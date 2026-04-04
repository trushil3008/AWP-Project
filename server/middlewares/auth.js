const jwt = require('jsonwebtoken');
const { User, Account } = require('../models');
const { ApiError } = require('../utils');

/**
 * Authentication middleware
 * Verifies JWT token from cookies or Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first (preferred for security)
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // Check Authorization header as fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('You are not logged in. Please log in to access this resource.'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return next(ApiError.unauthorized('The user belonging to this token no longer exists.'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(ApiError.unauthorized('Your account has been deactivated. Please contact support.'));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(ApiError.unauthorized('Password was recently changed. Please log in again.'));
    }

    // Get user's account
    const account = await Account.findOne({ userId: user._id });

    // Attach user and account to request
    req.user = user;
    req.account = account;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Your session has expired. Please log in again.'));
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work for both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.account = await Account.findOne({ userId: user._id });
      }
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

module.exports = { authenticate, optionalAuth };
