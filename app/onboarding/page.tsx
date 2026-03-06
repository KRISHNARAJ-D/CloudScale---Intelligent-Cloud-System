"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
    CheckCircle2, ArrowRight, CloudLightning, Zap, Users,
    ShieldCheck, Loader2, ChevronRight, BarChart3, Database,
} from "lucide-react";
import { ModernLogo } from "../components/ModernLogo";

const clouds = [
    { name: "AWS CloudWatch", sub: "Read-only IAM metric access", icon: <Zap size={22} color="#818cf8" /> },
    { name: "GCP Monitoring", sub: "Service Account JSON mapping", icon: <Database size={22} color="#34d399" /> },
];

export default function OnboardingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [invited, setInvited] = useState(false);

    const startSync = () => {
        setSyncing(true);
        setTimeout(() => { setSyncing(false); setStep(3); }, 2200);
    };

    const finish = () => router.push("/dashboard");

    const stepCircle = (n: number) => ({
        width: 42, height: 42, borderRadius: "0.875rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: "0.9rem",
        background: step >= n ? "linear-gradient(135deg,#4f46e5,#8b5cf6)" : "rgba(255,255,255,0.04)",
        color: step >= n ? "#fff" : "#334155",
        boxShadow: step >= n ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
        border: step >= n ? "none" : "1px solid rgba(255,255,255,0.08)",
        transition: "all .4s",
    });

    return (
        <div style={{ minHeight: "100vh", background: "#030303", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "'Inter',system-ui,sans-serif", position: "relative", overflow: "hidden" }}>

            {/* BG */}
            <div style={{ position: "absolute", top: "-15%", right: "-10%", width: "55%", height: "55%", background: "radial-gradient(circle,rgba(99,102,241,.12),transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-15%", left: "-10%", width: "45%", height: "45%", background: "radial-gradient(circle,rgba(139,92,246,.08),transparent 70%)", pointerEvents: "none" }} />

            <div style={{ maxWidth: 520, width: "100%", position: "relative", zIndex: 10 }}>

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "3rem" }}>
                    <div style={{ padding: 5, width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(99,102,241,.35)" }}>
                        <ModernLogo size={24} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.02em" }}>
                        CloudScale <span style={{ color: "#a5b4fc" }}>Genius</span>
                    </span>
                </div>

                {/* Step progress bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", gap: 0 }}>
                    {[1, 2, 3].map((n, i) => (
                        <React.Fragment key={n}>
                            <div style={stepCircle(n)}>
                                {step > n ? <CheckCircle2 size={18} /> : n}
                            </div>
                            {i < 2 && (
                                <div style={{ width: 60, height: 2, background: step > n ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", transition: "background .5s" }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div style={{ background: "rgba(5,5,15,0.7)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2rem", padding: "3rem", boxShadow: "0 0 100px rgba(99,102,241,0.1)", marginBottom: "2rem" }}>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div style={{ textAlign: "center", animation: "fadeUp .5s ease-out" }}>
                            <div style={{ width: 80, height: 80, borderRadius: "1.5rem", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.75rem", boxShadow: "0 0 30px rgba(99,102,241,0.15)" }}>
                                <ShieldCheck size={38} color="#818cf8" />
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>Enterprise Verified</h2>
                            <p style={{ color: "#64748b", lineHeight: 1.75, marginBottom: "2rem", fontSize: "0.9rem" }}>
                                Welcome, <strong style={{ color: "#fff" }}>{user?.firstName || "Cloud Architect"}</strong>. Your CloudScale Genius workspace has been provisioned with SOC2 encryption active.
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "1rem", padding: "0.875rem 1.25rem", marginBottom: "2rem" }}>
                                <CheckCircle2 size={18} color="#34d399" />
                                <div style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>SOC2 Type II Encrypted</p>
                                    <p style={{ fontSize: "0.7rem", color: "#64748b" }}>Zero-write access · GDPR compliant · IP isolated</p>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="btn-primary" style={{ width: "100%", fontSize: "1rem", padding: "0.9rem", justifyContent: "center" }}>
                                Unlock Cloud Monitoring <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div style={{ animation: "fadeUp .5s ease-out" }}>
                            <h2 style={{ fontSize: "1.625rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Connect Telemetry API</h2>
                            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.75rem", lineHeight: 1.7 }}>
                                Choose your cloud data source. Remember: CloudScale Genius <strong style={{ color: "#94a3b8" }}>never requires IAM writes</strong>.
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                {clouds.map((c, i) => (
                                    <div key={i} onClick={startSync} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.125rem 1.25rem", borderRadius: "1.125rem", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)", cursor: "pointer", transition: "all .2s" }}>
                                        <div style={{ width: 46, height: 46, borderRadius: "0.875rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            {c.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{c.name}</p>
                                            <p style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "0.15rem" }}>{c.sub}</p>
                                        </div>
                                        {syncing ? <Loader2 size={18} color="#6366f1" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} /> : <ChevronRight size={18} color="#334155" />}
                                    </div>
                                ))}
                            </div>
                            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#475569" }}>
                                No credentials right now?{" "}
                                <button onClick={() => setStep(3)} style={{ background: "none", border: "none", cursor: "pointer", color: "#818cf8", fontWeight: 700, textDecoration: "underline", fontSize: "0.78rem" }}>
                                    Start with CSV Upload
                                </button>
                            </p>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div style={{ animation: "fadeUp .5s ease-out" }}>
                            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                                <div style={{ width: 80, height: 80, borderRadius: "1.5rem", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                                    <Users size={38} color="#34d399" />
                                </div>
                                <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Invite Your DevOps Team</h2>
                                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Scale optimization across your entire organization.</p>
                            </div>

                            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.125rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Invite by email</label>
                                <div style={{ display: "flex", gap: "0.625rem" }}>
                                    <input type="email" placeholder="colleague@enterprise.com" style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", color: "#fff", padding: "0.65rem 1rem", fontSize: "0.875rem", outline: "none" }} />
                                    <button onClick={() => setInvited(true)} className="btn-primary" style={{ whiteSpace: "nowrap", fontSize: "0.875rem", padding: "0.65rem 1.25rem" }}>Send</button>
                                </div>
                                {invited && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", fontSize: "0.8rem", color: "#34d399", fontWeight: 700 }}>
                                        <CheckCircle2 size={14} /> Invitation sent successfully
                                    </div>
                                )}
                            </div>

                            <button onClick={finish} className="btn-primary" style={{ width: "100%", fontSize: "1rem", padding: "0.9rem", justifyContent: "center", marginBottom: "0.75rem" }}>
                                Finish Setup → Dashboard <ArrowRight size={18} />
                            </button>
                            <button onClick={finish} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.5rem" }}>
                                Skip for now
                            </button>
                        </div>
                    )}
                </div>

                {/* Trust footer */}
                <div style={{ display: "flex", justifyContent: "center", gap: "3rem", opacity: 0.35, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><ShieldCheck size={11} /> Enterprise Encryption</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><BarChart3 size={11} /> ISO 27001</span>
                </div>
            </div>

            <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .btn-primary { display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:linear-gradient(135deg,#4f46e5,#8b5cf6);color:#fff;font-weight:700;border-radius:.875rem;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 24px rgba(99,102,241,.3); }
      `}</style>
        </div>
    );
}
