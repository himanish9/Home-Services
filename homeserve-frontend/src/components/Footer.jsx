import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: '#0f172a',
      color: '#94a3b8',
      padding: '4.5rem 0 2.5rem 0',
      borderTop: '1px solid #1e293b'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}>
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800
              }}>
                HS
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Home<span style={{ color: '#38bdf8' }}>Serve</span>
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '1.5rem', color: '#94a3b8' }}>
              Your trusted on-demand platform for professional home cleaning, plumbing, electrical, and appliance repair services.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <span>✓ Verified Experts</span> • <span>✓ Transparent Pricing</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Popular Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Bathroom Cleaning</Link></li>
              <li><Link to="/" style={{ color: '#94a3b8' }}>House Cleaning</Link></li>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Plumbing Solutions</Link></li>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Electrical Repairs</Link></li>
              <li><Link to="/" style={{ color: '#94a3b8' }}>AC & Appliance Servicing</Link></li>
            </ul>
          </div>

          {/* Col 3: For Professionals */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>For Service Providers</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li><Link to="/register" style={{ color: '#94a3b8' }}>Join as Professional</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Worker Portal Login</Link></li>
              <li><a href="#how-it-works" style={{ color: '#94a3b8' }}>How Workers Earn</a></li>
              <li><span style={{ color: '#64748b' }}>Zero Onboarding Fees</span></li>
            </ul>
          </div>

          {/* Col 4: Platform Guarantee */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.25rem' }}>Trust & Safety</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Every service booked on HomeServe includes our 100% satisfaction guarantee with dedicated customer care.
            </p>
            <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>24/7 Support Hotline</div>
              <div style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600 }}>support@homeserve.com</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div>
            © {new Date().getFullYear()} HomeServe Platform Inc. All rights reserved. Final Year CSE Project.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
