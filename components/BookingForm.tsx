'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { CheckCircle, X, Loader2, Calendar, User, Mail, Phone, Clock, MessageSquare } from 'lucide-react';

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  nutritionist: string;
  date: string;
  timeSlot: string;
  healthConcern: string;
};

const nutritionistOptions = [
  'Dr. Aisha Mehta – Clinical Nutrition',
  'Rohan Sharma – Sports Nutrition',
  'Neha Kapoor – Weight Management',
  'Aarav Iyer – Diabetic Specialist',
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM',
];

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '0.75rem',
  border: `1.5px solid ${hasError ? '#FCA5A5' : '#E2E8F0'}`,
  background: hasError ? '#FFF5F5' : '#F8FAFC',
  color: '#1E293B',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  boxSizing: 'border-box',
});

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#64748B',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export default function BookingForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
    reset();
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#00C896';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,200,150,0.12)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, hasError?: boolean) => {
    e.target.style.borderColor = hasError ? '#FCA5A5' : '#E2E8F0';
    e.target.style.background = hasError ? '#FFF5F5' : '#F8FAFC';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ background: '#fff', borderRadius: '1.5rem', boxShadow: '0 20px 60px rgba(0,200,150,0.12)', border: '1px solid #E2E8F0', padding: '2.5rem' }}>
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Row 1: Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}><User style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Full Name</label>
              <input {...register('fullName', { required: 'Required' })} placeholder="Enter your full name"
                style={inputStyle(!!errors.fullName)} onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.fullName)} />
              {errors.fullName && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.fullName.message}</p>}
            </div>
            <div>
              <label style={labelStyle}><Mail style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Email Address</label>
              <input {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} type="email" placeholder="you@example.com"
                style={inputStyle(!!errors.email)} onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.email)} />
              {errors.email && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
            </div>
          </div>

          {/* Row 2: Phone + Nutritionist */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}><Phone style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Phone Number</label>
              <input {...register('phone', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: '10-digit number' } })} placeholder="9876543210"
                style={inputStyle(!!errors.phone)} onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.phone)} />
              {errors.phone && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.phone.message}</p>}
            </div>
            <div>
              <label style={labelStyle}><User style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Select Nutritionist</label>
              <select {...register('nutritionist', { required: 'Required' })}
                style={{ ...inputStyle(!!errors.nutritionist), cursor: 'pointer' }} onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.nutritionist)}>
                <option value="">Choose nutritionist...</option>
                {nutritionistOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {errors.nutritionist && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.nutritionist.message}</p>}
            </div>
          </div>

          {/* Row 3: Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}><Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Preferred Date</label>
              <input {...register('date', { required: 'Required' })} type="date" min={new Date().toISOString().split('T')[0]}
                style={inputStyle(!!errors.date)} onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.date)} />
              {errors.date && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.date.message}</p>}
            </div>
            <div>
              <label style={labelStyle}><Clock style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Time Slot</label>
              <select {...register('timeSlot', { required: 'Required' })}
                style={{ ...inputStyle(!!errors.timeSlot), cursor: 'pointer' }} onFocus={focusStyle} onBlur={e => blurStyle(e, !!errors.timeSlot)}>
                <option value="">Select a time...</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.timeSlot && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.timeSlot.message}</p>}
            </div>
          </div>

          {/* Health Concern */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}><MessageSquare style={{ width: '0.875rem', height: '0.875rem', color: '#00C896' }} />Health Concern</label>
            <textarea {...register('healthConcern', { required: 'Required' })} rows={4}
              placeholder="Describe your health goals, dietary concerns, or anything you'd like to discuss..."
              style={{ ...inputStyle(!!errors.healthConcern), resize: 'none', lineHeight: 1.6 } as React.CSSProperties}
              onFocus={focusStyle as React.FocusEventHandler<HTMLTextAreaElement>}
              onBlur={e => blurStyle(e as React.FocusEvent<HTMLTextAreaElement>, !!errors.healthConcern)} />
            {errors.healthConcern && <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.healthConcern.message}</p>}
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{ width: '100%', padding: '1rem', color: '#fff', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #00C896, #0EA5A4)', borderRadius: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(0,200,150,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.75 : 1, fontFamily: 'Inter, sans-serif' }}>
            {loading ? (<><Loader2 style={{ width: '1.125rem', height: '1.125rem', animation: 'spin 1s linear infinite' }} />Booking your appointment...</>) : (<><Calendar style={{ width: '1.125rem', height: '1.125rem' }} />Confirm Appointment</>)}
          </motion.button>
        </form>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: '1rem' }}
            onClick={e => { if (e.target === e.currentTarget) setSuccess(false); }}>
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ background: '#fff', borderRadius: '1.5rem', padding: '2.5rem', maxWidth: '28rem', width: '100%', boxShadow: '0 30px 80px rgba(0,0,0,0.2)', textAlign: 'center', position: 'relative' }}>
              <button onClick={() => setSuccess(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
              <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(0,200,150,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle style={{ width: '2.5rem', height: '2.5rem', color: '#00C896' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem' }}>Appointment Booked!</h3>
              <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Your consultation has been successfully scheduled. You'll receive a confirmation email shortly.
              </p>
              <button onClick={() => setSuccess(false)}
                style={{ width: '100%', padding: '0.875rem', color: '#fff', fontWeight: 700, background: 'linear-gradient(135deg,#00C896,#0EA5A4)', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
