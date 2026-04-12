'use client';

import { motion } from 'framer-motion';
import { Leaf, Activity, Stethoscope, Carrot } from 'lucide-react';

const services = [
  {
    icon: Leaf, color: '#00C896', bg: 'linear-gradient(135deg,#00C896,#0EA5A4)',
    title: 'Personalized Meal Plans',
    desc: 'Get diet plans dynamically tailored to your body type, goals, and specific dietary preferences using our AI engine.'
  },
  {
    icon: Stethoscope, color: '#3B82F6', bg: 'linear-gradient(135deg,#3B82F6,#2563EB)',
    title: 'Expert Consultations',
    desc: 'Connect with certified clinical nutritionists for 1-on-1 guidance, regular follow-ups, and professional monitoring.'
  },
  {
    icon: Activity, color: '#8B5CF6', bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)',
    title: 'Health Tracking',
    desc: 'Log meals, track daily macros, monitor weight changes, and visualize your progress with easy-to-read dashboards.'
  },
  {
    icon: Carrot, color: '#F59E0B', bg: 'linear-gradient(135deg,#F59E0B,#D97706)',
    title: 'Condition Management',
    desc: 'Specialized programs for managing diabetes, PCOS, thyroid issues, and other lifestyle-related health conditions.'
  },
];

export default function Services() {
  return (
    <section id="services" style={{ padding: '6rem 1.5rem', background: '#fff' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 4rem' }}>
          <span style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '9999px', background: 'rgba(0,200,150,0.1)', color: '#00C896', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Our Services</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', lineHeight: 1.2 }}>
            Comprehensive Care for Your{' '}
            <span style={{ background: 'linear-gradient(135deg,#00C896,#0EA5A4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Wellness Journey</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.6, margin: 0 }}>
            Everything you need to transform your health, from AI-generated daily meal plans to expert 1-on-1 human guidance.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {services.map((svc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              style={{ padding: '2.5rem', background: '#F8FAFC', borderRadius: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'transform 0.3s, box-shadow 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', background: svc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 20px ${svc.color}40`, marginBottom: '1.5rem' }}>
                <svc.icon style={{ width: '2rem', height: '2rem', color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>{svc.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
