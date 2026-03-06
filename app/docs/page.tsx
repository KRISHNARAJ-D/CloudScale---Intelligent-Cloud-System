"use client";

import React from "react";
import Link from "next/link";
import {
    Book, FileCode, Terminal, HelpCircle,
    ChevronRight, ArrowLeft, Download, ExternalLink,
    Cpu, Shield, Zap, Database
} from "lucide-react";
import { ModernLogo } from "../components/ModernLogo";

export default function DocsPage() {
    const sections = [
        {
            id: "quick-start",
            title: "Quick Start Guide",
            icon: <Zap size={20} color="#6366F1" />,
            content: "CloudScale Genius analyzes your cloud infrastructure costs using only standard CSV exports from your cloud provider. No IAM keys, no agent base installation, and zero security risk."
        },
        {
            id: "aws",
            title: "AWS CloudWatch Guide",
            icon: <Cpu size={20} color="#F59E0B" />,
            content: "To generate your AWS metrics export:\n1. Open CloudWatch → Metrics.\n2. Select your instances and click 'View in Metrics'.\n3. Click the 'Graphed metrics' tab.\n4. Click the 'Actions' dropdown → 'Export as CSV'.\n5. Upload the resulting file to the CloudScale dashboard."
        },
        {
            id: "gcp",
            title: "Google Cloud Guide",
            icon: <Database size={20} color="#4285F4" />,
            content: "To export GCP Monitoring data:\n1. Visit Monitoring → Metrics Explorer.\n2. Query your GCE Instance CPU/Memory metrics.\n3. Click the 'Download' icon in the top right corner.\n4. Choose 'CSV' format.\n5. Upload to CloudScale Genius."
        },
        {
            id: "azure",
            title: "Azure Monitor Guide",
            icon: <Shield size={20} color="#0078D4" />,
            content: "For Azure users:\n1. Open your Resource Group or Virtual Machine.\n2. Navigate to 'Metrics' in the sidebar.\n3. Add 'Percentage CPU' and 'Memory' charts.\n4. Click 'Share' → 'Download as Excel/CSV'.\n5. Upload the CSV export to our engine."
        }
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
            {/* Header / Nav */}
            <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                    <div style={{ padding: 4, width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ModernLogo size={22} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", letterSpacing: "-0.02em" }}>CloudScale <span style={{ color: "#A5B4FC" }}>Genius</span></span>
                </Link>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                    <Link href="/" style={{ fontSize: "0.9rem", color: "#94A3B8", textDecoration: "none", fontWeight: 500 }}>Home</Link>
                    <Link href="/pricing" style={{ fontSize: "0.9rem", color: "#94A3B8", textDecoration: "none", fontWeight: 500 }}>Pricing</Link>
                    <Link href="/dashboard" style={{ fontSize: "0.875rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#A5B4FC", padding: "0.5rem 1.25rem", borderRadius: "0.625rem", textDecoration: "none", fontWeight: 700 }}>Dashboard</Link>
                </div>
            </nav>

            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "4rem 1.5rem", display: "grid", gridTemplateColumns: "250px 1fr", gap: "4rem" }}>

                {/* Sidebar */}
                <aside style={{ position: "sticky", top: 120, height: "fit-content" }}>
                    <h4 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>Documentation</h4>
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {sections.map(s => (
                            <li key={s.id}>
                                <a href={`#${s.id}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem", borderRadius: "0.5rem", color: s.id === "quick-start" ? "#F8FAFC" : "#94A3B8", background: s.id === "quick-start" ? "rgba(255,255,255,0.05)" : "transparent", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "all 0.2s" }}>
                                    {s.icon} {s.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Main Content */}
                <main style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>

                    <div id="quick-start">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <div style={{ padding: 10, borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <Book size={24} color="#818CF8" />
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Introduction</h2>
                        </div>
                        <p style={{ fontSize: "1.1rem", color: "#94A3B8", lineHeight: 1.7, marginBottom: "2rem" }}>
                            CloudScale Genius is an agentless cloud optimization engine. Instead of requiring you to install intrusive monitoring agents or grant us broad IAM roles to your production accounts, we simply parse the standard CSV exports that your cloud provider already generates.
                        </p>
                        <div style={{ padding: "1.5rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "1rem" }}>
                            <HelpCircle size={24} color="#34D399" style={{ flexShrink: 0 }} />
                            <div>
                                <h4 style={{ color: "#F8FAFC", marginBottom: "0.3rem" }}>Why agentless?</h4>
                                <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.6 }}>
                                    Security compliance and IAM sprawl are the biggest blockers to cost optimization. Our CSV-first approach bypasses months of security reviews.
                                </p>
                            </div>
                        </div>
                    </div>

                    {sections.slice(1).map(s => (
                        <div key={s.id} id={s.id}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {s.icon}
                                </div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{s.title}</h3>
                            </div>
                            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem", whiteSpace: "pre-line", color: "#CBD5E1", fontSize: "1rem", lineHeight: 1.8 }}>
                                {s.content}
                            </div>
                        </div>
                    ))}

                    {/* Footer for Docs */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "3rem", marginBottom: "4rem" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Ready to optimize?</h4>
                        <p style={{ color: "#94A3B8", marginBottom: "1.5rem" }}>Upload your first CSV and identify hidden cloud waste in seconds.</p>
                        <Link href="/sign-up" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.75rem", color: "#fff", textDecoration: "none", fontWeight: 700 }}>
                            Get Started for Free <ChevronRight size={16} />
                        </Link>
                    </div>

                </main>
            </div>

            <style>{`
                html { scroll-behavior: smooth; }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            `}</style>
        </div>
    );
}
