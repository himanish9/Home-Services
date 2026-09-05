import React, { useState } from 'react';
import api from '../services/api';

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await api.post('/reviews', {
        booking_id: booking.id,
        rating,
        comment
      });

      if (res.data.success) {
        onSuccess(res.data.data.review);
      } else {
        setError(res.data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#94a3b8'
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
          Rate Your Experience
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.75rem' }}>
          How was the service provided for <strong style={{ color: 'var(--secondary)' }}>{booking.category_name}</strong>?
        </p>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Star Picker */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', fontSize: '2.25rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    color: (hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1',
                    transition: 'color 0.15s ease'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.5rem' }}>
              {rating === 5 && 'Outstanding Experience!'}
              {rating === 4 && 'Very Good Service'}
              {rating === 3 && 'Average Service'}
              {rating === 2 && 'Below Expectations'}
              {rating === 1 && 'Unsatisfactory'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Comment (Optional)</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="Share details about the technician's punctuality, professionalism, and service quality..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review ★'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
