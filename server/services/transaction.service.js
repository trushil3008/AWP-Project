const mongoose = require('mongoose');
const { Transaction, Account, User } = require('../models');
const { 
  ApiError, 
  generateTransactionId, 
  generateReference, 
  emailService,
  getPagination 
} = require('../utils');
const { TRANSACTION_TYPES, TRANSACTION_STATUS, ACCOUNT_STATUS, LIMITS } = require('../config/constants');

/**
 * Transaction Service
 * Handles all transaction-related business logic
 */
class TransactionService {
  /**
   * Transfer money between accounts
   * Uses MongoDB transactions to ensure atomicity
   * @param {Object} transferData - Transfer details
   * @param {Object} senderUser - Sender user object
   * @param {Object} senderAccount - Sender account object
   * @returns {Object} Transaction details
   */
  async transfer(transferData, senderUser, senderAccount) {
    const { receiverAccount: receiverAccountNumber, amount, reference, description } = transferData;

    // Validate amount
    if (amount < LIMITS.MIN_TRANSFER || amount > LIMITS.MAX_TRANSFER) {
      throw ApiError.badRequest(`Amount must be between ${LIMITS.MIN_TRANSFER} and ${LIMITS.MAX_TRANSFER}`);
    }

    // Check if sender account is active
    if (senderAccount.status !== ACCOUNT_STATUS.ACTIVE) {
      throw ApiError.forbidden('Your account is not active');
    }

    // Check sufficient balance
    if (senderAccount.balance < amount) {
      throw ApiError.badRequest('Insufficient balance');
    }

    // Check if not sending to self
    if (senderAccount.accountNumber === receiverAccountNumber) {
      throw ApiError.badRequest('Cannot transfer to your own account');
    }

    // Find receiver account
    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
    if (!receiverAccount) {
      throw ApiError.notFound('Receiver account not found');
    }

    // Check receiver account status
    if (receiverAccount.status !== ACCOUNT_STATUS.ACTIVE) {
      throw ApiError.badRequest('Receiver account is not active');
    }

    // Get receiver user
    const receiverUser = await User.findById(receiverAccount.userId);

    // Check daily limit
    senderAccount.resetDailyLimitIfNeeded();
    if (senderAccount.dailyTransferTotal + amount > LIMITS.DAILY_TRANSFER_LIMIT) {
      throw ApiError.badRequest(`Daily transfer limit of ${LIMITS.DAILY_TRANSFER_LIMIT} exceeded`);
    }

    // Start MongoDB session for atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Generate transaction ID
      const transactionId = generateTransactionId();
      const txnReference = reference || generateReference();

      // Deduct from sender
      senderAccount.balance -= amount;
      senderAccount.dailyTransferTotal += amount;
      senderAccount.lastTransferDate = new Date();
      await senderAccount.save({ session });

      // Add to receiver
      receiverAccount.balance += amount;
      await receiverAccount.save({ session });

      // Create transaction record
      const transaction = await Transaction.create([{
        transactionId,
        senderAccount: senderAccount.accountNumber,
        receiverAccount: receiverAccount.accountNumber,
        senderUserId: senderUser._id,
        receiverUserId: receiverAccount.userId,
        amount,
        type: TRANSACTION_TYPES.TRANSFER,
        status: TRANSACTION_STATUS.COMPLETED,
        reference: txnReference,
        description,
        balanceAfterTransaction: {
          sender: senderAccount.balance,
          receiver: receiverAccount.balance
        },
        completedAt: new Date()
      }], { session });

      // Commit transaction
      await session.commitTransaction();

      // Send notifications (async, don't wait)
      emailService.sendTransactionSuccess(senderUser, transaction[0], 'debit');
      emailService.sendTransactionSuccess(receiverUser, transaction[0], 'credit');

      return {
        transactionId: transaction[0].transactionId,
        amount: transaction[0].amount,
        receiverAccount: receiverAccount.accountNumber,
        receiverName: receiverUser.name,
        reference: transaction[0].reference,
        status: transaction[0].status,
        balanceAfter: senderAccount.balance,
        completedAt: transaction[0].completedAt
      };

    } catch (error) {
      // Rollback transaction
      await session.abortTransaction();
      
      // Log failed transaction
      console.error('Transaction failed:', error.message);
      
      // Send failure notification
      emailService.sendTransactionFailed(senderUser, { amount, receiverAccount: receiverAccountNumber }, error.message);
      
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transaction history for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (page, limit, filters)
   * @returns {Object} Transactions and pagination
   */
  async getTransactionHistory(userId, accountNumber, options = {}) {
    const { page = 1, limit = 10, status, type, startDate, endDate } = options;

    // Build query
    const query = {
      $or: [
        { senderAccount: accountNumber },
        { receiverAccount: accountNumber }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get total count
    const total = await Transaction.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('senderUserId', 'name email')
      .populate('receiverUserId', 'name email');

    // Transform transactions to show debit/credit from user perspective
    const formattedTransactions = transactions.map(txn => {
      const isDebit = txn.senderAccount === accountNumber;
      return {
        id: txn._id,
        transactionId: txn.transactionId,
        type: isDebit ? 'debit' : 'credit',
        amount: txn.amount,
        senderAccount: txn.senderAccount,
        receiverAccount: txn.receiverAccount,
        senderName: txn.senderUserId?.name || 'Unknown',
        receiverName: txn.receiverUserId?.name || 'Unknown',
        reference: txn.reference,
        description: txn.description,
        status: txn.status,
        balanceAfter: isDebit ? txn.balanceAfterTransaction?.sender : txn.balanceAfterTransaction?.receiver,
        createdAt: txn.createdAt,
        completedAt: txn.completedAt
      };
    });

    return {
      transactions: formattedTransactions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      }
    };
  }

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Transaction details
   */
  async getTransactionById(transactionId, userId) {
    const transaction = await Transaction.findOne({ transactionId })
      .populate('senderUserId', 'name email')
      .populate('receiverUserId', 'name email');

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    // Check if user is involved in transaction
    if (transaction.senderUserId._id.toString() !== userId && 
        transaction.receiverUserId._id.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this transaction');
    }

    return transaction;
  }

  /**
   * Get transaction summary for a user
   * @param {string} accountNumber - Account number
   * @param {string} period - Period (day, week, month, year)
   * @returns {Object} Summary stats
   */
  async getTransactionSummary(accountNumber, period = 'month') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const [creditStats, debitStats] = await Promise.all([
      // Credits (money received)
      Transaction.aggregate([
        {
          $match: {
            receiverAccount: accountNumber,
            status: TRANSACTION_STATUS.COMPLETED,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Debits (money sent)
      Transaction.aggregate([
        {
          $match: {
            senderAccount: accountNumber,
            status: TRANSACTION_STATUS.COMPLETED,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    return {
      period,
      startDate,
      credit: {
        total: creditStats[0]?.total || 0,
        count: creditStats[0]?.count || 0
      },
      debit: {
        total: debitStats[0]?.total || 0,
        count: debitStats[0]?.count || 0
      },
      netFlow: (creditStats[0]?.total || 0) - (debitStats[0]?.total || 0)
    };
  }
}

module.exports = new TransactionService();
