const bookingModel = require('../models/bookingModel');
const serviceModel = require('../models/serviceModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create a new booking request
 * @route   POST /api/bookings
 * @access  Private (CUSTOMER role)
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      category_id,
      service_date,
      service_time,
      address,
      problem_description,
      payment_method = 'CASH_ON_DELIVERY'
    } = req.body;

    // 1. Verify that the requested service category exists and is active
    const category = await serviceModel.getServiceById(category_id);
    if (!category) {
      return sendError(res, 404, 'Selected service category not found');
    }
    if (!category.is_active) {
      return sendError(res, 400, 'This service category is currently unavailable');
    }

    // 2. Validate booking date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (service_date < today) {
      return sendError(res, 400, 'Service date cannot be in the past');
    }

    // 3. Create the booking with category base price
    const newBookingId = await bookingModel.createBooking({
      customer_id: req.user.id,
      category_id: parseInt(category_id, 10),
      service_date,
      service_time,
      address,
      problem_description,
      total_amount: category.base_price,
      payment_method
    });

    // 4. Fetch full booking details for confirmation response
    const booking = await bookingModel.getBookingById(newBookingId);

    return sendSuccess(res, 201, 'Booking created successfully', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the logged-in customer
 * @route   GET /api/bookings or GET /api/customer/bookings
 * @access  Private (CUSTOMER role)
 */
const getCustomerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const bookings = await bookingModel.getBookingsByCustomer(req.user.id, status || null);

    return sendSuccess(res, 200, 'Customer bookings retrieved successfully', {
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking details by ID
 * @route   GET /api/bookings/:id
 * @access  Private (Owner customer, assigned worker, or admin)
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingModel.getBookingById(id);

    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    // Access authorization check: Customer must own the booking, Worker must be assigned, or user must be Admin
    const isOwnerCustomer = booking.customer_id === req.user.id;
    const isAssignedWorker = booking.worker_id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwnerCustomer && !isAssignedWorker && !isAdmin) {
      return sendError(res, 403, 'You do not have permission to view this booking');
    }

    return sendSuccess(res, 200, 'Booking details retrieved', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an eligible booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (CUSTOMER role)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    const booking = await bookingModel.getBookingById(id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (booking.customer_id !== req.user.id && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'You can only cancel your own bookings');
    }

    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return sendError(
        res,
        400,
        `Cannot cancel booking with status "${booking.status}". Only PENDING or ACCEPTED bookings can be cancelled.`
      );
    }

    const success = await bookingModel.cancelCustomerBooking(id, booking.customer_id, reason);

    if (!success) {
      return sendError(res, 400, 'Failed to cancel booking');
    }

    const updatedBooking = await bookingModel.getBookingById(id);
    return sendSuccess(res, 200, 'Booking has been cancelled successfully', {
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking
};
