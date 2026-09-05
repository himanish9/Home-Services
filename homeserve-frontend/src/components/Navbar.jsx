import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--header-height)'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
          }}>
            HS
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
              Home<span style={{ color: 'var(--primary)' }}>Serve</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              On-Demand Services
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ fontWeight: 500, color: 'var(--text-main)' }}>
            Services
          </Link>
          <a href="#how-it-works" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
            How It Works
          </a>

          {/* Conditional Role-Based Navigation */}
          {isAuthenticated && user && (
            <>
              {user.role === 'CUSTOMER' && (
                <Link to="/customer/bookings" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  My Bookings
                </Link>
              )}
              {user.role === 'SERVICE_PROVIDER' && (
                <Link to="/worker/dashboard" style={{ fontWeight: 600, color: '#059669' }}>
                  Worker Dashboard
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" style={{ fontWeight: 600, color: '#7c3aed' }}>
                  Admin Portal
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Auth CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {user.role.replace('_', ' ')}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 0.85rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
