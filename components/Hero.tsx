'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, TrendingUp, Users, Award } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Active Users' },
  { icon: Award, value: '200+', label: 'Expert Nutritionists' },
  { icon: TrendingUp, value: '95%', label: 'Success Rate' },
];

export default function Hero() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #F0FDF8 0%, #E0F7F4 50%, #F8FAFC 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '5rem', paddingBottom: '4rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
        <div className="grid lg:grid-cols-2" style={{ gap: '4rem', alignItems: 'center' }}>
          {/* Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', fontSize: '0.875rem', fontWeight: 600, color: '#00C896', width: 'fit-content' }}
            >
              <Sparkles style={{ width: '1rem', height: '1rem' }} />
              AI-Powered Nutrition Platform
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Personalized
                <span className="gradient-text" style={{ display: 'block' }}>Nutrition</span>
                for a Healthier
                <span style={{ color: '#94A3B8' }}> Tomorrow</span>
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              style={{ color: '#64748B', fontSize: '1.125rem', lineHeight: 1.7, maxWidth: '36rem', fontWeight: 400 }}>
              AI-powered diet plans crafted for your unique body + Expert nutritionist consultation to guide your wellness journey every step of the way.
            </motion.p>

            {/* Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', color: '#fff', fontWeight: 600, fontSize: '1rem', background: 'linear-gradient(135deg, #00C896, #0EA5A4)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,200,150,0.35)', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
                Get Started Free <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </Link>
              <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', color: '#334155', fontWeight: 600, fontSize: '1rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid #E2E8F0', borderRadius: '1rem', textDecoration: 'none', transition: 'border-color 0.2s, color 0.2s' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #00C896, #0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play style={{ width: '0.75rem', height: '0.75rem', fill: '#fff', color: '#fff', marginLeft: '2px' }} />
                </div>
                Book Consultation
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '0.5rem' }}>
              {stats.map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon style={{ width: '1.25rem', height: '1.25rem', color: '#00C896' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{stat.value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right – Illustration */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="float-animation" style={{ position: 'relative' }}>
              <div style={{ position: 'relative', width: '22rem', height: '22rem', borderRadius: '2rem', background: 'linear-gradient(135deg, #00C896, #0EA5A4)', boxShadow: '0 30px 60px rgba(0,200,150,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: '-4rem', right: '-4rem', width: '12rem', height: '12rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '-4rem', left: '-4rem', width: '12rem', height: '12rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <svg viewBox="0 0 200 200" style={{ width: '14rem', height: '14rem' }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="130" r="55" fill="white" fillOpacity="0.2" />
                    <circle cx="100" cy="130" r="45" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" strokeDasharray="4 2" />
                    <ellipse cx="90" cy="120" rx="18" ry="12" fill="#4ADE80" />
                    <ellipse cx="108" cy="118" rx="16" ry="10" fill="#22C55E" />
                    <ellipse cx="100" cy="125" rx="14" ry="9" fill="#86EFAC" />
                    <circle cx="88" cy="135" r="8" fill="#F87171" />
                    <rect x="86" y="127" width="4" height="3" rx="1" fill="#4ADE80" />
                    <ellipse cx="112" cy="133" rx="9" ry="11" fill="#A3E635" />
                    <ellipse cx="112" cy="133" rx="5" ry="7" fill="#D9F99D" />
                    <ellipse cx="112" cy="133" rx="3" ry="4" fill="#854D0E" />
                    <rect x="68" y="90" width="3" height="30" rx="1.5" fill="white" fillOpacity="0.8" />
                    <rect x="64" y="88" width="2" height="12" rx="1" fill="white" fillOpacity="0.8" />
                    <rect x="68" y="88" width="2" height="12" rx="1" fill="white" fillOpacity="0.8" />
                    <rect x="72" y="88" width="2" height="12" rx="1" fill="white" fillOpacity="0.8" />
                    <path d="M80 60 L85 60 L88 53 L93 68 L97 58 L102 63 L105 60 L120 60" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <ellipse cx="145" cy="85" rx="14" ry="16" fill="#FCA5A5" />
                    <path d="M145 69 Q148 62 154 65" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <ellipse cx="139" cy="85" rx="4" ry="6" fill="white" fillOpacity="0.3" />
                    <circle cx="52" cy="72" r="3" fill="white" fillOpacity="0.6" />
                    <circle cx="152" cy="115" r="2.5" fill="white" fillOpacity="0.6" />
                  </svg>
                </div>
              </div>
              {/* Floating badge 1 */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                style={{ position: 'absolute', top: '-1.5rem', left: '-1.5rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '1rem', padding: '0.75rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>AI</div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>Diet Plan Ready</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748B' }}>Personalized for you</p>
                </div>
              </motion.div>
              {/* Floating badge 2 */}
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                style={{ position: 'absolute', bottom: '-1rem', right: '-1.5rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: '1rem', padding: '0.75rem 1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⭐</span>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>4.9/5 Rating</p>
                  <p style={{ fontSize: '0.7rem', color: '#64748B' }}>12K+ reviews</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
