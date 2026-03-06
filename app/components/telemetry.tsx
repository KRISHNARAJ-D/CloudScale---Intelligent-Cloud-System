"use client";

import React, { useEffect, Suspense } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
        person_profiles: "identified_only", // Privacy: only capture identified users (avoids anonymous mass profiling initially)
        capture_pageview: false, // Disabling automatic pageviews to manual route tracking
        autocapture: false, // Turn off autocapture to respect user privacy and focus solely on our funnel bounds.
    });
}

function PostHogPageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && typeof window !== 'undefined') {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture("$pageview", { $current_url: url });
        }
    }, [pathname, searchParams]);

    return null;
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider client={posthog}>
            <Suspense fallback={null}>
                <PostHogPageViewTracker />
            </Suspense>
            {/* Vercel standard web vitals / analytics */}
            <Analytics />
            <SpeedInsights />
            {children}
        </PostHogProvider>
    );
}
