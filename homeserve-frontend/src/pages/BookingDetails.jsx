import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusTracker from '../components/StatusTracker';
import ReviewModal from '../components/ReviewModal';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          {error || 'Booking not found'}
        </div>
        <Link to="/customer/bookings" className="btn btn-secondary">
          ← Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      <Link to="/customer/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        ← Back to All My Bookings
      </Link>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Booking Reference
            </span>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
              {booking.booking_code}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Service Category</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary)' }}>
              {booking.category_name}
            </div>
          </div>
        </div>

        {/* Real-time Status Progression Tracker */}
        <StatusTracker status={booking.status} />
      </div>

      {/* Main Two-Column Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Service & Location Details */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Service Details
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Appointment Schedule
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--secondary)', marginTop: '0.25rem' }}>
              📅 {booking.service_date} ({booking.service_time})
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Service Location
            </span>
            <div style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginTop: '0.25rem', lineHeight: '1.6' }}>
              📍 {booking.address}
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Problem Description
            </span>
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.925rem',
              color: '#334155',
              marginTop: '0.35rem',
              lineHeight: '1.6'
            }}>
              "{booking.problem_description}"
            </div>
          </div>

          {/* Assigned Technician Card */}
          <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Assigned Service Provider
          </h3>

          {booking.worker_name ? (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#16a34a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🧑‍🔧
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#166534' }}>
                  {booking.worker_name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                  📞 {booking.worker_phone}
                </div>
                {booking.worker_rating && (
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706', marginTop: '0.2rem' }}>
                    ★ {parseFloat(booking.worker_rating).toFixed(1)} Rating ({booking.worker_experience} yrs experience)
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem', color: '#92400e', fontSize: '0.9rem' }}>
              ⏳ Dispatching nearest verified technician to accept your request.
            </div>
          )}
        </div>

        {/* Right Column: Payment & Review Action */}
        <div className="card" style={{ padding: '2rem', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            Payment Summary
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Base Visiting & Diagnostic Fee:</span>
            <span style={{ fontWeight: 600 }}>${parseFloat(booking.total_amount).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
            <span style={{ fontWeight: 600 }}>{booking.payment_method.replace(/_/g, ' ')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
            <span className={`badge ${booking.payment_status === 'PAID' ? 'badge-completed' : 'badge-pending'}`}>
              {booking.payment_status}
            </span>
          </div>

          <div style={{
            paddingTop: '1rem',
            borderTop: '2px dashed #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem'
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total:</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${parseFloat(booking.total_amount).toFixed(2)}
            </span>
          </div>

          {/* Rating Section if Completed */}
          {booking.status === 'COMPLETED' && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #cbd5e1' }}>
              {booking.review_rating ? (
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Your Submitted Review
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '1.35rem', margin: '0.4rem 0' }}>
                    {'★'.repeat(booking.review_rating)}
                    {'☆'.repeat(5 - booking.review_rating)}
                  </div>
                  {booking.review_comment && (
                    <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic' }}>
                      "{booking.review_comment}"
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', background: '#f59e0b' }}
                >
                  ★ Leave Review & Rating
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          booking={booking}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            fetchDetails();
          }}
        />
      )}
    </div>
  );
};

export default BookingDetails;
