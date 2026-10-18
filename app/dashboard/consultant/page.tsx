"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const S = {
  bg: "#F8FAFC", sidebar: "#fff", card: "#fff", border: "#F1F5F9",
  text: "#1E293B", muted: "#64748B", green: "#00C896", purple: "#7C3AED",
};

const patients = [
  { name: "Alice Johnson",  diet: "Diabetic Friendly",  status: "Pending", urgency: true,  hours: "2h ago" },
  { name: "Marcus Reid",    diet: "High Protein",       status: "Approved", urgency: false, hours: "5h ago" },
  { name: "Priya Sharma",   diet: "Heart Healthy",      status: "Override",  urgency: true,  hours: "1h ago" },
  { name: "Tom Walters",    diet: "Balanced Diet",      status: "Approved", urgency: false, hours: "8h ago" },
  { name: "Cam Diaz",       diet: "Low Carb",           status: "Pending", urgency: true,  hours: "30m ago" },
];

export default function ConsultantDashboard() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("patients");
  const name = session?.user?.name || "Consultant";

  const navItems = [
    { id: "patients", icon: "👥", label: "Patients" },
    { id: "reviews",  icon: "📋", label: "Reviews"  },
    { id: "history",  icon: "📈", label: "History"  },
    { id: "profile",  icon: "👤", label: "Profile"   },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: S.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: S.text }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: S.sidebar, borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${S.green},#0EA5A4)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 10px rgba(0,200,150,0.25)" }}>⚡</div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>NutriLife</span>
          </div>
          <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
            <span style={{ fontSize: 11, color: S.purple, fontWeight: 700 }}>CONSULTANT</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 4, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: activeNav === n.id ? "rgba(124,58,237,0.1)" : "transparent", color: activeNav === n.id ? S.purple : S.muted }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${S.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#a78bfa,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: S.text }}>Dr. {name}</p>
              <p style={{ fontSize: 11, color: S.muted }}>Consultant</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: "100%", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#DC2626", borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>Consultant Portal</h1>
            <p style={{ fontSize: 14, color: S.muted }}>Dr. {name} — Review AI-generated diet plans and manage patient allocations.</p>
          </div>
          <button style={{ background: S.purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + New Consultation
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Active Patients", val: "142", icon: "👥", color: S.purple },
            { label: "Pending Reviews", val: "18",  icon: "⏳", color: "#D97706" },
            { label: "ML Match Rate",   val: "99.4%", icon: "🎯", color: S.green },
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

        {/* Patient Queue */}
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Patient Review Queue</h2>
            <span style={{ fontSize: 12, background: "rgba(220,38,38,0.1)", color: "#DC2626", padding: "3px 12px", borderRadius: 999, fontWeight: 600 }}>
              {patients.filter(p => p.urgency).length} urgent
            </span>
          </div>
          <div>
            {patients.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: i < patients.length - 1 ? `1px solid ${S.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: S.purple, flexShrink: 0 }}>
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: S.text, marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: S.muted }}>{p.diet} · {p.hours}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 999, fontWeight: 600,
                    background: p.status === "Approved" ? "rgba(0,200,150,0.1)" : p.status === "Override" ? "rgba(220,38,38,0.1)" : "rgba(217,119,6,0.1)",
                    color: p.status === "Approved" ? S.green : p.status === "Override" ? "#DC2626" : "#D97706" }}>
                    {p.status}
                  </span>
                  {p.urgency && (
                    <button style={{ background: S.purple, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
