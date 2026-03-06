"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, TrendingDown, DollarSign, Database, Server, Download, Shield, Copy, FileText, FileJson, Code, AlertTriangle } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { addAuditLog } from "../../utils";
import type { AnalysisResult, ParsedResource } from "../csvParser";

const actionLabel: Record<string, string> = {
    downgrade_instance: "Downgrade Instance",
    terminate_instance: "Terminate Instance",
    resize_pod: "Resize Pod",
    none: "No Action",
};

const statusColor: Record<string, string> = {
    "Optimal": "#34D399",
    "Over-provisioned": "#FBBF24",
    "Idle Waste": "#FB7185",
    "Critical": "#F97316",
};

const statusBg: Record<string, string> = {
    "Optimal": "rgba(16,185,129,0.1)",
    "Over-provisioned": "rgba(251,191,36,0.1)",
    "Idle Waste": "rgba(244,63,94,0.15)",
    "Critical": "rgba(249,115,22,0.15)",
};

export default function AnalysisResultPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const providerParam = searchParams?.get("provider") || "aws";

    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem(`analysis_${id}`);
        if (stored) {
            try {
                setResult(JSON.parse(stored));
            } catch {
                setNotFound(true);
            }
        } else {
            setNotFound(true);
        }
    }, [id]);

    const applyFix = () => {
        setSaved(true);
        addAuditLog(`Applied ${id} optimization configuration to target active instances`, "system");
        setTimeout(() => setSaved(false), 2500);
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

    const getYAML = () => {
        if (!result) return "";
        let y = `optimization:\n  provider: ${result.provider}\n  analysis_id: ${id}\n  total_monthly_cost: $${result.totalMonthlyCost}/month\n  estimated_savings: $${result.totalSavings}/month\n  waste_percent: ${result.wastePercent}%\n  recommendations:\n`;
        result.resources.filter(r => r.action !== "none").forEach(r => {
            y += `    - resource: ${r.id}\n`;
            y += `      role: ${r.role}\n`;
            y += `      action: ${r.action}\n`;
            y += `      avg_cpu_utilization: ${r.avgCpu}%\n`;
            y += `      avg_memory_utilization: ${r.avgMemory}%\n`;
            y += `      estimated_savings: $${r.estimatedSavings}/month\n`;
        });
        if (result.resources.filter(r => r.action === "none").length > 0) {
            y += `  optimal_resources:\n`;
            result.resources.filter(r => r.action === "none").forEach(r => {
                y += `    - resource: ${r.id}\n`;
                y += `      role: ${r.role}\n`;
                y += `      status: ${r.status}\n`;
            });
        }
        return y;
    };

    const handleCopyYAML = () => {
        navigator.clipboard.writeText(getYAML());
        addAuditLog(`Copied raw generated YAML config for ${id}`, "data");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const exportCSV = () => {
        if (!result) return;
        const headers = ["Resource ID", "Role", "Cloud Provider", "Resource Type", "Avg CPU %", "Avg Memory %", "Monthly Cost ($)", "Status", "Recommended Action", "Potential Savings ($)"];
        const rows = result.resources.map(r => [
            r.id, r.role, result.provider.toUpperCase(), r.type,
            r.avgCpu, r.avgMemory, r.monthlyCost, r.status, r.action, r.estimatedSavings
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        downloadFile(csvContent, `analysis-${id}-results.csv`, "text/csv");
        addAuditLog(`Downloaded CSV report for ${id}`, "data");
    };

    const exportJSON = () => {
        if (!result) return;
        downloadFile(JSON.stringify(result, null, 2), `analysis-${id}-results.json`, "application/json");
        addAuditLog(`Downloaded JSON configuration for ${id}`, "data");
    };

    const exportYAMLFile = () => {
        downloadFile(getYAML(), `analysis-${id}-results.yaml`, "text/yaml");
        addAuditLog(`Downloaded YAML configuration for ${id}`, "data");
    };

    // ---- Loading / Not found states ----
    if (notFound) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: "1.5rem", color: "#94A3B8" }}>
                <AlertTriangle size={48} color="#FBBF24" />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F8FAFC" }}>Analysis not found</h2>
                <p style={{ fontSize: "0.9rem", textAlign: "center", maxWidth: 420 }}>
                    This result may have expired from the session, or you navigated here directly. Please upload a new CSV to run a fresh analysis.
                </p>
                <button
                    onClick={() => router.push("/analyses/new")}
                    style={{ padding: "0.75rem 2rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", border: "none", borderRadius: "0.75rem", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                    ← New Analysis
                </button>
            </div>
        );
    }

    if (!result) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, color: "#94A3B8", fontSize: "1rem" }}>
                Loading analysis results…
            </div>
        );
    }

    const actionableResources = result.resources.filter(r => r.action !== "none");

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4rem" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                        onClick={() => router.back()}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F8FAFC", cursor: "pointer", transition: "all .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
                            {result.analysisName || `Results: ${id}`}
                        </h1>
                        <p style={{ color: "#94A3B8", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                            Analysis Complete · Provider: <strong style={{ color: "#A5B4FC" }}>{result.provider.toUpperCase()}</strong> · {result.resources.length} Resources Detected
                        </p>
                    </div>
                </div>
                <button onClick={exportCSV} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.6rem", color: "#F8FAFC", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* KPI Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                {[
                    { title: "Total Monthly Cost", val: `$${result.totalMonthlyCost.toLocaleString()}/mo`, icon: <DollarSign size={20} color="#F8FAFC" />, bg: "rgba(255,255,255,0.05)", tc: "#F8FAFC" },
                    { title: "Estimated Savings", val: `$${result.totalSavings.toLocaleString()}/mo`, icon: <TrendingDown size={20} color="#10B981" />, bg: "rgba(16,185,129,0.1)", tc: "#34D399" },
                    { title: "Wasted Resources", val: `${result.wastePercent}%`, icon: <Server size={20} color="#F43F5E" />, bg: "rgba(244,63,94,0.1)", tc: "#FB7185" },
                    { title: "Optimization Score", val: `${result.optimizationScore} / 100`, icon: <Shield size={20} color="#8B5CF6" />, bg: "rgba(139,92,246,0.1)", tc: "#A78BFA" },
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

                {/* CPU & Memory Utilization Chart */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC" }}>CPU & Memory Utilization</h3>
                        <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Derived from uploaded CSV metrics</p>
                    </div>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.utilizationTimeline}>
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
                                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
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
                        <p style={{ fontSize: "0.8rem", color: "#64748B" }}>Distribution by category</p>
                    </div>
                    <div style={{ flex: 1, height: 200, minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={result.costBreakdown} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="val">
                                    {result.costBreakdown.map((e, i) => <Cell key={i} fill={e.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Cost"]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
                        {result.costBreakdown.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#94A3B8" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} /> {item.name}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Recommendations & Resource Table */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem" }}>

                {/* Recommended Actions */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <CheckCircle2 size={18} color="#10B981" /> Recommended Actions
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {actionableResources.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#64748B" }}>
                                <CheckCircle2 size={32} color="#34D399" style={{ marginBottom: "0.5rem" }} />
                                <p style={{ fontWeight: 600, color: "#34D399" }}>All resources are optimal!</p>
                                <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>No immediate actions required.</p>
                            </div>
                        ) : actionableResources.slice(0, 3).map((r, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.25rem" }}>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>{actionLabel[r.action] || r.action}: {r.role}</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#34D399" }}>Save ${r.estimatedSavings}/mo</span>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: "0.875rem", lineHeight: 1.5 }}>
                                    <code style={{ color: "#818CF8" }}>{r.id}</code> ({r.type}) running at {r.avgCpu}% CPU,{" "}
                                    {r.avgMemory}% Memory. Status: <span style={{ color: statusColor[r.status] }}>{r.status}</span>.
                                </p>
                                <button
                                    onClick={applyFix}
                                    style={{ width: "100%", padding: "0.5rem", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "0.5rem", color: "#A5B4FC", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all .2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.25)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                                >
                                    Apply Configuration
                                </button>
                            </div>
                        ))}
                        {saved && <div style={{ fontSize: "0.75rem", background: "#10B981", color: "#fff", padding: "0.5rem", borderRadius: "0.5rem", textAlign: "center", fontWeight: 700 }}>Configuration applied to cluster!</div>}
                    </div>
                </div>

                {/* Resource Table */}
                <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Database size={18} color="#818CF8" /> Resource Log
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                                    {["Resource ID", "Role", "Type", "CPU%", "Mem%", "Cost/mo", "Status"].map(h => (
                                        <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.resources.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "#F8FAFC", fontFamily: "monospace", fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.id}</td>
                                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#94A3B8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.role}</td>
                                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#818CF8", fontWeight: 600, whiteSpace: "nowrap" }}>{r.type}</td>
                                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.85rem", color: r.avgCpu > 80 ? "#F97316" : r.avgCpu < 20 ? "#FB7185" : "#34D399", fontWeight: 700 }}>{r.avgCpu}%</td>
                                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.85rem", color: r.avgMemory > 80 ? "#F97316" : r.avgMemory < 20 ? "#FB7185" : "#34D399", fontWeight: 700 }}>{r.avgMemory}%</td>
                                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#F8FAFC", fontWeight: 600, whiteSpace: "nowrap" }}>${r.monthlyCost.toLocaleString()}</td>
                                        <td style={{ padding: "0.875rem 1rem" }}>
                                            <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", padding: "0.2rem 0.6rem", borderRadius: 999, background: statusBg[r.status] || "rgba(255,255,255,0.05)", color: statusColor[r.status] || "#F8FAFC", whiteSpace: "nowrap" }}>
                                                {r.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Export Section */}
            <div style={{ padding: "1.75rem", borderRadius: "1.25rem", background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>

                {/* YAML Preview */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "0.5rem" }}><Code size={18} color="#38BDF8" /> Generated Configuration</h3>
                        <button onClick={handleCopyYAML} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#34D399" : "#94A3B8", fontSize: "0.75rem", borderRadius: "0.5rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy YAML"}
                        </button>
                    </div>
                    <div style={{ background: "#0F172A", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.03)", overflowX: "auto", maxHeight: 320, overflowY: "auto" }}>
                        <pre style={{ margin: 0, fontSize: "0.78rem", color: "#E2E8F0", fontFamily: "monospace", lineHeight: 1.6 }}>
                            {getYAML()}
                        </pre>
                    </div>
                </div>

                {/* Download Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Download size={18} color="#A78BFA" /> Output Files</h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: "0.25rem", lineHeight: 1.5 }}>
                        Download the full optimisation report derived from your uploaded CSV.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[
                            { label: "Download CSV", sub: "Spreadsheet summary", color: "#34D399", bg: "rgba(16,185,129,0.1)", icon: <FileText size={18} color="#34D399" />, fn: exportCSV },
                            { label: "Download YAML", sub: "IaC configuration file", color: "#38BDF8", bg: "rgba(56,189,248,0.1)", icon: <Code size={18} color="#38BDF8" />, fn: exportYAMLFile },
                            { label: "Download JSON", sub: "API-ready format", color: "#FB7185", bg: "rgba(244,63,94,0.1)", icon: <FileJson size={18} color="#FB7185" />, fn: exportJSON },
                        ].map((btn, i) => (
                            <button key={i} onClick={btn.fn} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "#F8FAFC", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ background: btn.bg, padding: "0.4rem", borderRadius: "0.5rem" }}>{btn.icon}</div>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{btn.label}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{btn.sub}</div>
                                    </div>
                                </div>
                                <Download size={16} color="#94A3B8" />
                            </button>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
