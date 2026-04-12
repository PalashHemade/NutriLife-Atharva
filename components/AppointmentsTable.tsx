'use client';

import { motion } from 'framer-motion';

const appointments = [
  { user: 'Priya Sharma', nutritionist: 'Dr. Aisha Mehta', date: '2026-03-04', time: '10:00 AM', status: 'Confirmed' },
  { user: 'Arjun Reddy', nutritionist: 'Rohan Sharma', date: '2026-03-04', time: '11:00 AM', status: 'Pending' },
  { user: 'Sneha Patel', nutritionist: 'Aarav Iyer', date: '2026-03-04', time: '02:00 PM', status: 'Completed' },
  { user: 'Rahul Kumar', nutritionist: 'Rohan Sharma', date: '2026-03-05', time: '09:00 AM', status: 'Confirmed' },
  { user: 'Divya Singh', nutritionist: 'Neha Kapoor', date: '2026-03-05', time: '03:00 PM', status: 'Pending' },
  { user: 'Kiran Nair', nutritionist: 'Aarav Iyer', date: '2026-03-05', time: '04:00 PM', status: 'Confirmed' },
  { user: 'Anjali Gupta', nutritionist: 'Dr. Aisha Mehta', date: '2026-03-06', time: '10:00 AM', status: 'Completed' },
  { user: 'Vikram Joshi', nutritionist: 'Rohan Sharma', date: '2026-03-06', time: '05:00 PM', status: 'Pending' },
];

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  Confirmed: { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  Pending: { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  Completed: { bg: '#F8FAFC', color: '#475569', dot: '#94A3B8' },
};

export default function AppointmentsTable() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #F1F5F9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Appointments</h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.125rem 0 0' }}>Upcoming & recent consultations</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Object.entries(statusConfig).map(([key, val]) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: val.bg, color: val.color }}>
              <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: val.dot, display: 'inline-block' }} />
              {key}
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Patient', 'Nutritionist', 'Date', 'Time', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ borderTop: '1px solid #F8FAFC' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,200,150,0.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{appt.user}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>{appt.nutritionist}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>
                  {new Date(appt.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>{appt.time}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: statusConfig[appt.status].bg, color: statusConfig[appt.status].color }}>
                    <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: statusConfig[appt.status].dot, display: 'inline-block' }} />
                    {appt.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
