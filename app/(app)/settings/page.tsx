"use client";

import React, { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { CloudLightning, User, Mail, Shield, Bell, Palette, Key, ChevronRight, CheckCircle2, Save, LogOut } from "lucide-react";
import Link from "next/link";
import { addAuditLog } from "../utils";

export default function SettingsPage() {
    const { user } = useUser();

    // State — name/email are always sourced from Clerk, never localStorage
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState({
        displayName: "",
        email: "",
        notifications: {
            weekly: true,
            savings: true,
            team: false,
            system: true
        },
        appearance: {
            theme: "dark",
            density: "comfortable",
            language: "en",
            timezone: "UTC"
        }
    });

    const [tfaEnabled, setTfaEnabled] = useState(true);
    const [tfaModal, setTfaModal] = useState(false);
    const [sessions, setSessions] = useState([
        { device: "MacBook Pro M3", location: "San Francisco, US", active: true },
        { device: "Chrome · Windows", location: "Seattle, US", active: false }
    ]);
    const [sessionsModal, setSessionsModal] = useState(false);
    const [keysModal, setKeysModal] = useState(false);
    const [appKeys, setAppKeys] = useState([
        { name: "Production API Key", id: "key_prod_9X...", created: "Oct 12, 2025" }
    ]);

    // Load saved preferences from localStorage, but ALWAYS use Clerk for identity
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem("cloudscale_settings");
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(s => ({
                    ...s,
                    notifications: parsed.notifications ?? s.notifications,
                    appearance: parsed.appearance ?? s.appearance,
                }));
            }
        }
    }, []);

    // Always sync name + email from Clerk (source of truth)
    useEffect(() => {
        if (user) {
            setSettings(s => ({
                ...s,
                displayName: user.fullName || user.firstName || user.username || "User",
                email: user.primaryEmailAddress?.emailAddress || ""
            }));
        }
    }, [user]);

    // Apply Theme and Density
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', settings.appearance.theme);
            document.documentElement.setAttribute('data-density', settings.appearance.density);
        }
    }, [settings.appearance]);

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            // Only persist preferences, NOT identity (name/email managed by Clerk)
            const toSave = {
                notifications: settings.notifications,
                appearance: settings.appearance
            };
            localStorage.setItem("cloudscale_settings", JSON.stringify(toSave));
        }
        addAuditLog("Updated account preferences and configuration", "settings");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const updateNotification = (key: keyof typeof settings.notifications) => {
        setSettings(s => ({
            ...s,
            notifications: { ...s.notifications, [key]: !s.notifications[key] }
        }));
    };

    const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
        <div
            onClick={onClick}
            style={{
                width: 36, height: 20, borderRadius: 20, cursor: "pointer",
                background: active ? "#6366F1" : "rgba(255,255,255,0.1)",
                position: "relative", transition: "all 0.2s"
            }}
        >
            <div style={{
                position: "absolute", top: 2, left: active ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff", transition: "all 0.2s"
            }} />
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 760, paddingBottom: "4rem" }}>

            {/* Header with Title Illustration style */}
            <div style={{
                padding: "2rem", borderRadius: "1.5rem", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
                border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
                <div style={{ position: "absolute", right: "-10%", top: "-50%", width: 300, height: 300, background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <SettingsIcon />
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em", margin: 0 }}>Preferences</h1>
                    </div>
                    <p style={{ color: "#94A3B8", fontSize: "0.9rem", margin: 0 }}>Manage your account, billing, and system configurations.</p>
                </div>

                <button onClick={handleSave} style={{
                    position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.75rem 1.5rem", borderRadius: "0.875rem", cursor: "pointer",
                    background: saved ? "#10B981" : "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff",
                    border: "none", fontWeight: 700, transition: "all .3s", boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
                }}>
                    {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saved ? "Saved Settings" : "Save Changes"}
                </button>
            </div>

            {/* Profile card */}
            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.75rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ position: "relative" }}>
                    <UserButton appearance={{ elements: { avatarBox: "w-16 h-16 rounded-2xl" } }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.25rem" }}>
                        {settings.displayName}
                    </h2>
                    <p style={{ color: "#94A3B8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        {settings.email}
                    </p>
                    <span style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#A5B4FC", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.2rem 0.75rem", borderRadius: 999 }}>
                        Enterprise Plan
                    </span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.7rem", color: "#64748B", marginBottom: "0.2rem" }}>Account ID</p>
                    <p style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#94A3B8", background: "rgba(0,0,0,0.2)", padding: "0.2rem 0.5rem", borderRadius: 6 }}>usr_2X9abcDefGhijkL</p>
                </div>
            </div>

            <div style={{ display: "grid", gap: "2rem" }}>

                {/* Account Settings */}
                <Section title="Account" icon={<User size={17} color="#6366F1" />}>
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Display Name</label>
                            <input type="text" value={settings.displayName} onChange={(e) => setSettings({ ...settings, displayName: e.target.value })} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.9rem", outline: "none" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Email Address</label>
                            <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.9rem", outline: "none" }} />
                        </div>
                    </div>
                </Section>

                {/* Notifications */}
                <Section title="Notifications" icon={<Bell size={17} color="#34D399" />}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <ToggleRow label="Weekly optimization reports" desc="Get a digest of savings opportunities every Monday." active={settings.notifications.weekly} onClick={() => updateNotification("weekly")} />
                        <ToggleRow label="Savings alerts" desc="Instant notifications when idle waste is detected." active={settings.notifications.savings} onClick={() => updateNotification("savings")} />
                        <ToggleRow label="Team activity notifications" desc="Emails when team members run analyses." active={settings.notifications.team} onClick={() => updateNotification("team")} />
                        <ToggleRow label="System updates" desc="Platform changelogs and new features." active={settings.notifications.system} onClick={() => updateNotification("system")} />
                    </div>
                </Section>

                {/* Security */}
                <Section title="Security & Authentication" icon={<Shield size={17} color="#F59E0B" />}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <ActionRow label="Two-factor authentication" val={tfaEnabled ? "Enabled (Authenticator App)" : "Disabled"} action={tfaEnabled ? "Disable" : "Enable"} onClick={() => { setTfaEnabled(!tfaEnabled); setTfaModal(true); setTimeout(() => setTfaModal(false), 2000); }} />
                        <ActionRow label="Active sessions" val={`${sessions.length} devices connected`} action="View all" onClick={() => setSessionsModal(!sessionsModal)} />
                        {sessionsModal && (
                            <div style={{ padding: "1rem 1.5rem", background: "rgba(0,0,0,0.15)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                {sessions.map((s, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <div>
                                            <span style={{ fontSize: "0.8rem", color: "#F8FAFC", fontWeight: 600 }}>{s.device}</span>
                                            {s.active && <span style={{ marginLeft: 8, fontSize: "0.6rem", color: "#34D399", background: "rgba(52,211,153,0.1)", padding: "2px 6px", borderRadius: 4 }}>Current</span>}
                                            <div style={{ fontSize: "0.7rem", color: "#64748B" }}>{s.location}</div>
                                        </div>
                                        {!s.active && <button onClick={() => setSessions(sessions.filter((_, idx) => idx !== i))} style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: "#F87171", borderRadius: 4, padding: "2px 8px", fontSize: "0.7rem", cursor: "pointer" }}>Log out</button>}
                                    </div>
                                ))}
                            </div>
                        )}
                        <ActionRow label="Connected apps" val="GitHub, Slack, AWS" action="Manage" onClick={() => alert("GitHub integration configuration would open here.")} />
                        <ActionRow label="API keys management" val={`${appKeys.length} keys active`} action="Revoke / Add" onClick={() => setKeysModal(!keysModal)} />
                        {keysModal && (
                            <div style={{ padding: "1rem 1.5rem", background: "rgba(0,0,0,0.15)" }}>
                                {appKeys.map((k, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                        <div>
                                            <span style={{ fontSize: "0.8rem", color: "#F8FAFC" }}>{k.name}</span>
                                            <div style={{ fontSize: "0.7rem", color: "#64748B", fontFamily: "monospace" }}>{k.id}</div>
                                        </div>
                                        <button onClick={() => { setAppKeys(appKeys.filter((_, idx) => idx !== i)); addAuditLog(`Revoked API key: ${k.name}`, "security"); }} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171", borderRadius: 4, padding: "2px 8px", fontSize: "0.7rem", cursor: "pointer" }}>Revoke</button>
                                    </div>
                                ))}
                                <button onClick={() => { setAppKeys([...appKeys, { name: "New API Key", id: "key_" + Math.random().toString(36).substr(2, 9), created: "Just now" }]); addAuditLog("Generated new platform API key", "security"); }} style={{ marginTop: "0.5rem", background: "#6366F1", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: "0.7rem", cursor: "pointer" }}>+ Generate New Key</button>
                            </div>
                        )}
                    </div>
                    {tfaModal && <div style={{ padding: "0.5rem", background: "#10B981", color: "#fff", fontSize: "0.8rem", textAlign: "center", fontWeight: 700 }}>2FA status updated successfully!</div>}
                </Section>

                {/* Appearance */}
                <Section title="Appearance" icon={<Palette size={17} color="#E879F9" />}>
                    <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Theme</label>
                            <select value={settings.appearance.theme} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, theme: e.target.value } })} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none", appearance: "none" }}>
                                <option value="dark">Dark Theme (Default)</option>
                                <option value="light">Light Theme</option>
                                <option value="system">System Preference</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Density</label>
                            <select value={settings.appearance.density} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, density: e.target.value } })} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none", appearance: "none" }}>
                                <option value="comfortable">Comfortable (Default)</option>
                                <option value="compact">Compact</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Language</label>
                            <select value={settings.appearance.language} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, language: e.target.value } })} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none", appearance: "none" }}>
                                <option value="en">English (US)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Timezone</label>
                            <select value={settings.appearance.timezone} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, timezone: e.target.value } })} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none", appearance: "none" }}>
                                <option value="UTC">UTC (Universal Coordinated Time)</option>
                                <option value="EST">EST (Eastern Standard Time)</option>
                                <option value="PST">PST (Pacific Standard Time)</option>
                            </select>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Danger zone */}
            <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "1.25rem", padding: "1.5rem", marginTop: "1rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#FCA5A5", marginBottom: "0.5rem" }}>Danger Zone</h3>
                <p style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "1rem" }}>Permanently delete your account and all data. This action cannot be undone.</p>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button style={{ padding: "0.625rem 1.25rem", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "0.75rem", color: "#F87171", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                        Delete Account
                    </button>
                    <button style={{ padding: "0.625rem 1.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#CBD5E1", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <LogOut size={14} /> Log out all devices
                    </button>
                </div>
            </div>
        </div>
    );

    function Section({ title, icon, children }: any) {
        return (
            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "0.625rem", background: "rgba(0,0,0,0.1)" }}>
                    {icon}
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>{title}</h3>
                </div>
                {children}
            </div>
        );
    }

    function ToggleRow({ label, desc, active, onClick }: any) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                    <h4 style={{ fontSize: "0.875rem", color: "#E2E8F0", fontWeight: 600, marginBottom: "0.2rem" }}>{label}</h4>
                    <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{desc}</p>
                </div>
                <Toggle active={active} onClick={onClick} />
            </div>
        );
    }

    function ActionRow({ label, val, action, onClick }: any) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                    <h4 style={{ fontSize: "0.875rem", color: "#E2E8F0", fontWeight: 600, marginBottom: "0.2rem" }}>{label}</h4>
                    <p style={{ fontSize: "0.75rem", color: "#64748B" }}>{val}</p>
                </div>
                <button onClick={onClick} style={{ padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#CBD5E1", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>{action}</button>
            </div>
        );
    }
}

function SettingsIcon() {
    return (
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Palette size={20} color="#818CF8" />
        </div>
    );
}
