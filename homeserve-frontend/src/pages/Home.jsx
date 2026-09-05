import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await api.get('/services?active=true');
        if (res.data.success) {
          setServices(res.data.data.services);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
        setError('Unable to load service categories. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services by search query and category filter
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CLEANING') return s.name.toLowerCase().includes('clean') || s.name.toLowerCase().includes('laundry');
    if (selectedFilter === 'REPAIR') return s.name.toLowerCase().includes('repair') || s.name.toLowerCase().includes('carpenter');
    if (selectedFilter === 'UTILITIES') return s.name.toLowerCase().includes('plumb') || s.name.toLowerCase().includes('electr');
    return true;
  });

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 75%)',
        padding: '5rem 0 4rem 0',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: '#dbeafe',
            color: '#1d4ed8',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)'
          }}>
            <span>✨</span> Trusted Home Service Professionals
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: '#0f172a',
            lineHeight: '1.15'
          }}>
            Reliable Home Services, <br />
            <span style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Booked in 60 Seconds
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#475569',
            lineHeight: '1.7',
            marginBottom: '2.5rem',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            From deep cleaning and emergency plumbing to AC maintenance and appliance diagnostics, connect with verified professionals at transparent, upfront rates.
          </p>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            padding: '0.5rem',
            borderRadius: '16px',
            border: '2px solid #cbd5e1',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.1)',
            maxWidth: '620px',
            margin: '0 auto 2rem auto'
          }}>
            <span style={{ fontSize: '1.3rem', paddingLeft: '1rem', paddingRight: '0.5rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search for plumbing, cleaning, AC repair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                padding: '0.6rem 0.5rem',
                fontFamily: 'inherit',
                color: '#0f172a'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  padding: '0 0.75rem'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Value Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.75rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#64748b'
          }}>
            <span>🛡️ 100% Verified Experts</span>
            <span>⚡ Same-Day Availability</span>
            <span>💳 Cash or Card on Service</span>
          </div>
        </div>
      </section>

      {/* 2. SERVICES CATALOG */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Explore Categories
              </span>
              <h2 style={{ fontSize: '2.25rem', marginTop: '0.25rem', color: 'var(--secondary)' }}>
                Our Professional Services
              </h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'All Services', key: 'ALL' },
                { label: 'Cleaning', key: 'CLEANING' },
                { label: 'Plumbing & Electrical', key: 'UTILITIES' },
                { label: 'Repairs & Appliances', key: 'REPAIR' }
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setSelectedFilter(pill.key)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: '1.5px solid',
                    borderColor: selectedFilter === pill.key ? 'var(--primary)' : 'var(--border)',
                    background: selectedFilter === pill.key ? 'var(--primary-light)' : '#ffffff',
                    color: selectedFilter === pill.key ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && <div className="spinner"></div>}

          {error && (
            <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Services Grid */}
          {!loading && !error && (
            <>
              {filteredServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                    No services found
                  </h3>
                  <p>Try searching for another keyword or clear your filter.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '2rem'
                }}>
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" style={{
        background: '#ffffff',
        padding: '5rem 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Simple 3-Step Process
          </span>
          <h2 style={{ fontSize: '2.25rem', marginTop: '0.25rem', marginBottom: '3.5rem', color: 'var(--secondary)' }}>
            How HomeServe Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'left', padding: '2rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '1.25rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Select Service & Time</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Pick from our range of services, enter your home address, choose a convenient date and time slot, and describe the issue.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'left', padding: '2rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '1.25rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Expert Arrives at Doorstep</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                A qualified, background-checked professional accepts the job, travels to your location, and handles the job with care.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'left', padding: '2rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '1.25rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Inspect, Pay & Review</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                Inspect the completed service, pay via cash on delivery or online, and share your rating and review to support great workers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKER CALL TO ACTION */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            boxShadow: '0 20px 40px -8px rgba(15, 23, 42, 0.25)'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Are you a skilled technician?
              </span>
              <h2 style={{ fontSize: '2.25rem', color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
                Grow Your Business with HomeServe
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6' }}>
                Join hundreds of verified professionals receiving real-time booking requests daily. Keep 100% of your tips and build customer trust.
              </p>
            </div>

            <Link to="/register" className="btn btn-primary btn-lg" style={{ background: '#2563eb' }}>
              Register as Service Provider →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
