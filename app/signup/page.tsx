"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function SignupRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/sign-up"); }, [router]);
    return <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366F1", animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style></div>;
}
