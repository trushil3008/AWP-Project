const { ROLES, ACCOUNT_STATUS } = require('../config/constants');
const { ApiError } = require('../utils');

/**
 * Role-based access control middleware
 * Restricts access to specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('You must be logged in to access this resource.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = authorize(ROLES.ADMIN);

/**
 * User only middleware
 */
const userOnly = authorize(ROLES.USER);

/**
 * Check if account is active (not frozen)
 * Use this for transaction-related routes
 */
const requireActiveAccount = (req, res, next) => {
  if (!req.account) {
    return next(ApiError.notFound('Account not found. Please contact support.'));
  }

  if (req.account.status === ACCOUNT_STATUS.FROZEN) {
    return next(ApiError.forbidden('Your account is frozen. Please contact support to resolve this issue.'));
  }

  if (req.account.status === ACCOUNT_STATUS.CLOSED) {
    return next(ApiError.forbidden('Your account has been closed.'));
  }

  next();
};

/**
 * Check if user owns the resource
 * @param {string} paramName - Request parameter containing resource owner ID
 */
const ownerOnly = (paramName = 'userId') => {
  return (req, res, next) => {
    const resourceOwnerId = req.params[paramName] || req.body[paramName];
    
    if (!resourceOwnerId) {
      return next();
    }

    if (req.user._id.toString() !== resourceOwnerId.toString() && req.user.role !== ROLES.ADMIN) {
      return next(ApiError.forbidden('You do not have permission to access this resource.'));
    }

    next();
  };
};

module.exports = {
  authorize,
  adminOnly,
  userOnly,
  requireActiveAccount,
  ownerOnly
};
