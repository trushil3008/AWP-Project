const { adminService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Admin Controller
 * Handles admin-only endpoints
 */

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully');
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, status } = req.query;

  const result = await adminService.getUsers({ page, limit, search, status });

  return ApiResponse.success(res, result, 'Users retrieved successfully');
});

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:userId
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.userId);
  return ApiResponse.success(res, user, 'User retrieved successfully');
});

/**
 * @desc    Freeze user account
 * @route   PATCH /api/admin/users/:accountId/freeze
 * @access  Private/Admin
 */
const freezeAccount = asyncHandler(async (req, res) => {
  const result = await adminService.freezeAccount(req.params.accountId);
  return ApiResponse.success(res, result, 'Account frozen successfully');
});

/**
 * @desc    Unfreeze user account
 * @route   PATCH /api/admin/users/:accountId/unfreeze
 * @access  Private/Admin
 */
const unfreezeAccount = asyncHandler(async (req, res) => {
  const result = await adminService.unfreezeAccount(req.params.accountId);
  return ApiResponse.success(res, result, 'Account unfrozen successfully');
});

/**
 * @desc    Get all transactions
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { page, limit, status, type, startDate, endDate, search } = req.query;

  const result = await adminService.getAllTransactions({
    page, limit, status, type, startDate, endDate, search
  });

  return ApiResponse.success(res, result, 'Transactions retrieved successfully');
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  freezeAccount,
  unfreezeAccount,
  getAllTransactions
};
