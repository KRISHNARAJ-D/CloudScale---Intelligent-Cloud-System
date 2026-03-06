import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    tracesSampleRate: 1.0,
    debug: false,
    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,       // Privacy: Keep user inputs/secrets anonymous
            blockAllMedia: true,     // Privacy: Don't capture user imagery
        }),
    ],
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    // Privacy specific setting - strip out IPs and User Agents (handled at server level, but explicit here)
    beforeSend(event) {
        if (event.user) {
            delete event.user.ip_address;
        }
        return event;
    }
});
