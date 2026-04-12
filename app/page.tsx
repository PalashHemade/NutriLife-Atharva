import Link from "next/link";

export default function Home() {
  return (
    <div style={{ background: "#020817", minHeight: "100vh", color: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ─── NAV ─── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #1e293b", background: "rgba(2,8,23,0.85)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#f1f5f9", letterSpacing: "-0.3px" }}>NutriLife</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/login" style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px", borderRadius: 8, transition: "color 0.2s" }}>
              Sign in
            </Link>
            <Link href="/register" style={{ background: "#10b981", color: "white", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "9px 20px", borderRadius: 8, display: "inline-block" }}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 999, padding: "6px 16px", marginBottom: 32 }}>
            <div style={{ width: 7, height: 7, background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
            <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600, letterSpacing: "0.5px" }}>POWERED BY RANDOM FOREST ML</span>
          </div>

          <h1 style={{ fontSize: "clamp(42px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24, color: "#f8fafc" }}>
            The Diet Plan<br />
            <span style={{ background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Built For Your Biology.</span>
          </h1>

          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 40px", fontWeight: 400 }}>
            NutriLife analyzes your glucose, cholesterol, BMR, and 12+ biomarkers to classify and generate a hyper-personalized nutrition plan — through a trained AI model, not a quiz.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ background: "#10b981", color: "white", textDecoration: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
              Start for free →
            </Link>
            <Link href="/login" style={{ color: "#94a3b8", textDecoration: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15, display: "inline-flex", alignItems: "center", border: "1px solid #1e293b" }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Dashboard Preview mockup */}
        <div style={{ marginTop: 80, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: 24, maxWidth: 900, margin: "80px auto 0" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}></div>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }}></div>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }}></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Daily Calories", val: "1,850 kcal", color: "#f59e0b" },
              { label: "Protein", val: "96g / 120g", color: "#10b981" },
              { label: "Glucose", val: "Normal", color: "#06b6d4" },
              { label: "Streak", val: "7 days 🔥", color: "#a78bfa" },
            ].map((c) => (
              <div key={c.label} style={{ background: "#1e293b", borderRadius: 12, padding: "16px 18px", border: "1px solid #334155" }}>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{c.val}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px 20px", border: "1px solid #334155" }}>
              <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Meal Plan — Today</p>
              {["Grilled Salmon & Quinoa", "Avocado Turkey Wrap", "Greek Yogurt Parfait"].map((m, i) => (
                <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #334155" : "none" }}>
                  <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{m}</span>
                  <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>AI Assigned</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: "18px 20px", border: "1px solid #334155" }}>
              <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>Macro Progress</p>
              {[
                { name: "Protein", pct: 80, color: "#10b981" },
                { name: "Carbs", pct: 55, color: "#f59e0b" },
                { name: "Fats", pct: 65, color: "#a78bfa" },
              ].map((m) => (
                <div key={m.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{m.name}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#334155", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.pct}%`, background: m.color, borderRadius: 999 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", background: "#0f172a", padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, textAlign: "center" }}>
          {[
            { val: "98%", label: "Macro Classification Accuracy" },
            { val: "15+", label: "Clinical Biomarkers Analyzed" },
            { val: "20,000+", label: "Active Daily Users" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: "clamp(36px,4vw,52px)", fontWeight: 900, background: "linear-gradient(135deg,#10b981,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.val}</p>
              <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>What Sets Us Apart</p>
          <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", lineHeight: 1.1 }}>Precision over guesswork.</h2>
          <p style={{ fontSize: 16, color: "#64748b", marginTop: 16, maxWidth: 480, margin: "16px auto 0", lineHeight: 1.7 }}>Every feature is engineered around clinical data, not lifestyle surveys.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            { icon: "🧬", title: "Clinical Biomarker Analysis", desc: "We ingest glucose fluctuations, cholesterol panels, BMR, and anthropometric data to power true precision nutrition." },
            { icon: "🤖", title: "Random Forest Classification", desc: "A trained sklearn pipeline classifies your unique health signature and maps it to the optimal diet category." },
            { icon: "🔐", title: "Role-Based Ecosystem", desc: "Four locked role portals — Users, Consultants, Trainers, and Admins — with JWT-enforced RBAC middleware." },
            { icon: "💊", title: "Allergy & Deficiency Tracking", desc: "Your plan dynamically excludes food groups that trigger allergies and targets nutrients you're clinically deficient in." },
            { icon: "📊", title: "Live Progress Telemetry", desc: "Real-time macro adherence, hydration tracking, and streak monitoring to keep you accountable." },
            { icon: "👨‍⚕️", title: "Expert Override System", desc: "Diet Consultants can review, annotate, and override any AI-generated plan from their secure professional portal." },
          ].map((f) => (
            <div key={f.title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "28px 28px", transition: "border-color 0.2s", cursor: "default" }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ background: "#0f172a", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>How It Works</p>
            <h2 style={{ fontSize: "clamp(30px,4vw,48px)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px" }}>Three steps to precision.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, textAlign: "center" }}>
            {[
              { step: "01", title: "Build Your Health Profile", desc: "Enter your height, weight, glucose, cholesterol, allergies, and goals. We do the rest." },
              { step: "02", title: "AI Classifies Your Needs", desc: "Our FastAPI microservice runs your data through a trained Random Forest pipeline in real time." },
              { step: "03", title: "Expert Validation", desc: "A Diet Consultant reviews the AI output. Your Trainer monitors your daily macro adherence." },
            ].map((s) => (
              <div key={s.step}>
                <p style={{ fontSize: 56, fontWeight: 900, color: "#1e293b", marginBottom: 16, lineHeight: 1 }}>{s.step}</p>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.1))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 24, padding: "64px 40px" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#f8fafc", letterSpacing: "-1px", marginBottom: 16 }}>
            Ready to eat with precision?
          </h2>
          <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 36, maxWidth: 420, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Free to start. Your first AI-generated nutrition plan in under 60 seconds.
          </p>
          <Link href="/register" style={{ background: "#10b981", color: "white", textDecoration: "none", padding: "15px 36px", borderRadius: 10, fontWeight: 700, fontSize: 16, display: "inline-block", boxShadow: "0 0 40px rgba(16,185,129,0.35)" }}>
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#475569" }}>© {new Date().getFullYear()} NutriLife Systems. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
