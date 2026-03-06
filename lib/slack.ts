// Utility to push alerts to a Slack channel webhook

export async function sendSlackAlert(message: string, errorDetails?: any) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const payload = {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `🚨 *CloudScale Alert:* ${message}`
                }
            }
        ]
    };

    if (errorDetails) {
        (payload.blocks as any[]).push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: `\`\`\`${JSON.stringify(errorDetails, null, 2).substring(0, 2000)}\`\`\``
            }
        });
    }

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Failed to send Slack alert:", error);
    }
}
