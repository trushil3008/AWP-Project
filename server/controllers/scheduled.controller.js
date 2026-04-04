const { scheduledService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Scheduled Transaction Controller
 * Handles scheduled/future transfers
 */

/**
 * @desc    Create a scheduled transaction
 * @route   POST /api/scheduled
 * @access  Private
 */
const createScheduled = asyncHandler(async (req, res) => {
  const { receiverAccount, amount, scheduledDate, reference, description, isRecurring, recurringFrequency } = req.body;

  const scheduled = await scheduledService.createScheduledTransaction(
    { 
      receiverAccount, 
      amount: parseFloat(amount), 
      scheduledDate, 
      reference, 
      description,
      isRecurring,
      recurringFrequency
    },
    req.user,
    req.account
  );

  return ApiResponse.created(res, scheduled, 'Transaction scheduled successfully');
});

/**
 * @desc    Get all scheduled transactions
 * @route   GET /api/scheduled
 * @access  Private
 */
const getScheduled = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const result = await scheduledService.getScheduledTransactions(
    req.user._id,
    { page, limit, status }
  );

  return ApiResponse.success(res, result, 'Scheduled transactions retrieved successfully');
});

/**
 * @desc    Get single scheduled transaction
 * @route   GET /api/scheduled/:id
 * @access  Private
 */
const getScheduledById = asyncHandler(async (req, res) => {
  const scheduled = await scheduledService.getScheduledById(
    req.params.id,
    req.user._id
  );
  return ApiResponse.success(res, scheduled, 'Scheduled transaction retrieved successfully');
});

/**
 * @desc    Cancel a scheduled transaction
 * @route   DELETE /api/scheduled/:id
 * @access  Private
 */
const cancelScheduled = asyncHandler(async (req, res) => {
  const result = await scheduledService.cancelScheduledTransaction(
    req.params.id,
    req.user._id
  );
  return ApiResponse.success(res, result, 'Scheduled transaction cancelled successfully');
});

module.exports = {
  createScheduled,
  getScheduled,
  getScheduledById,
  cancelScheduled
};
