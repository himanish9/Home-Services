const express = require('express');
const { body } = require('express-validator');
const {
  submitReview,
  getWorkerReviews,
  getBookingReview
} = require('../controllers/reviewController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

// Validation schema for submitting a review
const reviewValidation = [
  body('booking_id')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comment cannot exceed 1000 characters')
];

/**
 * @route   POST /api/reviews
 * @desc    Submit rating and review for a completed booking
 * @access  Private (CUSTOMER role)
 */
router.post(
  '/',
  requireAuth,
  requireRole('CUSTOMER'),
  reviewValidation,
  validateRequest,
  submitReview
);

/**
 * @route   GET /api/reviews/worker/:workerId
 * @desc    Get all reviews for a service provider
 * @access  Public
 */
router.get('/worker/:workerId', getWorkerReviews);

/**
 * @route   GET /api/reviews/booking/:bookingId
 * @desc    Get review for a specific booking
 * @access  Private
 */
router.get('/booking/:bookingId', requireAuth, getBookingReview);

module.exports = router;
