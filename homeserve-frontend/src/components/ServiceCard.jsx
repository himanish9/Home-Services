import React from 'react';
import { Link } from 'react-router-dom';

// Helper to map icon identifier string to an appropriate symbol/emoji
const getCategoryEmoji = (icon, name) => {
  const iconMap = {
    sparkles: '✨',
    home: '🏡',
    wrench: '🔧',
    bolt: '⚡',
    cog: '🧺',
    wind: '❄️',
    hammer: '🔨',
    shirt: '👔'
  };

  if (icon && iconMap[icon]) return iconMap[icon];

  const lower = name ? name.toLowerCase() : '';
  if (lower.includes('clean')) return '✨';
  if (lower.includes('plumb')) return '🔧';
  if (lower.includes('electr')) return '⚡';
  if (lower.includes('wash') || lower.includes('laundry')) return '🧺';
  if (lower.includes('ac') || lower.includes('cool')) return '❄️';
  if (lower.includes('carpent')) return '🔨';
  return '🛠️';
};

const ServiceCard = ({ service }) => {
  const emoji = getCategoryEmoji(service.icon, service.name);

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '16px',
        padding: '1.75rem',
        background: '#ffffff',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 32px -4px rgba(15, 23, 42, 0.12)';
        e.currentTarget.style.borderColor = '#93c5fd';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div>
        {/* Category Icon Badge */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.85rem',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.08)'
        }}>
          {emoji}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem', color: 'var(--secondary)' }}>
          {service.name}
        </h3>

        {/* Description */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          {service.description}
        </p>
      </div>

      {/* Pricing & CTA */}
      <div style={{
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Starting at
          </span>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
            ${parseFloat(service.base_price).toFixed(2)}
          </span>
        </div>

        <Link
          to={`/book/${service.id}`}
          className="btn btn-primary btn-sm"
          style={{ padding: '0.6rem 1.1rem', borderRadius: '10px' }}
        >
          Book Now →
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
