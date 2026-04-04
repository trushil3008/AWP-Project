const { analyticsService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Analytics Controller
 * Handles analytics and reporting endpoints
 */

/**
 * @desc    Get analytics summary
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(req.account.accountNumber);
  return ApiResponse.success(res, summary, 'Analytics summary retrieved successfully');
});

/**
 * @desc    Get monthly transaction statistics
 * @route   GET /api/analytics/monthly
 * @access  Private
 */
const getMonthlyStats = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const currentYear = year ? parseInt(year) : new Date().getFullYear();

  const stats = await analyticsService.getMonthlyStats(
    req.account.accountNumber,
    currentYear
  );

  return ApiResponse.success(res, stats, 'Monthly statistics retrieved successfully');
});

/**
 * @desc    Get spending breakdown by category
 * @route   GET /api/analytics/spending
 * @access  Private
 */
const getSpendingBreakdown = asyncHandler(async (req, res) => {
  const { months } = req.query;
  const numMonths = months ? parseInt(months) : 6;

  const breakdown = await analyticsService.getSpendingBreakdown(
    req.account.accountNumber,
    numMonths
  );

  return ApiResponse.success(res, breakdown, 'Spending breakdown retrieved successfully');
});

/**
 * @desc    Get daily transaction trend
 * @route   GET /api/analytics/trend
 * @access  Private
 */
const getDailyTrend = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const numDays = days ? parseInt(days) : 30;

  const trend = await analyticsService.getDailyTrend(
    req.account.accountNumber,
    numDays
  );

  return ApiResponse.success(res, trend, 'Daily trend retrieved successfully');
});

module.exports = {
  getSummary,
  getMonthlyStats,
  getSpendingBreakdown,
  getDailyTrend
};
