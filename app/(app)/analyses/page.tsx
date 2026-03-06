"use client";

import React, { useState } from "react";
import { CloudLightning, FileText, CheckCircle2, Clock, MoreVertical, RefreshCw, BarChart3, Database } from "lucide-react";
import Link from "next/link";

export default function AnalysesPage() {
    const records = [
        { id: "A-1029", app: "E-Commerce Gateway", platform: "AWS EKS", savings: "$1,450/mo", status: "Active", time: "2 hrs ago" },
        { id: "A-1028", app: "Analytics Workers", platform: "GCP GKE", savings: "$320/mo", status: "Active", time: "1 day ago" },
        { id: "A-1027", app: "Legacy CRM", platform: "Azure AKS", savings: "Reviewing", status: "Pending", time: "2 days ago" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 1000 }}>
            {/* Header / Hero Illustration */}
            <div style={{
                padding: "2.5rem", borderRadius: "1.5rem", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
                border: "1px solid rgba(255,255,255,0.05)"
            }}>
                <div style={{ position: "absolute", right: "-5%", top: "-50%", width: 400, height: 400, background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", position: "relative", zIndex: 10 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Database size={28} color="#F472B6" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Past Analyses</h1>
                        <p style={{ color: "#94A3B8", fontSize: "0.95rem", maxWidth: 500, lineHeight: 1.6 }}>View the history of all metric analyses, generated scaling configs, and simulated deployment savings.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#F8FAFC" }}>Recent Runs</h2>
                <Link href="/analyses/new" style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: "#6366F1", color: "#fff", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none" }}>
                    <CloudLightning size={14} /> New Analysis
                </Link>
            </div>

            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 60px", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>ID</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Workload</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Platform</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Est. Savings</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status</span>
                    <span></span>
                </div>
                {records.map(rec => (
                    <div key={rec.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 60px", gap: "1rem", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#6366F1" }}>{rec.id}</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F8FAFC" }}>{rec.app}</span>
                        <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>{rec.platform}</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#22C55E" }}>{rec.savings}</span>
                        <div>
                            {rec.status === "Active" ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.1)", color: "#34D399", padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700 }}><CheckCircle2 size={12} /> Applied</span>
                            ) : (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,158,11,0.1)", color: "#FBBF24", padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700 }}><Clock size={12} /> Pending</span>
                            )}
                        </div>
                        <button style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer", display: "flex", justifyContent: "center" }}>
                            <MoreVertical size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
