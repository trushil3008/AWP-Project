const { accountService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Account Controller
 * Handles account-related endpoints
 */

/**
 * @desc    Get current user's account details
 * @route   GET /api/account
 * @access  Private
 */
const getAccount = asyncHandler(async (req, res) => {
  const account = await accountService.getAccountByUserId(req.user._id);
  return ApiResponse.success(res, account, 'Account details retrieved successfully');
});

/**
 * @desc    Get account balance
 * @route   GET /api/account/balance
 * @access  Private
 */
const getBalance = asyncHandler(async (req, res) => {
  const balance = await accountService.getBalance(req.user._id);
  return ApiResponse.success(res, balance, 'Balance retrieved successfully');
});

/**
 * @desc    Get account statistics
 * @route   GET /api/account/stats
 * @access  Private
 */
const getAccountStats = asyncHandler(async (req, res) => {
  const stats = await accountService.getAccountStats(req.user._id);
  return ApiResponse.success(res, stats, 'Account statistics retrieved successfully');
});

/**
 * @desc    Verify if an account exists (for transfers)
 * @route   GET /api/account/verify/:accountNumber
 * @access  Private
 */
const verifyAccount = asyncHandler(async (req, res) => {
  const { accountNumber } = req.params;
  const account = await accountService.getAccountByNumber(accountNumber);
  
  // Return limited info for privacy
  return ApiResponse.success(res, {
    accountNumber: account.accountNumber,
    accountHolderName: account.userId.name,
    isActive: account.status === 'active'
  }, 'Account verified');
});

module.exports = {
  getAccount,
  getBalance,
  getAccountStats,
  verifyAccount
};
