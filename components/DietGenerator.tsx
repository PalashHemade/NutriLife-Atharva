'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Loader2, Sparkles } from 'lucide-react';

type Goal = 'Weight Loss' | 'Muscle Gain' | 'Diabetic Control';

interface DietPlan {
  breakfast: string; lunch: string; dinner: string; snacks: string;
  calories: number; protein: string; carbs: string; fat: string;
}

const users = ['Priya Sharma (28, F)', 'Arjun Reddy (32, M)', 'Sneha Patel (45, F)', 'Rahul Kumar (22, M)', 'Divya Singh (38, F)', 'Kiran Nair (55, M)', 'Anjali Gupta (34, F)', 'Vikram Joshi (29, M)'];
const goalOptions: Goal[] = ['Weight Loss', 'Muscle Gain', 'Diabetic Control'];

const mockDietPlans: Record<Goal, DietPlan> = {
  'Weight Loss': { breakfast: 'Oatmeal with berries + green tea + 2 boiled eggs (white only)', lunch: 'Grilled chicken salad + quinoa + cucumber raita', dinner: 'Steamed fish + stir-fried veggies + small bowl of brown rice', snacks: 'Apple + 10–12 almonds + coconut water', calories: 1450, protein: '120g', carbs: '140g', fat: '40g' },
  'Muscle Gain': { breakfast: 'Scrambled eggs (4) + whole-grain toast + banana + protein shake', lunch: 'Chicken breast 200g + sweet potato + legume dal + salad', dinner: 'Paneer tikka + roti (2) + mixed dal + curd + sabzi', snacks: 'Greek yogurt + nuts + banana + peanut butter sandwich', calories: 2800, protein: '180g', carbs: '300g', fat: '80g' },
  'Diabetic Control': { breakfast: 'Methi paratha (no ghee) + low-fat curd + vegetable soup', lunch: 'Brown rice (¾ cup) + moong dal + non-starchy sabzi + salad', dinner: 'Ragi roti (2) + stewed vegetables + low-fat chicken stew', snacks: 'Guava + roasted chana + vegetable juice (no sugar)', calories: 1600, protein: '100g', carbs: '180g', fat: '45g' },
};

const selectStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#1E293B', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s' };
const inputNum: React.CSSProperties = { ...selectStyle, cursor: 'text' };
const labelS: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

export default function DietGenerator() {
  const [form, setForm] = useState({ user: '', height: '', weight: '', goal: '' as Goal | '' });
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!form.user || !form.height || !form.weight || !form.goal) { setError('Please fill in all fields'); return; }
    setError(''); setLoading(true); setPlan(null);
    await new Promise(r => setTimeout(r, 1800));
    setPlan(mockDietPlans[form.goal as Goal]);
    setLoading(false);
  };

  const mealCards = plan ? [
    { label: '🌅 Breakfast', value: plan.breakfast },
    { label: '☀️ Lunch', value: plan.lunch },
    { label: '🌙 Dinner', value: plan.dinner },
    { label: '🍎 Snacks', value: plan.snacks },
  ] : [];

  return (
    <div>
      {/* Form card */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils style={{ width: '1.25rem', height: '1.25rem', color: '#00C896' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Generate Diet Plan</h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>AI-powered personalized nutrition</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelS}>Select User</label>
            <select value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} style={selectStyle}>
              <option value="">Choose a patient...</option>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={labelS}>Goal</label>
            <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value as Goal })} style={selectStyle}>
              <option value="">Select goal...</option>
              {goalOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={labelS}>Height (cm)</label>
            <input type="number" placeholder="e.g. 165" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} style={inputNum} />
          </div>
          <div>
            <label style={labelS}>Weight (kg)</label>
            <input type="number" placeholder="e.g. 70" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} style={inputNum} />
          </div>
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

        <motion.button onClick={handleGenerate} disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
          style={{ width: '100%', padding: '0.875rem', color: '#fff', fontWeight: 700, fontSize: '0.9rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', borderRadius: '0.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(0,200,150,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.75 : 1, fontFamily: 'Inter, sans-serif' }}>
          {loading ? (<><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />Generating Plan...</>) : (<><Sparkles style={{ width: '1rem', height: '1rem' }} />Generate Diet Plan</>)}
        </motion.button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            style={{ background: '#fff', borderRadius: '1rem', border: '1px solid rgba(0,200,150,0.2)', boxShadow: '0 8px 32px rgba(0,200,150,0.12)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Sparkles style={{ width: '1.125rem', height: '1.125rem' }} />Personalized Diet Plan
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{form.user} · {form.goal} · {form.height}cm / {form.weight}kg</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{plan.calories}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0 }}>kcal/day</p>
              </div>
            </div>
            {/* Macros */}
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,200,150,0.04)', borderBottom: '1px solid rgba(0,200,150,0.1)', display: 'flex', gap: '2rem' }}>
              {[{ label: 'Protein', value: plan.protein, color: '#3B82F6' }, { label: 'Carbs', value: plan.carbs, color: '#D97706' }, { label: 'Fat', value: plan.fat, color: '#EF4444' }].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: m.color, margin: 0 }}>{m.value}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>{m.label}</p>
                </div>
              ))}
            </div>
            {/* Meals */}
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {mealCards.map((meal, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '1rem', borderRadius: '0.75rem', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>{meal.label}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{meal.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
