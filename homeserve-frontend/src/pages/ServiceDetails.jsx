import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        if (res.data.success) {
          setService(res.data.data.service);
        }
      } catch (err) {
        setError('Service not found or unable to load details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          {error || 'Service not found'}
        </div>
        <Link to="/" className="btn btn-secondary">
          ← Back to All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        ← Back to All Services
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Details */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            HomeServe Verified Category
          </div>

          <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
            {service.name}
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
            {service.description}
          </p>

          <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
            What is Included in Every Booking
          </h3>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.975rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> Background-verified, certified master technician
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.975rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> Complete on-site inspection and problem diagnosis
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.975rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> Genuine replacement tools and industry-standard materials
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.975rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> Post-service area cleanup and quality inspection
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.975rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> 30-day HomeServe service warranty protection
            </li>
          </ul>
        </div>

        {/* Right Column: Pricing & Booking Action */}
        <div className="card" style={{ padding: '2.5rem', background: '#f8fafc', border: '2px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Standard Base Fee
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0 1.5rem 0' }}>
            ${parseFloat(service.base_price).toFixed(2)}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            Standard visiting and labor charges. Final material costs (if replacement parts are needed) will be quoted upfront before work begins.
          </p>

          <Link
            to={`/book/${service.id}`}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
          >
            Schedule & Book Now →
          </Link>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            🔒 Free cancellation up to arrival
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
