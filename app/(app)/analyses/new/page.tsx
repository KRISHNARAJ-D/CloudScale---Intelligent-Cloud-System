"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, Play, Zap, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "../../../hooks/useSupabase";
import { addAuditLog } from "../../utils";
import { parseCSV } from "../csvParser";

export default function NewAnalysisPage() {
    const router = useRouter();
    const { user } = useUser();
    const supabase = useSupabase();

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [provider, setProvider] = useState("AWS");
    const [analysisName, setAnalysisName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const setFileAndName = (f: File) => {
        setFile(f);
        setError(null);
        if (!analysisName) setAnalysisName(f.name.replace(/\.[^/.]+$/, ""));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) setFileAndName(e.dataTransfer.files[0]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files?.[0]) setFileAndName(e.target.files[0]);
    };

    const startAnalysis = () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                if (!text || text.trim().length < 10) throw new Error("File appears to be empty or invalid.");

                const result = parseCSV(text, provider, analysisName || file.name);
                const randomId = "A-" + Math.floor(1000 + Math.random() * 9000);

                // Store parsed result in sessionStorage keyed by analysis ID
                sessionStorage.setItem(`analysis_${randomId}`, JSON.stringify(result));

                addAuditLog(`Parsed & analyzed ${file.name} for ${provider} (${result.resources.length} resources detected)`, "data");

                // Also push to Supabase Audit Logs if user is logged in
                if (user?.id) {
                    supabase.from("audit_logs").insert({
                        user_id: user.id,
                        action: "Uploaded Cloud Metrics CSV",
                        entity_type: "file",
                        metadata: { filename: file.name, provider, resource_count: result.resources.length }
                    }).then(({ error }) => {
                        if (error) console.error("Audit log error:", error);
                    });
                }

                // Short delay for UX then redirect
                setTimeout(() => {
                    router.push(`/analyses/${randomId}?provider=${provider.toLowerCase()}`);
                }, 1500);
            } catch (err: any) {
                setLoading(false);
                setError(err.message || "Failed to parse CSV. Please ensure it matches the expected format.");
            }
        };
        reader.onerror = () => {
            setLoading(false);
            setError("Could not read the file. Please try again.");
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 800, paddingBottom: "4rem" }}>

            <div>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>New Cost Analysis</h1>
                <p style={{ color: "#94A3B8", fontSize: "0.95rem", maxWidth: 600, lineHeight: 1.6 }}>
                    Upload your cloud provider's billing export or metrics CSV. We'll parse it in real-time and generate personalized optimization recommendations.
                </p>
            </div>

            <div style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.25rem", padding: "2rem" }}>

                {/* Upload Area */}
                <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragActive ? "#818CF8" : file ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.15)"}`,
                        background: dragActive ? "rgba(99,102,241,0.05)" : file ? "rgba(16,185,129,0.03)" : "rgba(0,0,0,0.2)",
                        borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center", cursor: "pointer",
                        transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
                        marginBottom: "1.5rem"
                    }}
                >
                    <input type="file" ref={fileRef} onChange={handleChange} accept=".csv,.json" style={{ display: "none" }} />

                    {file ? (
                        <>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(16,185,129,0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(16,185,129,0.2)" }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.25rem" }}>{file.name}</h3>
                                <p style={{ fontSize: "0.85rem", color: "#64748B" }}>{(file.size / 1024).toFixed(1)} KB • Ready to analyze</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.05)", color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                                <UploadCloud size={32} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "0.25rem" }}>Click or drag file to this area to upload</h3>
                                <p style={{ fontSize: "0.85rem", color: "#64748B" }}>Supports CSV, JSON or Billing Export (Max 50MB)</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "0.75rem", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", marginBottom: "1.5rem" }}>
                        <AlertCircle size={18} color="#FB7185" />
                        <span style={{ fontSize: "0.85rem", color: "#FB7185", fontWeight: 500 }}>{error}</span>
                    </div>
                )}

                {/* Form fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Cloud Provider</label>
                        <select
                            value={provider} onChange={e => setProvider(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.9rem", outline: "none", appearance: "none" }}
                        >
                            <option value="AWS" style={{ background: "#0F172A", color: "#F8FAFC" }}>Amazon Web Services (AWS)</option>
                            <option value="GCP" style={{ background: "#0F172A", color: "#F8FAFC" }}>Google Cloud Platform (GCP)</option>
                            <option value="Azure" style={{ background: "#0F172A", color: "#F8FAFC" }}>Microsoft Azure</option>
                            <option value="K8s" style={{ background: "#0F172A", color: "#F8FAFC" }}>Kubernetes Metrics</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600, marginBottom: "0.5rem" }}>Analysis Name</label>
                        <input
                            type="text"
                            value={analysisName} onChange={e => setAnalysisName(e.target.value)}
                            placeholder="e.g. Q1 2026 Production Audit"
                            style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#F8FAFC", fontSize: "0.9rem", outline: "none" }}
                        />
                    </div>
                </div>

                {/* Action button */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "2rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem" }}>
                    {loading && <p style={{ fontSize: "0.85rem", color: "#A5B4FC", fontWeight: 500 }}>Parsing CSV & running cost engine…</p>}
                    <button
                        onClick={startAnalysis}
                        disabled={!file || loading}
                        style={{
                            padding: "0.875rem 2.5rem", borderRadius: "0.75rem", cursor: file && !loading ? "pointer" : "not-allowed",
                            background: file && !loading ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "rgba(255,255,255,0.1)",
                            color: file && !loading ? "#fff" : "#94A3B8",
                            border: "none", fontSize: "1rem", fontWeight: 700, transition: "all .3s", display: "flex", alignItems: "center", gap: "0.5rem"
                        }}
                    >
                        {loading ? (
                            <>
                                <Zap size={18} style={{ animation: "pulse-glow 1s infinite" }} />
                                Analyzing Infrastructure...
                            </>
                        ) : (
                            <>
                                <Play size={18} />
                                Start Analysis
                            </>
                        )}
                    </button>
                    {loading && (
                        <style>{`
                            @keyframes pulse-glow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
                        `}</style>
                    )}
                </div>
            </div>
        </div>
    );
}
