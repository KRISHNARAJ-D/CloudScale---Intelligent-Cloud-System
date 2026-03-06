import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { supabase } from "./supabase";

/**
 * Enterprise Multi-Cloud Abstration Layer
 * Pulls live metrics from providers every 5 minutes (simulated/scheduled)
 */

export interface CloudCredential {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
}

export class CloudMetricEngine {

    static async fetchAWSMetrics(userId: string, credentials: CloudCredential) {
        const client = new CloudWatchClient({
            region: credentials.region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
            },
        });

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last hour

        const command = new GetMetricDataCommand({
            MetricDataQueries: [
                {
                    Id: "cpu_usage",
                    MetricStat: {
                        Metric: {
                            Namespace: "AWS/EC2",
                            MetricName: "CPUUtilization",
                        },
                        Period: 300,
                        Stat: "Average",
                    },
                },
            ],
            StartTime: startTime,
            EndTime: endTime,
        });

        try {
            const response = await client.send(command);
            const results = response.MetricDataResults?.[0]?.Values || [];
            const timestamps = response.MetricDataResults?.[0]?.Timestamps || [];

            if (results.length > 0) {
                // Log latest metric to Supabase
                const latestValue = results[0];
                const latestTime = timestamps[0].toISOString();

                await supabase.from('metrics').insert({
                    user_id: userId,
                    provider: 'aws',
                    metric_name: 'CPUUtilization',
                    value: latestValue,
                    unit: 'Percent',
                    timestamp: latestTime,
                    metadata: { region: credentials.region }
                });

                return { success: true, value: latestValue };
            }

            return { success: false, reason: "No metrics found" };
        } catch (error: any) {
            console.error("AWS Metric Fetch Error:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Universal Optimization Calculator
     * Calculates waste and potential savings based on gathered metrics
     */
    static async runOptimizationPulse(userId: string) {
        // 1. Fetch historical metrics from Supabase
        const { data: metrics } = await supabase
            .from('metrics')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(20);

        if (!metrics || metrics.length === 0) return null;

        // 2. Simple Statistical Engine (Mocking heavy compute for now)
        const avgUsage = metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length;
        const wastePercentage = Math.max(0, 80 - avgUsage); // Assuming 80% target utilization
        const estimatedMonthlySpend = 500; // Mock profile
        const monthlySavings = (estimatedMonthlySpend * (wastePercentage / 100));

        const optimizationData = {
            user_id: userId,
            waste_percentage: parseFloat(wastePercentage.toFixed(2)),
            savings_amount: parseFloat(monthlySavings.toFixed(2)),
            last_optimized: new Date().toISOString(),
            total_savings_to_date: 1240.50 // Mock cumulative
        };

        // 3. Store result
        await supabase.from('optimizations').insert(optimizationData);

        return optimizationData;
    }
}
