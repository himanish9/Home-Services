const workerModel = require('../models/workerModel');
const bookingModel = require('../models/bookingModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get available jobs matching worker's skills
 * @route   GET /api/worker/jobs
 * @access  Private (SERVICE_PROVIDER role)
 */
const getAvailableJobs = async (req, res, next) => {
  try {
    const jobs = await workerModel.getAvailableJobsForWorker(req.user.id);
    return sendSuccess(res, 200, 'Available jobs retrieved', {
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs accepted/handled by this worker
 * @route   GET /api/worker/my-jobs
 * @access  Private (SERVICE_PROVIDER role)
 */
const getMyJobs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const jobs = await workerModel.getAssignedJobsForWorker(req.user.id, status || null);

    return sendSuccess(res, 200, 'Assigned jobs retrieved', {
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get details of a single job
 * @route   GET /api/worker/jobs/:id
 * @access  Private (SERVICE_PROVIDER role)
 */
const getJobDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await bookingModel.getBookingById(id);

    if (!job) {
      return sendError(res, 404, 'Job request not found');
    }

    return sendSuccess(res, 200, 'Job details retrieved', { job });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept an available pending job
 * @route   PUT /api/worker/jobs/:id/accept
 * @access  Private (SERVICE_PROVIDER role)
 */
const acceptJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Verify booking exists
    const booking = await bookingModel.getBookingById(id);
    if (!booking) {
      return sendError(res, 404, 'Job not found');
    }

    if (booking.status !== 'PENDING' || booking.worker_id !== null) {
      return sendError(res, 400, 'This job has already been accepted or is no longer available');
    }

    // 2. Attempt atomic accept
    const accepted = await workerModel.acceptJob(id, req.user.id);
    if (!accepted) {
      return sendError(res, 400, 'Could not accept this job. It may have been taken by another professional.');
    }

    const updatedJob = await bookingModel.getBookingById(id);
    return sendSuccess(res, 200, 'Job accepted successfully! You can now view customer details.', {
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of an accepted job
 * @route   PUT /api/worker/jobs/:id/status
 * @access  Private (SERVICE_PROVIDER role)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedTransitions = {
      ACCEPTED: ['ON_THE_WAY'],
      ON_THE_WAY: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED']
    };

    const booking = await bookingModel.getBookingById(id);
    if (!booking) {
      return sendError(res, 404, 'Job not found');
    }

    // Check ownership
    if (booking.worker_id !== req.user.id) {
      return sendError(res, 403, 'You are not assigned to this job');
    }

    const validNextStates = allowedTransitions[booking.status];
    if (!validNextStates || !validNextStates.includes(status)) {
      return sendError(
        res,
        400,
        `Invalid status transition from "${booking.status}" to "${status}". Valid transition: ${validNextStates ? validNextStates.join(', ') : 'None'}`
      );
    }

    const updated = await workerModel.updateJobStatus(id, req.user.id, status);
    if (!updated) {
      return sendError(res, 400, 'Failed to update job status');
    }

    const updatedJob = await bookingModel.getBookingById(id);
    return sendSuccess(res, 200, `Job status updated to ${status}`, {
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get worker dashboard statistics and earnings
 * @route   GET /api/worker/stats
 * @access  Private (SERVICE_PROVIDER role)
 */
const getWorkerDashboardStats = async (req, res, next) => {
  try {
    const statsData = await workerModel.getWorkerStats(req.user.id);
    return sendSuccess(res, 200, 'Worker statistics retrieved', statsData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update worker profile details
 * @route   PUT /api/worker/profile
 * @access  Private (SERVICE_PROVIDER role)
 */
const updateWorkerProfile = async (req, res, next) => {
  try {
    const { experience_years, service_area, bio, is_available } = req.body;

    await workerModel.updateWorkerProfile(req.user.id, {
      experience_years,
      service_area,
      bio,
      is_available
    });

    const statsData = await workerModel.getWorkerStats(req.user.id);
    return sendSuccess(res, 200, 'Worker profile updated successfully', statsData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableJobs,
  getMyJobs,
  getJobDetails,
  acceptJob,
  updateStatus,
  getWorkerDashboardStats,
  updateWorkerProfile
};
