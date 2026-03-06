"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ModernLogo } from "./components/ModernLogo";
import {
    UploadCloud, Zap, BarChart3, Download, Github, Shield,
    CheckCircle2, ArrowRight, Activity, Cpu, Bot, CloudOff, FileCheck, X
} from "lucide-react";

export default function LandingPage() {
    const { isSignedIn } = useUser();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const features = [
        { icon: <UploadCloud size={24} color="#818CF8" />, title: "CSV Upload (Any Cloud)", desc: "Upload AWS CloudWatch, GCP Monitoring, Prometheus, or Azure Monitor exports." },
        { icon: <Zap size={24} color="#F59E0B" />, title: "Statistical AI Engine", desc: "Monte Carlo optimization determines the ideal CPU threshold." },
        { icon: <BarChart3 size={24} color="#34D399" />, title: "Instant Savings Report", desc: "Identify wasted spend and predicted savings instantly." },
        { icon: <Download size={24} color="#F472B6" />, title: "YAML Config Generator", desc: "Generate production-ready HPA, ASG, or GCP autoscaler configs." },
        { icon: <Github size={24} color="#94A3B8" />, title: "One-Click GitHub Deploy", desc: "Commit optimized configuration directly to your repository." },
        { icon: <Shield size={24} color="#A78BFA" />, title: "Zero IAM Access Required", desc: "We only use CSV exports. Your credentials stay secure." },
    ];

    const advantages = [
        { icon: <Activity size={32} color="#6366F1" />, title: "Fast Setup", desc: "Upload your cloud metrics CSV and get insights instantly." },
        { icon: <Cpu size={32} color="#10B981" />, title: "Full Cost Visibility", desc: "See exactly where your infrastructure waste exists." },
        { icon: <Bot size={32} color="#F59E0B" />, title: "AI Optimization", desc: "Machine-learning models calculate the most efficient scaling configuration." },
    ];

    return (
        <div className="landing-page" style={{ background: "#0F172A", color: "#F8FAFC", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

            {/* 1. Navigation Bar */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 100,
                background: scrolled ? "rgba(15,23,42,0.85)" : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                transition: "all 0.3s",
            }}>
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                        <div style={{ padding: 4, width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                            <ModernLogo size={22} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff", letterSpacing: "-0.02em" }}>
                            CloudScale <span style={{ color: "#A5B4FC" }}>Genius</span>
                        </span>
                    </Link>

                    {/* Center links */}
                    <div className="nav-links" style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
                        {["Features", "Pricing", "Docs", "vs nOps"].map(link => (
                            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{ color: "#94A3B8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color .2s" }}>
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Auth & CTA */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        {isSignedIn ? (
                            <Link href="/dashboard" className="btn-primary" style={{ padding: "0.5rem 1.25rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.5rem", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem", boxShadow: "0 4px 12px rgba(99,102,241,0.25)" }}>
                                Dashboard <ArrowRight size={14} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4 }} />
                            </Link>
                        ) : (
                            <>
                                <Link href="/sign-in" style={{ color: "#E2E8F0", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, transition: "color .2s" }}>
                                    Log In
                                </Link>
                                <Link href="/sign-up" className="btn-primary" style={{ padding: "0.5rem 1.25rem", background: "linear-gradient(135deg,#6366F1,#4F46E5)", borderRadius: "0.5rem", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem", boxShadow: "0 4px 12px rgba(99,102,241,0.25)" }}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section style={{ padding: "100px 0 80px", position: "relative", overflow: "hidden" }}>
                {/* Advanced Glowing Background Elements */}
                <div style={{ position: "absolute", top: "-15%", left: "30%", width: "40%", height: "80%", background: "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
                <div style={{ position: "absolute", top: "10%", right: "15%", width: "35%", height: "65%", background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
                <div className="bg-grid-pattern" style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none", maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)", zIndex: 0 }} />

                <div className="container" style={{ position: "relative", textAlign: "center", zIndex: 10 }}>

                    {/* SaaS Trust Banner */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.375rem 1.25rem", borderRadius: 999, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", color: "#A5B4FC", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.5rem", backdropFilter: "blur(8px)" }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, background: "#6366F1", borderRadius: "50%" }}>
                            <Shield size={10} color="#fff" />
                        </span>
                        Used by modern engineering teams
                    </div>

                    {/* Elaborate Headline */}
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1.25rem", maxWidth: 900, margin: "0 auto 1.25rem" }}>
                        Control Your Cloud Costs<br />
                        <span style={{ background: "linear-gradient(135deg, #A5B4FC 0%, #C4B5FD 50%, #FBCFE8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>with AI Precision</span>
                    </h1>

                    {/* Subheadline Elaborated */}
                    <p style={{ fontSize: "1.125rem", color: "#94A3B8", maxWidth: 680, margin: "0 auto 2rem", lineHeight: 1.6, fontWeight: 400 }}>
                        CloudScale Genius deeply analyzes your multi-cloud infrastructure to instantly reveal hidden inefficiencies, completely eliminating cloud waste without requiring intrusive IAM agents.
                    </p>

                    {/* Pro-Tags Grid */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2.5rem", maxWidth: 840, margin: "0 auto 2.5rem" }}>
                        {[
                            "Detect wasted cloud resources",
                            "AI-driven cost optimization",
                            "Real-time infrastructure insights",
                            "Built for DevOps & FinOps teams"
                        ].map((tag) => (
                            <span key={tag} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.85rem", color: "#CBD5E1", fontWeight: 500, letterSpacing: "-0.01em" }}>
                                <CheckCircle2 size={16} color="#34D399" /> {tag}
                            </span>
                        ))}
                    </div>

                    {/* Elaborate Button Group */}
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                        <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "1rem 2rem", borderRadius: "0.75rem", fontSize: "1.05rem", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>
                            Start Optimizing Cloud Costs <ArrowRight size={18} strokeWidth={2.5} />
                        </Link>
                        <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "1rem 2rem", borderRadius: "0.75rem", fontSize: "1.05rem" }}>
                            <Zap size={18} color="#A5B4FC" /> See Live Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. Metrics Section (Dashboard Preview) */}
            <section style={{ padding: "60px 0 100px" }}>
                <div className="container">
                    <div className="glass-panel" style={{ padding: "2.5rem", borderRadius: "1.5rem" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
                            {[
                                { l: "Waste %", v: "32.4%", c: "#F87171" },
                                { l: "Savings", v: "$1,247 / month", c: "#34D399" },
                                { l: "Optimized Nodes", v: "142 nodes", c: "#818CF8" },
                                { l: "Confidence Score", v: "94%", c: "#FBBF24" },
                            ].map(k => (
                                <div key={k.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.25rem" }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{k.l}</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: k.c }}>{k.v}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F8FAFC", marginBottom: "1.5rem" }}>CPU Usage — Before vs After Optimization</div>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 120 }}>
                                {[85, 88, 42, 92, 45, 78, 41, 88, 40, 83, 38, 86, 91, 75, 52, 85].map((v, i) => (
                                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, alignItems: "stretch", justifyContent: "flex-end", height: "100%" }}>
                                        <div style={{ height: `${v}%`, background: "rgba(71,85,105,0.4)", borderRadius: "4px 4px 0 0", position: "relative", width: "100%" }}>
                                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${v * 0.45}%`, background: "linear-gradient(180deg, #818CF8, #4F46E5)", borderRadius: "4px 4px 0 0" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4. Feature Section */}
            <section id="features" style={{ padding: "100px 0", background: "#0B1120" }}>
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                        <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1rem" }}>
                            Everything you need to eliminate cloud waste
                        </h2>
                        <p style={{ color: "#94A3B8", fontSize: "1.125rem", maxWidth: 600, margin: "0 auto" }}>
                            Six powerful tools. One CSV upload. No IAM agents.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="feature-card">
                                <div style={{ width: 48, height: 48, borderRadius: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.5rem" }}>{f.title}</h3>
                                <p style={{ fontSize: "0.95rem", color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Platform Advantages Section */}
            <section style={{ padding: "100px 0" }}>
                <div className="container">
                    <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: "4rem" }}>
                        Why Engineering Teams Choose CloudScale Genius
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem" }}>
                        {advantages.map((a, i) => (
                            <div key={i} style={{ textAlign: "center", padding: "0 1rem" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
                                    {a.icon}
                                </div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1rem" }}>{a.title}</h3>
                                <p style={{ fontSize: "1rem", color: "#94A3B8", lineHeight: 1.6 }}>{a.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Comparison Section */}
            <section id="vs-nops" style={{ padding: "100px 0", background: "#0B1120" }}>
                <div className="container">
                    <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: "4rem" }}>
                        CloudScale Genius vs nOps
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        {/* CloudScale Card */}
                        <div style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.1), rgba(30,41,59,0.4))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "1.5rem", padding: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                                <div style={{ padding: 4, width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ModernLogo size={20} color="#fff" />
                                </div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>CloudScale Genius</h3>
                            </div>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                {["No IAM permissions required", "CSV-based analysis", "AI optimization", "Instant YAML generation", "Works offline"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1rem", color: "#E2E8F0" }}>
                                        <CheckCircle2 size={20} color="#34D399" style={{ flexShrink: 0 }} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* nOps Card */}
                        <div style={{ background: "rgba(30,41,59,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", opacity: 0.7 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#94A3B8" }}>nOps</span>
                                </div>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#94A3B8" }}>nOps</h3>
                            </div>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.25rem", opacity: 0.7 }}>
                                {["Requires IAM access", "Agent installation required", "Complex setup", "Limited export tools", "Cloud-locked"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1rem", color: "#94A3B8" }}>
                                        <X size={20} color="#F87171" style={{ flexShrink: 0 }} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Integrations & Final CTA */}
            <section style={{ padding: "120px 0" }}>
                <div className="container">
                    <div style={{ background: "linear-gradient(135deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "2rem", padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

                        <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "#F8FAFC", marginBottom: "1rem" }}>
                            Seamless integration with your stack
                        </h2>
                        <p style={{ fontSize: "1.1rem", color: "#94A3B8", marginBottom: "3rem", maxWidth: 600, margin: "0 auto 3rem" }}>
                            We process exports from every major cloud provider without requiring API keys, IAM roles, or local agents.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "4rem", opacity: 0.8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#CBD5E1" }}><CloudOff size={24} /> AWS</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#CBD5E1" }}><CloudOff size={24} /> GCP</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#CBD5E1" }}><CloudOff size={24} /> Azure</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#CBD5E1" }}><FileCheck size={24} /> Kubernetes</div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                            <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="btn-primary" style={{ padding: "1rem 2rem", borderRadius: "0.75rem", fontSize: "1.05rem" }}>
                                Connect Infrastructure
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "4rem 0 2rem", background: "#0B1120" }}>
                <div className="container">
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(250px, 2fr) 1fr 1fr 1fr", gap: "3rem", marginBottom: "4rem" }}>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                <div style={{ padding: 3, width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ModernLogo size={18} color="#fff" />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>CloudScale <span style={{ color: "#A5B4FC" }}>Genius</span></span>
                            </div>
                            <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 280 }}>
                                Enterprise cloud cost optimization. No IAM. No agents. Just CSV.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {["Features", "Pricing", "Docs"].map(link => (
                                    <Link key={link} href={`/${link.toLowerCase()}`} className="footer-link">{link}</Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resources</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {["Documentation", "GitHub", "API"].map(link => (
                                    <Link key={link} href="#" className="footer-link">{link}</Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Security</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {["SOC2 Type II", "ISO 27001", "99.9% Uptime"].map(link => (
                                    <span key={link} style={{ color: "#64748B", fontSize: "0.9rem" }}>{link}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ color: "#475569", fontSize: "0.875rem" }}>
                            © 2026 CloudScale Genius
                        </div>
                        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            <span>🔒 SOC2 Type II</span>
                            <span>🌍 ISO 27001</span>
                            <span>⚡ 99.9% Uptime</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                * { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                
                .container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .btn-primary {
                    background: linear-gradient(135deg,#6366F1,#4F46E5);
                    color: white;
                    text-decoration: none;
                    font-weight: 600;
                    box-shadow: 0 4px 16px rgba(99,102,241,0.3);
                    transition: all 0.2s ease;
                }
                .btn-primary:hover {
                    box-shadow: 0 6px 24px rgba(99,102,241,0.5);
                    transform: translateY(-2px);
                }

                .btn-secondary {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #F8FAFC;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                .btn-secondary:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.2);
                }

                .bg-grid-pattern {
                    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 60px 60px;
                }

                .glass-panel {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .feature-card {
                    background: rgba(30,41,59,0.3);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 1.25rem;
                    padding: 2rem;
                    transition: all 0.3s ease;
                    cursor: default;
                }
                .feature-card:hover {
                    border-color: rgba(99,102,241,0.4);
                    background: rgba(30,41,59,0.6);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
                }

                .footer-link {
                    color: #94A3B8;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.2s ease;
                }
                .footer-link:hover {
                    color: #F8FAFC;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }

                @media (max-width: 992px) {
                    .features-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .nav-links { display: none !important; }
                    section { padding: 60px 0 !important; }
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                    footer > .container > div:first-child {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    #vs-nops > .container > div:first-child {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
