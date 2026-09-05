import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'SERVICES' | 'BOOKINGS' | 'WORKERS' | 'USERS' | 'REVIEWS'

  const [dashboardData, setDashboardData] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // New/Edit Service Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: 'wrench',
    base_price: ''
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [modalError, setModalError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, servRes, bookRes, workRes, userRes, revRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/services'),
        api.get('/admin/bookings'),
        api.get('/admin/workers'),
        api.get('/admin/users'),
        api.get('/admin/reviews')
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data.data);
      if (servRes.data.success) setServices(servRes.data.data.services);
      if (bookRes.data.success) setBookings(bookRes.data.data.bookings);
      if (workRes.data.success) setWorkers(workRes.data.data.workers);
      if (userRes.data.success) setUsers(userRes.data.data.users);
      if (revRes.data.success) setReviews(revRes.data.data.reviews);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setNotice({ type: 'danger', message: 'Failed to load platform data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Worker approval toggle
  const handleToggleWorkerApproval = async (workerProfileId, currentApproval) => {
    try {
      const res = await api.put(`/admin/workers/${workerProfileId}/approve`, {
        is_approved: !currentApproval
      });
      if (res.data.success) {
        setNotice({ type: 'success', message: res.data.message });
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'danger', message: err.response?.data?.message || 'Error updating approval' });
    }
  };

  // User status toggle (ACTIVE / SUSPENDED)
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.data.success) {
        setNotice({ type: 'success', message: `User status changed to ${nextStatus}` });
        loadData();
      }
    } catch (err) {
      setNotice({ type: 'danger', message: err.response?.data?.message || 'Error updating user status' });
    }
  };

  // Create or update service category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      if (editingCategoryId) {
        await api.put(`/services/${editingCategoryId}`, categoryFormData);
        setNotice({ type: 'success', message: 'Service category updated successfully' });
      } else {
        await api.post('/services', categoryFormData);
        setNotice({ type: 'success', message: 'New service category created successfully' });
      }
      setShowCategoryModal(false);
      setEditingCategoryId(null);
      setModalError(null);
      setCategoryFormData({ name: '', description: '', icon: 'wrench', base_price: '' });
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.errors?.map((e) => e.message).join(', ') || 'Error saving category';
      setModalError(errMsg);
    }
  };

  // Delete service category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this category?')) return;
    try {
      const res = await api.delete(`/services/${categoryId}`);
      setNotice({ type: 'success', message: res.data.message });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting category');
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

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          <span>⚙️</span> Administration Center
        </div>
        <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)' }}>Platform Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Monitor system metrics, manage bookings, review service provider credentials, and configure services.
        </p>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? '✓' : '⚠️'} {notice.message}
        </div>
      )}

      {/* KPI Stats Bar */}
      {dashboardData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Platform Revenue
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
              ${parseFloat(dashboardData.bookings.total_revenue || 0).toFixed(2)}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Bookings
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>
              {dashboardData.bookings.total_bookings}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Customers
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.25rem' }}>
              {dashboardData.users.total_customers}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Service Providers
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.25rem' }}>
              {dashboardData.users.total_workers}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pending Approvals
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
              {dashboardData.pending_worker_approvals}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'OVERVIEW', label: 'Overview' },
          { key: 'SERVICES', label: `Service Categories (${services.length})` },
          { key: 'BOOKINGS', label: `All Bookings (${bookings.length})` },
          { key: 'WORKERS', label: `Service Providers (${workers.length})` },
          { key: 'USERS', label: `User Accounts (${users.length})` },
          { key: 'REVIEWS', label: `Reviews (${reviews.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.65rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '0.925rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="spinner"></div>}

      {/* TAB 1: OVERVIEW */}
      {!loading && activeTab === 'OVERVIEW' && dashboardData && (
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '1.25rem' }}>
            Recent Bookings
          </h3>
          <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Service</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Provider</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recent_bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{b.booking_code}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{b.category_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{b.customer_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{b.worker_name || 'Unassigned'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{b.service_date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{getStatusBadge(b.status)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                      ${parseFloat(b.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE CATEGORIES */}
      {!loading && activeTab === 'SERVICES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>Active Service Categories</h3>
            <button
              onClick={() => {
                setEditingCategoryId(null);
                setCategoryFormData({ name: '', description: '', icon: 'wrench', base_price: '' });
                setShowCategoryModal(true);
              }}
              className="btn btn-primary btn-sm"
            >
              + Add New Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {services.map((s) => (
              <div key={s.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)' }}>{s.name}</h4>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>${parseFloat(s.base_price).toFixed(2)}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {s.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setEditingCategoryId(s.id);
                      setCategoryFormData({
                        name: s.name,
                        description: s.description,
                        icon: s.icon || 'wrench',
                        base_price: s.base_price
                      });
                      setShowCategoryModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(s.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ALL BOOKINGS */}
      {!loading && activeTab === 'BOOKINGS' && (
        <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Booking Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Service</th>
                <th style={{ padding: '0.75rem 1rem' }}>Customer Details</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assigned Provider</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date/Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{b.booking_code}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{b.category_name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div>{b.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_phone}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {b.worker_name ? (
                      <div>{b.worker_name}</div>
                    ) : (
                      <span style={{ color: '#d97706', fontSize: '0.8rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.service_date} ({b.service_time})</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{getStatusBadge(b.status)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>${parseFloat(b.total_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: SERVICE PROVIDERS */}
      {!loading && activeTab === 'WORKERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {workers.map((w) => (
            <div key={w.worker_profile_id} className="card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--secondary)' }}>{w.name}</h4>
                  {w.is_approved ? (
                    <span className="badge badge-completed">Approved</span>
                  ) : (
                    <span className="badge badge-pending">Pending Approval</span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  📧 {w.email} • 📞 {w.phone} • 📍 {w.service_area}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                  <strong>Skills:</strong> {w.skills || 'None specified'} • <strong>Experience:</strong> {w.experience_years} years
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleToggleWorkerApproval(w.worker_profile_id, w.is_approved)}
                  className={`btn ${w.is_approved ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                >
                  {w.is_approved ? 'Revoke Approval' : 'Approve Application ✓'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: USERS */}
      {!loading && activeTab === 'USERS' && (
        <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.phone}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: u.role === 'ADMIN' ? '#7c3aed' : u.role === 'SERVICE_PROVIDER' ? '#059669' : '#2563eb' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-completed' : 'badge-cancelled'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: u.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)' }}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: REVIEWS */}
      {!loading && activeTab === 'REVIEWS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              No reviews in the system yet.
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{r.customer_name}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>reviewed</span>
                    <strong style={{ color: '#059669' }}>{r.worker_name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({r.service_name})</span>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '1.1rem' }}>
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                {r.comment && (
                  <p style={{ marginTop: '0.5rem', color: '#475569', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Category Modal (Create / Edit) */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
              {editingCategoryId ? 'Edit Service Category' : 'Create Service Category'}
            </h3>

            {modalError && (
              <div className="alert alert-danger" style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                <span>⚠️</span> {modalError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Pest Control"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Detailed description of the service scope..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className="form-control"
                    placeholder="49.00"
                    value={categoryFormData.base_price}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, base_price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Icon Slug</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="sparkles, wrench..."
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCategoryId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
