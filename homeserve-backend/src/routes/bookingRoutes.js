const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

// Validation schema for creating a booking
const createBookingValidation = [
  body('category_id')
    .notEmpty()
    .withMessage('Service category is required')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('service_date')
    .notEmpty()
    .withMessage('Service date is required')
    .isDate()
    .withMessage('Valid date format (YYYY-MM-DD) is required'),
  body('service_time')
    .trim()
    .notEmpty()
    .withMessage('Service time slot is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Service address is required')
    .isLength({ min: 10 })
    .withMessage('Please provide a complete address (at least 10 characters)'),
  body('problem_description')
    .trim()
    .notEmpty()
    .withMessage('Problem description is required')
    .isLength({ min: 10 })
    .withMessage('Please provide a brief problem description (at least 10 characters)'),
  body('payment_method')
    .optional()
    .isIn(['CASH_ON_DELIVERY', 'ONLINE'])
    .withMessage('Payment method must be CASH_ON_DELIVERY or ONLINE')
];

/**
 * @route   POST /api/bookings
 * @desc    Create a new service booking
 * @access  Private (CUSTOMER role)
 */
router.post(
  '/',
  requireAuth,
  requireRole('CUSTOMER'),
  createBookingValidation,
  validateRequest,
  createBooking
);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the authenticated customer
 * @access  Private (CUSTOMER role)
 */
router.get('/', requireAuth, getCustomerBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking details
 * @access  Private (Owner customer, assigned worker, or admin)
 */
router.get('/:id', requireAuth, getBookingById);

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel an eligible booking
 * @access  Private (CUSTOMER role)
 */
router.put('/:id/cancel', requireAuth, cancelBooking);

module.exports = router;
