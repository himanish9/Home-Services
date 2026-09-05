const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware to intercept validation errors from express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return sendError(res, 400, 'Validation Error', formattedErrors);
  }
  next();
};

module.exports = {
  validateRequest
};
