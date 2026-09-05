const { pool } = require('../config/db');

/**
 * Data Access Layer for Reviews and Ratings
 */

// Create a review and recalculate worker's aggregated rating
const createReview = async ({ booking_id, customer_id, worker_id, rating, comment = '' }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert review
    const [insertResult] = await connection.query(
      `INSERT INTO reviews (booking_id, customer_id, worker_id, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, customer_id, worker_id, rating, comment ? comment.trim() : null]
    );

    // 2. Recalculate average rating & total reviews for the worker
    await connection.query(
      `UPDATE worker_profiles 
       SET 
         rating = (
           SELECT ROUND(COALESCE(AVG(rating), 5.0), 2) 
           FROM reviews 
           WHERE worker_id = ?
         ),
         total_reviews = (
           SELECT COUNT(*) 
           FROM reviews 
           WHERE worker_id = ?
         )
       WHERE user_id = ?`,
      [worker_id, worker_id, worker_id]
    );

    await connection.commit();
    return insertResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Check if a booking already has a review
const getReviewByBookingId = async (bookingId) => {
  const [rows] = await pool.query(
    `SELECT r.*, c.name AS customer_name 
     FROM reviews r 
     JOIN users c ON r.customer_id = c.id 
     WHERE r.booking_id = ? LIMIT 1`,
    [bookingId]
  );

  return rows[0] || null;
};

// Get all reviews for a specific service provider
const getReviewsByWorkerId = async (workerUserId) => {
  const [rows] = await pool.query(
    `SELECT 
      r.id,
      r.booking_id,
      r.rating,
      r.comment,
      r.created_at,
      c.id AS customer_id,
      c.name AS customer_name,
      sc.name AS service_name
    FROM reviews r
    JOIN users c ON r.customer_id = c.id
    JOIN bookings b ON r.booking_id = b.id
    JOIN service_categories sc ON b.category_id = sc.id
    WHERE r.worker_id = ?
    ORDER BY r.created_at DESC`,
    [workerUserId]
  );

  return rows;
};

module.exports = {
  createReview,
  getReviewByBookingId,
  getReviewsByWorkerId
};
