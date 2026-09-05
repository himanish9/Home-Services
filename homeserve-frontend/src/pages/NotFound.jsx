import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/';
    if (user.role === 'SERVICE_PROVIDER') return '/worker/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/customer/bookings';
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 180px)', padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '580px', width: '100%', textAlign: 'center', padding: '3.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{
          width: '88px',
          height: '88px',
          margin: '0 auto 1.5rem',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 800
        }}>
          404
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
          Page Not Found
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          We could not find the page you are looking for. It may have been moved, renamed, or does not exist on the HomeServe platform.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-secondary">
            ← Back to Home
          </Link>
          <Link to={getDashboardLink()} className="btn btn-primary">
            {isAuthenticated ? 'Go to Dashboard' : 'Explore Services'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
