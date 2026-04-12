"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const S = { bg: "#020817", sidebar: "#0a1628", card: "#0f172a", border: "#1e293b", text: "#f1f5f9", muted: "#64748b", green: "#10b981", red: "#f87171" };

const users = [
  { name: "Alice Smith",  email: "alice@example.com",   role: "user",       joined: "2 days ago",  status: "active" },
  { name: "Dr. Roberts",  email: "doc.rob@health.io",   role: "consultant", joined: "5 days ago",  status: "active" },
  { name: "Zack Trainer", email: "zack@fit.com",        role: "trainer",    joined: "1 week ago",  status: "active" },
  { name: "Jane Admin",   email: "jane@nutrilife.io",   role: "admin",      joined: "1 month ago", status: "active" },
  { name: "Bob User",     email: "bob@example.com",     role: "user",       joined: "3 days ago",  status: "suspended" },
];

const roleColor: Record<string, { bg: string; color: string }> = {
  admin:      { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
  consultant: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  trainer:    { bg: "rgba(6,182,212,0.15)",   color: "#06b6d4" },
  user:       { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("users");
  const email = session?.user?.email || "admin@nutrilife.io";

  const navItems = [
    { id: "users",   icon: "👥", label: "Users"    },
    { id: "system",  icon: "⚙️", label: "System"   },
    { id: "logs",    icon: "📜", label: "Audit Log" },
    { id: "profile", icon: "👤", label: "Profile"   },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: S.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: S.text }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: "#07111f", borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#ef4444,#dc2626)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡️</div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>NutriLife</span>
          </div>
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
            <span style={{ fontSize: 11, color: S.red, fontWeight: 700 }}>ADMIN</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 4, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: activeNav === n.id ? "rgba(239,68,68,0.15)" : "transparent", color: activeNav === n.id ? S.red : S.muted }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${S.border}` }}>
          <div style={{ marginBottom: 12, padding: "0 4px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
            <p style={{ fontSize: 11, color: S.muted }}>Administrator</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: S.red, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>System Administration</h1>
            <p style={{ fontSize: 14, color: S.muted }}>Monitor NutriLife platform telemetry and manage user roles.</p>
          </div>
          <button style={{ background: S.red, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            ⚠ System Alerts
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Users",     val: "12,400", trend: "+2.4%",  icon: "👥", color: "#06b6d4" },
            { label: "ML Queries/day",  val: "450k",   trend: "+12%",   icon: "⚡", color: "#f59e0b" },
            { label: "Avg DB Latency",  val: "24ms",   trend: "−8ms",   icon: "🗄️", color: S.green  },
            { label: "System Health",   val: "8 / 8",  trend: "All OK", icon: "✅", color: "#a78bfa" },
          ].map(c => (
            <div key={c.label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 12, color: S.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</p>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: c.color, marginBottom: 4 }}>{c.val}</p>
              <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", color: S.green, padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>{c.trend}</span>
            </div>
          ))}
        </div>

        {/* User Table */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a1628" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>User Management</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "#1e293b", color: "#94a3b8", border: `1px solid ${S.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Filters</button>
              <button style={{ background: S.green, color: "#0f172a", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Export CSV</button>
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 24px", borderBottom: `1px solid ${S.border}`, background: "#0a1628" }}>
            {["User", "Role", "Joined", "Status", "Actions"].map(h => (
              <p key={h} style={{ fontSize: 11, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</p>
            ))}
          </div>

          {/* Table Rows */}
          {users.map((u, i) => (
            <div key={u.email} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "14px 24px", alignItems: "center", borderBottom: i < users.length - 1 ? `1px solid ${S.border}` : "none", background: "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#94a3b8", flexShrink: 0 }}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{u.name}</p>
                  <p style={{ fontSize: 12, color: S.muted }}>{u.email}</p>
                </div>
              </div>
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, fontWeight: 600, display: "inline-block", background: roleColor[u.role].bg, color: roleColor[u.role].color, textTransform: "capitalize" }}>{u.role}</span>
              <p style={{ fontSize: 13, color: S.muted }}>{u.joined}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: u.status === "active" ? S.green : S.red }}></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: u.status === "active" ? S.green : S.red, textTransform: "capitalize" }}>{u.status}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#06b6d4", fontWeight: 600, padding: 0 }}>Edit</button>
                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: u.status === "active" ? S.red : S.green, fontWeight: 600, padding: 0 }}>
                  {u.status === "active" ? "Suspend" : "Restore"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
