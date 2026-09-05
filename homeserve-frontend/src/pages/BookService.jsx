import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

const BookService = () => {
  const { id } = useParams(); // Optional category ID from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(id || '');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    service_date: '',
    service_time: TIME_SLOTS[0],
    address: '',
    problem_description: '',
    payment_method: 'CASH_ON_DELIVERY'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Minimum booking date is today
  const todayDate = new Date().toISOString().split('T')[0];

  // Load all available service categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/services?active=true');
        if (res.data.success) {
          const list = res.data.data.services;
          setCategories(list);

          // If id is provided in URL, pre-select it; otherwise default to first
          if (id) {
            const found = list.find((c) => c.id === parseInt(id, 10));
            if (found) {
              setSelectedCategoryId(found.id);
              setSelectedCategory(found);
            }
          } else if (list.length > 0) {
            setSelectedCategoryId(list[0].id);
            setSelectedCategory(list[0]);
          }
        }
      } catch (err) {
        setError('Failed to load services. Please check server connection.');
      }
    };

    fetchCategories();
  }, [id]);

  // Update selected category details when dropdown changes
  const handleCategoryChange = (e) => {
    const catId = parseInt(e.target.value, 10);
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    setSelectedCategory(cat || null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      setError('Please select a service category');
      return;
    }

    if (!formData.service_date) {
      setError('Please select a preferred service date');
      return;
    }

    if (formData.address.trim().length < 10) {
      setError('Please provide a complete address (at least 10 characters)');
      return;
    }

    if (formData.problem_description.trim().length < 10) {
      setError('Please provide a brief problem description (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        category_id: selectedCategoryId,
        service_date: formData.service_date,
        service_time: formData.service_time,
        address: formData.address,
        problem_description: formData.problem_description,
        payment_method: formData.payment_method
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setConfirmedBooking(res.data.data.booking);
      } else {
        setError(res.data.message || 'Booking creation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION MODAL / VIEW
  if (confirmedBooking) {
    return (
      <div className="container" style={{ padding: '4.5rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '620px', width: '100%', padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
          }}>
            ✓
          </div>

          <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.75rem' }}>
            Your service request has been registered and dispatched to certified technicians.
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Booking Code:</span>
              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{confirmedBooking.booking_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Service:</span>
              <span style={{ fontWeight: 600 }}>{confirmedBooking.category_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Scheduled Date & Time:</span>
              <span style={{ fontWeight: 600 }}>{confirmedBooking.service_date} ({confirmedBooking.service_time})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Base Fee:</span>
              <span style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.1rem' }}>${parseFloat(confirmedBooking.total_amount).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initial Status:</span>
              <span className="badge badge-pending">PENDING</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/customer/bookings" className="btn btn-primary btn-lg">
              Track My Bookings →
            </Link>
            <Link to="/" className="btn btn-secondary btn-lg">
              Book Another Service
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
          Schedule a Home Service
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
          Fill in your location and preferred appointment time. A verified technician will be assigned.
        </p>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Form Fields */}
          <div className="card" style={{ padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              1. Service & Appointment
            </h3>

            {/* Service Category Selector */}
            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select
                className="form-control"
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (from ${parseFloat(c.base_price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  name="service_date"
                  min={todayDate}
                  className="form-control"
                  value={formData.service_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time Slot</label>
                <select
                  name="service_time"
                  className="form-control"
                  value={formData.service_time}
                  onChange={handleChange}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', margin: '1.5rem 0 1rem 0', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              2. Address & Problem Details
            </h3>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Complete Home Address</label>
              <textarea
                name="address"
                rows="3"
                className="form-control"
                placeholder="House / Flat No., Building Name, Street, Landmark, City & Pin Code"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            {/* Problem Description */}
            <div className="form-group">
              <label className="form-label">Problem Description & Notes</label>
              <textarea
                name="problem_description"
                rows="3"
                className="form-control"
                placeholder="Please describe the issue in detail (e.g., sink leaking under basin, AC not cooling properly...)"
                value={formData.problem_description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Payment Method */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.35rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="CASH_ON_DELIVERY"
                    checked={formData.payment_method === 'CASH_ON_DELIVERY'}
                    onChange={handleChange}
                  />
                  💵 Cash on Service
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="ONLINE"
                    checked={formData.payment_method === 'ONLINE'}
                    onChange={handleChange}
                  />
                  💳 Online Payment
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="card" style={{ padding: '2.25rem', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Booking Summary
            </h3>

            {selectedCategory ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Selected Service:</span>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{selectedCategory.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Inspection & Labor Base:</span>
                  <span style={{ fontWeight: 600 }}>${parseFloat(selectedCategory.base_price).toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Taxes & Platform Fee:</span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>FREE ($0.00)</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  borderTop: '2px dashed var(--border)',
                  marginBottom: '1.75rem'
                }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary)' }}>Total Payable:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ${parseFloat(selectedCategory.base_price).toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginBottom: '1.25rem' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm & Request Professional →'}
                </button>

                <div style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: '1.5', textAlign: 'center' }}>
                  🔒 No upfront payment required for Cash on Delivery. Pay only after service completion and satisfaction.
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                Please select a service category
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookService;
