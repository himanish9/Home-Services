import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ReviewModal from '../components/ReviewModal';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);

  // Modals state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/bookings');
      if (res.data.success) {
        setBookings(res.data.data.bookings);
      }
    } catch (err) {
      setError('Unable to retrieve your bookings. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      setCancelLoading(true);
      const res = await api.put(`/bookings/${cancellingBookingId}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      if (res.data.success) {
        setCancellingBookingId(null);
        setCancelReason('');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'badge-pending',
      ACCEPTED: 'badge-accepted',
      ON_THE_WAY: 'badge-on_the_way',
      IN_PROGRESS: 'badge-in_progress',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled'
    };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status.replace('_', ' ')}</span>;
  };

  // Filter bookings based on selected tab
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(b.status);
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)' }}>My Service Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Track the status of your ongoing home services, view history, and leave reviews.
          </p>
        </div>

        <Link to="/" className="btn btn-primary">
          + Book New Service
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { key: 'ALL', label: 'All Bookings' },
          { key: 'ACTIVE', label: 'Ongoing / Active' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              color: filter === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: filter === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="spinner"></div>}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {/* Bookings List */}
      {!loading && !error && (
        <>
          {filteredBookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                No bookings found
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                You haven't placed any bookings in this category yet.
              </p>
              <Link to="/" className="btn btn-primary">
                Browse Available Services
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}
                >
                  {/* Top Bar: Code, Date & Badge */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {b.booking_code}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginLeft: '0.75rem' }}>
                        Booked on {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div>{getStatusBadge(b.status)}</div>
                  </div>

                  {/* Main Info Columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'center'
                  }}>
                    {/* Service & Problem */}
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.25rem' }}>
                        {b.category_name}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        "{b.problem_description}"
                      </p>
                    </div>

                    {/* Schedule */}
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Appointment Time
                      </span>
                      <div style={{ fontWeight: 600, color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        📅 {b.service_date}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        ⏰ {b.service_time}
                      </div>
                    </div>

                    {/* Assigned Technician */}
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Assigned Professional
                      </span>
                      {b.worker_name ? (
                        <div style={{ marginTop: '0.25rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>🧑‍🔧 {b.worker_name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 {b.worker_phone}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: 600, marginTop: '0.25rem' }}>
                          ⏳ Assigning verified worker...
                        </div>
                      )}
                    </div>

                    {/* Price & Actions */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        ${parseFloat(b.total_amount).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: b.payment_status === 'PAID' ? 'var(--success)' : '#d97706' }}>
                        {b.payment_status === 'PAID' ? '✓ PAID' : 'PAYMENT PENDING'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)'
                  }}>
                    {/* View Details Link */}
                    <Link to={`/customer/bookings/${b.id}`} className="btn btn-secondary btn-sm">
                      View Progress & Details →
                    </Link>

                    {/* Cancel Button */}
                    {['PENDING', 'ACCEPTED'].includes(b.status) && (
                      <button
                        onClick={() => setCancellingBookingId(b.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* Review Button */}
                    {b.status === 'COMPLETED' && !b.review_rating && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="btn btn-primary btn-sm"
                        style={{ background: '#f59e0b' }}
                      >
                        ★ Rate & Review
                      </button>
                    )}

                    {b.review_rating && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontWeight: 700, fontSize: '0.9rem' }}>
                        ★ {b.review_rating}.0 Rated
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBookingId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              Cancel Service Request
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel this booking? Please provide a brief reason.
            </p>

            <form onSubmit={handleCancel}>
              <div className="form-group">
                <label className="form-label">Reason for cancellation</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Issue resolved, schedule conflict..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setCancellingBookingId(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
