"use client";

import React from "react";
import { Download, FileText, BarChart3, TrendingDown, LayoutList, FileSpreadsheet } from "lucide-react";

export default function ReportsPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 1000 }}>
            {/* Header / Hero Illustration */}
            <div style={{
                padding: "2.5rem", borderRadius: "1.5rem", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
                border: "1px solid rgba(255,255,255,0.05)"
            }}>
                <div style={{ position: "absolute", right: "-10%", bottom: "-50%", width: 500, height: 500, background: "radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", position: "relative", zIndex: 10 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BarChart3 size={28} color="#FACC15" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Executive Reports</h1>
                        <p style={{ color: "#94A3B8", fontSize: "0.95rem", maxWidth: 500, lineHeight: 1.6 }}>Download structured FinOps summaries, PDF exports, and engineering board audit logs mapping cloud utilization.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

                <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={20} color="#818CF8" /></div>
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F8FAFC" }}>Monthly Savings Snapshot</h3>
                            <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Generated Mar 1, 2026</p>
                        </div>
                    </div>
                    <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Total Waste Eliminated</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#22C55E" }}>$4,120</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Active Optimizations</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC" }}>3 Clusters</span>
                        </div>
                    </div>
                    <button style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#F8FAFC", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileSpreadsheet size={20} color="#34D399" /></div>
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F8FAFC" }}>Raw Metrics Export</h3>
                            <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Weekly data dump (CSV)</p>
                        </div>
                    </div>
                    <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Data Points</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC" }}>142,000+</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>File Size</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC" }}>12.4 MB</span>
                        </div>
                    </div>
                    <button style={{ width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#F8FAFC", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Download size={16} /> Download CSV
                    </button>
                </div>

            </div>
        </div>
    );
}
