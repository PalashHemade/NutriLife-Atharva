import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';
import { Calendar } from 'lucide-react';

export default function BookPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: 'rgba(0,200,150,0.1)', color: '#00C896', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Calendar style={{ width: '1rem', height: '1rem' }} />
              Book Appointment
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem', lineHeight: 1.15 }}>
              Schedule Your{' '}
              <span style={{ background: 'linear-gradient(135deg,#00C896,#0EA5A4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Consultation</span>
            </h1>
            <p style={{ color: '#64748B', fontSize: '1.0625rem', maxWidth: '36rem', margin: '0 auto', lineHeight: 1.6 }}>
              Choose your preferred nutritionist and book a personalized consultation session at your convenience.
            </p>
          </div>

          <BookingForm />
        </div>
      </div>
      <Footer />
    </main>
  );
}
