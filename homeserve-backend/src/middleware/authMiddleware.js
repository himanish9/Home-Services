const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { sendError } = require('../utils/responseHandler');

/**
 * Authentication Middleware
 * Validates the JWT Bearer token in the Authorization header
 * and attaches the authenticated user object to req.user
 */
const requireAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication failed: No token provided');
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'homeserve_super_secret_jwt_key_2026_change_in_production'
    );

    // Verify user exists and is active in database
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'User associated with this token no longer exists');
    }

    if (user.status === 'SUSPENDED') {
      return sendError(res, 403, 'Your account is suspended. Please contact administration.');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired: Please log in again');
    }
    return sendError(res, 401, 'Invalid authentication token');
  }
};

/**
 * Role-Based Authorization Middleware Factory
 * Restricts access to specified roles
 * Usage: requireRole('ADMIN') or requireRole('CUSTOMER', 'ADMIN')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied: Restricted to [${allowedRoles.join(', ')}] role(s)`
      );
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
