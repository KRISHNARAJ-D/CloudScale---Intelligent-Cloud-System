"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, TrendingDown, DollarSign, Database, Server, Download, Shield, LayoutList, Check, Copy, FileText, FileJson, Code } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { addAuditLog } from "../../utils";

export default function AnalysisResultPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const providerParam = searchParams?.get("provider") || "aws"; // fallback
    const [saved, setSaved] = useState(false);

    // Mock interactive data
    const breakdown = [
        { name: "Compute", val: 5400, color: "#6366F1" },
        { name: "Database", val: 2100, color: "#EC4899" },
        { name: "Storage", val: 1200, color: "#10B981" },
        { name: "Network", val: 800, color: "#F59E0B" }
    ];

    const utilization = [
        { d: "Mon", cpu: 40, mem: 60 },
        { d: "Tue", cpu: 30, mem: 55 },
        { d: "Wed", cpu: 65, mem: 75 },
        { d: "Thu", cpu: 90, mem: 80 },
        { d: "Fri", cpu: 85, mem: 78 },
        { d: "Sat", cpu: 20, mem: 65 },
        { d: "Sun", cpu: 15, mem: 60 },
    ];

    const nodes = [
        { id: "i-0abcd1234ef", role: "Frontend API", size: "t3.xlarge", util: "12%", status: "Over-provisioned" },
        { id: "i-0xyzw9876ab", role: "Worker Node", size: "m5.large", util: "8%", status: "Idle Waste" },
        { id: "i-0klmn5432cd", role: "Redis Cache", size: "r5.2xlarge", util: "92%", status: "Optimal" },
    ];

    const applyFix = () => {
        setSaved(true);
        addAuditLog(`Applied ${id} optimization configuration to target active instances`, "system");
        setTimeout(() => setSaved(false), 2000);
    };

    const [copied, setCopied] = useState(false);

    const exportData = {
        optimization: {
            provider: providerParam,
            recommendations: nodes.map(n => ({
                resource: n.role,
                resource_id: n.id,
                action: n.status.toLowerCase().includes("over") ? "downgrade_instance" : n.status.includes("Idle") ? "terminate_instance" : "none",
                estimated_savings: n.role.includes("API") ? "$340/month" : n.role.includes("Worker") ? "$120/month" : "$0/month"
            }))
        }
    };

    const getYAML = () => {
        let y = `optimization:\n  provider: ${providerParam}\n  recommendations:\n`;
        exportData.optimization.recommendations.forEach(r => {
            y += `    - resource: ${r.resource}\n`;
            y += `      action: ${r.action}\n`;
            y += `      estimated_savings: ${r.estimated_savings}\n`;
        });
        return y;
    };

    const handleCopyYAML = () => {
        navigator.clipboard.writeText(getYAML());
        addAuditLog(`Copied raw generated YAML config for ${id}`, "data");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        const headers = ["Resource Name", "Cloud Provider", "Resource Type", "Monthly Cost", "Optimization Recommendation", "Potential Savings"];
        const rows = nodes.map(n => [
            n.role,
            providerParam.toUpperCase(),
            n.size,
            n.role.includes("API") ? "$1,200" : "$800",
            n.status,
            n.role.includes("API") ? "$340/mo" : n.role.includes("Worker") ? "$120/mo" : "$0"
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        downloadFile(csvContent, `analysis-${id}-results.csv`, "text/csv");
        addAuditLog(`Downloaded CSV report for ${id}`, "data");
    };

    const exportJSON = () => {
        downloadFile(JSON.stringify(exportData, null, 2), `analysis-${id}-results.json`, "application/json");
        addAuditLog(`Downloaded JSON configuration for ${id}`, "data");
    };

    const exportYAMLFile = () => {
        downloadFile(getYAML(), `analysis-${id}-results.yaml`, "text/yaml");
        addAuditLog(`Downloaded YAML configuration for ${id}`, "data");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4rem" }}>

            {/* Header / Navigate Back */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F8FAFC", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Results: {id}</h1>
                        <p style={{ color: "#94A3B8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} /> Analysis Complete · High Confidence
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={exportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.6rem", color: "#F8FAFC", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                {[
                    { title: "Current Total Cost", val: "$9,500/mo", icon: <DollarSign size={20} color="#F8FAFC" />, bg: "rgba(255,255,255,0.05)", tc: "#F8FAFC" },
                    { title: "Estimated Savings", val: "$2,850/mo", icon: <TrendingDown size={20} color="#10B981" />, bg: "rgba(16,185,129,0.1)", tc: "#34D399" },
                    { title: "Wasted Resources", val: "30.0%", icon: <Server size={20} color="#F43F5E" />, bg: "rgba(244,63,94,0.1)", tc: "#FB7185" },
                    { title: "Optimization Score", val: "92 / 100", icon: <Shield size={20} color="#8B5CF6" />, bg: "rgba(139,92,246,0.1)", tc: "#A78BFA" }
                ].map((k, i) => (
                    <div key={i} style={{ padding: "1.5rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {k.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{k.title}</p>
                            <h3 style={{ fontSize: "1.875rem", fontWeight: 800, color: k.tc, letterSpacing: "-0.03em" }}>{k.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>

                {/* Resource Usage Area Chart */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC" }}>CPU & Memory Utilization</h3>
                        <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Analyzed based on last 7 days metrics</p>
                    </div>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={utilization}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="d" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="cpu" name="CPU Utilization" stroke="#6366F1" strokeWidth={3} fill="url(#colorCpu)" />
                                <Area type="monotone" dataKey="mem" name="Memory Utilization" stroke="#10B981" strokeWidth={3} fill="url(#colorMem)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cost Breakdown Pie Chart */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC" }}>Cost Breakdown</h3>
                        <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Distribution of current waste</p>
                    </div>
                    <div style={{ flex: 1, height: 200, minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={breakdown} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="val">
                                    {breakdown.map((e, i) => <Cell key={i} fill={e.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`$${v}`, "Cost"]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                        {breakdown.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} /> {item.name}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Recommendations & Table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem" }}>

                {/* Actions */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={18} color="#10B981" /> Recommended Actions</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {nodes.slice(0, 2).map((n, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>Downsize {n.role}</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#34D399" }}>Save $340/mo</span>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "1rem", lineHeight: 1.5 }}>
                                    Instance `{n.id}` ({n.size}) has consistently run at {n.util} utilization. Propose migrating to t3.medium.
                                </p>
                                <button onClick={applyFix} style={{ width: "100%", padding: "0.5rem", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "0.5rem", color: "#A5B4FC", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.25)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}>
                                    Apply Configuration
                                </button>
                            </div>
                        ))}
                        {saved && <div style={{ fontSize: "0.75rem", background: "#10B981", color: "#fff", padding: "0.5rem", borderRadius: "0.5rem", textAlign: "center", fontWeight: 700, animation: "fadeUp 0.3s ease-out" }}>Configuration applied to cluster!</div>}
                    </div>
                </div>

                {/* Resource List */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Database size={18} color="#818CF8" /> Resource Log</h3>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                                    <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Resource ID</th>
                                    <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Role</th>
                                    <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Type</th>
                                    <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>P99 Util</th>
                                    <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.map((n, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#F8FAFC", fontFamily: "monospace", fontWeight: 600 }}>{n.id}</td>
                                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#94A3B8" }}>{n.role}</td>
                                        <td style={{ padding: "1rem", fontSize: "0.8rem", color: "#818CF8", fontWeight: 600 }}>{n.size}</td>
                                        <td style={{ padding: "1rem", fontSize: "0.85rem", color: "#F8FAFC", fontWeight: 700 }}>{n.util}</td>
                                        <td style={{ padding: "1rem" }}>
                                            <span style={{
                                                fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", padding: "0.2rem 0.6rem", borderRadius: 999,
                                                background: n.status === "Optimal" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.15)",
                                                color: n.status === "Optimal" ? "#34D399" : "#FB7185"
                                            }}>{n.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Export & Configuration output section */}
            <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

                {/* Configuration Code Output */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "0.5rem" }}><Code size={18} color="#38BDF8" /> Generated Configuration</h3>
                        <button onClick={handleCopyYAML} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#34D399" : "#94A3B8", fontSize: "0.75rem", borderRadius: "0.5rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy YAML"}
                        </button>
                    </div>
                    <div style={{ background: "#0F172A", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.03)", overflowX: "auto" }}>
                        <pre style={{ margin: 0, fontSize: "0.8rem", color: "#E2E8F0", fontFamily: "monospace", lineHeight: 1.5 }}>
                            {getYAML()}
                        </pre>
                    </div>
                </div>

                {/* File Download Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Download size={18} color="#A78BFA" /> Output Files</h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                        Download the full system report including infrastructure analysis logs, cost breakdowns, and direct execution configurations.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "#F8FAFC", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ background: "rgba(16,185,129,0.1)", padding: "0.4rem", borderRadius: "0.5rem" }}><FileText size={18} color="#34D399" /></div>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Download CSV</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Spreadsheet summary</div>
                                </div>
                            </div>
                            <Download size={16} color="#94A3B8" />
                        </button>

                        <button onClick={exportYAMLFile} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "#F8FAFC", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ background: "rgba(56,189,248,0.1)", padding: "0.4rem", borderRadius: "0.5rem" }}><Code size={18} color="#38BDF8" /></div>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Download YAML</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>IaC configuration file</div>
                                </div>
                            </div>
                            <Download size={16} color="#94A3B8" />
                        </button>

                        <button onClick={exportJSON} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "#F8FAFC", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ background: "rgba(244,63,94,0.1)", padding: "0.4rem", borderRadius: "0.5rem" }}><FileJson size={18} color="#FB7185" /></div>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Download JSON</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>API-ready format</div>
                                </div>
                            </div>
                            <Download size={16} color="#94A3B8" />
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
