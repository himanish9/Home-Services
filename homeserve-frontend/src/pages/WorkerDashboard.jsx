import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const WorkerDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('AVAILABLE'); // 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'REVIEWS'
  const [stats, setStats] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [notice, setNotice] = useState(null);

  // Fetch all worker dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, availRes, myJobsRes] = await Promise.all([
        api.get('/worker/stats'),
        api.get('/worker/jobs'),
        api.get('/worker/my-jobs')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (availRes.data.success) setAvailableJobs(availRes.data.data.jobs);
      if (myJobsRes.data.success) setMyJobs(myJobsRes.data.data.jobs);

      // Load reviews if user profile available
      if (user?.id) {
        const revRes = await api.get(`/reviews/worker/${user.id}`);
        if (revRes.data.success) setReviews(revRes.data.data.reviews);
      }
    } catch (err) {
      console.error('Failed to load worker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Accept a job
  const handleAcceptJob = async (jobId) => {
    try {
      setActionLoading(jobId);
      setNotice(null);

      const res = await api.put(`/worker/jobs/${jobId}/accept`);
      if (res.data.success) {
        setNotice({ type: 'success', message: 'Job accepted! Check "My Active Jobs" tab to view details.' });
        loadDashboardData();
        setActiveTab('ACTIVE');
      }
    } catch (err) {
      setNotice({ type: 'danger', message: err.response?.data?.message || 'Failed to accept job' });
    } finally {
      setActionLoading(null);
    }
  };

  // Progress job status
  const handleUpdateStatus = async (jobId, nextStatus) => {
    try {
      setActionLoading(jobId);
      setNotice(null);

      const res = await api.put(`/worker/jobs/${jobId}/status`, { status: nextStatus });
      if (res.data.success) {
        setNotice({ type: 'success', message: `Job updated to: ${nextStatus.replace('_', ' ')}` });
        loadDashboardData();
      }
    } catch (err) {
      setNotice({ type: 'danger', message: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle availability
  const handleToggleAvailability = async () => {
    if (!stats) return;
    const nextAvailability = !stats.profile.is_available;
    try {
      await api.put('/worker/profile', { is_available: nextAvailability });
      loadDashboardData();
    } catch (err) {
      alert('Failed to update availability status');
    }
  };

  const ongoingJobs = myJobs.filter((j) => ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(j.status));
  const completedJobs = myJobs.filter((j) => j.status === 'COMPLETED');

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            <span>🛠️</span> Service Provider Portal
          </div>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--secondary)' }}>
            Welcome, {user?.name || 'Professional'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage available requests matching your skills, active appointments, and earnings.
          </p>
        </div>

        {/* Availability Toggle */}
        {stats && (
          <button
            onClick={handleToggleAvailability}
            className={`btn ${stats.profile.is_available ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              background: stats.profile.is_available ? '#10b981' : '#64748b',
              color: '#ffffff',
              borderColor: 'transparent'
            }}
          >
            {stats.profile.is_available ? '🟢 Online & Available' : '⚪ Offline'}
          </button>
        )}
      </div>

      {notice && (
        <div className={`alert alert-${notice.type}`}>
          {notice.type === 'success' ? '✓' : '⚠️'} {notice.message}
        </div>
      )}

      {/* KPI Stats Grid */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* Total Earnings */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Earnings
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.25rem' }}>
              ${parseFloat(stats.stats.total_earnings || 0).toFixed(2)}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              From {stats.stats.completed_jobs || 0} completed services
            </span>
          </div>

          {/* Active Jobs */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Jobs
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>
              {ongoingJobs.length}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              In progress & scheduled
            </span>
          </div>

          {/* Customer Rating */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Rating & Reviews
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
              ★ {parseFloat(stats.profile.rating || 5.0).toFixed(1)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Based on {stats.profile.total_reviews || 0} reviews
            </span>
          </div>

          {/* Approval Status */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #7c3aed' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Provider Status
            </span>
            <div style={{ marginTop: '0.5rem' }}>
              {stats.profile.is_approved ? (
                <span className="badge badge-completed">Verified Partner</span>
              ) : (
                <span className="badge badge-pending">Pending Approval</span>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
              Background check verified
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { key: 'AVAILABLE', label: `Available Requests (${availableJobs.length})` },
          { key: 'ACTIVE', label: `My Active Jobs (${ongoingJobs.length})` },
          { key: 'COMPLETED', label: `Completed Jobs (${completedJobs.length})` },
          { key: 'REVIEWS', label: `Customer Reviews (${reviews.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.65rem 1.25rem',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
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

      {/* TAB 1: AVAILABLE JOBS */}
      {!loading && activeTab === 'AVAILABLE' && (
        <div>
          {availableJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                No Available Requests Right Now
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                New requests matching your registered skills will appear here automatically in real time.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {availableJobs.map((job) => (
                <div key={job.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {job.booking_code}
                      </span>
                      <span className="badge badge-pending">PENDING</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                      {job.category_name}
                    </h3>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      "{job.problem_description}"
                    </p>

                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                      <div>📅 <strong>Date:</strong> {job.service_date} ({job.service_time})</div>
                      <div style={{ marginTop: '0.35rem' }}>📍 <strong>Address:</strong> {job.address}</div>
                      <div style={{ marginTop: '0.35rem' }}>👤 <strong>Customer:</strong> {job.customer_name}</div>
                    </div>
                  </div>

                  <div style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Fee</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        ${parseFloat(job.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === job.id}
                    >
                      {actionLoading === job.id ? 'Accepting...' : 'Accept Job ✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE JOBS */}
      {!loading && activeTab === 'ACTIVE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {ongoingJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                No Active Jobs Underway
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Check the "Available Requests" tab to accept upcoming service requests.
              </p>
            </div>
          ) : (
            ongoingJobs.map((job) => (
              <div key={job.id} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {job.booking_code}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                      {job.category_name}
                    </span>
                  </div>

                  <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status.replace('_', ' ')}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer & Location</span>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)', marginTop: '0.25rem' }}>{job.customer_name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>📞 {job.customer_phone}</div>
                    <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.5rem' }}>📍 {job.address}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Problem Description</span>
                    <p style={{ fontSize: '0.92rem', color: '#334155', marginTop: '0.25rem', lineHeight: '1.6' }}>
                      "{job.problem_description}"
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Schedule & Earnings</span>
                    <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>📅 {job.service_date} ({job.service_time})</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>
                      ${parseFloat(job.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Status Progression Actions */}
                <div style={{
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Current Status: <strong style={{ color: 'var(--secondary)' }}>{job.status.replace('_', ' ')}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {job.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'ON_THE_WAY')}
                        className="btn btn-primary"
                        disabled={actionLoading === job.id}
                      >
                        🚗 Mark On The Way →
                      </button>
                    )}

                    {job.status === 'ON_THE_WAY' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                        className="btn btn-primary"
                        style={{ background: '#d97706' }}
                        disabled={actionLoading === job.id}
                      >
                        🛠️ Start Work (In Progress) →
                      </button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                        className="btn btn-primary"
                        style={{ background: '#16a34a' }}
                        disabled={actionLoading === job.id}
                      >
                        ✓ Mark Job Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED JOBS */}
      {!loading && activeTab === 'COMPLETED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {completedJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                No Completed Jobs Yet
              </h3>
            </div>
          ) : (
            completedJobs.map((job) => (
              <div key={job.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{job.booking_code}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--secondary)' }}>{job.category_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer: {job.customer_name} • 📅 {job.service_date}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>
                    +${parseFloat(job.total_amount).toFixed(2)}
                  </div>
                  <span className="badge badge-completed">COMPLETED</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: REVIEWS */}
      {!loading && activeTab === 'REVIEWS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reviews.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>
                No Reviews Yet
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Complete bookings with exceptional service to receive customer star ratings and feedback.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                    👤 {rev.customer_name}
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Service: <strong>{rev.service_name}</strong> • {new Date(rev.created_at).toLocaleDateString()}
                </div>
                {rev.comment && (
                  <p style={{ fontSize: '0.95rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.6' }}>
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
