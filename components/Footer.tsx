'use client';

import Link from 'next/link';
import { Leaf, Twitter, Instagram, Linkedin, Youtube, Send } from 'lucide-react';

const footerLinks = {
  Product: ['AI Diet Planner', 'Health Tracking', 'Meal Plans', 'Appointments'],
  Company: ['About Us', 'Blog', 'Careers', 'Press'],
  Support: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'],
};

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#CBD5E1', borderTop: '1px solid #1E293B' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '5rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          
          {/* Brand */}
          <div style={{ gridColumn: '1 / -1', maxWidth: '400px' }} className="lg:col-span-2; lg:pr-8">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', textDecoration: 'none' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf style={{ width: '1rem', height: '1rem', color: '#fff' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Nutri<span style={{ color: '#00C896' }}>Life</span></span>
            </Link>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: '#94A3B8', marginBottom: '1.5rem' }}>
              India's leading AI-powered nutrition platform. Personalized diet plans + expert consultations for a healthier you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#CBD5E1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send style={{ width: '1rem', height: '1rem', color: '#00C896' }} />
                <span>hello@nutrilife.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00C896', fontSize: '1.2rem', lineHeight: 0.8 }}>📞</span>
                <span>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#00C896', fontSize: '1.2rem', lineHeight: 0.8 }}>📍</span>
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>{title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {links.map(link => (
                  <li key={link}>
                    <Link href="#" style={{ color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00C896'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>Stay Updated</h4>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.6 }}>
              Get weekly nutrition tips and health insights right to your inbox.
            </p>
            <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="email" placeholder="your@email.com" required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: '#1E293B', border: '1px solid #334155', color: '#fff', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#00C896'}
                onBlur={e => e.target.style.borderColor = '#334155'} />
              <button type="submit"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ paddingTop: '2rem', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }} className="md:flex-row">
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, textAlign: 'center' }}>
            © {new Date().getFullYear()} NutriLife India Pvt. Ltd. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', transition: 'color 0.2s, background 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = '#00C896'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.background = '#1E293B'; }}>
                <Icon style={{ width: '1rem', height: '1rem' }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
