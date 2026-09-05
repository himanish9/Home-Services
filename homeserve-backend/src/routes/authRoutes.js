const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { validateRequest } = require('../middleware/validateMiddleware');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { sendSuccess } = require('../utils/responseHandler');

const router = express.Router();

// Validation schema for registration
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 digits'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'SERVICE_PROVIDER'])
    .withMessage('Role must be either CUSTOMER or SERVICE_PROVIDER')
];

// Validation schema for login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer or worker
 * @access  Public
 */
router.post('/register', registerValidation, validateRequest, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT token
 * @access  Public
 */
router.post('/login', loginValidation, validateRequest, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get profile of currently logged-in user
 * @access  Private (Any authenticated user)
 */
router.get('/me', requireAuth, getMe);

/**
 * @route   GET /api/auth/test-admin
 * @desc    Test admin role authorization
 * @access  Private (Admin only)
 */
router.get('/test-admin', requireAuth, requireRole('ADMIN'), (req, res) => {
  return sendSuccess(res, 200, 'Admin authorization verified', { user: req.user });
});

/**
 * @route   GET /api/auth/test-worker
 * @desc    Test service provider role authorization
 * @access  Private (Worker only)
 */
router.get('/test-worker', requireAuth, requireRole('SERVICE_PROVIDER'), (req, res) => {
  return sendSuccess(res, 200, 'Worker authorization verified', { user: req.user });
});

/**
 * @route   GET /api/auth/test-customer
 * @desc    Test customer role authorization
 * @access  Private (Customer only)
 */
router.get('/test-customer', requireAuth, requireRole('CUSTOMER'), (req, res) => {
  return sendSuccess(res, 200, 'Customer authorization verified', { user: req.user });
});

module.exports = router;
