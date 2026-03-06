import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { sendSlackAlert } from "../../../lib/slack";

// ─────────────────────────────────────────────
//  Input Validation
// ─────────────────────────────────────────────
const OptimalConfigSchema = z.object({
  cpu_threshold: z.number().min(1).max(100),
  min_instances: z.number().int().min(1),
  max_instances: z.number().int().min(1),
  scale_out_at: z.string().optional(),
  scale_in_at: z.string().optional(),
  recommendation: z.string().optional(),
});

const ProjectedSavingsSchema = z.object({
  monthly: z.number(),
  percentage: z.number(),
});

const RiskSchema = z.object({
  level: z.enum(["low", "medium", "high"]).optional(),
  factors: z.array(z.string()).optional(),
});

const ConfidenceSchema = z.object({
  score: z.number(),
  grade: z.string(),
  interpretation: z.string(),
});

const ScalingPolicySchema = z.object({
  type: z.string().optional(),
  metric: z.string().optional(),
  target_value: z.number().optional(),
  scale_out_cooldown_seconds: z.number().optional(),
  scale_in_cooldown_seconds: z.number().optional(),
  peak_hours: z.array(z.string()).optional(),
  idle_hours: z.array(z.string()).optional(),
});

const RequestSchema = z.object({
  schema: z.enum(["aws_cloudwatch", "gcp_monitoring", "prometheus"]).optional().default("aws_cloudwatch"),
  optimal_config: OptimalConfigSchema,
  projected_savings: ProjectedSavingsSchema.optional(),
  risk_analysis: RiskSchema.optional(),
  confidence: ConfidenceSchema.optional(),
  scaling_policy: ScalingPolicySchema.optional(),
  // Context overrides
  app_name: z.string().optional().default("my-app"),
  namespace: z.string().optional().default("default"),
  target_platforms: z.array(z.enum(["eks", "gke", "aks", "ec2", "all"])).optional().default(["all"]),
});

type ValidatedInput = z.infer<typeof RequestSchema>;

// ─────────────────────────────────────────────
//  YAML Validation (Structural)
// ─────────────────────────────────────────────
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateYamlStructure(
  input: ValidatedInput,
  platforms: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { optimal_config } = input;

  if (optimal_config.min_instances >= optimal_config.max_instances) {
    errors.push(`min_instances (${optimal_config.min_instances}) must be less than max_instances (${optimal_config.max_instances}).`);
  }
  if (optimal_config.cpu_threshold < 50 || optimal_config.cpu_threshold > 85) {
    warnings.push(`cpu_threshold of ${optimal_config.cpu_threshold}% is outside the recommended 50–85% cloud autoscaling band.`);
  }
  if (optimal_config.min_instances === 1) {
    warnings.push("min_instances=1 creates a single point of failure. Consider min_instances=2 for production.");
  }
  if (optimal_config.max_instances > 100) {
    warnings.push("max_instances exceeds 100. Verify your cloud account quotas.");
  }
  if (input.risk_analysis?.level === "high" && platforms.includes("ec2")) {
    warnings.push("High risk profile detected — review EC2 ASG lifecycle hooks before applying.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────
//  YAML Template Generators
// ─────────────────────────────────────────────

function timestamp(): string {
  return new Date().toISOString();
}

// Kubernetes HPA v2 (EKS / GKE / AKS)
function generateKubernetesHPA(input: ValidatedInput, platform: string): string {
  const { optimal_config, app_name, namespace, confidence, projected_savings, risk_analysis } = input;
  const cpuTarget = Math.round(optimal_config.cpu_threshold);
  const cooldownOut = input.scaling_policy?.scale_out_cooldown_seconds ?? 60;
  const cooldownIn = input.scaling_policy?.scale_in_cooldown_seconds ?? 300;

  const platformComment: Record<string, string> = {
    eks: "AWS EKS — ensure cluster-autoscaler is deployed alongside this HPA.",
    gke: "GCP GKE — compatible with GKE Autopilot and Standard modes.",
    aks: "Azure AKS — ensure KEDA or metrics-server v0.6+ is installed.",
  };

  return `# ============================================================
# UniScale AI — Kubernetes HPA v2 Configuration
# Generated: ${timestamp()}
# Platform: ${platform.toUpperCase()}
# ${platformComment[platform] ?? ""}
# Confidence: ${confidence?.score ?? "N/A"}% (Grade ${confidence?.grade ?? "N/A"})
# Risk Level: ${risk_analysis?.level ?? "unknown"}
# Projected Monthly Savings: $${projected_savings?.monthly ?? 0} (${projected_savings?.percentage ?? 0}%)
# Recommendation: ${optimal_config.recommendation ?? "Scale between min/max instances targeting CPU threshold."}
# ============================================================
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${app_name}-hpa
  namespace: ${namespace}
  labels:
    app: ${app_name}
    managed-by: uniscale-ai
    platform: ${platform}
  annotations:
    uniscale.ai/generated: "${timestamp()}"
    uniscale.ai/confidence: "${confidence?.score ?? 'N/A'}"
    uniscale.ai/risk-level: "${risk_analysis?.level ?? 'unknown'}"
spec:
  # ── Target Deployment ──────────────────────
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${app_name}

  # ── Instance Range ─────────────────────────
  # UniScale recommends: min=${optimal_config.min_instances}, max=${optimal_config.max_instances}
  minReplicas: ${optimal_config.min_instances}
  maxReplicas: ${optimal_config.max_instances}

  # ── Scaling Metrics ────────────────────────
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          # UniScale optimal CPU target: ${cpuTarget}%
          # Scale-out triggers at: ${optimal_config.scale_out_at ?? cpuTarget + "%"}
          # Scale-in triggers at: ${optimal_config.scale_in_at ?? Math.round(cpuTarget * 0.5) + "%"}
          averageUtilization: ${cpuTarget}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          # Memory target at 80% to avoid OOM evictions
          averageUtilization: 80

  # ── Scaling Behavior ───────────────────────
  behavior:
    scaleUp:
      # Aggressive scale-out: respond within ${cooldownOut}s to handle traffic spikes
      stabilizationWindowSeconds: ${cooldownOut}
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
        - type: Percent
          value: 100
          periodSeconds: 60
      selectPolicy: Max

    scaleDown:
      # Conservative scale-in: wait ${cooldownIn}s to avoid flapping
      stabilizationWindowSeconds: ${cooldownIn}
      policies:
        - type: Pods
          value: 2
          periodSeconds: 120
        - type: Percent
          value: 25
          periodSeconds: 120
      selectPolicy: Min

---
# ── Supporting Deployment Template ─────────────────────────
# Apply resource requests so HPA metrics work correctly.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${app_name}
  namespace: ${namespace}
  labels:
    app: ${app_name}
    managed-by: uniscale-ai
spec:
  # Initial replicas — HPA will manage this after first sync
  replicas: ${Math.ceil((optimal_config.min_instances + optimal_config.max_instances) / 2)}
  selector:
    matchLabels:
      app: ${app_name}
  template:
    metadata:
      labels:
        app: ${app_name}
    spec:
      containers:
        - name: ${app_name}
          image: YOUR_IMAGE:TAG   # Replace with your container image
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "1000m"
              memory: "512Mi"
          # Readiness probe ensures pods are ready before receiving traffic
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
`;
}

// AWS EC2 Auto Scaling Group Policy (CloudFormation-style JSON → YAML)
function generateAWSASG(input: ValidatedInput): string {
  const { optimal_config, app_name, confidence, projected_savings, risk_analysis } = input;
  const cpuTarget = Math.round(optimal_config.cpu_threshold);
  const cooldownOut = input.scaling_policy?.scale_out_cooldown_seconds ?? 60;
  const cooldownIn = input.scaling_policy?.scale_in_cooldown_seconds ?? 300;

  return `# ============================================================
# UniScale AI — AWS EC2 Auto Scaling Group (CloudFormation)
# Generated: ${timestamp()}
# Platform: AWS EC2 / ECS
# Confidence: ${confidence?.score ?? "N/A"}% (Grade ${confidence?.grade ?? "N/A"})
# Risk Level: ${risk_analysis?.level ?? "unknown"}
# Projected Monthly Savings: $${projected_savings?.monthly ?? 0} (${projected_savings?.percentage ?? 0}%)
# ============================================================
AWSTemplateFormatVersion: "2010-09-09"
Description: >
  UniScale AI — Auto Scaling Group for ${app_name}.
  CPU target: ${cpuTarget}% | Range: ${optimal_config.min_instances}–${optimal_config.max_instances} instances.

Parameters:
  VpcId:
    Type: AWS::EC2::VPC::Id
    Description: VPC where the ASG will be deployed
  SubnetIds:
    Type: List<AWS::EC2::Subnet::Id>
    Description: Subnets for the ASG instances (use multi-AZ for HA)
  AmiId:
    Type: AWS::EC2::Image::Id
    Description: AMI ID for instances
  InstanceType:
    Type: String
    Default: t3.medium
    AllowedValues: [t3.micro, t3.small, t3.medium, t3.large, m5.large, c5.large]
    Description: EC2 instance type

Resources:
  # ── Launch Template ──────────────────────────────────────
  ${app_name}LaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateName: ${app_name}-launch-template
      LaunchTemplateData:
        ImageId: !Ref AmiId
        InstanceType: !Ref InstanceType
        # Enable detailed CloudWatch monitoring for better scaling metrics
        Monitoring:
          Enabled: true
        TagSpecifications:
          - ResourceType: instance
            Tags:
              - Key: Name
                Value: ${app_name}
              - Key: ManagedBy
                Value: UniScale-AI
              - Key: Environment
                Value: production

  # ── Auto Scaling Group ────────────────────────────────────
  ${app_name}ASG:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      AutoScalingGroupName: ${app_name}-asg
      LaunchTemplate:
        LaunchTemplateId: !Ref ${app_name}LaunchTemplate
        Version: !GetAtt ${app_name}LaunchTemplate.LatestVersionNumber
      VPCZoneIdentifier: !Ref SubnetIds

      # ── Instance Range (UniScale Optimal) ─────────────────
      # Recommendation: ${optimal_config.recommendation ?? "Scale based on CPU target."}
      MinSize: "${optimal_config.min_instances}"
      MaxSize: "${optimal_config.max_instances}"
      DesiredCapacity: "${Math.ceil((optimal_config.min_instances + optimal_config.max_instances) / 2)}"

      # Health checks — use ELB if behind a load balancer
      HealthCheckType: EC2
      HealthCheckGracePeriod: 300

      # Instance refresh — rolling updates without downtime
      InstanceRefresh:
        Strategy: Rolling
        Preferences:
          MinHealthyPercentage: 80
          InstanceWarmup: 120

      Tags:
        - Key: Name
          Value: ${app_name}-asg-instance
          PropagateAtLaunch: true
        - Key: ManagedBy
          Value: UniScale-AI
          PropagateAtLaunch: true

  # ── Target Tracking Scaling Policy ────────────────────────
  ${app_name}ScalingPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AutoScalingGroupName: !Ref ${app_name}ASG
      PolicyType: TargetTrackingScaling
      TargetTrackingConfiguration:
        # UniScale recommends: target CPU = ${cpuTarget}%
        # This keeps instances ~${cpuTarget}% busy, scaling out/in automatically.
        PredefinedMetricSpecification:
          PredefinedMetricType: ASGAverageCPUUtilization
        TargetValue: ${cpuTarget}
        # Scale-out cooldown: ${cooldownOut}s (fast response to traffic spikes)
        EstimatedInstanceWarmup: ${cooldownOut}
        # Disable scale-in to protect against flapping during peak periods
        DisableScaleIn: false

  # ── CloudWatch Alarm: CPU High ────────────────────────────
  ${app_name}CPUHighAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ${app_name}-cpu-high
      AlarmDescription: >
        UniScale: CPU exceeded scale-out threshold.
        Scale-out at: ${optimal_config.scale_out_at ?? cpuTarget + "%"}
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: 60
      EvaluationPeriods: 2
      Threshold: ${Math.round(cpuTarget * 0.9)}
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: AutoScalingGroupName
          Value: !Ref ${app_name}ASG

  # ── CloudWatch Alarm: CPU Low ─────────────────────────────
  ${app_name}CPULowAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ${app_name}-cpu-low
      AlarmDescription: >
        UniScale: CPU below scale-in threshold.
        Scale-in at: ${optimal_config.scale_in_at ?? Math.round(cpuTarget * 0.5) + "%"}
        Scale-in cooldown: ${cooldownIn}s
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: ${cooldownIn}
      EvaluationPeriods: 3
      Threshold: ${Math.round(cpuTarget * 0.5)}
      ComparisonOperator: LessThanThreshold
      Dimensions:
        - Name: AutoScalingGroupName
          Value: !Ref ${app_name}ASG

Outputs:
  ASGName:
    Description: Auto Scaling Group Name
    Value: !Ref ${app_name}ASG
  ScalingPolicyARN:
    Description: Scaling Policy ARN
    Value: !Ref ${app_name}ScalingPolicy
`;
}

// GCP Managed Instance Group Autoscaler
function generateGCPAutoscaler(input: ValidatedInput): string {
  const { optimal_config, app_name, confidence, projected_savings, risk_analysis } = input;
  const cpuTarget = Math.round(optimal_config.cpu_threshold);
  const cooldownIn = input.scaling_policy?.scale_in_cooldown_seconds ?? 300;

  return `# ============================================================
# UniScale AI — GCP Managed Instance Group Autoscaler
# Generated: ${timestamp()}
# Platform: GCP Compute Engine / GKE
# Confidence: ${confidence?.score ?? "N/A"}% (Grade ${confidence?.grade ?? "N/A"})
# Risk Level: ${risk_analysis?.level ?? "unknown"}
# Projected Monthly Savings: $${projected_savings?.monthly ?? 0} (${projected_savings?.percentage ?? 0}%)
# Apply with: gcloud compute instance-groups managed set-autoscaling ...
# ============================================================

# ── Instance Template ─────────────────────────────────────
# Run: gcloud compute instance-templates create ${app_name}-template \
#        --machine-type=n2-standard-2 --image-family=debian-11 \
#        --image-project=debian-cloud --tags=http-server

# ── Managed Instance Group (gcloud) ──────────────────────
# Run: gcloud compute instance-groups managed create ${app_name}-mig \
#        --template=${app_name}-template \
#        --size=${optimal_config.min_instances} \
#        --region=us-central1

# ── Autoscaler Configuration (Deployment Manager YAML) ────
resources:
  - name: ${app_name}-autoscaler
    type: compute.v1.regionAutoscaler
    properties:
      region: us-central1    # Change to your target region
      target: $(ref.${app_name}-mig.selfLink)
      autoscalingPolicy:
        # ── Instance Range (UniScale Optimal) ───────────────
        # Recommendation: ${optimal_config.recommendation ?? "CPU-based scaling."}
        minNumReplicas: ${optimal_config.min_instances}
        maxNumReplicas: ${optimal_config.max_instances}

        # ── CPU Utilization Target ───────────────────────────
        # UniScale recommends: ${cpuTarget}% CPU target
        # This means GCP will add/remove VMs to keep average at ${cpuTarget / 100}
        cpuUtilization:
          utilizationTarget: ${(cpuTarget / 100).toFixed(2)}

        # ── Scale-In Controls ────────────────────────────────
        # Wait ${cooldownIn}s before scaling in (avoids thrashing)
        scaleInControl:
          timeWindowSec: ${cooldownIn}
          maxScaledInReplicas:
            fixed: 2           # Max 2 VMs removed per scale-in event
            calculated: 25     # Or 25% of current capacity, whichever is lower

        # ── Cool-down Period ─────────────────────────────────
        # Ignore new metrics for 120s after a scaling event (VM startup time)
        coolDownPeriodSec: 120

        # ── Load Balancing Utilization (optional) ───────────
        # Uncomment if using a Cloud Load Balancer
        # loadBalancingUtilization:
        #   utilizationTarget: 0.8

  # ── Managed Instance Group Definition ───────────────────
  - name: ${app_name}-mig
    type: compute.v1.regionInstanceGroupManager
    properties:
      region: us-central1
      baseInstanceName: ${app_name}-vm
      targetSize: ${Math.ceil((optimal_config.min_instances + optimal_config.max_instances) / 2)}
      instanceTemplate: $(ref.${app_name}-template.selfLink)
      autoHealingPolicies:
        - healthCheck: $(ref.${app_name}-health-check.selfLink)
          # Restart unhealthy VMs after 300s
          initialDelaySec: 300
      updatePolicy:
        type: PROACTIVE
        minimalAction: REPLACE
        maxSurge:
          fixed: 2
        maxUnavailable:
          fixed: 0    # Zero downtime rolling updates

  # ── Health Check ─────────────────────────────────────────
  - name: ${app_name}-health-check
    type: compute.v1.healthCheck
    properties:
      checkIntervalSec: 10
      timeoutSec: 5
      healthyThreshold: 2
      unhealthyThreshold: 3
      httpHealthCheck:
        port: 80
        requestPath: /healthz

---
# ── GKE Autopilot HPA (GCP Kubernetes) ─────────────────────
# If using GKE instead of MIG, apply this HPA config:
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${app_name}-hpa-gke
  namespace: default
  annotations:
    uniscale.ai/platform: "gcp_gke"
    uniscale.ai/cpu-target: "${cpuTarget}%"
    # GKE Autopilot scales nodes automatically alongside pods
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${app_name}
  minReplicas: ${optimal_config.min_instances}
  maxReplicas: ${optimal_config.max_instances}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          # UniScale GCP optimal target: ${cpuTarget}%
          averageUtilization: ${cpuTarget}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: ${cooldownIn}
`;
}

// Azure VMSS / AKS Autoscaler
function generateAzureAKS(input: ValidatedInput): string {
  const { optimal_config, app_name, namespace, confidence, projected_savings, risk_analysis } = input;
  const cpuTarget = Math.round(optimal_config.cpu_threshold);
  const cooldownIn = input.scaling_policy?.scale_in_cooldown_seconds ?? 300;

  return `# ============================================================
# UniScale AI — Azure AKS / VMSS Autoscaler
# Generated: ${timestamp()}
# Platform: Azure AKS / Azure VMSS
# Confidence: ${confidence?.score ?? "N/A"}% (Grade ${confidence?.grade ?? "N/A"})
# Risk Level: ${risk_analysis?.level ?? "unknown"}
# Projected Monthly Savings: $${projected_savings?.monthly ?? 0} (${projected_savings?.percentage ?? 0}%)
# Deploy with: kubectl apply -f this-file.yaml
# ============================================================

# ── Kubernetes HPA (AKS) ─────────────────────────────────
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${app_name}-hpa-aks
  namespace: ${namespace}
  labels:
    app: ${app_name}
    managed-by: uniscale-ai
    platform: azure-aks
  annotations:
    uniscale.ai/generated: "${timestamp()}"
    uniscale.ai/cpu-target: "${cpuTarget}%"
    uniscale.ai/risk: "${risk_analysis?.level ?? 'unknown'}"
    # AKS: ensure metrics-server addon is enabled
    # az aks enable-addons --addons metrics-server --name <cluster> --resource-group <rg>
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${app_name}

  # ── Replica Range (UniScale Optimal) ─────────────────────
  # Recommendation: ${optimal_config.recommendation ?? "Scale between min/max."}
  minReplicas: ${optimal_config.min_instances}
  maxReplicas: ${optimal_config.max_instances}

  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          # UniScale recommends: ${cpuTarget}% for this workload
          averageUtilization: ${cpuTarget}

  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      # Conservative scale-in (AKS default is too aggressive)
      stabilizationWindowSeconds: ${cooldownIn}
      policies:
        - type: Pods
          value: 1
          periodSeconds: 60

---
# ── Azure VMSS Autoscale (ARM Template YAML equivalent) ───
# Save as vmss-autoscale.json and deploy via:
# az deployment group create --template-file vmss-autoscale.json
#
# Azure VMSS autoscale uses metrics autoscale rules (JSON-based ARM).
# Key settings map:
#
#   minCount:   ${optimal_config.min_instances}    instances
#   maxCount:   ${optimal_config.max_instances}    instances  
#   defaultCount: ${Math.ceil((optimal_config.min_instances + optimal_config.max_instances) / 2)}  instances
#
#   Scale-Out rule:
#     metric:    Percentage CPU
#     operator:  GreaterThan
#     threshold: ${Math.round(cpuTarget * 0.9)}%  (90% of UniScale target)
#     cooldown:  PT1M  (1 minute)
#     direction: Increase
#     value:     2 VMs
#
#   Scale-In rule:
#     metric:    Percentage CPU
#     operator:  LessThan
#     threshold: ${Math.round(cpuTarget * 0.5)}%  (50% of UniScale target)
#     cooldown:  PT${Math.round(cooldownIn / 60)}M  (${cooldownIn}s as minutes)
#     direction: Decrease
#     value:     1 VM

# ── AKS Cluster Autoscaler (node-level) ──────────────────
# Enable with:
# az aks update \
#   --name <cluster-name> \
#   --resource-group <rg> \
#   --enable-cluster-autoscaler \
#   --min-count ${optimal_config.min_instances} \
#   --max-count ${optimal_config.max_instances}
#
# Cluster autoscaler config (applied via ConfigMap):
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-status
  namespace: kube-system
  labels:
    managed-by: uniscale-ai
data:
  # Scale-down delay: wait before removing underutilized nodes
  scale-down-delay-after-add: "${Math.round(cooldownIn / 60)}m"
  scale-down-unneeded-time: "5m"
  # Skip system pods during scale-down (prevents eviction of critical workloads)
  skip-nodes-with-system-pods: "true"
  # Balance replicas across availability zones for HA
  balance-similar-node-groups: "true"
`;
}

// ─────────────────────────────────────────────
//  GET — Schema Info
// ─────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/generate-yaml",
    description: "Generates production-ready autoscaling YAML configs from UniScale optimization results.",
    supported_platforms: {
      eks: "Kubernetes HPA v2 for AWS EKS",
      gke: "Kubernetes HPA v2 + GCP MIG Autoscaler for GCP GKE",
      aks: "Kubernetes HPA v2 + Azure VMSS hints for Azure AKS",
      ec2: "AWS CloudFormation template with EC2 ASG target-tracking policy",
      all: "All of the above combined",
    },
    required_fields: ["optimal_config.cpu_threshold", "optimal_config.min_instances", "optimal_config.max_instances"],
    optional_fields: ["app_name", "namespace", "target_platforms", "confidence", "risk_analysis", "projected_savings", "scaling_policy"],
  });
}

// ─────────────────────────────────────────────
//  POST — Generate YAML
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const platformsRaw = input.target_platforms ?? ["all"];
    const platforms = platformsRaw.includes("all")
      ? ["eks", "gke", "aks", "ec2"]
      : platformsRaw;

    // ── Structural Validation ──────────────────
    const validation = validateYamlStructure(input, platforms);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation failed — invalid configuration values.",
          validation_errors: validation.errors,
          validation_warnings: validation.warnings,
        },
        { status: 422 }
      );
    }

    // ── Generate YAML per platform ─────────────
    const templates: Record<string, string> = {};

    if (platforms.includes("eks")) {
      templates["kubernetes_hpa_eks"] = generateKubernetesHPA(input, "eks");
    }
    if (platforms.includes("gke")) {
      templates["kubernetes_hpa_gke"] = generateKubernetesHPA(input, "gke");
      templates["gcp_mig_autoscaler"] = generateGCPAutoscaler(input);
    }
    if (platforms.includes("aks")) {
      templates["azure_aks_hpa"] = generateAzureAKS(input);
    }
    if (platforms.includes("ec2")) {
      templates["aws_asg_cloudformation"] = generateAWSASG(input);
    }

    // ── Summary ────────────────────────────────
    return NextResponse.json({
      generated_at: timestamp(),
      app_name: input.app_name,
      namespace: input.namespace,
      platforms_generated: platforms,
      optimal_config_applied: {
        cpu_threshold: `${input.optimal_config.cpu_threshold}%`,
        min_instances: input.optimal_config.min_instances,
        max_instances: input.optimal_config.max_instances,
      },
      validation: {
        passed: true,
        warnings: validation.warnings,
      },
      templates,
      usage: {
        kubernetes:
          "Save the HPA YAML to a file and run: kubectl apply -f <filename>.yaml",
        aws_ec2:
          "Deploy via: aws cloudformation deploy --template-file <file>.yaml --stack-name <name> --capabilities CAPABILITY_IAM",
        gcp:
          "Deploy MIG via: gcloud deployment-manager deployments create <name> --config <file>.yaml",
        azure:
          "Apply HPA: kubectl apply -f <file>.yaml | VMSS: az deployment group create --template-file <file>.json",
      },
    });
  } catch (err: any) {
    console.error("[/api/generate-yaml] Error:", err);
    Sentry.captureException(err);
    await sendSlackAlert("YAML Generation Exception", err.message || err.toString());
    return NextResponse.json(
      { error: "Internal server error during YAML generation." },
      { status: 500 }
    );
  }
}
