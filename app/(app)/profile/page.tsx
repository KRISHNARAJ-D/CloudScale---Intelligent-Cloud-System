"use client";

import React from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Mail, Globe, Twitter, Github, Calendar, BarChart3, Award, TrendingDown } from "lucide-react";

const stats = [
    { label: "Total Analyses", val: "12", icon: <BarChart3 size={17} color="#818CF8" /> },
    { label: "Total Saved", val: "$1,847", icon: <TrendingDown size={17} color="#34D399" /> },
    { label: "Team Members", val: "4", icon: <Award size={17} color="#FBBF24" /> },
    { label: "Member Since", val: "Mar '26", icon: <Calendar size={17} color="#F472B6" /> },
];

const recentActivity = [
    { action: "Uploaded AWS CloudWatch CSV", time: "5 min ago", color: "#818CF8" },
    { action: "Generated HPA YAML for k8s cluster", time: "2 hrs ago", color: "#34D399" },
    { action: "Saved $91/mo on EC2 fleet", time: "Yesterday", color: "#FBBF24" },
    { action: "Invited 2 team members", time: "2 days ago", color: "#F472B6" },
];

export default function ProfilePage() {
    const { user } = useUser();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 760 }}>
            {/* Hero */}
            <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "1.5rem", padding: "2.5rem 2rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                    <div style={{ width: 88, height: 88, borderRadius: "1.5rem", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 900, color: "#fff" }}>
                        {user?.firstName?.[0] || "C"}
                    </div>
                    <div style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: "#10B981", border: "3px solid #0F172A" }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F8FAFC", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
                        {user?.fullName || user?.firstName || "Cloud Architect"}
                    </h1>
                    <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginBottom: "1rem" }}>
                        {user?.primaryEmailAddress?.emailAddress || "engineer@enterprise.com"}
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#A5B4FC", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.875rem", borderRadius: 999 }}>Pro Plan</span>
                        <span style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.25rem 0.875rem", borderRadius: 999 }}>SOC2 Verified</span>
                    </div>
                </div>
                <UserButton appearance={{ elements: { avatarBox: "w-10 h-10 rounded-xl" } }} />
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
                {stats.map((s) => (
                    <div key={s.label} style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.125rem", padding: "1.25rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>{s.icon}</div>
                        <div style={{ fontSize: "1.625rem", fontWeight: 900, color: "#F8FAFC", letterSpacing: "-0.03em" }}>{s.val}</div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "0.25rem" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Recent activity */}
            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F8FAFC" }}>Recent Activity</h3>
                </div>
                {recentActivity.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem", borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                        <p style={{ flex: 1, fontSize: "0.875rem", color: "#CBD5E1" }}>{a.action}</p>
                        <span style={{ fontSize: "0.75rem", color: "#475569", whiteSpace: "nowrap" }}>{a.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
