'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Utensils, CalendarCheck, LogOut, Leaf, ChevronRight } from 'lucide-react';

type Section = 'overview' | 'users' | 'diet' | 'appointments';

interface Props {
  active: Section;
  onChange: (s: Section) => void;
  onLogout: () => void;
}

const navItems: { id: Section; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'diet', icon: Utensils, label: 'Generate Diet Plan' },
  { id: 'appointments', icon: CalendarCheck, label: 'Appointments' },
];

export default function DashboardSidebar({ active, onChange, onLogout }: Props) {
  return (
    <aside style={{ width: '16rem', minHeight: '100vh', background: '#fff', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,200,150,0.3)' }}>
            <Leaf style={{ width: '1rem', height: '1rem', color: '#fff' }} />
          </div>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Nutri<span style={{ background: 'linear-gradient(135deg,#00C896,#0EA5A4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Life</span></span>
          </div>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500, marginTop: '0.25rem', paddingLeft: '2.625rem' }}>Consultant Portal</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem' }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <motion.button key={item.id} onClick={() => onChange(item.id)}
              whileHover={{ x: isActive ? 0 : 2 }} whileTap={{ scale: 0.98 }}
              style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', transition: 'background 0.2s, color 0.2s',
                background: isActive ? 'linear-gradient(135deg,#00C896,#0EA5A4)' : 'transparent',
                color: isActive ? '#fff' : '#64748B',
                boxShadow: isActive ? '0 4px 16px rgba(0,200,150,0.3)' : 'none',
              }}>
              <item.icon style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, color: isActive ? '#fff' : '#94A3B8' }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {isActive && <ChevronRight style={{ width: '1rem', height: '1rem', color: 'rgba(255,255,255,0.7)' }} />}
            </motion.button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '0.75rem', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.15)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00C896', margin: 0 }}>Dr. Priya Nair</p>
          <p style={{ fontSize: '0.7rem', color: '#94A3B8', margin: '0.125rem 0 0' }}>priya@nutrilife.in</p>
        </div>
        <button onClick={onLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#94A3B8', transition: 'background 0.2s, color 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}>
          <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
          Logout
        </button>
      </div>
    </aside>
  );
}
