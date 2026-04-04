const { transactionService, beneficiaryService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Transaction Controller
 * Handles transaction-related endpoints
 */

/**
 * @desc    Transfer money to another account
 * @route   POST /api/transactions/transfer
 * @access  Private
 */
const transfer = asyncHandler(async (req, res) => {
  const { receiverAccount, amount, reference, description } = req.body;

  const result = await transactionService.transfer(
    { receiverAccount, amount: parseFloat(amount), reference, description },
    req.user,
    req.account
  );

  // Update beneficiary stats if receiver is a saved beneficiary
  beneficiaryService.recordTransfer(req.user._id, receiverAccount);

  return ApiResponse.success(res, result, 'Transfer successful');
});

/**
 * @desc    Get transaction history
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, status, type, startDate, endDate } = req.query;

  const result = await transactionService.getTransactionHistory(
    req.user._id,
    req.account.accountNumber,
    { page, limit, status, type, startDate, endDate }
  );

  return ApiResponse.success(res, result, 'Transactions retrieved successfully');
});

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:transactionId
 * @access  Private
 */
const getTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await transactionService.getTransactionById(
    transactionId,
    req.user._id.toString()
  );

  return ApiResponse.success(res, transaction, 'Transaction retrieved successfully');
});

/**
 * @desc    Get transaction summary/stats
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getTransactionSummary = asyncHandler(async (req, res) => {
  const { period } = req.query;

  const summary = await transactionService.getTransactionSummary(
    req.account.accountNumber,
    period
  );

  return ApiResponse.success(res, summary, 'Transaction summary retrieved successfully');
});

module.exports = {
  transfer,
  getTransactions,
  getTransaction,
  getTransactionSummary
};
