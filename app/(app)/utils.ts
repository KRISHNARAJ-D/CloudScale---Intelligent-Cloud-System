export const addAuditLog = (event: string, type: "system" | "data" | "auth" | "settings" | "security") => {
    if (typeof window === "undefined") return;
    try {
        const stored = localStorage.getItem("audit_logs_v1");
        let logs = [];
        if (stored) {
            logs = JSON.parse(stored);
        } else {
            logs = [
                { id: "A-591", event: "Generated HPA YAML", user: "jordan.kim@example.com", time: "5 minutes ago", ip: "192.168.1.104", type: "system" },
                { id: "A-590", event: "Uploaded AWS CloudWatch CSV", user: "jordan.kim@example.com", time: "12 minutes ago", ip: "192.168.1.104", type: "data" },
                { id: "A-589", event: "Invited user 'alex.chen@example.com'", user: "admin@example.com", time: "2 hours ago", ip: "10.0.0.52", type: "auth" },
                { id: "A-588", event: "Changed optimization threshold to 68%", user: "admin@example.com", time: "1 day ago", ip: "10.0.0.52", type: "settings" },
                { id: "A-587", event: "Successful login via Google", user: "jordan.kim@example.com", time: "1 day ago", ip: "192.168.1.104", type: "auth" },
                { id: "A-586", event: "Exported Savings Report (PDF)", user: "admin@example.com", time: "3 days ago", ip: "10.0.0.52", type: "system" },
                { id: "A-585", event: "API Key rotated", user: "system", time: "1 week ago", ip: "internal", type: "security" },
            ];
        }

        const newLog = {
            id: "A-" + Math.floor(1000 + Math.random() * 9000),
            event,
            user: "admin@enterprise.com",
            time: "Just now",
            ip: "192.168.1.104",
            type
        };

        const updated = [newLog, ...logs];
        localStorage.setItem("audit_logs_v1", JSON.stringify(updated));
        window.dispatchEvent(new Event('audit_update'));
    } catch { }
};
