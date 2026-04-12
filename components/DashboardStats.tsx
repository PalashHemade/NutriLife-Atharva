'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, ClipboardList, UserCheck } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Total Users', value: 1284, gradient: 'linear-gradient(135deg,#00C896,#0EA5A4)', iconBg: 'rgba(0,200,150,0.12)', iconColor: '#00C896', change: '+12%', changeGood: true },
  { icon: CalendarCheck, label: "Today's Appointments", value: 24, gradient: 'linear-gradient(135deg,#6366F1,#8B5CF6)', iconBg: 'rgba(99,102,241,0.12)', iconColor: '#6366F1', change: '+5', changeGood: true },
  { icon: ClipboardList, label: 'Pending Diet Plans', value: 38, gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#F59E0B', change: '-3', changeGood: false },
  { icon: UserCheck, label: 'Active Nutritionists', value: 16, gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)', iconBg: 'rgba(236,72,153,0.12)', iconColor: '#EC4899', change: '+2', changeGood: true },
];

function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 40;
    const stepVal = target / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += stepVal;
      if (cur >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(cur));
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}</>;
}

export default function DashboardStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
      {stats.map((stat, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '1.5rem', transition: 'box-shadow 0.3s, transform 0.3s', cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon style={{ width: '1.375rem', height: '1.375rem', color: stat.iconColor }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px', background: stat.changeGood ? '#F0FDF4' : '#FFF5F5', color: stat.changeGood ? '#16A34A' : '#EF4444' }}>
              {stat.change}
            </span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1, marginBottom: '0.25rem' }}>
            <Counter target={stat.value} />
          </p>
          <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>{stat.label}</p>
          <div style={{ marginTop: '0.875rem', height: '3px', borderRadius: '9999px', background: stat.gradient, opacity: 0.7 }} />
        </motion.div>
      ))}
    </div>
  );
}
