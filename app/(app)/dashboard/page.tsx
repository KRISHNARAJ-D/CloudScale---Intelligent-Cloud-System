"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
    TrendingDown,
    DollarSign,
    Zap,
    Layers,
    UploadCloud,
    BarChart3,
    Cloud,
    ShieldCheck,
    ArrowRight,
    PlusCircle,
    ChevronRight,
} from "lucide-react";

const spendingData = [
    { month: "Aug", cost: 14200, optimized: 14200 },
    { month: "Sep", cost: 15100, optimized: 15100 },
    { month: "Oct", cost: 16800, optimized: 16800 },
    { month: "Nov", cost: 18200, optimized: 14500 },
    { month: "Dec", cost: 19500, optimized: 13200 },
    { month: "Jan", cost: 21000, optimized: 13800 },
    { month: "Feb", cost: 22400, optimized: 14100 },
];

const resourceUsageData = [
    { time: "00:00", cpu: 45, mem: 60 },
    { time: "04:00", cpu: 30, mem: 55 },
    { time: "08:00", cpu: 85, mem: 75 },
    { time: "12:00", cpu: 92, mem: 80 },
    { time: "16:00", cpu: 88, mem: 78 },
    { time: "20:00", cpu: 60, mem: 65 },
];

const recommendations = [
    { title: "Downsize 4 Idle RDS Instances", impact: "High", savings: "$450/mo", type: "Database" },
    { title: "Delete 12 Unattached EBS Volumes", impact: "Medium", savings: "$120/mo", type: "Storage" },
    { title: "Apply Compute Savings Plan", impact: "High", savings: "$1,200/mo", type: "Compute" },
];

const kpis = [
    { label: "Infrastructure Waste", val: "32.4%", trend: "-12.5%", positive: true, icon: <TrendingDown size={19} color="#34d399" /> },
    { label: "Monthly Savings", val: "$1,247", trend: "+18.2%", positive: true, icon: <DollarSign size={19} color="#818cf8" /> },
    { label: "Last Optimization", val: "5m ago", trend: "Healthy", positive: true, icon: <Zap size={19} color="#fbbf24" /> },
    { label: "Optimized Nodes", val: "142", trend: "+5 today", positive: true, icon: <Layers size={19} color="#e879f9" /> },
];

const recentAnalyses = [
    { id: "A-247", provider: "AWS CloudWatch", savings: "$91/mo", pct: "32%", confidence: "92%", date: "5 min ago" },
    { id: "A-246", provider: "GCP Monitoring", savings: "$64/mo", pct: "27%", confidence: "88%", date: "2 hrs ago" },
    { id: "A-245", provider: "K8s Prometheus", savings: "$128/mo", pct: "41%", confidence: "94%", date: "Yesterday" },
];

export default function DashboardPage() {
    const { user } = useUser();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 800);
        return () => clearTimeout(t);
    }, []);

    const card = (children: React.ReactNode, extra?: React.CSSProperties) => (
        <div style={{ background: "rgba(5,5,15,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.5rem", boxShadow: "0 4px 40px rgba(0,0,0,0.5)", ...extra }}>
            {children}
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", animation: "fadeUp .6s ease-out both" }}>

            {/* HEADER ROW with Premium Header Illustration */}
            <div style={{
                padding: "2.5rem 2rem", borderRadius: "1.5rem", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))",
                border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem"
            }}>
                <div style={{ position: "absolute", top: "-50%", left: "-10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-50%", right: "-10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 10 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.85rem", background: "rgba(99,102,241,0.15)", borderRadius: 999, border: "1px solid rgba(99,102,241,0.3)", color: "#A5B4FC", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                        <Cloud size={12} fill="#A5B4FC" /> Overall State: Optimized
                    </div>
                    <h1 style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.375rem", lineHeight: 1.1 }}>
                        Welcome back, {user?.firstName || "Engineer"}
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: 500 }}>
                        Enterprise ID: <code style={{ color: "#818cf8", fontFamily: "monospace", padding: "2px 6px", background: "rgba(0,0,0,0.3)", borderRadius: 4 }}>CSG-PRO-{user?.id?.slice(-5).toUpperCase() || "00922"}</code> · 4 cloud regions active
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", position: "relative", zIndex: 10 }}>
                    <Link href="/analyses/new" className="btn-primary" style={{ fontSize: "0.875rem", padding: "0.75rem 1.5rem", textDecoration: "none" }}>
                        <PlusCircle size={16} /> New Analysis
                    </Link>
                    <button className="btn-secondary" style={{ fontSize: "0.875rem", padding: "0.75rem 1.25rem" }}>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "1.25rem" }}>
                {!ready ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="shimmer glass-card" style={{ padding: "1.5rem", height: 120 }}></div>
                    ))
                ) : (
                    kpis.map((k, i) => (
                        <div key={i} className="glass-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 12, right: 16, opacity: 0.06, transform: "scale(3)", transformOrigin: "top right" }}>{k.icon}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                                {k.icon}
                                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>{k.label}</span>
                            </div>
                            <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{k.val}</div>
                            <div style={{ marginTop: "0.375rem", fontSize: "0.7rem", fontWeight: 700, color: k.trend.includes("-") || k.positive ? "#34d399" : "#94a3b8" }}>{k.trend}</div>
                        </div>
                    ))
                )}
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr", gap: "1.5rem" }}>
                {/* Spending Chart */}
                {card(
                    <div style={{ padding: "1.75rem 2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <BarChart3 size={17} color="#818cf8" /> Monthly Cloud Spending
                                </h3>
                                <p style={{ fontSize: "0.75rem", color: "#475569" }}>Actual vs Optimized Projection</p>
                            </div>
                            <select style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", color: "#94a3b8", fontSize: "0.75rem", padding: "0.375rem 0.75rem", outline: "none" }}>
                                <option>Last 6 months</option>
                                <option>Last 12 months</option>
                            </select>
                        </div>
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ready ? spendingData : []}>
                                    <defs>
                                        <linearGradient id="grad-cost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#475569" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="grad-opt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="month" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                                    <Tooltip contentStyle={{ background: "rgba(5,5,15,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", fontSize: 12 }} itemStyle={{ color: "#fff" }} />
                                    <Area type="monotone" dataKey="cost" name="Actual Cost" stroke="#64748b" strokeWidth={2.5} fill="url(#grad-cost)" />
                                    <Area type="monotone" dataKey="optimized" name="Optimized Projection" stroke="#34d399" strokeWidth={2.5} fill="url(#grad-opt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {card(
                    <div style={{ padding: "1.75rem", height: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#a5b4fc", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Zap size={16} /> AI Optimization Recommendations
                            </h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                            {recommendations.map((rec, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div>
                                        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.25rem" }}>{rec.title}</p>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 4, background: rec.impact === "High" ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)", color: rec.impact === "High" ? "#FCA5A5" : "#FBBF24" }}>{rec.impact} Impact</span>
                                            <span style={{ fontSize: "0.65rem", color: "#64748B" }}>{rec.type}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#34D399" }}>{rec.savings}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/analyses" className="btn-secondary" style={{ marginTop: "1rem", width: "100%", fontSize: "0.8rem", padding: "0.6rem" }}>
                            View all insights <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </div>

            {/* RECENT ANALYSES */}
            {card(
                <div style={{ padding: "1.75rem 2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>Recent Analyses</h3>
                        <Link href="/analyses/new" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#818cf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            New Analysis <ChevronRight size={14} />
                        </Link>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                {["ID", "Provider", "Savings", "Reduction", "Confidence", "When"].map((h, i) => (
                                    <th key={i} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentAnalyses.map((row, i) => (
                                <tr key={i} style={{ borderBottom: i < recentAnalyses.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer" }}>
                                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.8rem", fontWeight: 700, color: "#818cf8", fontFamily: "monospace" }}>{row.id}</td>
                                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>{row.provider}</td>
                                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem", fontWeight: 800, color: "#34d399" }}>{row.savings}</td>
                                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.8rem", color: "#fff", fontWeight: 700 }}>{row.pct}</td>
                                    <td style={{ padding: "1rem 0.75rem" }}>
                                        <span style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", borderRadius: 999, padding: "0.2rem 0.75rem", fontSize: "0.7rem", fontWeight: 700 }}>{row.confidence}</span>
                                    </td>
                                    <td style={{ padding: "1rem 0.75rem", fontSize: "0.75rem", color: "#475569" }}>{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {recentAnalyses.length === 0 && (
                        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                            <UploadCloud size={40} color="#334155" style={{ margin: "0 auto 1rem" }} />
                            <p style={{ fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>No analyses yet</p>
                            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Upload your first CSV to see savings instantly 🎉</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
