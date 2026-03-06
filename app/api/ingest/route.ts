import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { CloudMetricEngine } from "@/lib/cloud-engine";
import * as Sentry from "@sentry/nextjs";
import { sendSlackAlert } from "@/lib/slack";

/**
 * Enterprise Multi-Cloud Ingestion API
 * Handles metric gathering and optimization calculation every 5 minutes
 * for live monitoring and cost-saving dashboard.
 */

export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const credentials = await req.json(); // AWS/GCP regions and secrets

        // Step 1: Fetch Live AWS Infrastructure Metrics
        const awsResult = await CloudMetricEngine.fetchAWSMetrics(userId, credentials);

        if (!awsResult.success) {
            return NextResponse.json({ error: `AWS Sync Failed: \${awsResult.reason || awsResult.error}` }, { status: 400 });
        }

        // Step 2: Trigger Statistical Engine Optimization Pulse
        const optimization = await CloudMetricEngine.runOptimizationPulse(userId);

        return NextResponse.json({
            status: "INGESTION_SUCCESS",
            provider: "AWS",
            live_cpu: awsResult.value,
            optimization: optimization
        });
    } catch (error: any) {
        console.error("Multi-Cloud Sync Error:", error);
        Sentry.captureException(error);
        await sendSlackAlert("Ingestion Engine Exception", error.message || error.toString());
        return NextResponse.json({ error: "Internal Server Error during ingestion" }, { status: 500 });
    }
}
