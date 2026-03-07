"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import {
    CloudLightning,
    BarChart3,
    UploadCloud,
    Zap,
    Users,
    Settings,
    Activity,
    Menu,
    ChevronRight,
    ShieldCheck,
    Bell,
    Search,
    HelpCircle,
    Terminal,
    User,
    Home,
    LogOut,
} from "lucide-react";
import { ModernLogo } from "../components/ModernLogo";
import toast from "react-hot-toast";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <BarChart3 size={17} /> },
    { name: "New Analysis", href: "/analyses/new", icon: <UploadCloud size={17} /> },
    { name: "Analyses", href: "/analyses", icon: <Zap size={17} /> },
    { name: "Team", href: "/team", icon: <Users size={17} /> },
];

const bottomNav = [
    { name: "Profile", href: "/profile", icon: <User size={17} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={17} /> },
    { name: "Audit Log", href: "/audit", icon: <Activity size={17} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notifications, setNotifications] = useState<any[]>([]);

    React.useEffect(() => {
        const loadNotes = () => {
            const stored = localStorage.getItem("cs_notifications_v1");
            if (stored) {
                setNotifications(JSON.parse(stored));
            } else {
                const initial = [
                    { id: "msg_1", type: "invite", sender: "admin@enterprise.com", workspace: "Engineering Cost Workspace", time: "Just now", read: false },
                    { id: "msg_2", type: "system", text: "EC2 Analysis Complete. $1,200/mo in potential savings identified.", time: "2 hours ago", read: false }
                ];
                setNotifications(initial);
                localStorage.setItem("cs_notifications_v1", JSON.stringify(initial));
            }
        };
        loadNotes();
        window.addEventListener("notifications_update", loadNotes);
        return () => window.removeEventListener("notifications_update", loadNotes);
    }, []);

    const handleAction = (id: string, actionName: string) => {
        if (actionName === "accept") toast.success("Invitation accepted!");
        if (actionName === "decline") toast.success("Invitation declined.");
        const newNotifs = notifications.filter(n => n.id !== id);
        setNotifications(newNotifs);
        localStorage.setItem("cs_notifications_v1", JSON.stringify(newNotifs));
    };

    const markAllRead = () => {
        const newNotifs = notifications.map(n => ({ ...n, read: true }));
        setNotifications(newNotifs);
        localStorage.setItem("cs_notifications_v1", JSON.stringify(newNotifs));
        toast.success("All notifications marked as read");
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
                searchInputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Expanded Search Data for Global Smart Search
    const allSearchItems = [
        { title: "EC2 Instance Optimization Report", type: "Report", href: "/reports", context: "Found $1,200/mo savings" },
        { title: "Monthly Spending Summary", type: "Report", href: "/reports", context: "Last week" },
        { title: "K8s HPA Scaling Config", type: "Insight", href: "/analyses", context: "High Confidence" },
        { title: "Idle Load Balancers", type: "Insight", href: "/analyses", context: "Action Required" },
        { title: "GCP Prometheus Metrics", type: "Resource", href: "/analyses", context: "us-central1" },
        { title: "AWS CloudWatch Export", type: "Resource", href: "/analyses", context: "us-east-1" },
        { title: "Azure Monitor Dump", type: "Resource", href: "/analyses", context: "westeurope" },
        { title: "Team Management", type: "Settings", href: "/team", context: "Admin Tools" },
        { title: "Billing & Subscriptions", type: "Settings", href: "/settings", context: "Enterprise Plan" },
        { title: "Notification Preferences", type: "Settings", href: "/settings", context: "Alerts" }
    ];

    const searchResults = searchQuery.trim() === "" ? [] : allSearchItems.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.context.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const Highlight = ({ text, highlight }: { text: string, highlight: string }) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((p, i) =>
                    regex.test(p) ? <span key={i} style={{ backgroundColor: "rgba(129,140,248,0.3)", color: "#A5B4FC", borderRadius: 2 }}>{p}</span> : <span key={i}>{p}</span>
                )}
            </span>
        );
    };

    const sidebarW = sidebarOpen ? 260 : 72;
    const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

    return (
        <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F8FAFC", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>


            {/* Mobile drawer overlay */}
            {mobileOpen && (
                <div className="cs-drawer-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* SIDEBAR */}
            <aside className={`cs-sidebar${mobileOpen ? " cs-sidebar-open" : ""}`} style={{
                width: sidebarW,
                minWidth: sidebarW,
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                background: "#1E293B",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                transition: "width 0.3s ease, min-width 0.3s ease",
                overflow: "hidden",
                zIndex: 30,
            }}>

                {/* Logo */}
                <div style={{ height: 68, display: "flex", alignItems: "center", padding: sidebarOpen ? "0 1.25rem" : "0", justifyContent: sidebarOpen ? "flex-start" : "center", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: "0.625rem", flexShrink: 0 }}>
                    <div style={{ padding: 4, width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#4f46e5,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                        <ModernLogo size={22} color="#fff" />
                    </div>
                    {sidebarOpen && (
                        <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                            CloudScale <span style={{ color: "#a5b4fc" }}>Genius</span>
                        </span>
                    )}
                </div>

                {/* Nav */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 0.75rem" }}>
                    {sidebarOpen && (
                        <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 0.75rem", marginBottom: "0.625rem" }}>Core</p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "2rem" }}>
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: sidebarOpen ? "0.6rem 0.875rem" : "0.6rem", borderRadius: "0.875rem", textDecoration: "none", color: active ? "#A5B4FC" : "#64748B", background: active ? "rgba(99,102,241,0.15)" : "transparent", border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent", fontWeight: active ? 700 : 500, fontSize: "0.875rem", transition: "all .2s", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                                    <span style={{ flexShrink: 0, color: active ? "#818CF8" : "#475569" }}>{item.icon}</span>
                                    {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    {sidebarOpen && (
                        <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 0.75rem", marginBottom: "0.625rem" }}>System</p>
                    )}
                    {/* Back to home link */}
                    {sidebarOpen && (
                        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", textDecoration: "none", color: "#fff", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.5rem", border: "1px solid rgba(139,92,246,0.6)", transition: "all .2s", boxShadow: "0 0 15px rgba(139,92,246,0.5)" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 25px rgba(139,92,246,0.8)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 15px rgba(139,92,246,0.5)"}>
                            <Home size={14} /> Back to Home
                        </Link>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {bottomNav.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: sidebarOpen ? "0.6rem 0.875rem" : "0.6rem", borderRadius: "0.875rem", textDecoration: "none", color: active ? "#A5B4FC" : "#64748B", background: active ? "rgba(99,102,241,0.1)" : "transparent", fontWeight: active ? 700 : 500, fontSize: "0.875rem", transition: "all .2s", justifyContent: sidebarOpen ? "flex-start" : "center", border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent" }}>
                                    <span style={{ flexShrink: 0, color: active ? "#818CF8" : "#475569" }}>{item.icon}</span>
                                    {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </div>


                {/* Account */}
                <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "0.875rem", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-xl" } }} />
                        {sidebarOpen && (
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName || user?.firstName || user?.username || "User"}</p>
                                <p style={{ fontSize: "0.7rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.primaryEmailAddress?.emailAddress}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => signOut(() => router.push("/"))}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "flex-start" : "center",
                            gap: "0.75rem", padding: sidebarOpen ? "0.6rem 0.875rem" : "0.6rem",
                            background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)",
                            borderRadius: "0.875rem", color: "#F87171", fontSize: "0.875rem",
                            fontWeight: 600, cursor: "pointer", transition: "all .2s", marginTop: "0.25rem"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.15)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.06)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.15)"; }}
                    >
                        <LogOut size={15} />
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAV */}
            <nav className="cs-bottom-nav">
                {[...navItems.slice(0, 3), { name: "Settings", href: "/settings", icon: <Settings size={20} /> }].map(item => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                            textDecoration: "none", color: active ? "#818CF8" : "#475569",
                            padding: "0.5rem 0.75rem", borderRadius: "0.75rem", flex: 1,
                            background: active ? "rgba(99,102,241,0.12)" : "transparent",
                            transition: "all .2s", fontSize: "0.6rem", fontWeight: 700
                        }}>
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
                <button onClick={() => setMobileOpen(v => !v)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                    background: "none", border: "none", color: mobileOpen ? "#818CF8" : "#475569",
                    padding: "0.5rem 0.75rem", borderRadius: "0.75rem", cursor: "pointer",
                    fontSize: "0.6rem", fontWeight: 700, flex: 1
                }}>
                    <Menu size={20} />
                    <span>More</span>
                </button>
            </nav>

            {/* MAIN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, maxHeight: "100vh" }}>

                {/* TOPBAR */}
                <header style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", background: "#0F172A", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 20, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <button onClick={() => { setSidebarOpen(v => !v); setMobileOpen(v => !v); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: 4 }}>
                            <Menu size={20} />
                        </button>

                        {/* Search */}
                        <div className="cs-search-bar" style={{ position: "relative" }}>
                            <div onClick={() => setIsSearchOpen(true)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.75rem", color: "#475569", fontSize: "0.8rem", cursor: "text", transition: "all .2s", minWidth: 260 }}>
                                <Search size={14} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search analyses…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchOpen(true)}
                                    style={{ flex: 1, background: "transparent", border: "none", color: "#F8FAFC", outline: "none", fontWeight: 500 }}
                                />
                                <div style={{ display: "flex", gap: "3px" }}>
                                    <kbd style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 5px", fontSize: "0.65rem", fontWeight: 700 }}>⌘</kbd>
                                    <kbd style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "1px 5px", fontSize: "0.65rem", fontWeight: 700 }}>K</kbd>
                                </div>
                            </div>

                            {/* Search Dropdown */}
                            {isSearchOpen && (
                                <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", left: 0, width: "100%", background: "#0F172A", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "1rem", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 50 }}>
                                    {searchResults.length > 0 ? (
                                        searchResults.map((res, i) => (
                                            <Link key={i} href={res.href} onClick={() => setIsSearchOpen(false)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 1rem", borderBottom: i === searchResults.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)", textDecoration: "none", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ color: "#F8FAFC", fontSize: "0.8rem", fontWeight: 600 }}>
                                                        <Highlight text={res.title} highlight={searchQuery} />
                                                    </span>
                                                    <span style={{ color: "#64748B", fontSize: "0.7rem", marginTop: 2 }}>
                                                        <Highlight text={res.context} highlight={searchQuery} />
                                                    </span>
                                                </div>
                                                <span style={{ color: "#818CF8", fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 6 }}>{res.type}</span>
                                            </Link>
                                        ))
                                    ) : (
                                        <div style={{ padding: "1.5rem", color: "#64748B", fontSize: "0.85rem", textAlign: "center" }}>
                                            {searchQuery.trim() === "" ? "Type to search..." : `No results found for "${searchQuery}"`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Breadcrumbs */}
                        <div className="cs-breadcrumbs" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>
                            <Link href="/dashboard" style={{ color: "#475569", textDecoration: "none", transition: "color .2s" }}>Dashboard</Link>
                            <ChevronRight size={12} color="#334155" />
                            <span style={{ color: "#a5b4fc", fontWeight: 700 }}>Overview</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.3rem 0.875rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 999, fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#34d399" }}>
                            <ShieldCheck size={11} /> SOC2 Active
                        </div>
                        <div style={{ position: "relative" }}>
                            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", position: "relative", padding: 6 }}>
                                <Bell size={19} />
                                {unreadCount > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, background: "#6366f1", borderRadius: "50%", border: "2px solid #030303" }} />}
                            </button>
                            {isNotificationsOpen && (
                                <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", right: 0, width: 320, background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 50 }}>
                                    <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#F8FAFC" }}>Notifications</h3>
                                        <span onClick={markAllRead} style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>Mark all as read</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", maxHeight: 400, overflowY: "auto" }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: "2rem", textAlign: "center", color: "#64748B", fontSize: "0.8rem" }}>No new notifications.</div>
                                        ) : notifications.map(notif => (
                                            <div key={notif.id} style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", background: notif.read ? "transparent" : "rgba(99,102,241,0.05)", cursor: "pointer", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = notif.read ? "rgba(255,255,255,0.02)" : "rgba(99,102,241,0.1)"} onMouseLeave={e => e.currentTarget.style.background = notif.read ? "transparent" : "rgba(99,102,241,0.05)"}>
                                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                                    {notif.type === "invite" ? (
                                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#818CF8" }}><Users size={16} /></div>
                                                    ) : (
                                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#34D399" }}><Activity size={16} /></div>
                                                    )}

                                                    <div>
                                                        {notif.type === "invite" ? (
                                                            <>
                                                                <p style={{ fontSize: "0.8rem", color: "#E2E8F0", marginBottom: 4, lineHeight: 1.4 }}>
                                                                    <span style={{ fontWeight: 700, color: "#fff" }}>{notif.sender}</span> invited you to join the <span style={{ fontWeight: 700, color: "#fff" }}>{notif.workspace}</span>
                                                                </p>
                                                                <p style={{ fontSize: "0.7rem", color: "#64748B", marginBottom: 8 }}>{notif.time}</p>
                                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                                    <button onClick={() => handleAction(notif.id, 'accept')} style={{ padding: "0.3rem 0.75rem", borderRadius: "0.5rem", background: "#6366f1", color: "#fff", border: "none", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer" }}>Accept</button>
                                                                    <button onClick={() => handleAction(notif.id, 'decline')} style={{ padding: "0.3rem 0.75rem", borderRadius: "0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer" }}>Decline</button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p style={{ fontSize: "0.8rem", color: "#E2E8F0", marginBottom: 4, lineHeight: 1.4 }}>{notif.text}</p>
                                                                <p style={{ fontSize: "0.7rem", color: "#64748B" }}>{notif.time}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 6 }}>
                            <HelpCircle size={19} />
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main style={{ flex: 1, overflowY: "auto", background: "#0F172A" }} className="cs-page-content">
                    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
