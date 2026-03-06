import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─────────────────────────────────────────────
//  Cloud Instance Pricing Catalog (USD/hr)
//  Prices reflect on-demand us-east-1 / us-central1 / East US
// ─────────────────────────────────────────────
const PRICING_CATALOG: Record<string, { hourly: number; vcpu: number; ram_gb: number; provider: string }> = {
    // AWS EC2
    "t3.micro": { hourly: 0.0104, vcpu: 2, ram_gb: 1, provider: "aws" },
    "t3.small": { hourly: 0.0208, vcpu: 2, ram_gb: 2, provider: "aws" },
    "t3.medium": { hourly: 0.0416, vcpu: 2, ram_gb: 4, provider: "aws" },
    "t3.large": { hourly: 0.0832, vcpu: 2, ram_gb: 8, provider: "aws" },
    "t3.xlarge": { hourly: 0.1664, vcpu: 4, ram_gb: 16, provider: "aws" },
    "m5.large": { hourly: 0.096, vcpu: 2, ram_gb: 8, provider: "aws" },
    "m5.xlarge": { hourly: 0.192, vcpu: 4, ram_gb: 16, provider: "aws" },
    "m5.2xlarge": { hourly: 0.384, vcpu: 8, ram_gb: 32, provider: "aws" },
    "c5.large": { hourly: 0.085, vcpu: 2, ram_gb: 4, provider: "aws" },
    "c5.xlarge": { hourly: 0.170, vcpu: 4, ram_gb: 8, provider: "aws" },
    "c5.2xlarge": { hourly: 0.340, vcpu: 8, ram_gb: 16, provider: "aws" },
    "r5.large": { hourly: 0.126, vcpu: 2, ram_gb: 16, provider: "aws" },
    "r5.xlarge": { hourly: 0.252, vcpu: 4, ram_gb: 32, provider: "aws" },
    // GCP Compute Engine
    "n2-standard-2": { hourly: 0.0971, vcpu: 2, ram_gb: 8, provider: "gcp" },
    "n2-standard-4": { hourly: 0.1942, vcpu: 4, ram_gb: 16, provider: "gcp" },
    "n2-standard-8": { hourly: 0.3883, vcpu: 8, ram_gb: 32, provider: "gcp" },
    "e2-standard-2": { hourly: 0.0670, vcpu: 2, ram_gb: 8, provider: "gcp" },
    "e2-standard-4": { hourly: 0.1340, vcpu: 4, ram_gb: 16, provider: "gcp" },
    "c2-standard-4": { hourly: 0.2088, vcpu: 4, ram_gb: 16, provider: "gcp" },
    // Azure VMs
    "Standard_D2s_v3": { hourly: 0.096, vcpu: 2, ram_gb: 8, provider: "azure" },
    "Standard_D4s_v3": { hourly: 0.192, vcpu: 4, ram_gb: 16, provider: "azure" },
    "Standard_D8s_v3": { hourly: 0.384, vcpu: 8, ram_gb: 32, provider: "azure" },
    "Standard_B2s": { hourly: 0.0496, vcpu: 2, ram_gb: 4, provider: "azure" },
    "Standard_B4ms": { hourly: 0.166, vcpu: 4, ram_gb: 16, provider: "azure" },
};

// Kubernetes / EKS node pricing uses instance types above
// EKS management fee: $0.10/hr per cluster
const EKS_CLUSTER_FEE_HOURLY = 0.10;
const HOURS_PER_MONTH = 730;

// ─────────────────────────────────────────────
//  Input Schema
// ─────────────────────────────────────────────
const InstanceConfig = z.object({
    instance_type: z.string().default("t3.medium"),
    instance_count: z.number().int().min(1),
    hours_per_month: z.number().optional().default(730),
    reserved_discount: z.number().min(0).max(0.75).optional().default(0), // 0–75% discount
    spot_discount: z.number().min(0).max(0.90).optional().default(0),     // 0–90% discount
    platform: z.enum(["aws", "gcp", "azure", "kubernetes"]).optional().default("aws"),
    eks_cluster: z.boolean().optional().default(false),                    // add cluster fee?
});

const RequestSchema = z.object({
    current_config: InstanceConfig,
    optimal_config: InstanceConfig.extend({
        // optimal uses avg of min/max instances
        min_instances: z.number().int().min(1).optional(),
        max_instances: z.number().int().min(1).optional(),
    }),
    // Optional overrides
    custom_hourly_rate: z.number().optional(),     // override catalog price
    uniscale_license_cost: z.number().optional().default(29.99), // monthly SaaS fee for ROI calc
    include_rightsizing: z.boolean().optional().default(true),   // suggest cheaper instance type?
    currency: z.enum(["USD", "EUR", "GBP", "INR"]).optional().default("USD"),
});

type ValidatedInput = z.infer<typeof RequestSchema>;
type InstanceConfigInput = z.infer<typeof InstanceConfig>;

// ─────────────────────────────────────────────
//  Currency Conversion (static rates vs USD)
// ─────────────────────────────────────────────
const FX: Record<string, number> = { USD: 1.0, EUR: 0.92, GBP: 0.79, INR: 83.1 };
const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", INR: "₹" };

// ─────────────────────────────────────────────
//  Core Cost Calculators
// ─────────────────────────────────────────────
function resolveHourlyRate(cfg: InstanceConfigInput, customRate?: number): number {
    if (customRate) return customRate;
    const spec = PRICING_CATALOG[cfg.instance_type];
    if (!spec) return 0.10; // fallback
    let rate = spec.hourly;
    rate *= (1 - cfg.reserved_discount);
    rate *= (1 - cfg.spot_discount);
    return rate;
}

function calcMonthlyCost(cfg: InstanceConfigInput, customRate?: number, isOptimal = false): {
    instance_cost: number;
    cluster_fee: number;
    total: number;
    hourly_rate: number;
    effective_instances: number;
} {
    const hourlyRate = resolveHourlyRate(cfg, customRate);
    const hours = cfg.hours_per_month ?? HOURS_PER_MONTH;

    // For optimal config, use average of min/max if provided
    let effectiveInstances = cfg.instance_count;
    if (isOptimal) {
        const ext = cfg as z.infer<typeof RequestSchema>["optimal_config"];
        if (ext.min_instances && ext.max_instances) {
            effectiveInstances = (ext.min_instances + ext.max_instances) / 2;
        }
    }

    const instanceCost = hourlyRate * effectiveInstances * hours;
    const clusterFee = cfg.eks_cluster ? EKS_CLUSTER_FEE_HOURLY * hours : 0;
    return {
        instance_cost: instanceCost,
        cluster_fee: clusterFee,
        total: instanceCost + clusterFee,
        hourly_rate: hourlyRate,
        effective_instances: effectiveInstances,
    };
}

// ─────────────────────────────────────────────
//  Rightsizing Suggestion
// ─────────────────────────────────────────────
function suggestRightsize(instanceType: string, avgCpuPercent = 40): {
    suggestion: string | null;
    potential_hourly_saving: number;
} {
    const current = PRICING_CATALOG[instanceType];
    if (!current) return { suggestion: null, potential_hourly_saving: 0 };

    // If CPU avg < 30%, suggest one size down within same family
    if (avgCpuPercent < 30) {
        const sameFamily = Object.entries(PRICING_CATALOG).filter(
            ([key, val]) => val.provider === current.provider &&
                key !== instanceType &&
                val.vcpu <= current.vcpu &&
                val.ram_gb <= current.ram_gb &&
                val.hourly < current.hourly
        );
        sameFamily.sort((a, b) => b[1].hourly - a[1].hourly); // closest smaller
        if (sameFamily.length > 0) {
            const [betterType, betterSpec] = sameFamily[0];
            return {
                suggestion: `Rightsize from ${instanceType} → ${betterType} (${current.vcpu}vCPU/${current.ram_gb}GB → ${betterSpec.vcpu}vCPU/${betterSpec.ram_gb}GB). Save $${((current.hourly - betterSpec.hourly) * HOURS_PER_MONTH).toFixed(2)}/month per instance.`,
                potential_hourly_saving: (current.hourly - betterSpec.hourly),
            };
        }
    }
    return { suggestion: null, potential_hourly_saving: 0 };
}

// ─────────────────────────────────────────────
//  Chart Data Generator
// ─────────────────────────────────────────────
function buildChartData(
    currentMonthly: number,
    optimizedMonthly: number,
    licenseCost: number,
    currency: string
) {
    const fx = FX[currency] ?? 1;
    const sym = CURRENCY_SYMBOL[currency] ?? "$";
    const c = (v: number) => parseFloat((v * fx).toFixed(2));

    // Monthly trend: project 12 months showing cumulative savings
    const monthly_trend = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const label = new Date(2026, i, 1).toLocaleString('en-US', { month: 'short' });
        return {
            month: label,
            current: c(currentMonthly),
            optimized: c(optimizedMonthly + licenseCost), // incl. SaaS fee
            saving: c(currentMonthly - optimizedMonthly - licenseCost),
            cumulative_saving: c((currentMonthly - optimizedMonthly - licenseCost) * month),
        };
    });

    // Cost breakdown pie slices
    const breakdown = {
        current: {
            label: "Current Configuration",
            value: c(currentMonthly),
            currency_symbol: sym,
        },
        optimized_compute: {
            label: "Optimized Compute",
            value: c(optimizedMonthly),
            currency_symbol: sym,
        },
        uniscale_fee: {
            label: "UniScale License",
            value: c(licenseCost),
            currency_symbol: sym,
        },
        net_saving: {
            label: "Net Monthly Saving",
            value: c(currentMonthly - optimizedMonthly - licenseCost),
            currency_symbol: sym,
        },
    };

    // Before/after utilization chart points (simulate hourly pattern)
    const utilization_comparison = Array.from({ length: 24 }, (_, hour) => {
        // Simulate a typical daily CPU curve
        const peak = hour >= 9 && hour <= 18;
        const idle = hour >= 1 && hour <= 5;
        const currentUtil = idle ? 8 + Math.random() * 5 : peak ? 70 + Math.random() * 25 : 35 + Math.random() * 15;
        const optimizedUtil = idle ? 8 + Math.random() * 5 : peak ? 55 + Math.random() * 15 : 30 + Math.random() * 10;
        return {
            hour: `${String(hour).padStart(2, "0")}:00`,
            current_util: parseFloat(currentUtil.toFixed(1)),
            optimized_util: parseFloat(optimizedUtil.toFixed(1)),
            wasted_capacity: parseFloat(Math.max(0, currentUtil - optimizedUtil).toFixed(1)),
        };
    });

    // Annual savings waterfall data
    const annual_waterfall = [
        { label: "Current Annual Cost", value: c(currentMonthly * 12), type: "total" },
        { label: "Instance Rightsizing", value: c(-(currentMonthly - optimizedMonthly) * 0.4 * 12), type: "saving" },
        { label: "Autoscaling Savings", value: c(-(currentMonthly - optimizedMonthly) * 0.6 * 12), type: "saving" },
        { label: "UniScale License", value: c(licenseCost * 12), type: "cost" },
        { label: "Optimized Annual Cost", value: c((optimizedMonthly + licenseCost) * 12), type: "total" },
    ];

    return { monthly_trend, breakdown, utilization_comparison, annual_waterfall };
}

// ─────────────────────────────────────────────
//  GET — Pricing Catalog Info
// ─────────────────────────────────────────────
export async function GET() {
    const catalog = Object.entries(PRICING_CATALOG).map(([type, spec]) => ({
        instance_type: type,
        provider: spec.provider,
        vcpu: spec.vcpu,
        ram_gb: spec.ram_gb,
        hourly_usd: spec.hourly,
        monthly_usd: parseFloat((spec.hourly * HOURS_PER_MONTH).toFixed(2)),
    }));
    return NextResponse.json({
        endpoint: "/api/calculate-savings",
        pricing_catalog: catalog,
        hours_per_month: HOURS_PER_MONTH,
        supported_currencies: Object.keys(FX),
        note: "Prices are on-demand rates. Use reserved_discount (0–0.75) or spot_discount (0–0.90) fields to model discounts.",
    });
}

// ─────────────────────────────────────────────
//  POST — Calculate ROI
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = RequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request.", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const input: ValidatedInput = parsed.data;
        const { current_config, optimal_config, currency = "USD", uniscale_license_cost = 29.99 } = input;

        const fx = FX[currency] ?? 1;
        const sym = CURRENCY_SYMBOL[currency] ?? "$";
        const conv = (v: number) => parseFloat((v * fx).toFixed(2));
        const pct = (v: number) => parseFloat(v.toFixed(1));

        // ── Cost Computations ──────────────────────
        const current = calcMonthlyCost(current_config, input.custom_hourly_rate, false);
        const optimized = calcMonthlyCost(optimal_config, input.custom_hourly_rate, true);

        const currentMonthly = current.total;
        const optimizedMonthly = optimized.total;
        const rawSaving = currentMonthly - optimizedMonthly;
        const netSaving = rawSaving - uniscale_license_cost;

        const savingsPercent = currentMonthly > 0 ? (rawSaving / currentMonthly) * 100 : 0;
        const netSavingsPercent = currentMonthly > 0 ? (netSaving / currentMonthly) * 100 : 0;
        const annualSaving = netSaving * 12;
        const roiMultiple = uniscale_license_cost > 0 ? parseFloat((rawSaving / uniscale_license_cost).toFixed(2)) : 0;

        // Payback months to recoup any migration effort
        // Assume 1 day of engineering time = avg $800 effort
        const migrationEffort = 800;
        const paybackMonths = netSaving > 0 ? parseFloat((migrationEffort / netSaving).toFixed(1)) : null;

        // ── Rightsizing ────────────────────────────
        const rightsize = input.include_rightsizing
            ? suggestRightsize(current_config.instance_type, 40)
            : { suggestion: null, potential_hourly_saving: 0 };

        const rightsizeMonthlySaving = rightsize.potential_hourly_saving * current_config.instance_count * HOURS_PER_MONTH;

        // ── Waste Analysis ─────────────────────────
        const wastedHoursCurrent = (currentMonthly - optimizedMonthly) / current.hourly_rate;
        const wastedInstanceEquiv = parseFloat((wastedHoursCurrent / HOURS_PER_MONTH).toFixed(2));

        // ── Chart Data ─────────────────────────────
        const charts = buildChartData(currentMonthly, optimizedMonthly, uniscale_license_cost, currency);

        // ── Instance Spec Details ──────────────────
        const currentSpec = PRICING_CATALOG[current_config.instance_type];
        const optimalSpec = PRICING_CATALOG[optimal_config.instance_type];

        // ─────────────────────────────────────────
        return NextResponse.json({
            currency,
            currency_symbol: sym,

            // ── Main ROI Numbers ─────────────────────
            current_monthly: conv(currentMonthly),
            optimized_monthly: conv(optimizedMonthly),
            savings_dollar: conv(rawSaving),
            savings_percent: pct(savingsPercent),
            net_savings_after_license: conv(netSaving),
            net_savings_percent: pct(netSavingsPercent),
            roi_multiple: roiMultiple,

            // ── Annual Projection ────────────────────
            annual: {
                current_cost: conv(currentMonthly * 12),
                optimized_cost: conv(optimizedMonthly * 12),
                gross_savings: conv(rawSaving * 12),
                license_cost: conv(uniscale_license_cost * 12),
                net_savings: conv(annualSaving),
                payback_months: paybackMonths,
            },

            // ── Cost Breakdown ───────────────────────
            cost_breakdown: {
                current: {
                    instance_type: current_config.instance_type,
                    instance_count: current_config.instance_count,
                    hourly_rate: conv(current.hourly_rate),
                    instance_cost: conv(current.instance_cost),
                    cluster_fee: conv(current.cluster_fee),
                    total: conv(current.total),
                    ...(currentSpec && { spec: { vcpu: currentSpec.vcpu, ram_gb: currentSpec.ram_gb } }),
                },
                optimized: {
                    instance_type: optimal_config.instance_type,
                    instance_count: optimal_config.instance_count,
                    effective_avg_instances: parseFloat(optimized.effective_instances.toFixed(2)),
                    hourly_rate: conv(optimized.hourly_rate),
                    instance_cost: conv(optimized.instance_cost),
                    cluster_fee: conv(optimized.cluster_fee),
                    total: conv(optimized.total),
                    ...(optimalSpec && { spec: { vcpu: optimalSpec.vcpu, ram_gb: optimalSpec.ram_gb } }),
                },
            },

            // ── Waste Analysis ───────────────────────
            waste_analysis: {
                wasted_instance_equivalent: wastedInstanceEquiv,
                wasted_hours: parseFloat(wastedHoursCurrent.toFixed(0)),
                waste_cost_monthly: conv(rawSaving),
                waste_cost_annual: conv(rawSaving * 12),
            },

            // ── Rightsizing ──────────────────────────
            rightsizing: {
                applicable: rightsize.suggestion !== null,
                suggestion: rightsize.suggestion,
                potential_monthly_saving: conv(rightsizeMonthlySaving),
                combined_total_saving: conv(rawSaving + rightsizeMonthlySaving),
            },

            // ── UniScale ROI ─────────────────────────
            uniscale_roi: {
                license_cost_monthly: conv(uniscale_license_cost),
                license_cost_annual: conv(uniscale_license_cost * 12),
                roi_multiple: roiMultiple,
                break_even_days: roiMultiple > 0 ? parseFloat((30 / roiMultiple).toFixed(1)) : null,
                verdict:
                    roiMultiple >= 5 ? "Exceptional ROI — immediate deployment recommended."
                        : roiMultiple >= 2 ? "Strong ROI — deployment strongly recommended."
                            : roiMultiple >= 1 ? "Positive ROI — savings exceed license cost."
                                : "License cost exceeds savings — review configuration.",
            },

            // ── Charts ───────────────────────────────
            charts,
        });
    } catch (err) {
        console.error("[/api/calculate-savings] Error:", err);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
