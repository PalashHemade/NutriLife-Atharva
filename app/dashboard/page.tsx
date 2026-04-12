'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardStats from '@/components/DashboardStats';
import UsersTable from '@/components/UsersTable';
import DietGenerator from '@/components/DietGenerator';
import AppointmentsTable from '@/components/AppointmentsTable';
import { Bell, Search, Menu } from 'lucide-react';

type Section = 'overview' | 'users' | 'diet' | 'appointments';

const sectionTitles: Record<Section, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Welcome back, Dr. Priya Nair' },
  users: { title: 'Users', subtitle: 'Manage your registered patients' },
  diet: { title: 'Generate Diet Plan', subtitle: 'AI-powered personalized nutrition plans' },
  appointments: { title: 'Appointments', subtitle: 'View and manage consultations' },
};

export default function DashboardPage() {
  const [active, setActive] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => router.push('/login');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex' }}>
      {/* Sidebar – desktop */}
      <div className="hidden lg:flex" style={{ flexShrink: 0 }}>
        <DashboardSidebar active={active} onChange={setActive} onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.4)' }}
              className="lg:hidden" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'fixed', inset: '0 auto 0 0', zIndex: 50 }}
              className="lg:hidden">
              <DashboardSidebar active={active} onChange={s => { setActive(s); setSidebarOpen(false); }} onLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #F1F5F9', padding: '0 1.5rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
              style={{ padding: '0.5rem', borderRadius: '0.625rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
              <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{sectionTitles[active].title}</h2>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, display: 'none' }} className="sm:block">{sectionTitles[active].subtitle}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.625rem' }}>
              <Search style={{ width: '1rem', height: '1rem', color: '#94A3B8', flexShrink: 0 }} />
              <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', width: '8rem', fontSize: '0.875rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }} />
            </div>
            {/* Bell */}
            <button style={{ position: 'relative', padding: '0.5rem', borderRadius: '0.625rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
              <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ position: 'absolute', top: '0.375rem', right: '0.375rem', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#00C896' }} />
            </button>
            {/* Avatar */}
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 10px rgba(0,200,150,0.3)' }}>P</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {active === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <DashboardStats />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {/* Recent Activity */}
                    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1.25rem' }}>Recent Activity</h3>
                      {[
                        { action: 'New appointment booked', who: 'Priya Sharma with Dr. Aisha Mehta', time: '2 min ago', dot: '#22C55E' },
                        { action: 'Diet plan generated', who: 'Arjun Reddy – Muscle Gain', time: '18 min ago', dot: '#3B82F6' },
                        { action: 'Consultation completed', who: 'Sneha Patel with Aarav Iyer', time: '1 hr ago', dot: '#94A3B8' },
                        { action: 'New user registered', who: 'Kiran Nair joined NutriLife', time: '3 hrs ago', dot: '#00C896' },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < 3 ? '0.875rem' : 0 }}>
                          <span style={{ marginTop: '0.375rem', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: item.dot, flexShrink: 0, display: 'inline-block' }} />
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0 }}>{item.action}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.125rem 0 0' }}>{item.who} · {item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Top Nutritionists */}
                    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1.25rem' }}>Top Nutritionists</h3>
                      {[
                        { name: 'Dr. Aisha Mehta', patients: 342, rating: 4.9, emoji: '👩‍⚕️' },
                        { name: 'Aarav Iyer', patients: 298, rating: 4.9, emoji: '🩺' },
                        { name: 'Neha Kapoor', patients: 276, rating: 4.8, emoji: '🌿' },
                        { name: 'Rohan Sharma', patients: 241, rating: 4.8, emoji: '🏋️' },
                      ].map((n, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: i < 3 ? '0.875rem' : 0 }}>
                          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>{n.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.125rem 0 0' }}>{n.patients} patients · ⭐ {n.rating}</p>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00C896' }}>#{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {active === 'users' && <UsersTable />}
              {active === 'diet' && <DietGenerator />}
              {active === 'appointments' && <AppointmentsTable />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
