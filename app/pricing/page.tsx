"use client";

import React from "react";
import Link from "next/link";
import { CloudLightning, CheckCircle2, Zap, ArrowRight, Shield, Heart } from "lucide-react";
import { ModernLogo } from "../components/ModernLogo";

export default function PricingPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F8FAFC", fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* NAV */}
            <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                    <div style={{ padding: 4, width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ModernLogo size={20} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>CloudScale <span style={{ color: "#A5B4FC" }}>Genius</span></span>
                </Link>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <Link href="/" style={{ textDecoration: "none", fontSize: "0.875rem", color: "#94A3B8", fontWeight: 500 }}>← Home</Link>
                    <Link href="/dashboard" style={{ textDecoration: "none", fontSize: "0.875rem", color: "#fff", fontWeight: 700, background: "linear-gradient(135deg,#6366F1,#4F46E5)", padding: "0.5rem 1.25rem", borderRadius: "0.625rem" }}>Open Dashboard</Link>
                </div>
            </nav>

            <div style={{ maxWidth: 800, margin: "0 auto", padding: "6rem 1.5rem" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 1rem", borderRadius: 999, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34D399", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                        <Heart size={12} /> Community Powered
                    </div>
                    <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1rem", background: "linear-gradient(135deg,#fff,#C4B5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        100% Free. Forever.
                    </h1>
                    <p style={{ color: "#94A3B8", fontSize: "1.125rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
                        We built CloudScale Genius to democratize cloud cost optimization. No paywalls, no hidden enterprise tiers.
                    </p>
                </div>

                {/* The One Tier */}
                <div style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                    border: "2px solid rgba(99,102,241,0.5)",
                    borderRadius: "1.5rem",
                    padding: "3rem",
                    position: "relative",
                    boxShadow: "0 0 60px rgba(99,102,241,0.2)",
                    display: "flex", flexDirection: "column",
                    maxWidth: 480, margin: "0 auto"
                }}>
                    <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.3rem 1.25rem", borderRadius: "0 0 0.75rem 0.75rem" }}>
                        Everything Included
                    </div>

                    <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#818CF8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Pro Edition</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", justifyContent: "center", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "3.5rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>$0</span>
                        </div>
                        <p style={{ color: "#94A3B8", fontSize: "0.875rem" }}>Login optional. Start immediately.</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                        {[
                            "Unlimited CSV Analyses",
                            "AWS, GCP, Azure, and Kubernetes",
                            "YAML Generator & GitHub Deploy",
                            "PDF PDF Savings Reports",
                            "Detailed Audit Log",
                            "SOC2 & GDPR Compliant Security",
                        ].map(f => (
                            <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", color: "#E2E8F0", fontWeight: 500 }}>
                                <CheckCircle2 size={18} color="#818CF8" style={{ flexShrink: 0 }} />
                                {f}
                            </div>
                        ))}
                    </div>

                    <Link href="/dashboard" style={{
                        display: "block", textAlign: "center", padding: "1rem",
                        background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                        border: "none", borderRadius: "0.875rem", color: "#fff", fontWeight: 700, textDecoration: "none",
                        fontSize: "1rem", transition: "all .2s",
                        boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                    }}>
                        Analyze a CSV right now <ArrowRight size={15} style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} />
                    </Link>
                </div>

            </div>
        </div>
    );
}
