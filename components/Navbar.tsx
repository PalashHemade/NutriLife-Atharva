'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Leaf, Menu, X, ArrowRight } from 'lucide-react';

const links = [
  { name: 'Services', href: '/#services' },
  { name: 'Nutritionists', href: '/#nutritionists' },
  { name: 'Book Appointment', href: '/book' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : '1px solid transparent',
        transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s'
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '5rem' }}>
          
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,200,150,0.3)' }}>
              <Leaf style={{ width: '1.25rem', height: '1.25rem', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>Nutri<span style={{ color: '#00C896' }}>Life</span></span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex" style={{ display: 'none', alignItems: 'center', gap: '2.5rem' }}>
            {links.map((link) => (
              <Link key={link.name} href={link.href} style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00C896'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; }}>
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex" style={{ display: 'none', alignItems: 'center', gap: '1rem' }}>
            <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#00C896', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '9999px', transition: 'background 0.2s', border: '1px solid transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,200,150,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              Diet Consultant Login
            </Link>
            <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', color: '#fff', fontSize: '0.875rem', fontWeight: 600, borderRadius: '9999px', boxShadow: '0 4px 14px rgba(0,200,150,0.3)', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,200,150,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,200,150,0.3)'; }}>
              Get Started <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>

          {/* Mobile Menu Button - forced display override inside its own style block if screen is small */}
          <style>{`
            @media (min-width: 768px) { .mobile-btn { display: none !important; } nav.hidden { display: flex !important; } div.hidden { display: flex !important; } }
          `}</style>
          <button className="mobile-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'flex', padding: '0.5rem', border: 'none', background: 'rgba(241,245,249,0.8)', borderRadius: '0.5rem', cursor: 'pointer', color: '#1E293B' }}>
            {mobileMenu ? <X style={{ width: '1.25rem', height: '1.25rem' }} /> : <Menu style={{ width: '1.25rem', height: '1.25rem' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {links.map((link) => (
                <Link key={link.name} href={link.href} onClick={() => setMobileMenu(false)}
                  style={{ display: 'block', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#1E293B', textDecoration: 'none', borderRadius: '0.5rem', background: '#F8FAFC' }}>
                  {link.name}
                </Link>
              ))}
              <div style={{ height: '1px', background: '#E2E8F0', margin: '0.5rem 0' }} />
              <Link href="/login" onClick={() => setMobileMenu(false)}
                style={{ display: 'block', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#00C896', textDecoration: 'none', textAlign: 'center' }}>
                Diet Consultant Login
              </Link>
              <Link href="/book" onClick={() => setMobileMenu(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', background: 'linear-gradient(135deg,#00C896,#0EA5A4)', color: '#fff', fontSize: '1rem', fontWeight: 600, borderRadius: '0.75rem', textDecoration: 'none' }}>
                Get Started <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
