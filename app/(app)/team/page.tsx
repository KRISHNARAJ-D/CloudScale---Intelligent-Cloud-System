"use client";

import React, { useState, useEffect } from "react";
import { Users, Mail, UserPlus, Shield, MoreVertical, Search, CheckCircle2, ChevronRight, HardDrive, Trash2, ShieldCheck, Activity } from "lucide-react";
import { addAuditLog } from "../utils";

export default function TeamPage() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("Member");
    const [invited, setInvited] = useState(false);
    const [search, setSearch] = useState("");

    const [members, setMembers] = useState([
        { id: 1, name: "Alice Chen", email: "alice@enterprise.com", role: "Admin", status: "Active", initials: "AC", color: "#6366F1" },
        { id: 2, name: "Bob Smith", email: "bob@enterprise.com", role: "Member", status: "Active", initials: "BS", color: "#10B981" },
        { id: 3, name: "David Kim", email: "dkim@enterprise.com", role: "Viewer", status: "Pending", initials: "DK", color: "#F59E0B" },
    ]);

    const [recentLogs, setRecentLogs] = useState<any[]>([]);

    useEffect(() => {
        const loadLogs = () => {
            const stored = localStorage.getItem("audit_logs_v1");
            if (stored) {
                setRecentLogs(JSON.parse(stored).slice(0, 4));
            }
        };
        loadLogs();
        window.addEventListener("audit_update", loadLogs);
        return () => window.removeEventListener("audit_update", loadLogs);
    }, []);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setMembers([...members, {
            id: Date.now(),
            name: email.split('@')[0],
            email,
            role,
            status: "Pending",
            initials: email.substring(0, 2).toUpperCase(),
            color: "#8B5CF6"
        }]);
        setInvited(true);
        addAuditLog(`Invited user '${email}' with ${role} access`, "auth");

        const storedNotes = localStorage.getItem("cs_notifications_v1");
        const notes = storedNotes ? JSON.parse(storedNotes) : [];
        const newNote = {
            id: `invite_${Date.now()}`,
            type: "invite",
            sender: "admin@enterprise.com",
            workspace: `Engineering Cost Workspace (Sent to ${email})`,
            time: "Just now",
            read: false
        };
        localStorage.setItem("cs_notifications_v1", JSON.stringify([newNote, ...notes]));
        window.dispatchEvent(new Event("notifications_update"));

        setTimeout(() => setInvited(false), 2000);
        setEmail("");
    };

    const removeMember = (id: number, removedEmail: string) => {
        setMembers(members.filter(m => m.id !== id));
        addAuditLog(`Removed user '${removedEmail}' from team`, "auth");
    };

    const filtered = members.filter(m => m.email.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 900, paddingBottom: "4rem" }}>

            {/* Header / Hero Illustration */}
            <div style={{
                padding: "2.5rem", borderRadius: "1.5rem", position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))",
                border: "1px solid rgba(255,255,255,0.05)"
            }}>
                {/* CSS Geometric Background Illusion */}
                <div style={{ position: "absolute", right: "-10%", top: "-100%", width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", right: "20%", bottom: "-50%", width: 300, height: 300, background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", position: "relative", zIndex: 10 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Users size={28} color="#34D399" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Team Management</h1>
                        <p style={{ color: "#94A3B8", fontSize: "0.95rem", maxWidth: 500, lineHeight: 1.6 }}>Manage access control, invite engineering teams, and assign role-based permissions to your cost analysis workspace.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>

                {/* Left Col - Team List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "0.5rem 1rem", borderRadius: "999px" }}>
                            <Search size={14} color="#64748B" />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search members..."
                                style={{ background: "transparent", border: "none", color: "#F8FAFC", fontSize: "0.8rem", outline: "none", width: 140 }}
                            />
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>{filtered.length} members</span>
                    </div>

                    <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 40px", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.1)" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>User</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
                            <span></span>
                        </div>

                        {filtered.map(member => (
                            <div key={member.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 40px", gap: "1rem", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: member.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                        {member.initials}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</p>
                                        <p style={{ fontSize: "0.75rem", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.email}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8" }}>{member.role}</div>
                                <div>
                                    <span style={{
                                        fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: 999,
                                        background: member.status === "Active" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                                        color: member.status === "Active" ? "#34D399" : "#FBBF24"
                                    }}>
                                        {member.status}
                                    </span>
                                </div>
                                <button onClick={() => removeMember(member.id, member.email)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Col - Invite & Logs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Invite Card */}
                    <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            <UserPlus size={16} color="#34D399" />
                            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>Invite New Member</h3>
                        </div>
                        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="eng@company.com" style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Assign Role</label>
                                <select value={role} onChange={e => setRole(e.target.value)} style={{ width: "100%", padding: "0.6rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.875rem", outline: "none", appearance: "none" }}>
                                    <option value="Admin" style={{ background: "#1E293B", color: "#F8FAFC" }}>Admin (Full Access)</option>
                                    <option value="Member" style={{ background: "#1E293B", color: "#F8FAFC" }}>Member (Edit Analyses)</option>
                                    <option value="Viewer" style={{ background: "#1E293B", color: "#F8FAFC" }}>Viewer (Read Only)</option>
                                </select>
                            </div>
                            <button type="submit" style={{
                                padding: "0.75rem", borderRadius: "0.625rem", cursor: "pointer",
                                background: invited ? "#10B981" : "linear-gradient(135deg, #10B981, #059669)", color: "#fff",
                                border: "none", fontWeight: 700, transition: "all .3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                            }}>
                                {invited ? <CheckCircle2 size={16} /> : <Mail size={16} />}
                                {invited ? "Invitation Sent" : "Send Invite"}
                            </button>
                        </form>
                    </div>

                    {/* Activity Log Mini */}
                    <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            <Activity size={16} color="#6366F1" />
                            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>Recent Activity</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {recentLogs.length > 0 ? recentLogs.map((lg, i) => (
                                <LogItem key={i} text={lg.event} time={lg.time} />
                            )) : (
                                <>
                                    <LogItem text="Alice Chen changed IAM policy" time="2h ago" />
                                    <LogItem text="Bob Smith invited David Kim" time="4h ago" />
                                    <LogItem text="New CSV Analysis run by Admin" time="1d ago" />
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

    function LogItem({ text, time }: any) {
        return (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)", marginTop: 6, flexShrink: 0 }} />
                <div>
                    <p style={{ fontSize: "0.75rem", color: "#CBD5E1", lineHeight: 1.4, marginBottom: 2 }}>{text}</p>
                    <p style={{ fontSize: "0.65rem", color: "#64748B", fontWeight: 600 }}>{time}</p>
                </div>
            </div>
        )
    }
}
