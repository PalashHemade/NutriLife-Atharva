"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const dashboardMap: Record<string, string> = {
  user: "/dashboard/user",
  consultant: "/dashboard/consultant",
  trainer: "/dashboard/trainer",
  admin: "/dashboard/admin",
};

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const homeHref = role ? dashboardMap[role] || "/dashboard/user" : "/login";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <p style={{ fontSize: 56, marginBottom: 16 }}>🔒</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>Access denied</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>
          You don't have permission to view that page. It belongs to a different role than your account.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href={homeHref} style={{ background: "#00C896", color: "white", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 20px rgba(0,200,150,0.25)" }}>
            Go to my dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#DC2626", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
