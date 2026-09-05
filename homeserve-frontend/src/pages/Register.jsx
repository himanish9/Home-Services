import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const [role, setRole] = useState('CUSTOMER');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    experience_years: '2',
    service_area: '',
    bio: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Load available service categories for worker skill selection
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/services?active=true');
        if (res.data.success) {
          setCategories(res.data.data.services);
        }
      } catch (err) {
        console.error('Failed to load categories for registration:', err);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (role === 'SERVICE_PROVIDER' && selectedCategories.length === 0) {
      setError('Please select at least one service category skill');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        ...(role === 'SERVICE_PROVIDER' && {
          experience_years: parseInt(formData.experience_years, 10),
          service_area: formData.service_area || 'Metropolitan Area',
          bio: formData.bio,
          category_ids: selectedCategories
        })
      };

      const result = await register(payload);

      if (result.success) {
        if (role === 'SERVICE_PROVIDER') {
          navigate('/worker/dashboard');
        } else {
          navigate('/customer/bookings');
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--secondary)', marginBottom: '0.4rem' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Join HomeServe as a customer or service provider
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          padding: '0.35rem',
          borderRadius: '12px',
          marginBottom: '1.75rem'
        }}>
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: role === 'CUSTOMER' ? '#ffffff' : 'transparent',
              color: role === 'CUSTOMER' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'CUSTOMER' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            👤 Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('SERVICE_PROVIDER')}
            style={{
              padding: '0.65rem 1rem',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: role === 'SERVICE_PROVIDER' ? '#ffffff' : 'transparent',
              color: role === 'SERVICE_PROVIDER' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'SERVICE_PROVIDER' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🛠️ Service Provider
          </button>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+1-555-0123"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Extra fields for SERVICE_PROVIDER */}
          {role === 'SERVICE_PROVIDER' && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginTop: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
                Professional Credentials
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    min="0"
                    max="50"
                    className="form-control"
                    value={formData.experience_years}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Area</label>
                  <input
                    type="text"
                    name="service_area"
                    className="form-control"
                    placeholder="e.g. Downtown Metro, South Suburbs"
                    value={formData.service_area}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio / Specialty</label>
                <textarea
                  name="bio"
                  rows="2"
                  className="form-control"
                  placeholder="Briefly describe your skill background and certifications..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Select Your Skill Categories (You'll receive job requests for these)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.6rem',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  padding: '0.5rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px'
                }}>
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'CUSTOMER' ? 'Customer' : 'Service Provider'} →`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
