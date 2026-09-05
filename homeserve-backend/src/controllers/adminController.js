const adminModel = require('../models/adminModel');
const bookingModel = require('../models/bookingModel');
const userModel = require('../models/userModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get dashboard metrics and platform statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (ADMIN role)
 */
const getDashboard = async (req, res, next) => {
  try {
    const metrics = await adminModel.getDashboardMetrics();
    return sendSuccess(res, 200, 'Dashboard metrics retrieved', metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with optional role and search filters
 * @route   GET /api/admin/users
 * @access  Private (ADMIN role)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const users = await adminModel.getAllUsers({ role, search });

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (ACTIVE / SUSPENDED)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (ADMIN role)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return sendError(res, 400, 'Status must be either ACTIVE or SUSPENDED');
    }

    // Prevent admin from suspending themselves
    if (parseInt(id, 10) === req.user.id) {
      return sendError(res, 400, 'Administrators cannot suspend their own account');
    }

    const updated = await adminModel.updateUserStatus(id, status);
    if (!updated) {
      return sendError(res, 404, 'User not found');
    }

    const user = await userModel.findById(id);
    return sendSuccess(res, 200, `User status updated to ${status}`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all service providers with approval status and skills
 * @route   GET /api/admin/workers
 * @access  Private (ADMIN role)
 */
const getWorkers = async (req, res, next) => {
  try {
    const workers = await adminModel.getAllWorkers();
    return sendSuccess(res, 200, 'Service providers retrieved successfully', {
      count: workers.length,
      workers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a service provider application
 * @route   PUT /api/admin/workers/:id/approve
 * @access  Private (ADMIN role)
 */
const updateWorkerApproval = async (req, res, next) => {
  try {
    const { id } = req.params; // worker_profile_id
    const { is_approved } = req.body;

    if (is_approved === undefined) {
      return sendError(res, 400, 'is_approved boolean field is required');
    }

    const updated = await adminModel.updateWorkerApproval(id, Boolean(is_approved));
    if (!updated) {
      return sendError(res, 404, 'Worker profile not found');
    }

    return sendSuccess(
      res,
      200,
      `Worker profile ${is_approved ? 'approved' : 'unapproved/rejected'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings across the platform
 * @route   GET /api/admin/bookings
 * @access  Private (ADMIN role)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const bookings = await adminModel.getAllBookings({ status, search });

    return sendSuccess(res, 200, 'All platform bookings retrieved', {
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin update/override for booking status
 * @route   PUT /api/admin/bookings/:id/status
 * @access  Private (ADMIN role)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    const updated = await adminModel.updateBookingStatusByAdmin(id, status);
    if (!updated) {
      return sendError(res, 404, 'Booking not found');
    }

    const booking = await bookingModel.getBookingById(id);
    return sendSuccess(res, 200, `Booking status updated to ${status}`, { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews across the platform
 * @route   GET /api/admin/reviews
 * @access  Private (ADMIN role)
 */
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await adminModel.getAllReviews();
    return sendSuccess(res, 200, 'All reviews retrieved successfully', {
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  getWorkers,
  updateWorkerApproval,
  getAllBookings,
  updateBookingStatus,
  getAllReviews
};
