"use client";

import React, { useState, useEffect } from "react";
import { Download, Search, Filter, Shield, Activity, HardDrive, Key, UserPlus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AuditLogPage() {
    const { user: clerkUser } = useUser();
    const fallbackEmail = clerkUser?.primaryEmailAddress?.emailAddress || "user@example.com";
    const [search, setSearch] = useState("");
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const loadLogs = () => {
            const stored = localStorage.getItem("audit_logs_v1");
            if (stored) {
                setLogs(JSON.parse(stored));
            } else {
                const initial = [
                    { id: "A-591", event: "Generated HPA YAML", user: "jordan.kim@example.com", time: "5 minutes ago", ip: "192.168.1.104", type: "system" },
                    { id: "A-590", event: "Uploaded AWS CloudWatch CSV", user: "jordan.kim@example.com", time: "12 minutes ago", ip: "192.168.1.104", type: "data" },
                    { id: "A-589", event: "Invited user 'alex.chen@example.com'", user: "admin@example.com", time: "2 hours ago", ip: "10.0.0.52", type: "auth" },
                    { id: "A-588", event: "Changed optimization threshold to 68%", user: "admin@example.com", time: "1 day ago", ip: "10.0.0.52", type: "settings" },
                    { id: "A-587", event: "Successful login via Google", user: "jordan.kim@example.com", time: "1 day ago", ip: "192.168.1.104", type: "auth" },
                    { id: "A-586", event: "Exported Savings Report (PDF)", user: "admin@example.com", time: "3 days ago", ip: "10.0.0.52", type: "system" },
                    { id: "A-585", event: "API Key rotated", user: "system", time: "1 week ago", ip: "internal", type: "security" },
                ];
                setLogs(initial);
                localStorage.setItem("audit_logs_v1", JSON.stringify(initial));
            }
        };

        loadLogs();
        window.addEventListener("audit_update", loadLogs);
        return () => window.removeEventListener("audit_update", loadLogs);
    }, []);

    const filteredLogs = logs.filter(l =>
        l.event?.toLowerCase().includes(search.toLowerCase()) ||
        l.user?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 1000 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>Audit Log</h1>
                    <p style={{ color: "#64748B", fontSize: "0.875rem" }}>Immutable record of all system, data, and authentication events.</p>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#F8FAFC", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
                    <Search size={16} color="#64748B" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        type="text"
                        placeholder="Search events or users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.75rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none" }}
                    />
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.75rem", color: "#CBD5E1", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                    <Filter size={14} /> Filter
                </button>
            </div>

            {/* Table */}
            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>Event ID</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>Timestamp</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>Activity</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>User / Actor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, i) => (
                                <tr key={log.id} style={{ borderBottom: i < filteredLogs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", transition: "background .2s" }}>
                                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", color: "#64748B", fontWeight: 500, whiteSpace: "nowrap" }}>{log.id}</td>
                                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", color: "#CBD5E1", whiteSpace: "nowrap" }}>{log.time}</td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ width: 28, height: 28, borderRadius: "0.5rem", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {log.type === "system" && <Activity size={14} color="#818CF8" />}
                                                {log.type === "data" && <HardDrive size={14} color="#34D399" />}
                                                {log.type === "auth" && <UserPlus size={14} color="#FBBF24" />}
                                                {log.type === "settings" && <Shield size={14} color="#A78BFA" />}
                                                {log.type === "security" && <Key size={14} color="#F87171" />}
                                            </div>
                                            <span style={{ fontSize: "0.875rem", color: "#F8FAFC", fontWeight: 500 }}>{log.event}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#CBD5E1" }}>
                                        {log.user.includes("jordan.kim") || log.user.includes("admin@") ? fallbackEmail : log.user}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#64748B", fontSize: "0.9rem" }}>No matching events found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
