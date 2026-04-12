"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const S = {
  bg: "#020817", sidebar: "#0a1628", card: "#0f172a", border: "#1e293b",
  text: "#f1f5f9", muted: "#64748b", green: "#10b981", accent: "#06b6d4",
  red: "#f87171", yellow: "#f59e0b", purple: "#a78bfa",
};

type NavSection = "dashboard" | "meals" | "recipes" | "recipe" | "activity" | "nutritionists";

// ─── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ active, setActive, name }: { active: NavSection; setActive: (s: NavSection) => void; name: string }) {
  const items: { id: NavSection; icon: string; label: string }[] = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "meals", icon: "🥗", label: "AI Meal Plan" },
    { id: "recipes", icon: "📖", label: "Recipe Browser" },
    { id: "recipe", icon: "👨‍🍳", label: "Recipe Finder" },
    { id: "activity", icon: "🏃", label: "Activity Tracker" },
    { id: "nutritionists", icon: "👨‍⚕️", label: "Nutritionists" },
  ];
  return (
    <aside style={{ width: 230, background: S.sidebar, borderRight: `1px solid ${S.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${S.green},#059669)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 16, color: S.text }}>NutriLife</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {items.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, marginBottom: 4, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.15s", background: active === n.id ? "rgba(16,185,129,0.15)" : "transparent", color: active === n.id ? S.green : S.muted }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "16px 12px", borderTop: `1px solid ${S.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${S.green},#059669)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
            <p style={{ fontSize: 11, color: S.muted }}>User</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          style={{ width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: S.red, borderRadius: 8, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Dashboard Overview ──────────────────────────────────────────────
function DashboardOverview({ mealPlan, totalBurnt }: { mealPlan: any; totalBurnt: number }) {
  const consumed = (mealPlan?.meals || []).filter((m: any) => m.consumed);
  const totalConsumed = consumed.reduce((s: number, m: any) => s + Math.round(m.calories * (m.consumedAmount || 0) / 100), 0);
  const proteinConsumed = consumed.reduce((s: number, m: any) => s + Math.round(m.protein * (m.consumedAmount || 0) / 100), 0);
  const carbsConsumed = consumed.reduce((s: number, m: any) => s + Math.round(m.carbs * (m.consumedAmount || 0) / 100), 0);
  const fatConsumed = consumed.reduce((s: number, m: any) => s + Math.round(m.fat * (m.consumedAmount || 0) / 100), 0);

  const stats = [
    { label: "Calories Eaten", val: `${totalConsumed}`, sub: `of ${mealPlan?.totalCalories || "—"} kcal`, icon: "🔥", accent: S.yellow },
    { label: "Protein", val: `${proteinConsumed}g`, sub: `of ${mealPlan?.totalProtein || "—"}g`, icon: "💪", accent: S.green },
    { label: "Calories Burnt", val: `${totalBurnt}`, sub: "kcal today", icon: "⚡", accent: S.accent },
    { label: "Net Calories", val: `${totalConsumed - totalBurnt}`, sub: "kcal", icon: "📊", accent: S.purple },
  ];
  const macros = [
    { name: "Protein", current: proteinConsumed, target: mealPlan?.totalProtein || 120, color: S.green },
    { name: "Carbs", current: carbsConsumed, target: mealPlan?.totalCarbs || 200, color: S.yellow },
    { name: "Fats", current: fatConsumed, target: mealPlan?.totalFat || 60, color: S.purple },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(c => (
          <div key={c.label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <p style={{ fontSize: 12, color: S.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</p>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color: c.accent, marginBottom: 3 }}>{c.val}</p>
            <p style={{ fontSize: 11, color: S.muted }}>{c.sub}</p>
          </div>
        ))}
      </div>
      {mealPlan && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: S.text }}>🤖 Today's Plan — {mealPlan.category}</h2>
            {(mealPlan.meals || []).map((m: any) => (
              <div key={m._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#1e293b", borderRadius: 10, border: `1px solid ${S.border}`, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: S.muted }}>{m.calories} kcal · {m.protein}g P · {m.mealType}</p>
                </div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600, background: m.consumed ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)", color: m.consumed ? S.green : S.muted }}>
                  {m.consumed ? `✓ ${m.consumedAmount}%` : "Pending"}
                </span>
              </div>
            ))}
          </div>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: S.text }}>🎯 Macro Progress</h2>
            {macros.map(m => {
              const pct = m.target > 0 ? Math.min(Math.round((m.current / m.target) * 100), 100) : 0;
              return (
                <div key={m.name} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{m.name}</span>
                    <span style={{ fontSize: 12, color: S.muted }}>{m.current}g / {m.target}g</span>
                  </div>
                  <div style={{ height: 7, background: "#1e293b", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: m.color, borderRadius: 999, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!mealPlan && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🥗</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 8 }}>No meal plan for today</h3>
          <p style={{ fontSize: 14, color: S.muted }}>Go to the "AI Meal Plan" tab to generate your personalized nutrition plan.</p>
        </div>
      )}
    </div>
  );
}

// ─── AI Meal Plan Section ────────────────────────────────────────────
function MealPlanSection({ mealPlan, setMealPlan, refreshPlan }: { mealPlan: any; setMealPlan: (p: any) => void; refreshPlan: () => void }) {
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [showProfile, setShowProfile] = useState(!mealPlan);
  const [profile, setProfile] = useState({ age: "30", height: "170", weight: "70", gender: "male", glucoseLevel: "90", cholesterol: "180", allergies: "None", goals: "general health", dailyCaloricIntake: "2000", bloodPressure: "120", dietaryRestrictions: "None", preferredCuisine: "Indian", weeklyExerciseHours: "3" });
  const [consumeAmounts, setConsumeAmounts] = useState<Record<string, number>>({});

  const bmi = profile.height && profile.weight ? (Number(profile.weight) / ((Number(profile.height) / 100) ** 2)).toFixed(1) : "—";

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(profile.age),
          height: Number(profile.height),
          weight: Number(profile.weight),
          gender: profile.gender,
          glucoseLevel: Number(profile.glucoseLevel),
          cholesterol: Number(profile.cholesterol),
          allergies: profile.allergies.split(",").map(a => a.trim()).filter(Boolean),
          goals: profile.goals.split(",").map(g => g.trim()).filter(Boolean),
          dailyCaloricIntake: Number(profile.dailyCaloricIntake),
          bloodPressure: Number(profile.bloodPressure),
          dietaryRestrictions: profile.dietaryRestrictions,
          preferredCuisine: profile.preferredCuisine,
          weeklyExerciseHours: Number(profile.weeklyExerciseHours),
        }),
      });
      const data = await res.json();
      if (data.mealPlan) {
        setMealPlan(data.mealPlan);
        setShowProfile(false);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const modifyPlan = async () => {
    setModifying(true);
    const consumedMeals = Object.entries(consumeAmounts)
      .filter(([_, amt]) => amt > 0)
      .map(([mealId, consumedAmount]) => ({ mealId, consumedAmount }));

    if (consumedMeals.length === 0) { setModifying(false); return; }

    try {
      const res = await fetch("/api/ai/modify-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumedMeals }),
      });
      const data = await res.json();
      if (data.mealPlan) {
        setMealPlan(data.mealPlan);
        setConsumeAmounts({});
      }
    } catch (err) { console.error(err); }
    setModifying(false);
  };

  const inputS = { width: "100%", background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "10px 12px", color: S.text, fontSize: 14, outline: "none" } as const;

  return (
    <div>
      {/* Health Profile Form */}
      {showProfile && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 4 }}>🧬 Health Profile</h3>
          <p style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>Enter your details for AI + ML-powered personalized meal plan (all 13 clinical features)</p>

          {/* Row 1: Basic Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Age</label><input value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} type="number" style={inputS} /></div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Gender</label>
              <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} style={{ ...inputS, cursor: "pointer" }}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Height (cm)</label><input value={profile.height} onChange={e => setProfile({ ...profile, height: e.target.value })} type="number" style={inputS} /></div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Weight (kg)</label><input value={profile.weight} onChange={e => setProfile({ ...profile, weight: e.target.value })} type="number" style={inputS} /></div>
          </div>

          {/* BMI Auto-calculated */}
          <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: S.green, fontWeight: 700 }}>📊 BMI: {bmi}</span>
            <span style={{ fontSize: 11, color: S.muted }}>(auto-calculated from height & weight)</span>
          </div>

          {/* Row 2: Clinical Data */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Glucose (mg/dL)</label><input value={profile.glucoseLevel} onChange={e => setProfile({ ...profile, glucoseLevel: e.target.value })} type="number" style={inputS} /></div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Cholesterol (mg/dL)</label><input value={profile.cholesterol} onChange={e => setProfile({ ...profile, cholesterol: e.target.value })} type="number" style={inputS} /></div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Blood Pressure (mmHg)</label><input value={profile.bloodPressure} onChange={e => setProfile({ ...profile, bloodPressure: e.target.value })} type="number" style={inputS} /></div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Daily Caloric Intake</label><input value={profile.dailyCaloricIntake} onChange={e => setProfile({ ...profile, dailyCaloricIntake: e.target.value })} type="number" style={inputS} /></div>
          </div>

          {/* Row 3: Preferences */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Dietary Restrictions</label>
              <select value={profile.dietaryRestrictions} onChange={e => setProfile({ ...profile, dietaryRestrictions: e.target.value })} style={{ ...inputS, cursor: "pointer" }}>
                <option value="None">None</option><option value="Vegetarian">Vegetarian</option><option value="Vegan">Vegan</option><option value="Gluten-Free">Gluten-Free</option><option value="Dairy-Free">Dairy-Free</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Preferred Cuisine</label>
              <select value={profile.preferredCuisine} onChange={e => setProfile({ ...profile, preferredCuisine: e.target.value })} style={{ ...inputS, cursor: "pointer" }}>
                <option value="Indian">Indian</option><option value="Chinese">Chinese</option><option value="Mexican">Mexican</option><option value="Mediterranean">Mediterranean</option><option value="Italian">Italian</option><option value="Japanese">Japanese</option>
              </select>
            </div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Weekly Exercise (hrs)</label><input value={profile.weeklyExerciseHours} onChange={e => setProfile({ ...profile, weeklyExerciseHours: e.target.value })} type="number" step="0.5" style={inputS} /></div>
          </div>

          {/* Row 4: Allergies & Goals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Allergies</label>
              <select value={profile.allergies} onChange={e => setProfile({ ...profile, allergies: e.target.value })} style={{ ...inputS, cursor: "pointer" }}>
                <option value="None">None</option><option value="Peanuts">Peanuts</option><option value="Shellfish">Shellfish</option><option value="Dairy">Dairy</option><option value="Gluten">Gluten</option><option value="Soy">Soy</option><option value="Eggs">Eggs</option>
              </select>
            </div>
            <div><label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Goals (comma separated)</label><input value={profile.goals} onChange={e => setProfile({ ...profile, goals: e.target.value })} placeholder="e.g. weight loss, muscle gain" style={inputS} /></div>
          </div>
          <button onClick={generatePlan} disabled={loading}
            style={{ width: "100%", background: loading ? "#059669" : S.green, color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 15, cursor: loading ? "wait" : "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
            {loading ? "⏳ ML classifying + AI generating..." : "🤖 Generate AI Meal Plan (ML + Groq)"}
          </button>
        </div>
      )}

      {/* Current Meal Plan */}
      {mealPlan && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: S.text }}>🍽️ Today's Meal Plan</h3>
              <p style={{ fontSize: 12, color: S.muted }}>Category: {mealPlan.category} · {mealPlan.totalCalories} kcal · {mealPlan.modified ? "📝 Modified" : "✨ Original"}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowProfile(true)} style={{ background: "#1e293b", color: S.muted, border: `1px solid ${S.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Regenerate</button>
            </div>
          </div>

          {(mealPlan.meals || []).map((m: any, index: number) => (
            <div key={`${m.name}-${index}`} style={{ background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, background: "rgba(6,182,212,0.15)", color: S.accent, padding: "2px 8px", borderRadius: 999, fontWeight: 600, textTransform: "capitalize" }}>{m.mealType}</span>
                    {m.consumed && <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", color: S.green, padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>✓ Consumed {m.consumedAmount}%</span>}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 4 }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: S.muted }}>{m.description}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: m.consumed ? 0 : 10 }}>
                <span style={{ fontSize: 12, color: S.yellow, fontWeight: 600 }}>{m.calories} kcal</span>
                <span style={{ fontSize: 12, color: S.green, fontWeight: 600 }}>{m.protein}g P</span>
                <span style={{ fontSize: 12, color: S.accent, fontWeight: 600 }}>{m.carbs}g C</span>
                <span style={{ fontSize: 12, color: S.purple, fontWeight: 600 }}>{m.fat}g F</span>
              </div>
              {!m.consumed && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <label style={{ fontSize: 12, color: S.muted, flexShrink: 0 }}>How much did you eat?</label>
                  <input type="range" min={0} max={100} step={10} value={consumeAmounts[m._id] || 0}
                    onChange={e => setConsumeAmounts({ ...consumeAmounts, [m._id]: Number(e.target.value) })}
                    style={{ flex: 1, accentColor: S.green }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.green, minWidth: 36, textAlign: "right" }}>{consumeAmounts[m._id] || 0}%</span>
                </div>
              )}
            </div>
          ))}

          {Object.values(consumeAmounts).some(v => v > 0) && (
            <button onClick={modifyPlan} disabled={modifying}
              style={{ width: "100%", marginTop: 12, background: modifying ? "#0891b2" : S.accent, color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 14, cursor: modifying ? "wait" : "pointer" }}>
              {modifying ? "⏳ AI is adjusting your plan..." : "📝 Log Consumption & Adjust Plan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Recipe Finder ───────────────────────────────────────────────────
function RecipeSection() {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);

  const findRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setRecipe(null);
    try {
      const res = await fetch("/api/ai/recipe-from-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean) }),
      });
      const data = await res.json();
      if (data.recipe) setRecipe(data.recipe);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 4 }}>👨‍🍳 Recipe from Ingredients</h3>
        <p style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>Enter the ingredients you have, and AI will create a recipe with nutrition info</p>
        <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="e.g. chicken, rice, broccoli, garlic, olive oil, lemon" rows={3}
          style={{ width: "100%", background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 10, padding: "12px 14px", color: S.text, fontSize: 14, outline: "none", resize: "none", marginBottom: 14 }} />
        <button onClick={findRecipe} disabled={loading}
          style={{ width: "100%", background: loading ? "#059669" : S.green, color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "🍳 Cooking up a recipe..." : "🍳 Generate Recipe"}
        </button>
      </div>

      {recipe && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", background: "linear-gradient(135deg,#10b981,#059669)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{recipe.name}</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Serves {recipe.servings} · Prep {recipe.prepTime} · Cook {recipe.cookTime}</p>
          </div>
          <div style={{ padding: 24 }}>
            {/* Nutrition */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${S.border}` }}>
              {[
                { label: "Calories", val: recipe.nutrition?.calories, color: S.yellow },
                { label: "Protein", val: `${recipe.nutrition?.protein}g`, color: S.green },
                { label: "Carbs", val: `${recipe.nutrition?.carbs}g`, color: S.accent },
                { label: "Fat", val: `${recipe.nutrition?.fat}g`, color: S.purple },
              ].map(n => (
                <div key={n.label}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: n.color }}>{n.val}</p>
                  <p style={{ fontSize: 11, color: S.muted }}>{n.label}</p>
                </div>
              ))}
            </div>
            {/* Ingredients */}
            <h4 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 10 }}>Ingredients</h4>
            <ul style={{ padding: "0 0 0 18px", marginBottom: 20 }}>
              {(recipe.ingredients || []).map((ing: string, i: number) => (
                <li key={i} style={{ fontSize: 13, color: S.muted, marginBottom: 4 }}>{ing}</li>
              ))}
            </ul>
            {/* Steps */}
            <h4 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 10 }}>Instructions</h4>
            {(recipe.instructions || []).map((step: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: S.green, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
            {recipe.tips && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(16,185,129,0.08)", border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 10 }}>
                <p style={{ fontSize: 13, color: S.green, fontWeight: 600 }}>💡 Tip: {recipe.tips}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Activity Tracker ────────────────────────────────────────────────
function ActivitySection() {
  const [activities, setActivities] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [totalBurnt, setTotalBurnt] = useState(0);
  const [selected, setSelected] = useState("");
  const [duration, setDuration] = useState("30");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetch("/api/ai/activity-calories").then(r => r.json()).then(d => {
      setActivities(d.activities || []);
      setTodayLogs(d.todayLogs || []);
      setTotalBurnt(d.totalBurntToday || 0);
    });
  }, []);

  const logActivity = async () => {
    if (!selected || !duration) return;
    setLogging(true);
    try {
      const res = await fetch("/api/ai/activity-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: selected, duration: Number(duration) }),
      });
      const data = await res.json();
      if (data.log) {
        setTodayLogs([data.log, ...todayLogs]);
        setTotalBurnt(data.totalBurntToday);
        setSelected("");
        setDuration("30");
      }
    } catch (err) { console.error(err); }
    setLogging(false);
  };

  return (
    <div>
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 4 }}>🏃 Activity Tracker</h3>
        <p style={{ fontSize: 13, color: S.muted, marginBottom: 20 }}>Select your activity and duration to calculate calories burnt</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {activities.map(a => (
            <button key={a.id} onClick={() => setSelected(a.id)}
              style={{ padding: "14px 12px", borderRadius: 12, border: selected === a.id ? `2px solid ${S.green}` : `1px solid ${S.border}`, background: selected === a.id ? "rgba(16,185,129,0.1)" : "#1e293b", cursor: "pointer", textAlign: "center" }}>
              <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{a.emoji}</span>
              <p style={{ fontSize: 12, fontWeight: 600, color: selected === a.id ? S.green : S.text }}>{a.label}</p>
              <p style={{ fontSize: 10, color: S.muted }}>MET: {a.met}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <label style={{ fontSize: 13, color: S.muted, flexShrink: 0 }}>Duration:</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={1}
              style={{ width: 80, background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 12px", color: S.text, fontSize: 14, outline: "none", textAlign: "center" }} />
            <span style={{ fontSize: 13, color: S.muted }}>minutes</span>
          </div>
        )}

        <button onClick={logActivity} disabled={!selected || logging}
          style={{ width: "100%", background: !selected ? "#1e293b" : logging ? "#059669" : S.green, color: !selected ? S.muted : "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 14, cursor: !selected ? "default" : logging ? "wait" : "pointer" }}>
          {logging ? "Logging..." : "⚡ Log Activity & Calculate Burn"}
        </button>
      </div>

      {/* Today's Summary */}
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text }}>Today's Activity Log</h3>
          <span style={{ fontSize: 22, fontWeight: 900, color: S.yellow }}>{totalBurnt} kcal burnt</span>
        </div>
        {todayLogs.length === 0 && <p style={{ fontSize: 14, color: S.muted, textAlign: "center", padding: 20 }}>No activities logged today.</p>}
        {todayLogs.map((log: any, i: number) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < todayLogs.length - 1 ? `1px solid ${S.border}` : "none" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{log.activity}</p>
              <p style={{ fontSize: 12, color: S.muted }}>{log.duration} min · MET {log.met}</p>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: S.yellow }}>-{log.caloriesBurnt} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Nutritionist Section ────────────────────────────────────────────
function NutritionistSection() {
  const [nutritionists, setNutritionists] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [booking, setBooking] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({ date: "", time: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/nutritionists").then(r => r.json()).then(d => setNutritionists(d.nutritionists || []));
    fetch("/api/appointments").then(r => r.json()).then(d => setAppointments(d.appointments || []));
  }, []);

  const bookAppointment = async () => {
    if (!booking || !bookForm.date || !bookForm.time) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nutritionistId: booking, ...bookForm }),
      });
      const data = await res.json();
      if (data.appointment) {
        setAppointments([data.appointment, ...appointments]);
        setBooking(null);
        setBookForm({ date: "", time: "", notes: "" });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  return (
    <div>
      {success && (
        <div style={{ background: "rgba(16,185,129,0.1)", border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: S.green, fontSize: 14, fontWeight: 600, textAlign: "center" }}>
          ✓ Appointment booked successfully! You'll receive a confirmation soon.
        </div>
      )}

      <h3 style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 20 }}>👨‍⚕️ Our Expert Nutritionists</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {nutritionists.map((doc: any) => (
          <div key={doc._id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{doc.emoji}</div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: S.text }}>{doc.name}</p>
                  <p style={{ fontSize: 12, color: S.green, fontWeight: 600 }}>{doc.specialization}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.6, marginBottom: 12 }}>{doc.bio}</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: S.muted }}>⭐ {doc.rating}</span>
                <span style={{ fontSize: 12, color: S.muted }}>{doc.reviews} reviews</span>
                <span style={{ fontSize: 12, color: S.muted }}>{doc.patients} patients</span>
                <span style={{ fontSize: 12, color: S.muted }}>{doc.experience}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {(doc.badges || []).map((b: string, i: number) => (
                  <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(16,185,129,0.1)", color: S.green, fontWeight: 600 }}>{b}</span>
                ))}
              </div>
              <button onClick={() => setBooking(booking === doc._id ? null : doc._id)}
                style={{ width: "100%", background: booking === doc._id ? S.accent : S.green, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {booking === doc._id ? "Cancel" : "📅 Book Appointment"}
              </button>
            </div>

            {/* Booking Form */}
            {booking === doc._id && (
              <div style={{ padding: "0 22px 20px", borderTop: `1px solid ${S.border}`, paddingTop: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Date</label>
                    <input type="date" value={bookForm.date} onChange={e => setBookForm({ ...bookForm, date: e.target.value })} min={new Date().toISOString().split("T")[0]}
                      style={{ width: "100%", background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 10px", color: S.text, fontSize: 13, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: S.muted, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Time</label>
                    <select value={bookForm.time} onChange={e => setBookForm({ ...bookForm, time: e.target.value })}
                      style={{ width: "100%", background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 10px", color: S.text, fontSize: 13, outline: "none", cursor: "pointer" }}>
                      <option value="">Select time...</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <textarea value={bookForm.notes} onChange={e => setBookForm({ ...bookForm, notes: e.target.value })} placeholder="Any specific concerns or notes..." rows={2}
                  style={{ width: "100%", background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 10px", color: S.text, fontSize: 13, outline: "none", resize: "none", marginBottom: 10 }} />
                <button onClick={bookAppointment} disabled={!bookForm.date || !bookForm.time || submitting}
                  style={{ width: "100%", background: submitting ? "#059669" : S.green, color: "#fff", border: "none", borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 13, cursor: submitting ? "wait" : "pointer" }}>
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* My Appointments */}
      {appointments.length > 0 && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 16 }}>📋 My Appointments</h3>
          {appointments.map((apt: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < appointments.length - 1 ? `1px solid ${S.border}` : "none" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{apt.nutritionistName}</p>
                <p style={{ fontSize: 12, color: S.muted }}>{apt.date} · {apt.time}</p>
              </div>
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 600, textTransform: "capitalize",
                background: apt.status === "confirmed" ? "rgba(16,185,129,0.15)" : apt.status === "completed" ? "rgba(100,116,139,0.15)" : "rgba(245,158,11,0.15)",
                color: apt.status === "confirmed" ? S.green : apt.status === "completed" ? S.muted : S.yellow }}>
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────
export default function UserDashboard() {
  const { data: session } = useSession();
  const [active, setActive] = useState<NavSection>("dashboard");
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [totalBurnt, setTotalBurnt] = useState(0);
  const name = session?.user?.name || "User";

  const refreshPlan = useCallback(() => {
    fetch("/api/ai/generate-plan").then(r => r.json()).then(d => {
      if (d.mealPlan) setMealPlan(d.mealPlan);
    });
  }, []);

  useEffect(() => {
    refreshPlan();
    fetch("/api/ai/activity-calories").then(r => r.json()).then(d => setTotalBurnt(d.totalBurntToday || 0));
  }, [refreshPlan]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: S.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: S.text }}>
      <Sidebar active={active} setActive={setActive} name={name} />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>
            {active === "dashboard" && `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${name.split(" ")[0]} 👋`}
            {active === "meals" && "🤖 AI Meal Plan"}
            {active === "recipes" && "📖 Recipe Browser"}
            {active === "recipe" && "👨‍🍳 Recipe Finder"}
            {active === "activity" && "🏃 Activity Tracker"}
            {active === "nutritionists" && "👨‍⚕️ Nutritionists"}
          </h1>
          <p style={{ fontSize: 14, color: S.muted }}>
            {active === "dashboard" && "Your personalized nutrition overview for today."}
            {active === "meals" && "Generate and manage your AI-powered meal plan with ML classification."}
            {active === "recipes" && "Browse our curated recipe database filtered by your ML-predicted diet type."}
            {active === "recipe" && "Enter your ingredients and let AI create a recipe for you."}
            {active === "activity" && "Track your exercises and see how many calories you've burnt."}
            {active === "nutritionists" && "Browse expert nutritionists and book a consultation."}
          </p>
        </div>

        {active === "dashboard" && <DashboardOverview mealPlan={mealPlan} totalBurnt={totalBurnt} />}
        {active === "meals" && <MealPlanSection mealPlan={mealPlan} setMealPlan={setMealPlan} refreshPlan={refreshPlan} />}
        {active === "recipes" && <RecipeBrowser dietCategory={mealPlan?.category} />}
        {active === "recipe" && <RecipeSection />}
        {active === "activity" && <ActivitySection />}
        {active === "nutritionists" && <NutritionistSection />}
      </main>
    </div>
  );
}

// ─── Recipe Browser (from MongoDB) ───────────────────────────────────
function RecipeBrowser({ dietCategory }: { dietCategory?: string }) {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filterDiet, setFilterDiet] = useState(dietCategory || "");
  const [filterType, setFilterType] = useState("");
  const [filterCuisine, setFilterCuisine] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDiet) params.set("dietType", filterDiet);
    if (filterType) params.set("type", filterType);
    if (filterCuisine) params.set("cuisine", filterCuisine);
    fetch(`/api/recipes?${params.toString()}`).then(r => r.json()).then(d => {
      setRecipes(d.recipes || []);
      setLoading(false);
    });
  }, [filterDiet, filterType, filterCuisine]);

  return (
    <div>
      {/* Filters */}
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 11, color: S.muted, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Diet Type</label>
            <select value={filterDiet} onChange={e => setFilterDiet(e.target.value)} style={{ background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 12px", color: S.text, fontSize: 13, outline: "none", cursor: "pointer" }}>
              <option value="">All Diets</option>
              <option value="Low_Carb">Low Carb</option>
              <option value="Low_Sodium">Low Sodium</option>
              <option value="Balanced">Balanced</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: S.muted, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 12px", color: S.text, fontSize: 13, outline: "none", cursor: "pointer" }}>
              <option value="">Veg & Non-Veg</option>
              <option value="Veg">🥬 Veg Only</option>
              <option value="Non-Veg">🍗 Non-Veg Only</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: S.muted, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Cuisine</label>
            <select value={filterCuisine} onChange={e => setFilterCuisine(e.target.value)} style={{ background: "#1e293b", border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 12px", color: S.text, fontSize: 13, outline: "none", cursor: "pointer" }}>
              <option value="">All Cuisines</option>
              <option value="Indian">Indian</option>
              <option value="South Indian">South Indian</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Asian">Asian</option>
              <option value="Mexican">Mexican</option>
              <option value="Global">Global</option>
            </select>
          </div>
          <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
            <span style={{ fontSize: 13, color: S.muted }}>{recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found</span>
          </div>
        </div>
        {dietCategory && (
          <div style={{ marginTop: 12, padding: "8px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: S.green, fontWeight: 600 }}>🤖 ML recommended diet: {dietCategory}  </span>
            <button onClick={() => setFilterDiet(dietCategory)} style={{ fontSize: 12, color: S.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Filter by this</button>
          </div>
        )}
      </div>

      {loading && <p style={{ textAlign: "center", color: S.muted, padding: 40 }}>Loading recipes...</p>}

      {/* Recipe Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {recipes.map((r: any) => (
          <div key={r._id} onClick={() => setSelectedRecipe(r)} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = S.green)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = S.border)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: S.text, flex: 1 }}>{r.name}</h4>
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, fontWeight: 600, flexShrink: 0, marginLeft: 8, background: r.type === "Veg" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: r.type === "Veg" ? S.green : S.red }}>{r.type}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {r.dietType && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(6,182,212,0.12)", color: S.accent, fontWeight: 600 }}>{r.dietType.replace("_", " ")}</span>}
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(100,116,139,0.15)", color: S.muted, fontWeight: 600 }}>{r.cuisine}</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: S.yellow, fontWeight: 600 }}>{r.nutritionPer100g?.caloriesKcal} kcal</span>
              <span style={{ fontSize: 12, color: S.green, fontWeight: 600 }}>{r.nutritionPer100g?.proteinG}g P</span>
              <span style={{ fontSize: 12, color: S.accent, fontWeight: 600 }}>{r.nutritionPer100g?.carbsG}g C</span>
              <span style={{ fontSize: 12, color: S.purple, fontWeight: 600 }}>{r.nutritionPer100g?.fatG}g F</span>
            </div>
            <p style={{ fontSize: 11, color: S.muted }}>⏱ {r.cookTime} min · {(r.ingredients || []).length} ingredients</p>
          </div>
        ))}
      </div>

      {recipes.length === 0 && !loading && <p style={{ textAlign: "center", color: S.muted, padding: 40 }}>No recipes found. Try adjusting filters.</p>}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }} onClick={() => setSelectedRecipe(null)}>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 0 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "20px 24px", background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: "20px 20px 0 0", position: "relative" }}>
              <button onClick={() => setSelectedRecipe(null)} style={{ position: "absolute", top: 14, right: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 28, height: 28, fontSize: 14, cursor: "pointer", color: "#fff" }}>✕</button>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{selectedRecipe.name}</h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{selectedRecipe.type} · {selectedRecipe.cuisine} · ⏱ {selectedRecipe.cookingTimeMinutes} min</span>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {/* Nutrition */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                {[{ l: "Calories", v: selectedRecipe.nutritionPer100g?.caloriesKcal, u: "kcal", c: S.yellow }, { l: "Protein", v: selectedRecipe.nutritionPer100g?.proteinG, u: "g", c: S.green }, { l: "Carbs", v: selectedRecipe.nutritionPer100g?.carbohydratesG, u: "g", c: S.accent }, { l: "Fat", v: selectedRecipe.nutritionPer100g?.fatG, u: "g", c: S.purple }, { l: "Sugar", v: selectedRecipe.nutritionPer100g?.sugarG, u: "g", c: S.red }, { l: "Sodium", v: selectedRecipe.nutritionPer100g?.sodiumMg, u: "mg", c: S.muted }].map(n => (
                  <div key={n.l} style={{ background: "#1e293b", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: n.c }}>{n.v}{n.u !== "kcal" ? n.u : ""}</p>
                    <p style={{ fontSize: 10, color: S.muted, textTransform: "uppercase" }}>{n.l}{n.u === "kcal" ? " (kcal)" : ""}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: S.muted, marginBottom: 16, textAlign: "center" }}>Per 100g serving</p>
              {/* Ingredients */}
              <h4 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 10 }}>🧂 Ingredients</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                {(selectedRecipe.ingredients || []).map((ing: any, i: number) => (
                  <span key={i} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, background: "#1e293b", border: `1px solid ${S.border}`, color: S.text, fontWeight: 500 }}>{ing.quantity} {ing.unit} {ing.name}</span>
                ))}
              </div>
              {/* Steps */}
              <h4 style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 10 }}>📝 Cooking Steps</h4>
              {(selectedRecipe.recipeSteps || []).map((step: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: S.green, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
              {/* Tags */}
              {(selectedRecipe.tags || []).length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
                  {(selectedRecipe.tags || []).map((t: string) => <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "rgba(16,185,129,0.1)", color: S.green, fontWeight: 600 }}>#{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
