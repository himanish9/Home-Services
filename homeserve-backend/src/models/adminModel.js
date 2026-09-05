const { pool } = require('../config/db');

/**
 * Data Access Layer for Admin Management and Analytics
 */

// Get comprehensive system KPIs and dashboard statistics
const getDashboardMetrics = async () => {
  // 1. User counts
  const [userCounts] = await pool.query(`
    SELECT 
      COUNT(*) AS total_users,
      SUM(CASE WHEN role = 'CUSTOMER' THEN 1 ELSE 0 END) AS total_customers,
      SUM(CASE WHEN role = 'SERVICE_PROVIDER' THEN 1 ELSE 0 END) AS total_workers
    FROM users
  `);

  // 2. Pending worker approvals
  const [pendingApprovals] = await pool.query(`
    SELECT COUNT(*) AS pending_worker_approvals 
    FROM worker_profiles 
    WHERE is_approved = FALSE
  `);

  // 3. Booking metrics & platform revenue
  const [bookingMetrics] = await pool.query(`
    SELECT 
      COUNT(*) AS total_bookings,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_bookings,
      SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_bookings,
      SUM(CASE WHEN status = 'ON_THE_WAY' THEN 1 ELSE 0 END) AS on_the_way_bookings,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_bookings,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_bookings,
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_bookings,
      COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) AS total_revenue
    FROM bookings
  `);

  // 4. Categories count
  const [catCount] = await pool.query(`SELECT COUNT(*) AS total_categories FROM service_categories`);

  // 5. Recent 5 bookings
  const [recentBookings] = await pool.query(`
    SELECT 
      b.id, b.booking_code, b.service_date, b.status, b.total_amount, b.created_at,
      sc.name AS category_name,
      c.name AS customer_name,
      w.name AS worker_name
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    JOIN users c ON b.customer_id = c.id
    LEFT JOIN users w ON b.worker_id = w.id
    ORDER BY b.created_at DESC
    LIMIT 5
  `);

  return {
    users: userCounts[0],
    pending_worker_approvals: pendingApprovals[0].pending_worker_approvals,
    bookings: bookingMetrics[0],
    total_categories: catCount[0].total_categories,
    recent_bookings: recentBookings
  };
};

// Get all users with optional role and search filters
const getAllUsers = async ({ role, search }) => {
  let query = `
    SELECT id, name, email, phone, role, status, created_at, updated_at 
    FROM users 
    WHERE 1=1
  `;
  const params = [];

  if (role) {
    query += ' AND role = ?';
    params.push(role.toUpperCase());
  }

  if (search && search.trim() !== '') {
    query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// Update user active status (ACTIVE / SUSPENDED)
const updateUserStatus = async (userId, status) => {
  const [result] = await pool.query(
    'UPDATE users SET status = ? WHERE id = ?',
    [status, userId]
  );
  return result.affectedRows > 0;
};

// Get all service providers with their worker profiles and skills
const getAllWorkers = async () => {
  const [rows] = await pool.query(`
    SELECT 
      wp.id AS worker_profile_id,
      wp.experience_years,
      wp.service_area,
      wp.bio,
      wp.rating,
      wp.total_reviews,
      wp.is_available,
      wp.is_approved,
      wp.created_at AS registered_at,
      u.id AS user_id,
      u.name,
      u.email,
      u.phone,
      u.status AS user_status,
      GROUP_CONCAT(sc.name SEPARATOR ', ') AS skills
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    LEFT JOIN worker_skills ws ON ws.worker_profile_id = wp.id
    LEFT JOIN service_categories sc ON ws.category_id = sc.id
    GROUP BY wp.id, u.id
    ORDER BY wp.created_at DESC
  `);
  return rows;
};

// Approve or reject worker profile
const updateWorkerApproval = async (workerProfileId, isApproved) => {
  const [result] = await pool.query(
    'UPDATE worker_profiles SET is_approved = ? WHERE id = ?',
    [isApproved, workerProfileId]
  );
  return result.affectedRows > 0;
};

// Get all platform bookings with comprehensive details
const getAllBookings = async ({ status, search } = {}) => {
  let query = `
    SELECT 
      b.*,
      sc.name AS category_name,
      sc.icon AS category_icon,
      c.name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      w.name AS worker_name,
      w.email AS worker_email,
      w.phone AS worker_phone,
      r.rating AS review_rating
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    JOIN users c ON b.customer_id = c.id
    LEFT JOIN users w ON b.worker_id = w.id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += ' AND b.status = ?';
    params.push(status);
  }

  if (search && search.trim() !== '') {
    query += ' AND (b.booking_code LIKE ? OR c.name LIKE ? OR sc.name LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY b.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// Update booking status by admin
const updateBookingStatusByAdmin = async (bookingId, status) => {
  let query = `UPDATE bookings SET status = ?`;
  const params = [status];

  if (status === 'COMPLETED') {
    query += `, payment_status = 'PAID'`;
  }

  query += ` WHERE id = ?`;
  params.push(bookingId);

  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
};

// Get all platform reviews
const getAllReviews = async () => {
  const [rows] = await pool.query(`
    SELECT 
      r.*,
      b.booking_code,
      sc.name AS service_name,
      c.name AS customer_name,
      w.name AS worker_name
    FROM reviews r
    JOIN bookings b ON r.booking_id = b.id
    JOIN service_categories sc ON b.category_id = sc.id
    JOIN users c ON r.customer_id = c.id
    JOIN users w ON r.worker_id = w.id
    ORDER BY r.created_at DESC
  `);
  return rows;
};

module.exports = {
  getDashboardMetrics,
  getAllUsers,
  updateUserStatus,
  getAllWorkers,
  updateWorkerApproval,
  getAllBookings,
  updateBookingStatusByAdmin,
  getAllReviews
};
