"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const dashboardMap: Record<string, string> = {
  user: "/dashboard/user",
  consultant: "/dashboard/consultant",
  trainer: "/dashboard/trainer",
  admin: "/dashboard/admin",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");
  const { data: session, status } = useSession();

  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to role-based dashboard if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role || "user";
      router.push(dashboardMap[role] || "/dashboard/user");
    }
  }, [status, session, router]);

  if (status === "authenticated") {
    return null; // Will redirect via useEffect
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      // Fetch session to determine role and redirect
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role || "user";
      const dashboardMap: Record<string, string> = {
        user: "/dashboard/user",
        consultant: "/dashboard/consultant",
        trainer: "/dashboard/trainer",
        admin: "/dashboard/admin",
      };
      router.push(dashboardMap[role] || "/dashboard/user");
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
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: text }}>NutriLife</span>
          </Link>
          <div style={{ marginTop: 24, marginBottom: 0 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: text, letterSpacing: "-0.5px", marginBottom: 6 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: muted }}>Sign in to your account to continue</p>
          </div>
        </div>

        {/* Success message */}
        {registered && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, textAlign: "center", color: "#10b981", fontSize: 14, fontWeight: 600 }}>
            ✓ Account created! Sign in below.
          </div>
        )}

        {/* Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", color: text, fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Password</label>
                <a href="#" style={{ fontSize: 13, color: "#10b981", fontWeight: 600, textDecoration: "none" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 44px 12px 14px", color: text, fontSize: 14, outline: "none" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 16 }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", color: "#f87171", fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#059669" : "#10b981", color: "white", border: "none", borderRadius: 10, padding: "14px", fontWeight: 700, fontSize: 15, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: muted }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#10b981", fontWeight: 700, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
