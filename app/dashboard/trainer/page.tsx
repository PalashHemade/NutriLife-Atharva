"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const S = { bg: "#F8FAFC", sidebar: "#fff", card: "#fff", border: "#F1F5F9", text: "#1E293B", muted: "#64748B", green: "#00C896", blue: "#0891B2" };

const clients = [
  { name: "John Doe",    goal: "Hypertrophy", kcal: 2800, adherence: 87, last: "1h ago",  status: "On Track"       },
  { name: "Sarah Connor",goal: "Weight Loss",  kcal: 1600, adherence: 65, last: "3h ago",  status: "Needs Attention"},
  { name: "Mike Ross",   goal: "Endurance",   kcal: 2200, adherence: 92, last: "30m ago", status: "Excellent"      },
  { name: "Priya Nair",  goal: "Lean Bulk",   kcal: 2500, adherence: 78, last: "5h ago",  status: "On Track"       },
  { name: "Tom Brady",   goal: "Maintenance", kcal: 2000, adherence: 55, last: "1d ago",  status: "Overdue"        },
];

export default function TrainerDashboard() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("clients");
  const name = session?.user?.name || "Trainer";

  const navItems = [
    { id: "clients",   icon: "👥", label: "Clients"   },
    { id: "sessions",  icon: "🏋️", label: "Sessions"  },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "profile",   icon: "👤", label: "Profile"   },
  ];

  const statusColor = (s: string) =>
    s === "Excellent" ? S.green : s === "On Track" ? S.blue : s === "Needs Attention" ? "#D97706" : "#DC2626";
  const statusBg = (s: string) =>
    s === "Excellent" ? "rgba(0,200,150,0.1)" : s === "On Track" ? "rgba(8,145,178,0.1)" : s === "Needs Attention" ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.1)";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: S.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: S.text }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: S.sidebar, borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${S.green},#0EA5A4)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 10px rgba(0,200,150,0.25)" }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>NutriLife</span>
          </div>
          <div style={{ background: "rgba(8,145,178,0.1)", border: "1px solid rgba(8,145,178,0.2)", borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
            <span style={{ fontSize: 11, color: S.blue, fontWeight: 700 }}>TRAINER</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 4, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: activeNav === n.id ? "rgba(8,145,178,0.1)" : "transparent", color: activeNav === n.id ? S.blue : S.muted }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#06b6d4,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{name}</p>
              <p style={{ fontSize: 11, color: S.muted }}>Trainer</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: "100%", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#DC2626", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Trainer HQ</h1>
            <p style={{ fontSize: 14, color: S.muted }}>Welcome back, {name} — track your clients' macro adherence and fitness metrics.</p>
          </div>
          <button style={{ background: S.blue, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + Add Client
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Active Clients",  val: "24",  icon: "👥", color: S.blue },
            { label: "Sessions Today",  val: "6",   icon: "🏋️", color: "#D97706" },
            { label: "Avg Adherence",   val: "81%", icon: "🎯", color: S.green },
          ].map(c => (
            <div key={c.label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: S.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</p>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
              </div>
              <p style={{ fontSize: 30, fontWeight: 900, color: c.color }}>{c.val}</p>
            </div>
          ))}
        </div>

        {/* Client Roster */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Client Roster</h2>
            <span style={{ fontSize: 12, color: S.muted }}>Sorted by last activity</span>
          </div>
          {clients.map((c, i) => (
            <div key={c.name} style={{ padding: "16px 24px", borderBottom: i < clients.length - 1 ? `1px solid ${S.border}` : "none", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: S.blue, flexShrink: 0 }}>
                {c.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{c.name}</p>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600, background: statusBg(c.status), color: statusColor(c.status) }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: S.muted }}>{c.goal}</span>
                  <span style={{ fontSize: 12, color: S.muted }}>·</span>
                  <span style={{ fontSize: 12, color: S.muted }}>{c.kcal} kcal/day</span>
                  <span style={{ fontSize: 12, color: S.muted }}>·</span>
                  <span style={{ fontSize: 12, color: S.muted }}>{c.last}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 5, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.adherence}%`, background: statusColor(c.status), borderRadius: 999 }}></div>
                  </div>
                  <span style={{ fontSize: 12, color: S.muted, fontWeight: 600, flexShrink: 0 }}>{c.adherence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
