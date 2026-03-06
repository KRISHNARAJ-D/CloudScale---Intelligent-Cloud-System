"use client";

import React, { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { CloudLightning, Shield, Zap, BarChart3, ArrowLeft, Moon, Sun } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
    const [darkMode, setDarkMode] = useState(true);

    const dark = {
        pageBg: "#0F172A",
        cardBg: "#1E293B",
        border: "#334155",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        inputBg: "#334155",
        inputText: "#F1F5F9",
        inputPlaceholder: "#64748B",
        accent: "#6366F1",
        accentHover: "#4F46E5",
        accentLight: "rgba(99,102,241,0.12)",
        mutedText: "#475569",
    };

    const light = {
        pageBg: "#F8FAFC",
        cardBg: "#FFFFFF",
        border: "#E2E8F0",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        inputBg: "#F1F5F9",
        inputText: "#0F172A",
        inputPlaceholder: "#94A3B8",
        accent: "#6366F1",
        accentHover: "#4F46E5",
        accentLight: "rgba(99,102,241,0.08)",
        mutedText: "#94A3B8",
    };

    const t = darkMode ? dark : light;

    const benefits = [
        { icon: "⚡", text: "Analyze cloud CSV in 30 seconds" },
        { icon: "🔒", text: "No IAM agents or write access needed" },
        { icon: "💰", text: "Average 35% infrastructure savings" },
        { icon: "🌐", text: "AWS · GCP · Azure · Kubernetes" },
    ];

    return (
        <div style={{
            minHeight: "100vh",
            background: darkMode
                ? "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)"
                : "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F8FAFC 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            fontFamily: "'Inter', system-ui, sans-serif",
            position: "relative",
            transition: "all 0.3s ease",
        }}>

            {/* Background mesh */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "60%", background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "40%", height: "40%", background: "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40%", height: "40%", background: "radial-gradient(ellipse, rgba(79,70,229,0.1) 0%, transparent 70%)" }} />
                {darkMode && (
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                )}
            </div>

            {/* Top bar */}
            <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", right: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", color: t.textSecondary, fontSize: "0.8rem", fontWeight: 600 }}>
                    <ArrowLeft size={14} /> Back to home
                </Link>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.875rem", borderRadius: "2rem", background: t.inputBg, border: `1px solid ${t.border}`, cursor: "pointer", color: t.textSecondary, fontSize: "0.75rem", fontWeight: 600, transition: "all .2s" }}
                >
                    {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                    {darkMode ? "Light" : "Dark"}
                </button>
            </div>

            {/* MAIN CARD */}
            <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 10, animation: "fadeUp 0.5s ease-out" }}>

                {/* Brand header */}
                <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)", marginBottom: "1.25rem" }}>
                        <CloudLightning size={26} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.03em", margin: 0, marginBottom: "0.375rem" }}>
                        Create your account
                    </h1>
                    <p style={{ color: t.textSecondary, fontSize: "0.9rem", margin: 0 }}>
                        Join <strong style={{ color: t.accent }}>12,000+ engineers</strong> saving 35% on cloud costs
                    </p>
                </div>

                {/* Benefits strip */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {benefits.map((b) => (
                        <div key={b.text} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.875rem", background: t.inputBg, border: `1px solid ${t.border}` }}>
                            <span style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>{b.icon}</span>
                            <span style={{ fontSize: "0.73rem", color: t.textSecondary, fontWeight: 500, lineHeight: 1.5 }}>{b.text}</span>
                        </div>
                    ))}
                </div>

                {/* Clerk Sign Up Widget */}
                <div style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "1.5rem",
                    padding: "0.25rem",
                    boxShadow: darkMode
                        ? "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
                        : "0 25px 60px rgba(15,23,42,0.12), 0 0 0 1px rgba(99,102,241,0.06)",
                    overflow: "hidden",
                }}>
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: { width: "100%", fontFamily: "'Inter', system-ui, sans-serif" },
                                card: { background: "transparent", border: "none", boxShadow: "none", padding: "1.5rem 1.75rem 1.75rem", borderRadius: 0 },
                                header: { display: "none" },
                                headerTitle: { display: "none" },
                                headerSubtitle: { display: "none" },
                                socialButtonsBlockButton: {
                                    background: darkMode ? "#1E293B" : "#F8FAFC",
                                    border: `1.5px solid ${t.border}`,
                                    borderRadius: "0.75rem",
                                    color: t.textPrimary,
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    height: "2.875rem",
                                    transition: "all 0.2s",
                                },
                                socialButtonsBlockButtonText: { color: t.textPrimary, fontWeight: 600 },
                                dividerRow: { margin: "0.25rem 0" },
                                dividerText: { color: t.mutedText, fontSize: "0.75rem", fontWeight: 600 },
                                dividerLine: { background: t.border },
                                formFieldLabel: {
                                    color: t.textPrimary,
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.02em",
                                    marginBottom: "0.375rem",
                                },
                                formFieldInput: {
                                    background: t.inputBg,
                                    border: `1.5px solid ${t.border}`,
                                    borderRadius: "0.75rem",
                                    color: t.inputText,
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                    height: "2.875rem",
                                    padding: "0 1rem",
                                },
                                formFieldHintText: { color: t.mutedText, fontSize: "0.75rem" },
                                formFieldErrorText: { color: "#F87171", fontSize: "0.75rem", fontWeight: 600 },
                                formButtonPrimary: {
                                    background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                    borderRadius: "0.75rem",
                                    height: "2.875rem",
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                                    border: "none",
                                    color: "#fff",
                                },
                                footer: { background: "transparent", padding: "0 0 0.25rem", justifyContent: "center" },
                                footerActionText: { color: t.textSecondary, fontSize: "0.8rem" },
                                footerActionLink: { color: t.accent, fontWeight: 700, fontSize: "0.8rem" },
                                identityPreviewText: { color: t.textPrimary },
                                identityPreviewEditButtonIcon: { color: t.accent },
                                otpCodeFieldInput: {
                                    background: t.inputBg,
                                    border: `1.5px solid ${t.border}`,
                                    borderRadius: "0.625rem",
                                    color: t.inputText,
                                    fontSize: "1.25rem",
                                    fontWeight: 700,
                                },
                                formResendCodeLink: { color: t.accent, fontWeight: 600 },
                            },
                            variables: {
                                colorBackground: t.cardBg,
                                colorInputBackground: t.inputBg,
                                colorInputText: t.inputText,
                                colorText: t.textPrimary,
                                colorTextSecondary: t.textSecondary,
                                colorPrimary: "#6366F1",
                                colorTextOnPrimaryBackground: "#FFFFFF",
                                colorNeutral: t.mutedText,
                                colorDanger: "#F87171",
                                colorSuccess: "#10B981",
                                borderRadius: "0.75rem",
                                spacingUnit: "1rem",
                                fontFamily: "'Inter', system-ui, sans-serif",
                                fontSize: "0.9rem",
                            },
                        }}
                    />
                </div>

                {/* Trust footer */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem", marginTop: "1.75rem" }}>
                    <span style={{ fontSize: "0.7rem", color: t.mutedText, fontWeight: 600 }}>🔒 SOC2 Type II</span>
                    <span style={{ fontSize: "0.7rem", color: t.mutedText, fontWeight: 600 }}>🛡️ GDPR Compliant</span>
                    <span style={{ fontSize: "0.7rem", color: t.mutedText, fontWeight: 600 }}>⚡ Zero AWS Agents</span>
                </div>

                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.7rem", color: t.mutedText }}>
                    By creating an account you agree to our{" "}
                    <a href="#" style={{ color: t.textSecondary, textDecoration: "underline" }}>Terms</a> &amp;{" "}
                    <a href="#" style={{ color: t.textSecondary, textDecoration: "underline" }}>Privacy Policy</a>
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }

        .cl-formFieldLabel { color: ${t.textPrimary} !important; }
        .cl-socialButtonsBlockButtonText { color: ${t.textPrimary} !important; }
        .cl-dividerText { color: ${t.mutedText} !important; }
        .cl-footerActionText { color: ${t.textSecondary} !important; }
        .cl-footerActionLink { color: #6366F1 !important; font-weight: 700 !important; }
        .cl-formFieldInput {
          background: ${t.inputBg} !important;
          color: ${t.inputText} !important;
          border-color: ${t.border} !important;
        }
        .cl-formFieldInput::placeholder { color: ${t.inputPlaceholder} !important; }
        .cl-formFieldInput:focus {
          border-color: #6366F1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
          outline: none !important;
        }
        .cl-formButtonPrimary:hover {
          background: linear-gradient(135deg, #4F46E5, #4338CA) !important;
          box-shadow: 0 6px 24px rgba(99,102,241,0.5) !important;
          transform: translateY(-1px) !important;
        }
        .cl-socialButtonsBlockButton:hover {
          border-color: #6366F1 !important;
          background: ${darkMode ? "#334155" : "#EEF2FF"} !important;
        }
      `}</style>
        </div>
    );
}
