"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "user" | "consultant" | "trainer" | "admin";

const ROLES: { value: Role; label: string; icon: string; desc: string }[] = [
  { value: "user",       label: "Regular User",     icon: "🧑",  desc: "Get personalized AI diet plans" },
  { value: "consultant", label: "Diet Consultant",   icon: "👨‍⚕️", desc: "Review and override AI plans" },
  { value: "trainer",    label: "Fitness Trainer",   icon: "💪",  desc: "Track client macros & progress" },
  { value: "admin",      label: "Administrator",     icon: "🛡️",  desc: "Manage platform and users" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("user");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Registration failed.");
      else router.push("/login?registered=true");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const bg = "#020817";
  const card = "#0f172a";
  const border = "#1e293b";
  const muted = "#64748b";
  const text = "#f1f5f9";
  const inputBg = "#1e293b";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: text }}>NutriLife</span>
          </Link>
          <div style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: text, letterSpacing: "-0.5px", marginBottom: 6 }}>Create your account</h1>
            <p style={{ fontSize: 14, color: muted }}>Start your precision nutrition journey — free of charge.</p>
          </div>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required
                style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", color: text, fontSize: 14, outline: "none" }} />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required
                style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", color: text, fontSize: 14, outline: "none" }} />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" required minLength={8}
                  style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 44px 12px 14px", color: text, fontSize: 14, outline: "none" }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 16 }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Role picker */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>I am a...</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    style={{ textAlign: "left", padding: "14px", borderRadius: 12, border: role === r.value ? "1.5px solid #10b981" : `1.5px solid ${border}`, background: role === r.value ? "rgba(16,185,129,0.1)" : "#1e293b", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: role === r.value ? "#10b981" : text, marginBottom: 3 }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", color: "#f87171", fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: loading ? "#059669" : "#10b981", color: "white", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 15, cursor: loading ? "wait" : "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: muted }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#10b981", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
