'use client';

import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

const users = [
  { name: 'Priya Sharma', age: 28, bmi: 24.2, goal: 'Weight Loss', avatar: '🧕' },
  { name: 'Arjun Reddy', age: 32, bmi: 27.8, goal: 'Muscle Gain', avatar: '💪' },
  { name: 'Sneha Patel', age: 45, bmi: 30.1, goal: 'Diabetic Control', avatar: '🧑‍🦰' },
  { name: 'Rahul Kumar', age: 22, bmi: 21.5, goal: 'Muscle Gain', avatar: '🏋️' },
  { name: 'Divya Singh', age: 38, bmi: 28.4, goal: 'Weight Loss', avatar: '🧑‍💼' },
  { name: 'Kiran Nair', age: 55, bmi: 26.0, goal: 'Diabetic Control', avatar: '👨‍🦳' },
  { name: 'Anjali Gupta', age: 34, bmi: 23.1, goal: 'Maintenance', avatar: '🧘' },
  { name: 'Vikram Joshi', age: 29, bmi: 22.8, goal: 'Muscle Gain', avatar: '🏃' },
];

const goalColors: Record<string, { bg: string; color: string }> = {
  'Weight Loss': { bg: '#FFF7ED', color: '#C2410C' },
  'Muscle Gain': { bg: '#EFF6FF', color: '#1D4ED8' },
  'Diabetic Control': { bg: '#FEF2F2', color: '#B91C1C' },
  'Maintenance': { bg: '#F0FDF4', color: '#15803D' },
};

function bmiColor(bmi: number) {
  if (bmi < 18.5) return '#3B82F6';
  if (bmi < 25) return '#16A34A';
  if (bmi < 30) return '#D97706';
  return '#EF4444';
}

export default function UsersTable() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Users</h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.125rem 0 0' }}>All registered patients</p>
        </div>
        <span style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(0,200,150,0.1)', color: '#00C896', borderRadius: '9999px' }}>
          {users.length} active
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['User', 'Age', 'BMI', 'Goal', 'Action'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ borderTop: '1px solid #F8FAFC' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,200,150,0.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(0,200,150,0.15),rgba(14,165,164,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                      {user.avatar}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748B' }}>{user.age} yrs</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: bmiColor(user.bmi) }}>{user.bmi}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: goalColors[user.goal]?.bg || '#F8FAFC', color: goalColors[user.goal]?.color || '#64748B' }}>
                    {user.goal}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#00C896', background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', transition: 'background 0.2s', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,200,150,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                    <Eye style={{ width: '0.875rem', height: '0.875rem' }} />View
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
