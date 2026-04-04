const { authService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Auth Controller
 * Handles authentication endpoints
 */

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await authService.register({ name, email, password });

  // Generate token and set cookie
  const token = authService.generateToken(result.user.id);
  authService.setTokenCookie(res, token);

  return ApiResponse.created(res, result, 'Registration successful');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  // Set token cookie
  authService.setTokenCookie(res, result.token);

  // Remove token from response (it's in the cookie)
  const { token, ...responseData } = result;

  return ApiResponse.success(res, responseData, 'Login successful');
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  authService.clearTokenCookie(res);
  return ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user._id);
  return ApiResponse.success(res, result, 'Profile retrieved successfully');
});

/**
 * @desc    Update password
 * @route   PATCH /api/auth/update-password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await authService.updatePassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  // Generate new token after password change
  const token = authService.generateToken(req.user._id);
  authService.setTokenCookie(res, token);

  return ApiResponse.success(res, result, 'Password updated successfully');
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword
};
