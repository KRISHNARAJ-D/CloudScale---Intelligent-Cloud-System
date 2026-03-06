import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─────────────────────────────────────────────
//  Input Schema Validation (Zod)
// ─────────────────────────────────────────────
const MetricsSchema = z.object({
    avg_cpu: z.number(),
    max_cpu: z.number(),
    cpu_variance: z.number(),
    waste_percent: z.number(),
    anomalies_detected: z.number().optional().default(0),
});

const TimePatternsSchema = z.object({
    daily_peaks: z.array(z.string()).optional().default([]),
    idle_periods: z.array(z.string()).optional().default([]),
});

const RequestSchema = z.object({
    schema: z.enum(["aws_cloudwatch", "gcp_monitoring", "prometheus"]).optional().default("aws_cloudwatch"),
    metrics: MetricsSchema,
    time_patterns: TimePatternsSchema.optional().default({ daily_peaks: [], idle_periods: [] }),
    // raw instance info is optional — used for tighter savings math
    current_instances: z.number().optional(),
    instance_cost_per_hour: z.number().optional(), // USD
    observation_hours: z.number().optional(),
});

type ValidatedInput = z.infer<typeof RequestSchema>;

// ─────────────────────────────────────────────
//  Statistical Helper Functions
// ─────────────────────────────────────────────

/** Clamp a number between [min, max] */
const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

/** Round to N decimal places */
const round = (val: number, dp = 2) =>
    Math.round(val * 10 ** dp) / 10 ** dp;

/**
 * Determine optimal CPU target (60–80%) using a statistical approach:
 *   - High variance  → lower target (more headroom for spikes)
 *   - High avg_cpu   → higher target is already being hit, bring headroom in
 *   - High anomalies → extra headroom penalty
 */
function computeOptimalCpuTarget(
    avgCpu: number,
    cpuVariance: number,
    maxCpu: number,
    anomalies: number
): number {
    const stdDev = Math.sqrt(cpuVariance);
    // Safe headroom = 1 sigma above average, but cap at max observed
    const peakEstimate = Math.min(avgCpu + stdDev, maxCpu);

    // Base target: we want the system comfortable at p95 usage
    let target = peakEstimate * 1.1; // 10 % buffer above p95 estimate

    // Anomaly penalty: each anomaly nudges target down by 1.5%
    target -= anomalies * 1.5;

    // Hard clamp to [60, 80] — the recommended cloud scaling band
    return round(clamp(target, 60, 80), 1);
}

/**
 * Compute min instances:
 *   - Derived from idle-period CPU usage approximation.
 *   - At least 1 instance must always run.
 */
function computeMinInstances(
    currentInstances: number,
    wastePercent: number,
    idlePeriods: string[]
): number {
    const utilizationInIdle = 1 - wastePercent / 100; // inverse of waste
    const idleFraction = idlePeriods.length > 0 ? Math.min(idlePeriods.length * 0.08, 0.5) : 0.1;
    const minRaw = Math.ceil(currentInstances * utilizationInIdle * idleFraction);
    return Math.max(1, minRaw);
}

/**
 * Compute max instances:
 *   - Driven by max CPU load with target utilization applied.
 *   - max_instances = current_instances * (max_cpu / cpu_target), rounded up + 1 for burst buffer.
 */
function computeMaxInstances(
    currentInstances: number,
    maxCpu: number,
    cpuTarget: number
): number {
    const scaleFactor = maxCpu / cpuTarget;
    return Math.max(2, Math.ceil(currentInstances * scaleFactor) + 1);
}

/**
 * Compute projected savings.
 * Uses instance-hours math when cost data is available;
 * falls back to a waste-reduction estimate otherwise.
 */
function computeSavings(
    wastePercent: number,
    currentInstances: number,
    minInstances: number,
    maxInstances: number,
    instanceCostPerHour: number,
    observationHours: number
): { monthly_usd: number; percentage: number } {
    // Average optimized instance count (assumes auto-scaling between min/max)
    const avgOptimizedInstances = (minInstances + maxInstances) / 2;
    // Waste reduction: optimized average vs current static fleet
    const reducedInstances = Math.max(0, currentInstances - avgOptimizedInstances);

    // Cost path A: explicit hourly rate given
    const hoursInMonth = 730;
    const savedHours = reducedInstances * hoursInMonth * instanceCostPerHour;

    // Cost path B: estimate based on waste % only (fallback)
    // Assume $0.10/hr per instance as baseline if not given
    const baseHourlyRate = instanceCostPerHour > 0 ? instanceCostPerHour : 0.1;
    const fallbackSaving = (wastePercent / 100) * currentInstances * hoursInMonth * baseHourlyRate;

    const monthly_usd = round(
        instanceCostPerHour > 0 ? savedHours : fallbackSaving,
        2
    );
    const percentage = round(
        (reducedInstances / currentInstances) * 100,
        1
    );

    return { monthly_usd, percentage: Math.max(0, percentage) };
}

/**
 * Confidence score (0–100):
 *   - Penalised by high variance (unpredictable workload)
 *   - Penalised by many anomalies (outliers skew the model)
 *   - Boosted by having time-pattern data
 */
function computeConfidence(
    cpuVariance: number,
    anomalies: number,
    hasPeaks: boolean,
    hasIdlePeriods: boolean
): number {
    let score = 95;
    const stdDev = Math.sqrt(cpuVariance);

    // High variability penalty
    if (stdDev > 30) score -= 20;
    else if (stdDev > 15) score -= 10;
    else if (stdDev > 5) score -= 5;

    // Anomaly penalty
    score -= Math.min(anomalies * 3, 15);

    // Rewards
    if (hasPeaks) score += 5;
    if (hasIdlePeriods) score += 5;

    return clamp(round(score, 0), 30, 99);
}

/**
 * Risk analysis — generates structured risk items.
 */
function computeRisk(
    avgCpu: number,
    maxCpu: number,
    cpuVariance: number,
    anomalies: number,
    minInstances: number,
    wastePercent: number
): { level: "low" | "medium" | "high"; factors: string[] } {
    const factors: string[] = [];
    let riskScore = 0;

    if (maxCpu > 90) {
        factors.push("CPU spikes above 90% detected — risk of throttling if min instances is set too low.");
        riskScore += 2;
    }
    if (Math.sqrt(cpuVariance) > 20) {
        factors.push("High CPU variance — workload is unpredictable; consider burst scaling policy.");
        riskScore += 2;
    }
    if (anomalies > 3) {
        factors.push(`${anomalies} anomalies detected in data — model confidence reduced.`);
        riskScore += 1;
    }
    if (minInstances === 1) {
        factors.push("Min instances set to 1 — single point of failure during scale-in.");
        riskScore += 1;
    }
    if (wastePercent > 50) {
        factors.push("Very high waste (>50%) means current provisioning is significantly over-sized.");
        riskScore += 1;
    }
    if (avgCpu < 20) {
        factors.push("Average CPU below 20% — consider right-sizing instance type before scaling.");
    }

    const level: "low" | "medium" | "high" =
        riskScore >= 4 ? "high" : riskScore >= 2 ? "medium" : "low";

    return { level, factors: factors.length > 0 ? factors : ["No significant risks identified."] };
}

// ─────────────────────────────────────────────
//  Before/After Utilization Projection
// ─────────────────────────────────────────────
function computeBeforeAfter(
    avgCpu: number,
    cpuTarget: number,
    currentInstances: number,
    optAvgInstances: number
): { current_util: number; optimized_util: number } {
    // Optimized util = redistribute same load across fewer avg instances
    const loadUnit = avgCpu * currentInstances;
    const optimizedUtil = round(loadUnit / optAvgInstances, 1);
    return {
        current_util: round(avgCpu, 1),
        optimized_util: clamp(round(optimizedUtil, 1), cpuTarget - 5, cpuTarget + 10),
    };
}

// ─────────────────────────────────────────────
//  POST Handler
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = RequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: "Invalid request body.",
                    details: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const input: ValidatedInput = parsed.data;
        const { metrics, time_patterns } = input;
        const {
            avg_cpu,
            max_cpu,
            cpu_variance,
            waste_percent,
            anomalies_detected,
        } = metrics;

        // Defaults for optional fields
        const currentInstances = input.current_instances ?? 4;
        const instanceCostPerHour = input.instance_cost_per_hour ?? 0;
        const observationHours = input.observation_hours ?? 720;
        const idlePeriods = time_patterns?.idle_periods ?? [];
        const dailyPeaks = time_patterns?.daily_peaks ?? [];

        // ── Core Computations ──────────────────────
        const cpuTarget = computeOptimalCpuTarget(avg_cpu, cpu_variance, max_cpu, anomalies_detected);
        const minInstances = computeMinInstances(currentInstances, waste_percent, idlePeriods);
        const maxInstances = computeMaxInstances(currentInstances, max_cpu, cpuTarget);
        const avgOptimizedInstances = (minInstances + maxInstances) / 2;

        const savings = computeSavings(
            waste_percent,
            currentInstances,
            minInstances,
            maxInstances,
            instanceCostPerHour,
            observationHours
        );

        const confidence = computeConfidence(
            cpu_variance,
            anomalies_detected,
            dailyPeaks.length > 0,
            idlePeriods.length > 0
        );

        const risk = computeRisk(
            avg_cpu,
            max_cpu,
            cpu_variance,
            anomalies_detected,
            minInstances,
            waste_percent
        );

        const beforeAfter = computeBeforeAfter(
            avg_cpu,
            cpuTarget,
            currentInstances,
            avgOptimizedInstances
        );

        // ── Scale-Out / Scale-In Thresholds ────────
        const scaleOutThreshold = round(cpuTarget * 0.9, 1);  // scale out at 90% of target
        const scaleInThreshold = round(cpuTarget * 0.5, 1);   // scale in at 50% of target

        // ── Response ───────────────────────────────
        return NextResponse.json({
            schema: input.schema,
            current_waste: `${round(waste_percent, 1)}%`,
            optimal_config: {
                cpu_threshold: cpuTarget,
                min_instances: minInstances,
                max_instances: maxInstances,
                scale_out_at: `${scaleOutThreshold}%`,
                scale_in_at: `${scaleInThreshold}%`,
                recommendation: `Auto-scale between ${minInstances}–${maxInstances} instances targeting ${cpuTarget}% CPU utilization.`,
            },
            projected_savings: {
                monthly: savings.monthly_usd,
                percentage: savings.percentage,
                note:
                    instanceCostPerHour > 0
                        ? "Savings calculated from provided instance hourly rate."
                        : "Savings estimated using $0.10/hr baseline. Pass `instance_cost_per_hour` for accuracy.",
            },
            before_after: beforeAfter,
            confidence: {
                score: confidence,
                grade: confidence >= 85 ? "A" : confidence >= 70 ? "B" : confidence >= 55 ? "C" : "D",
                interpretation:
                    confidence >= 85
                        ? "High confidence — data is consistent and sufficient."
                        : confidence >= 70
                            ? "Moderate confidence — recommendations are sound but monitor closely."
                            : "Low confidence — workload is highly variable; validate before applying.",
            },
            risk_analysis: {
                level: risk.level,
                factors: risk.factors,
            },
            scaling_policy: {
                type: "target_tracking",
                metric: "cpu_utilization",
                target_value: cpuTarget,
                scale_out_cooldown_seconds: 60,
                scale_in_cooldown_seconds: 300,
                peak_hours: dailyPeaks,
                idle_hours: idlePeriods,
            },
        });
    } catch (err) {
        console.error("[/api/optimize] Error:", err);
        return NextResponse.json(
            { error: "Internal server error during optimization." },
            { status: 500 }
        );
    }
}
