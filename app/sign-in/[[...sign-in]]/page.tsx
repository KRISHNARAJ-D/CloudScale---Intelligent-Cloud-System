"use client";

import React, { useState, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { ModernLogo } from "../../components/ModernLogo";
import { CloudLightning, Shield, Zap, BarChart3, ArrowLeft, Moon, Sun } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
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
        divider: "#1E293B",
        mutedText: "#475569",
        successGreen: "#10B981",
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
        divider: "#F1F5F9",
        mutedText: "#94A3B8",
        successGreen: "#10B981",
    };

    const t = darkMode ? dark : light;

    const stats = [
        { icon: <BarChart3 size={16} />, val: "12K+", label: "Engineers" },
        { icon: <Zap size={16} />, val: "$4.2M", label: "Saved" },
        { icon: <Shield size={16} />, val: "SOC2", label: "Certified" },
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
                {/* Grid lines */}
                {darkMode && (
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                )}
            </div>

            {/* Theme toggle + back link */}
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
            <div style={{
                width: "100%",
                maxWidth: 440,
                position: "relative",
                zIndex: 10,
                animation: "fadeUp 0.5s ease-out",
            }}>

                {/* Brand header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ padding: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)", marginBottom: "1.25rem" }}>
                        <ModernLogo size={32} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.03em", margin: 0, marginBottom: "0.375rem" }}>
                        Welcome back
                    </h1>
                    <p style={{ color: t.textSecondary, fontSize: "0.9rem", margin: 0 }}>
                        Sign in to <strong style={{ color: t.accent }}>CloudScale Genius</strong>
                    </p>
                </div>

                {/* Clerk widget wrapper */}
                <div style={{
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: "1.5rem",
                    padding: "1rem",
                    boxShadow: darkMode
                        ? "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
                        : "0 25px 60px rgba(15,23,42,0.12), 0 0 0 1px rgba(99,102,241,0.06)",
                    overflow: "hidden",
                }}>
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: { width: "100%", fontFamily: "'Inter', system-ui, sans-serif" },
                                cardBox: { background: "transparent", boxShadow: "none" },
                                card: { background: "transparent", border: "none", boxShadow: "none", padding: "1rem", borderRadius: 0, gap: "1.25rem" },
                                header: { display: "none" }, // We use our own header above
                                headerTitle: { display: "none" },
                                headerSubtitle: { display: "none" },
                                // Social buttons
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
                                // Form fields
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
                                    transition: "all 0.2s",
                                },
                                formFieldHintText: { color: t.mutedText, fontSize: "0.75rem" },
                                formFieldErrorText: { color: "#F87171", fontSize: "0.75rem", fontWeight: 600 },
                                // Primary button
                                formButtonPrimary: {
                                    background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                    borderRadius: "0.75rem",
                                    height: "2.875rem",
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                                    transition: "all 0.2s",
                                    border: "none",
                                    color: "#fff",
                                },
                                // Footer
                                footer: { background: "transparent", padding: "0 0 0.25rem", justifyContent: "center" },
                                footerActionText: { color: t.textSecondary, fontSize: "0.8rem" },
                                footerActionLink: { color: t.accent, fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" },
                                identityPreviewText: { color: t.textPrimary },
                                identityPreviewEditButtonIcon: { color: t.accent },
                                alternativeMethodsBlockButton: {
                                    background: darkMode ? "#1E293B" : "#F8FAFC",
                                    border: `1.5px solid ${t.border}`,
                                    borderRadius: "0.75rem",
                                    color: t.textPrimary,
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                },
                                otpCodeFieldInput: {
                                    background: t.inputBg,
                                    border: `1.5px solid ${t.border}`,
                                    borderRadius: "0.625rem",
                                    color: t.inputText,
                                    fontSize: "1.25rem",
                                    fontWeight: 700,
                                },
                                formResendCodeLink: { color: t.accent, fontWeight: 600 },
                                backLink: { color: t.accent, fontWeight: 600 },
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

                {/* Social proof row */}
                <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "2rem" }}>
                    {stats.map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", color: t.accent, marginBottom: "0.2rem" }}>
                                {s.icon}
                                <span style={{ fontWeight: 800, fontSize: "1rem", color: t.textPrimary }}>{s.val}</span>
                            </div>
                            <span style={{ fontSize: "0.7rem", color: t.mutedText, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Footer brand */}
                <p style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.7rem", color: t.mutedText }}>
                    By signing in you agree to our{" "}
                    <a href="#" style={{ color: t.textSecondary, textDecoration: "underline", textUnderlineOffset: 3 }}>Terms</a>{" "}
                    &amp;{" "}
                    <a href="#" style={{ color: t.textSecondary, textDecoration: "underline", textUnderlineOffset: 3 }}>Privacy Policy</a>
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }

        /* Override Clerk internals: force dark or light label/text visibility */
        .cl-formFieldLabel { color: ${t.textPrimary} !important; }
        .cl-internal-b3fm6y { color: ${t.textSecondary} !important; }
        .cl-socialButtonsBlockButtonText { color: ${t.textPrimary} !important; }
        .cl-dividerText { color: ${t.mutedText} !important; }
        .cl-footerActionText { color: ${t.textSecondary} !important; }
        .cl-footerActionLink, .cl-footerPages__signUp a { color: #6366F1 !important; font-weight: 700 !important; }
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
        .cl-card { gap: 1rem !important; }
        .cl-main { gap: 1rem !important; }
        .cl-form { gap: 0.875rem !important; }
      `}</style>
        </div>
    );
}
