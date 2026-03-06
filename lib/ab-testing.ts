"use client";

import { useFeatureFlagEnabled, useFeatureFlagPayload } from "posthog-js/react";

/**
 * Enterprise A/B Testing Framework powered by PostHog
 * Provides a clean interface for feature flags, multi-variate testing, and progressive rollouts
 * while keeping core SaaS components isolated from underlying analytics libraries.
 */
export function useABTest(flagKey: string, defaultValue: boolean = false): boolean {
    const isEnabled = useFeatureFlagEnabled(flagKey);

    // Return true/false based on flag (fallback to defaultValue if network/posthog block failed)
    if (isEnabled === undefined) {
        return defaultValue;
    }

    return isEnabled;
}

export function useMultiVariateTest<T>(flagKey: string, defaultValue: T): T {
    const isEnabled = useFeatureFlagEnabled(flagKey);
    const payload = useFeatureFlagPayload(flagKey);

    if (isEnabled && payload !== undefined) {
        return payload as T;
    }

    return defaultValue;
}
