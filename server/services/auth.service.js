const jwt = require('jsonwebtoken');
const { User, Account } = require('../models');
const { ApiError, generateAccountNumber, sanitizeUser, emailService } = require('../utils');
const { ROLES, ACCOUNT_TYPES, ACCOUNT_STATUS } = require('../config/constants');

/**
 * Auth Service
 * Handles authentication business logic
 */
class AuthService {
  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  /**
   * Set JWT cookie on response
   * @param {Object} res - Express response object
   * @param {string} token - JWT token
   */
  setTokenCookie(res, token) {
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    };

    res.cookie('jwt', token, cookieOptions);
  }

  /**
   * Clear JWT cookie (logout)
   * @param {Object} res - Express response object
   */
  clearTokenCookie(res) {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
  }

  /**
   * Register a new user
   * Creates user and associated account
   * @param {Object} userData - User registration data
   * @returns {Object} User and account details
   */
  async register(userData) {
    const { name, email, password } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: ROLES.USER
    });

    // Generate unique account number
    const accountNumber = await generateAccountNumber();

    // Create account for user
    const account = await Account.create({
      userId: user._id,
      accountNumber,
      accountType: ACCOUNT_TYPES.SAVINGS,
      balance: 0,
      status: ACCOUNT_STATUS.ACTIVE
    });

    // Send welcome email
    emailService.sendWelcomeEmail(user, accountNumber);

    return {
      user: sanitizeUser(user),
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status
      }
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User and token
   */
  async login(email, password) {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Get account
    const account = await Account.findOne({ userId: user._id });

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: sanitizeUser(user),
      account: account ? {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status
      } : null,
      token
    };
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Object} User profile with account
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const account = await Account.findOne({ userId });

    return {
      user: sanitizeUser(user),
      account: account ? {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status,
        currency: account.currency
      } : null
    };
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();
