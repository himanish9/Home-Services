const reviewModel = require('../models/reviewModel');
const bookingModel = require('../models/bookingModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Submit rating and review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (CUSTOMER role)
 */
const submitReview = async (req, res, next) => {
  try {
    const { booking_id, rating, comment } = req.body;

    // 1. Fetch booking
    const booking = await bookingModel.getBookingById(booking_id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    // 2. Authorization: Must be the customer who made the booking
    if (booking.customer_id !== req.user.id) {
      return sendError(res, 403, 'You can only review your own bookings');
    }

    // 3. Status validation: Booking must be COMPLETED
    if (booking.status !== 'COMPLETED') {
      return sendError(
        res,
        400,
        `Cannot review booking with status "${booking.status}". Reviews can only be submitted after service is COMPLETED.`
      );
    }

    // 4. Must have an assigned worker
    if (!booking.worker_id) {
      return sendError(res, 400, 'Cannot submit review for a booking without an assigned worker');
    }

    // 5. Check if review already exists
    const existingReview = await reviewModel.getReviewByBookingId(booking_id);
    if (existingReview) {
      return sendError(res, 409, 'A review has already been submitted for this booking');
    }

    // 6. Create review and update worker's average rating
    const reviewId = await reviewModel.createReview({
      booking_id: parseInt(booking_id, 10),
      customer_id: req.user.id,
      worker_id: booking.worker_id,
      rating: parseInt(rating, 10),
      comment
    });

    const createdReview = await reviewModel.getReviewByBookingId(booking_id);

    return sendSuccess(res, 201, 'Thank you! Your review has been submitted successfully.', {
      review: createdReview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific worker
 * @route   GET /api/reviews/worker/:workerId
 * @access  Public
 */
const getWorkerReviews = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const reviews = await reviewModel.getReviewsByWorkerId(workerId);

    return sendSuccess(res, 200, 'Worker reviews retrieved', {
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review for a specific booking
 * @route   GET /api/reviews/booking/:bookingId
 * @access  Private (Authenticated users)
 */
const getBookingReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const review = await reviewModel.getReviewByBookingId(bookingId);

    return sendSuccess(res, 200, 'Booking review retrieved', { review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getWorkerReviews,
  getBookingReview
};
