const { pool } = require('../config/db');

/**
 * Data Access Layer for Bookings
 */

// Generate a unique booking reference code (e.g. HS-2026-98124)
const generateBookingCode = () => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `HS-${new Date().getFullYear()}-${randomDigits}`;
};

// Create a new booking
const createBooking = async ({
  customer_id,
  category_id,
  service_date,
  service_time,
  address,
  problem_description,
  total_amount,
  payment_method = 'CASH_ON_DELIVERY'
}) => {
  const booking_code = generateBookingCode();

  const [result] = await pool.query(
    `INSERT INTO bookings (
      booking_code, customer_id, category_id, service_date, service_time,
      address, problem_description, status, total_amount, payment_method, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, 'PENDING')`,
    [
      booking_code,
      customer_id,
      category_id,
      service_date,
      service_time,
      address.trim(),
      problem_description.trim(),
      total_amount,
      payment_method
    ]
  );

  return result.insertId;
};

// Get complete booking details by ID with joined customer, worker, category, and review
const getBookingById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      b.*,
      sc.name AS category_name,
      sc.icon AS category_icon,
      sc.base_price AS category_base_price,
      c.name AS customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      w.id AS worker_user_id,
      w.name AS worker_name,
      w.email AS worker_email,
      w.phone AS worker_phone,
      wp.rating AS worker_rating,
      wp.experience_years AS worker_experience,
      wp.service_area AS worker_service_area,
      r.id AS review_id,
      r.rating AS review_rating,
      r.comment AS review_comment,
      r.created_at AS review_date
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    JOIN users c ON b.customer_id = c.id
    LEFT JOIN users w ON b.worker_id = w.id
    LEFT JOIN worker_profiles wp ON w.id = wp.user_id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE b.id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

// Get all bookings created by a specific customer
const getBookingsByCustomer = async (customerId, statusFilter = null) => {
  let query = `
    SELECT 
      b.*,
      sc.name AS category_name,
      sc.icon AS category_icon,
      w.name AS worker_name,
      w.phone AS worker_phone,
      r.rating AS review_rating
    FROM bookings b
    JOIN service_categories sc ON b.category_id = sc.id
    LEFT JOIN users w ON b.worker_id = w.id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE b.customer_id = ?
  `;
  const params = [customerId];

  if (statusFilter) {
    query += ' AND b.status = ?';
    params.push(statusFilter);
  }

  query += ' ORDER BY b.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

// Cancel an eligible booking (Only allowed if status is PENDING or ACCEPTED)
const cancelCustomerBooking = async (id, customerId, cancellationReason = 'Cancelled by customer') => {
  const [result] = await pool.query(
    `UPDATE bookings 
     SET status = 'CANCELLED', cancellation_reason = ? 
     WHERE id = ? AND customer_id = ? AND status IN ('PENDING', 'ACCEPTED')`,
    [cancellationReason.trim(), id, customerId]
  );

  return result.affectedRows > 0;
};

module.exports = {
  createBooking,
  getBookingById,
  getBookingsByCustomer,
  cancelCustomerBooking
};
