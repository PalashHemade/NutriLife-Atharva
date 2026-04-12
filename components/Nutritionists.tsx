'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, ArrowRight, Clock } from 'lucide-react';

const nutritionists = [
  { name: 'Dr. Aisha Mehta', specialization: 'Clinical Nutrition', experience: '12+ years', rating: 4.9, reviews: 846, patients: '2.4K', emoji: '👩‍⚕️', bg: 'linear-gradient(135deg,#E0F7F4,#C0F0E8)', badges: ['Diabetes', 'Thyroid', 'PCOS'] },
  { name: 'Rohan Sharma', specialization: 'Sports Nutrition', experience: '8+ years', rating: 4.8, reviews: 612, patients: '1.8K', emoji: '🏋️', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', badges: ['Athletes', 'Muscle Gain', 'Performance'] },
  { name: 'Neha Kapoor', specialization: 'Weight Management', experience: '10+ years', rating: 4.8, reviews: 734, patients: '3.1K', emoji: '🌿', bg: 'linear-gradient(135deg,#FEF9C3,#FDE68A)', badges: ['Obesity', 'Keto', 'Intermittent Fasting'] },
  { name: 'Aarav Iyer', specialization: 'Diabetic Specialist', experience: '15+ years', rating: 4.9, reviews: 921, patients: '4.2K', emoji: '🩺', bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', badges: ['Type 2 Diabetes', 'Insulin', 'Lifestyle'] },
];

export default function Nutritionists() {
  return (
    <section id="nutritionists" style={{ padding: '5rem 1.5rem', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 4rem' }}>
          <span style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '9999px', background: 'rgba(0,200,150,0.1)', color: '#00C896', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Our Experts</span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', lineHeight: 1.2 }}>
            Meet Your Personal{' '}
            <span style={{ background: 'linear-gradient(135deg,#00C896,#0EA5A4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nutritionists</span>
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.6, margin: 0 }}>
            Certified experts with decades of combined experience helping thousands achieve their health goals.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {nutritionists.map((doc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9', overflow: 'hidden', transition: 'box-shadow 0.3s, transform 0.3s', cursor: 'default' }}>
              {/* Avatar area */}
              <div style={{ height: '8rem', background: doc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                  {doc.emoji}
                </div>
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', borderRadius: '9999px', padding: '0.25rem 0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Star style={{ width: '0.75rem', height: '0.75rem', color: '#FBBF24', fill: '#FBBF24' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{doc.rating}</span>
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', margin: '0 0 0.25rem' }}>{doc.name}</h3>
                <p style={{ color: '#00C896', fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.875rem' }}>{doc.specialization}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock style={{ width: '0.875rem', height: '0.875rem' }} />{doc.experience}
                  </div>
                  <div><span style={{ fontWeight: 600, color: '#475569' }}>{doc.patients}</span> patients</div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
                  {doc.badges.map((badge, bi) => (
                    <span key={bi} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#F1F5F9', color: '#475569', fontWeight: 500 }}>{badge}</span>
                  ))}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#CBD5E1', marginBottom: '1rem' }}>{doc.reviews} reviews</p>

                <Link href="/book"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,200,150,0.25)', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,200,150,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,200,150,0.25)'; }}>
                  Book Now <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
