const express = require('express');
const { body } = require('express-validator');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateMiddleware');

const router = express.Router();

// Validation schema for creating a service category
const serviceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Service category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 2 })
    .withMessage('Description must be at least 2 characters long'),
  body('base_price')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a valid positive number'),
  body('icon')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Icon identifier cannot be empty')
];

/**
 * @route   GET /api/services
 * @desc    Get all service categories (supports ?search= and ?active=true)
 * @access  Public
 */
router.get('/', getServices);

/**
 * @route   GET /api/services/:id
 * @desc    Get service category by ID
 * @access  Public
 */
router.get('/:id', getServiceById);

/**
 * @route   POST /api/services
 * @desc    Create a new service category
 * @access  Private (Admin only)
 */
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  serviceValidation,
  validateRequest,
  createService
);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service category
 * @access  Private (Admin only)
 */
router.put('/:id', requireAuth, requireRole('ADMIN'), updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service category
 * @access  Private (Admin only)
 */
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteService);

module.exports = router;
