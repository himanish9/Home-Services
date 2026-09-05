const express = require('express');
const { body } = require('express-validator');
const {
  getAvailableJobs,
  getMyJobs,
  getJobDetails,
  acceptJob,
  updateStatus,
  getWorkerDashboardStats,
  updateWorkerProfile
} = require('../controllers/workerController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

// All routes in this file require authentication and SERVICE_PROVIDER role
router.use(requireAuth, requireRole('SERVICE_PROVIDER'));

// Validation for status update
const statusValidation = [
  body('status')
    .notEmpty()
    .withMessage('New status is required')
    .isIn(['ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Status must be ON_THE_WAY, IN_PROGRESS, or COMPLETED')
];

/**
 * @route   GET /api/worker/jobs
 * @desc    Get available pending jobs matching worker's categories
 * @access  Private (SERVICE_PROVIDER)
 */
router.get('/jobs', getAvailableJobs);

/**
 * @route   GET /api/worker/my-jobs
 * @desc    Get all jobs accepted by this worker
 * @access  Private (SERVICE_PROVIDER)
 */
router.get('/my-jobs', getMyJobs);

/**
 * @route   GET /api/worker/jobs/:id
 * @desc    Get details of a single job
 * @access  Private (SERVICE_PROVIDER)
 */
router.get('/jobs/:id', getJobDetails);

/**
 * @route   PUT /api/worker/jobs/:id/accept
 * @desc    Accept an available job
 * @access  Private (SERVICE_PROVIDER)
 */
router.put('/jobs/:id/accept', acceptJob);

/**
 * @route   PUT /api/worker/jobs/:id/status
 * @desc    Update progress status of an accepted job
 * @access  Private (SERVICE_PROVIDER)
 */
router.put('/jobs/:id/status', statusValidation, validateRequest, updateStatus);

/**
 * @route   GET /api/worker/stats
 * @desc    Get worker dashboard statistics, ratings, and total earnings
 * @access  Private (SERVICE_PROVIDER)
 */
router.get('/stats', getWorkerDashboardStats);

/**
 * @route   PUT /api/worker/profile
 * @desc    Update worker profile details
 * @access  Private (SERVICE_PROVIDER)
 */
router.put('/profile', updateWorkerProfile);

module.exports = router;
