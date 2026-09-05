const express = require('express');
const { body } = require('express-validator');
const {
  getDashboard,
  getUsers,
  updateUserStatus,
  getWorkers,
  updateWorkerApproval,
  getAllBookings,
  updateBookingStatus,
  getAllReviews
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

// Enforce authentication and ADMIN role for all routes in this module
router.use(requireAuth, requireRole('ADMIN'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard metrics, KPIs, and recent activity
 * @access  Private (ADMIN)
 */
router.get('/dashboard', getDashboard);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with role and keyword filters
 * @access  Private (ADMIN)
 */
router.get('/users', getUsers);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (ACTIVE / SUSPENDED)
 * @access  Private (ADMIN)
 */
router.put(
  '/users/:id/status',
  [body('status').isIn(['ACTIVE', 'SUSPENDED']).withMessage('Status must be ACTIVE or SUSPENDED')],
  validateRequest,
  updateUserStatus
);

/**
 * @route   GET /api/admin/workers
 * @desc    Get all service providers with skills and approval state
 * @access  Private (ADMIN)
 */
router.get('/workers', getWorkers);

/**
 * @route   PUT /api/admin/workers/:id/approve
 * @desc    Approve or reject a service provider
 * @access  Private (ADMIN)
 */
router.put(
  '/workers/:id/approve',
  [body('is_approved').isBoolean().withMessage('is_approved must be a boolean')],
  validateRequest,
  updateWorkerApproval
);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all platform bookings with status filter
 * @access  Private (ADMIN)
 */
router.get('/bookings', getAllBookings);

/**
 * @route   PUT /api/admin/bookings/:id/status
 * @desc    Override booking status
 * @access  Private (ADMIN)
 */
router.put(
  '/bookings/:id/status',
  [
    body('status')
      .isIn(['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid status')
  ],
  validateRequest,
  updateBookingStatus
);

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all platform reviews
 * @access  Private (ADMIN)
 */
router.get('/reviews', getAllReviews);

module.exports = router;
