import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Role-based redirection
        if (result.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (result.user.role === 'SERVICE_PROVIDER') {
          navigate('/worker/dashboard');
        } else {
          navigate('/customer/bookings');
        }
      } else {
        setError(result.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Selector (for interviews & fast testing)
  const setDemoAccount = (role) => {
    if (role === 'CUSTOMER') {
      setFormData({ email: 'customer@homeserve.com', password: 'Password123!' });
    } else if (role === 'WORKER') {
      setFormData({ email: 'worker@homeserve.com', password: 'Password123!' });
    } else if (role === 'ADMIN') {
      setFormData({ email: 'admin@homeserve.com', password: 'Password123!' });
    }
    setError(null);
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Sign in to access your HomeServe account
          </p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.75rem'
        }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ⚡ Instant Demo Login:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setDemoAccount('CUSTOMER')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('WORKER')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
            >
              Worker
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('ADMIN')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem' }}
            >
              Admin
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
