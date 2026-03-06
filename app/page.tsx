"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
    CloudLightning, UploadCloud, Zap, BarChart3, Shield, Download,
    CheckCircle2, ArrowRight, ChevronRight, Menu, X, Users, Globe,
    TrendingDown, Star, Github, Settings2, Layers,
} from "lucide-react";

const features = [
    { icon: <UploadCloud size={22} color="#818CF8" />, title: "CSV Upload (Any Cloud)", desc: "Drop AWS CloudWatch, GCP Monitoring, Prometheus, or Azure Monitor exports. Schema auto-detection in seconds.", color: "rgba(99,102,241,0.12)" },
    { icon: <Zap size={22} color="#F59E0B" />, title: "Statistical AI Engine", desc: "Monte Carlo optimization finds your exact CPU threshold (default 68%) to balance cost vs performance.", color: "rgba(245,158,11,0.12)" },
    { icon: <BarChart3 size={22} color="#34D399" />, title: "Instant Savings Report", desc: "See exactly how much you're wasting and what the HPA/ASG config change will save — before you deploy.", color: "rgba(52,211,153,0.12)" },
    { icon: <Download size={22} color="#F472B6" />, title: "YAML Config Generator", desc: "Get production-ready HPA, ASG, or GCP Autoscaler YAML with one click. No boilerplate to write.", color: "rgba(244,114,182,0.12)" },
    { icon: <Github size={22} color="#94A3B8" />, title: "One-Click GitHub Deploy", desc: "Commit the optimized config directly to your repo. Review the PR, merge, and watch savings appear.", color: "rgba(148,163,184,0.12)" },
    { icon: <Shield size={22} color="#A78BFA" />, title: "Zero IAM Access Required", desc: "nOps needs full IAM. We work with anonymous CSV exports — your credentials never leave your machine.", color: "rgba(167,139,250,0.12)" },
];

const steps = [
    { num: "01", title: "Export CSV", desc: "Download a metrics export from AWS CloudWatch, GCP Console, or kubectl top. Takes 30 seconds.", icon: <UploadCloud size={28} color="#6366F1" /> },
    { num: "02", title: "Upload & Detect", desc: "Drag-drop or browse. We auto-detect your cloud provider, timezone, and metric schema.", icon: <Settings2 size={28} color="#8B5CF6" /> },
    { num: "03", title: "AI Optimization", desc: "Our statistical engine analyzes 168hrs of data and finds the optimal scaling configuration.", icon: <Zap size={28} color="#A78BFA" /> },
    { num: "04", title: "Deploy & Save", desc: "Copy the YAML diff or deploy straight to GitHub. Average result: 35% cost reduction.", icon: <TrendingDown size={28} color="#34D399" /> },
];

const testimonials = [
    { quote: "We cut our AWS bill by $4,200/month in the first week. This is insane.", name: "Jordan Kim", role: "Senior SRE @ Fintech Corp", stars: 5 },
    { quote: "No IAM setup, no agents. Just CSV → YAML. Finally something that works.", name: "Maria Santos", role: "DevOps Lead @ HealthTech", stars: 5 },
    { quote: "Replaced our nOps contract ($1,800/mo) with CloudScale Genius's Team plan.", name: "Alex Chen", role: "Platform Engineer @ RetailCo", stars: 5 },
];

const nOpsDiff = [
    ["Setup time", "3–7 days", "30 seconds ✓"],
    ["Cloud access needed", "Full IAM", "None ✓"],
    ["Supported clouds", "AWS + Azure", "4 clouds ✓"],
    ["Starting price", "$500+/mo", "Free ✓"],
    ["YAML control", "Black box", "Full YAML ✓"],
    ["Team seats", "Paid add-on", "Free ✓"],
];

export default function LandingPage() {
    const { isSignedIn } = useUser();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    return (
        <div style={{ background: "#0F172A", color: "#F8FAFC", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

            {/* ──────────── NAV ──────────── */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 100,
                background: scrolled ? "rgba(15,23,42,0.9)" : "transparent",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
                transition: "all 0.3s",
                padding: "0 max(1.5rem, calc(50% - 680px))",
                height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                        <CloudLightning size={18} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "-0.02em" }}>
                        CloudScale <span style={{ color: "#A5B4FC" }}>Genius</span>
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    {[["Features", "#features"], ["Pricing", "/pricing"], ["Docs", "#"], ["vs nOps", "#compare"]].map(([l, h]) => (
                        <a key={l as string} href={h as string} style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "color .2s" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}
                        >{l}</a>
                    ))}
                </div>

                {/* Auth CTAs */}
                <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
                    {isSignedIn ? (
                        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1.25rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.75rem", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                            Dashboard <ArrowRight size={14} />
                        </Link>
                    ) : (
                        <>
                            <Link href="/sign-in" style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, padding: "0.5rem 1rem" }}>Log In</Link>
                            <Link href="/dashboard" style={{ padding: "0.5rem 1.25rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.75rem", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                                Open Dashboard →
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main style={{ padding: "0 max(1.5rem, calc(50% - 680px))" }}>

                {/* ──────────── HERO ──────────── */}
                <section style={{ paddingTop: "6rem", paddingBottom: "6rem", position: "relative", textAlign: "center", overflow: "hidden" }}>
                    {/* Glow */}
                    <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "60%", background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />

                    {/* Badge */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 1rem", borderRadius: 999, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#A5B4FC", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "2rem", animation: "fadeUp .5s ease-out" }}>
                        <Shield size={11} fill="#A5B4FC" /> Used by modern engineering teams
                    </div>

                    <h1 style={{ fontSize: "clamp(2.75rem,6vw,5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1.5rem", animation: "fadeUp .6s ease-out .05s both" }}>
                        Control Your Cloud Costs<br />
                        <span style={{ background: "linear-gradient(135deg,#818CF8,#C4B5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>with AI Precision</span>
                    </h1>

                    <p style={{ fontSize: "1.25rem", color: "#64748B", maxWidth: 640, margin: "0 auto 1.5rem", lineHeight: 1.7, animation: "fadeUp .6s ease-out .1s both" }}>
                        CloudScale Genius analyzes your infrastructure and reveals hidden cost savings automatically.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem", color: "#94A3B8", fontSize: "0.95rem", animation: "fadeUp .6s ease-out .12s both" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><CheckCircle2 size={16} color="#34D399" /> Detect wasted cloud resources</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><CheckCircle2 size={16} color="#34D399" /> AI-driven cost optimization</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><CheckCircle2 size={16} color="#34D399" /> Real-time infrastructure insights</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><CheckCircle2 size={16} color="#34D399" /> Built for DevOps and FinOps teams</span>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem", animation: "fadeUp .6s ease-out .15s both" }}>
                        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", padding: "1rem 2.5rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.875rem", color: "#fff", fontWeight: 800, textDecoration: "none", fontSize: "1.125rem", boxShadow: "0 8px 32px rgba(99,102,241,0.5)", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.6)" }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.5)" }}>
                            Start Optimizing Cloud Costs <ArrowRight size={18} />
                        </Link>
                        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", padding: "1rem 2.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.875rem", color: "#CBD5E1", fontWeight: 700, textDecoration: "none", fontSize: "1.125rem", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)" }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}>
                            See Live Dashboard
                        </Link>
                    </div>

                    {/* Product mockup */}
                    <div style={{ animation: "fadeUp .7s ease-out .2s both", position: "relative", display: "inline-block", width: "100%", maxWidth: 880 }}>
                        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "1.5rem", boxShadow: "0 0 100px rgba(99,102,241,0.15), 0 40px 80px rgba(0,0,0,0.5)" }}>
                            {/* Mock window chrome */}
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                {["#EF4444", "#F59E0B", "#10B981"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
                                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "0.375rem", height: 12, margin: "0 1rem" }} />
                            </div>
                            {/* Fake dashboard UI */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.875rem", marginBottom: "1.25rem" }}>
                                {[
                                    { l: "Waste %", v: "32.4%", c: "#F87171" },
                                    { l: "Savings", v: "$1,247/mo", c: "#34D399" },
                                    { l: "Optimized", v: "142 nodes", c: "#818CF8" },
                                    { l: "Confidence", v: "94%", c: "#FBBF24" },
                                ].map(k => (
                                    <div key={k.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", padding: "0.875rem" }}>
                                        <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.375rem" }}>{k.l}</div>
                                        <div style={{ fontSize: "1.25rem", fontWeight: 900, color: k.c }}>{k.v}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Fake chart bars */}
                            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.875rem", padding: "1rem" }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>CPU Usage · Before vs After</div>
                                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.375rem", height: 60 }}>
                                    {[85, 88, 42, 92, 45, 78, 41, 88, 40, 83, 38, 86].map((v, i) => (
                                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, alignItems: "stretch" }}>
                                            <div style={{ height: `${v * 0.6}%`, background: "#475569", borderRadius: "2px 2px 0 0", opacity: 0.5 }} />
                                            <div style={{ height: `${(v * 0.45) * 0.6}%`, background: "#6366F1", borderRadius: "2px 2px 0 0" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ──────────── FEATURES ──────────── */}
                <section id="features" style={{ paddingBottom: "6rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
                            Everything you need to{" "}
                            <span style={{ background: "linear-gradient(135deg,#818CF8,#C4B5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>eliminate waste</span>
                        </h2>
                        <p style={{ color: "#64748B", fontSize: "1.1rem" }}>Six features. One CSV. Zero IAM agents.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.25rem" }}>
                        {features.map((f) => (
                            <div key={f.title} style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.75rem", transition: "all .25s", cursor: "default" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.35)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: "0.875rem", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.5rem" }}>{f.title}</h3>
                                <p style={{ fontSize: "0.875rem", color: "#64748B", lineHeight: 1.7 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ──────────── HOW IT WORKS ──────────── */}
                <section style={{ paddingBottom: "6rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                        <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
                            From CSV to savings in{" "}
                            <span style={{ color: "#34D399" }}>4 steps</span>
                        </h2>
                        <p style={{ color: "#64748B", fontSize: "1.1rem" }}>No agents. No IAM. No setup wizards.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "1.5rem", position: "relative" }}>
                        {steps.map((s, i) => (
                            <div key={s.num} style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.5rem", padding: "2rem 1.5rem", position: "relative" }}>
                                <div style={{ fontSize: "0.65rem", fontWeight: 900, color: "#334155", letterSpacing: "0.1em", marginBottom: "1.25rem" }}>{s.num}</div>
                                <div style={{ width: 56, height: 56, borderRadius: "1rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                                    {s.icon}
                                </div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.5rem" }}>{s.title}</h3>
                                <p style={{ fontSize: "0.875rem", color: "#64748B", lineHeight: 1.7 }}>{s.desc}</p>
                                {i < steps.length - 1 && (
                                    <div style={{ position: "absolute", top: "50%", right: "-0.875rem", transform: "translateY(-50%)", zIndex: 10, display: "none" }}>
                                        <ChevronRight size={18} color="#334155" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ──────────── VS NOPS ──────────── */}
                <section id="compare" style={{ paddingBottom: "6rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
                            nOps vs <span style={{ color: "#818CF8" }}>CloudScale Genius</span>
                        </h2>
                        <p style={{ color: "#64748B", fontSize: "1rem", fontStyle: "italic" }}>"Why 12,000 engineers left legacy cost tools behind"</p>
                    </div>
                    <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.5rem", overflow: "hidden", maxWidth: 760, margin: "0 auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(255,255,255,0.03)", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase" }}>Feature</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#EF4444", letterSpacing: "0.07em", textTransform: "uppercase", textAlign: "center" }}>nOps ($500+/mo)</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#34D399", letterSpacing: "0.07em", textTransform: "uppercase", textAlign: "center" }}>CloudScale Genius ✦ Free</span>
                        </div>
                        {nOpsDiff.map(([feat, nops, csg], i) => (
                            <div key={feat as string} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "1rem 1.5rem", borderBottom: i < nOpsDiff.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                                <span style={{ fontSize: "0.875rem", color: "#CBD5E1", fontWeight: 500 }}>{feat}</span>
                                <span style={{ fontSize: "0.875rem", color: "#64748B", textAlign: "center" }}>{nops}</span>
                                <span style={{ fontSize: "0.875rem", color: "#34D399", fontWeight: 700, textAlign: "center" }}>{csg}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ──────────── TESTIMONIALS ──────────── */}
                <section style={{ paddingBottom: "6rem" }}>
                    <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", textAlign: "center", marginBottom: "3rem" }}>
                        Trusted by engineers at{" "}
                        <span style={{ color: "#818CF8" }}>scale</span>
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
                        {testimonials.map((t) => (
                            <div key={t.name} style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "2rem" }}>
                                <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
                                    {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} color="#FBBF24" fill="#FBBF24" />)}
                                </div>
                                <p style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>"{t.quote}"</p>
                                <div>
                                    <p style={{ fontWeight: 700, color: "#F8FAFC", fontSize: "0.875rem" }}>{t.name}</p>
                                    <p style={{ color: "#64748B", fontSize: "0.8rem" }}>{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ──────────── PRICING PREVIEW ──────────── */}
                <section style={{ paddingBottom: "6rem", textAlign: "center" }}>
                    <h2 style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1rem" }}>100% Free Forever</h2>
                    <p style={{ color: "#64748B", marginBottom: "2rem" }}>No paywalls or hidden enterprise tiers.</p>
                    <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 2rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.875rem", color: "#CBD5E1", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
                        View feature list <ChevronRight size={16} />
                    </Link>
                </section>

                {/* ──────────── CTA ──────────── */}
                <section style={{ paddingBottom: "6rem" }}>
                    <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "2rem", padding: "5rem 3rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60%", height: "200%", background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
                        <h2 style={{ fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "1rem", position: "relative" }}>
                            Optimize your cloud spending in minutes.
                        </h2>
                        <div style={{ color: "#94A3B8", fontSize: "1.125rem", marginBottom: "2.5rem", position: "relative", maxWidth: 600, margin: "0 auto 2.5rem" }}>
                            AI-powered insights help you reduce waste, control costs, and scale smarter.
                            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.95rem", color: "#CBD5E1", marginTop: "1.5rem" }}>
                                <span><CheckCircle2 size={16} color="#34D399" style={{ verticalAlign: "text-bottom", marginRight: 4 }} /> No complex setup</span>
                                <span><CheckCircle2 size={16} color="#34D399" style={{ verticalAlign: "text-bottom", marginRight: 4 }} /> Instant cost visibility</span>
                                <span><CheckCircle2 size={16} color="#34D399" style={{ verticalAlign: "text-bottom", marginRight: 4 }} /> Built for modern teams</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", position: "relative", flexWrap: "wrap" }}>
                            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", padding: "1rem 2.5rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.875rem", color: "#fff", fontWeight: 800, textDecoration: "none", fontSize: "1.125rem", boxShadow: "0 8px 32px rgba(99,102,241,0.5)", transition: "all .2s" }}>
                                Start Optimizing <ArrowRight size={20} />
                            </Link>
                            <Link href="/demos" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", padding: "1rem 2.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.875rem", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "1.125rem", transition: "all .2s" }}>
                                View Live Demo <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ──────────── FOOTER ──────────── */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3rem max(1.5rem, calc(50% - 680px))" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CloudLightning size={15} color="#fff" />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>CloudScale <span style={{ color: "#A5B4FC" }}>Genius</span></span>
                        </div>
                        <p style={{ color: "#475569", fontSize: "0.8rem", maxWidth: 240, lineHeight: 1.7 }}>Enterprise cloud cost optimization. No IAM. No agents. Just CSV.</p>
                    </div>
                    {[
                        ["Product", ["Features", "Pricing", "Docs", "Changelog"]],
                        ["Company", ["About", "Blog", "Careers", "Contact"]],
                        ["Legal", ["Privacy", "Terms", "Security", "SOC2"]],
                    ].map(([title, links]) => (
                        <div key={title as string}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F8FAFC", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>{title as string}</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {(links as string[]).map(l => <a key={l} href="#" style={{ color: "#475569", textDecoration: "none", fontSize: "0.875rem", transition: "color .2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#CBD5E1")} onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>{l}</a>)}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <p style={{ color: "#334155", fontSize: "0.8rem" }}>© 2026 CloudScale Intelligence Inc. All rights reserved.</p>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.7rem", fontWeight: 700, color: "#334155", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        <span>🔒 SOC2 Type II</span>
                        <span>🌍 ISO 27001</span>
                        <span>⚡ 99.9% Uptime</span>
                    </div>
                </div>
            </footer>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>
        </div>
    );
}
