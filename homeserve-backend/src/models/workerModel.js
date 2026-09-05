const { pool } = require('../config/db');

/**
 * Data Access Layer for Service Provider / Worker Operations
 */

// Get available pending jobs that match the worker's approved skills/categories
const getAvailableJobsForWorker = async (workerUserId) => {
  const [rows] = await pool.query(
    `SELECT 
      b.id,
      b.booking_code,
      b.category_id,
      sc.name AS category_name,
      sc.icon AS category_icon,
      b.service_date,
      b.service_time,
      b.address,
      b.problem_description,
      b.status,
      b.total_amount,
      b.payment_method,
      b.created_at,
      c.name AS customer_name,
      c.phone AS customer_phone
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    JOIN users c ON b.customer_id = c.id
    JOIN worker_skills ws ON ws.category_id = b.category_id
    JOIN worker_profiles wp ON wp.id = ws.worker_profile_id
    WHERE wp.user_id = ?
      AND wp.is_approved = TRUE
      AND b.status = 'PENDING'
      AND b.worker_id IS NULL
    ORDER BY b.created_at DESC`,
    [workerUserId]
  );

  return rows;
};

// Get jobs assigned to this worker (filtered by status or all)
const getAssignedJobsForWorker = async (workerUserId, statusFilter = null) => {
  let query = `
    SELECT 
      b.*,
      sc.name AS category_name,
      sc.icon AS category_icon,
      c.name AS customer_name,
      c.phone AS customer_phone,
      c.email AS customer_email,
      r.rating AS review_rating,
      r.comment AS review_comment
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    JOIN users c ON b.customer_id = c.id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE b.worker_id = ?
  `;
  const params = [workerUserId];

  if (statusFilter) {
    query += ' AND b.status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY b.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// Accept a job atomically (prevents concurrent race conditions)
const acceptJob = async (bookingId, workerUserId) => {
  const [result] = await pool.query(
    `UPDATE bookings 
     SET worker_id = ?, status = 'ACCEPTED' 
     WHERE id = ? AND status = 'PENDING' AND worker_id IS NULL`,
    [workerUserId, bookingId]
  );

  return result.affectedRows > 0;
};

// Update status of an accepted job (ACCEPTED -> ON_THE_WAY -> IN_PROGRESS -> COMPLETED)
const updateJobStatus = async (bookingId, workerUserId, newStatus) => {
  let query = `UPDATE bookings SET status = ?`;
  const params = [newStatus];

  // If marking as COMPLETED, also mark payment as PAID
  if (newStatus === 'COMPLETED') {
    query += `, payment_status = 'PAID'`;
  }

  query += ` WHERE id = ? AND worker_id = ?`;
  params.push(bookingId, workerUserId);

  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
};

// Get worker dashboard statistics (total jobs, completed jobs, earnings, profile rating)
const getWorkerStats = async (workerUserId) => {
  // 1. Get profile details
  const [profileRows] = await pool.query(
    `SELECT rating, total_reviews, is_available, is_approved 
     FROM worker_profiles 
     WHERE user_id = ? LIMIT 1`,
    [workerUserId]
  );
  const profile = profileRows[0] || {};

  // 2. Aggregate booking statistics
  const [bookingStats] = await pool.query(
    `SELECT 
      COUNT(*) AS total_jobs,
      SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_jobs,
      SUM(CASE WHEN status = 'ON_THE_WAY' THEN 1 ELSE 0 END) AS on_the_way_jobs,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_jobs,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_jobs,
      COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) AS total_earnings
     FROM bookings 
     WHERE worker_id = ?`,
    [workerUserId]
  );

  return {
    profile: {
      rating: parseFloat(profile.rating || 5.0),
      total_reviews: profile.total_reviews || 0,
      is_available: Boolean(profile.is_available),
      is_approved: Boolean(profile.is_approved)
    },
    stats: bookingStats[0]
  };
};

// Update worker profile
const updateWorkerProfile = async (workerUserId, { experience_years, service_area, bio, is_available }) => {
  const fields = [];
  const params = [];

  if (experience_years !== undefined) {
    fields.push('experience_years = ?');
    params.push(parseInt(experience_years, 10));
  }
  if (service_area !== undefined) {
    fields.push('service_area = ?');
    params.push(service_area.trim());
  }
  if (bio !== undefined) {
    fields.push('bio = ?');
    params.push(bio.trim());
  }
  if (is_available !== undefined) {
    fields.push('is_available = ?');
    params.push(Boolean(is_available));
  }

  if (fields.length === 0) return false;

  params.push(workerUserId);
  const [result] = await pool.query(
    `UPDATE worker_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
    params
  );

  return result.affectedRows > 0;
};

module.exports = {
  getAvailableJobsForWorker,
  getAssignedJobsForWorker,
  acceptJob,
  updateJobStatus,
  getWorkerStats,
  updateWorkerProfile
};
