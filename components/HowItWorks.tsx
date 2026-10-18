'use client';

import { motion } from 'framer-motion';
import { ClipboardList, BrainCircuit, LineChart } from 'lucide-react';

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Build Your Health Profile',
    desc: 'Enter 13 clinical data points — glucose, cholesterol, blood pressure, BMI, exercise habits, allergies, and more. No guesswork quizzes.',
  },
  {
    icon: BrainCircuit,
    step: '02',
    title: 'ML Classifies, AI Plans',
    desc: 'A trained Random Forest model classifies your profile into Balanced, Low-Carb, or Low-Sodium — then AI builds a full day of meals from our real recipe database.',
  },
  {
    icon: LineChart,
    step: '03',
    title: 'Log, Track, Adjust',
    desc: 'Mark what you actually ate and the plan recalculates your remaining meals. Track workouts and see calories burnt vs. eaten in real time.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '6rem 1.5rem', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 4rem' }}>
          <span style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '9999px', background: 'rgba(0,200,150,0.1)', color: '#00C896', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>How It Works</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', lineHeight: 1.2 }}>
            From bloodwork to{' '}
            <span style={{ background: 'linear-gradient(135deg,#00C896,#0EA5A4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dinner plate</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.6, margin: 0 }}>
            Three steps, powered by a real trained ML model and curated nutrition data — not a vibe check.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', position: 'relative' }}>
          {steps.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '2.5rem', position: 'relative' }}>
              <p style={{ fontSize: '2.75rem', fontWeight: 900, color: '#E2E8F0', lineHeight: 1, marginBottom: '1rem' }}>{s.step}</p>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,200,150,0.25)', marginBottom: '1.25rem' }}>
                <s.icon style={{ width: '1.75rem', height: '1.75rem', color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>{s.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
