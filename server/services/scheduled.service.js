const mongoose = require('mongoose');
const { ScheduledTransaction, Account, User, Transaction } = require('../models');
const { 
  ApiError, 
  generateTransactionId, 
  generateReference,
  getPagination 
} = require('../utils');
const { SCHEDULED_STATUS, TRANSACTION_TYPES, TRANSACTION_STATUS, ACCOUNT_STATUS } = require('../config/constants');

/**
 * Scheduled Transaction Service
 * Handles scheduled/future transfers
 */
class ScheduledService {
  /**
   * Create a scheduled transaction
   * @param {Object} data - Scheduled transaction data
   * @param {Object} user - User object
   * @param {Object} senderAccount - Sender account
   * @returns {Object} Created scheduled transaction
   */
  async createScheduledTransaction(data, user, senderAccount) {
    const { receiverAccount: receiverAccountNumber, amount, scheduledDate, reference, description, isRecurring, recurringFrequency } = data;

    // Validate receiver account exists
    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });
    if (!receiverAccount) {
      throw ApiError.notFound('Receiver account not found');
    }

    // Cannot schedule to self
    if (senderAccount.accountNumber === receiverAccountNumber) {
      throw ApiError.badRequest('Cannot schedule transfer to your own account');
    }

    // Validate scheduled date is in future
    const scheduleDateTime = new Date(scheduledDate);
    if (scheduleDateTime <= new Date()) {
      throw ApiError.badRequest('Scheduled date must be in the future');
    }

    // Get receiver user
    const receiverUser = await User.findById(receiverAccount.userId);

    // Create scheduled transaction
    const scheduled = await ScheduledTransaction.create({
      userId: user._id,
      senderAccount: senderAccount.accountNumber,
      receiverAccount: receiverAccountNumber,
      receiverUserId: receiverAccount.userId,
      amount,
      scheduledDate: scheduleDateTime,
      reference: reference || generateReference(),
      description,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      status: SCHEDULED_STATUS.PENDING
    });

    return {
      id: scheduled._id,
      senderAccount: scheduled.senderAccount,
      receiverAccount: scheduled.receiverAccount,
      receiverName: receiverUser?.name || 'Unknown',
      amount: scheduled.amount,
      scheduledDate: scheduled.scheduledDate,
      reference: scheduled.reference,
      description: scheduled.description,
      isRecurring: scheduled.isRecurring,
      recurringFrequency: scheduled.recurringFrequency,
      status: scheduled.status,
      createdAt: scheduled.createdAt
    };
  }

  /**
   * Get scheduled transactions for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object} Scheduled transactions and pagination
   */
  async getScheduledTransactions(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const total = await ScheduledTransaction.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const scheduled = await ScheduledTransaction.find(query)
      .sort({ scheduledDate: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('receiverUserId', 'name email');

    const formattedScheduled = scheduled.map(s => ({
      id: s._id,
      senderAccount: s.senderAccount,
      receiverAccount: s.receiverAccount,
      receiverName: s.receiverUserId?.name || 'Unknown',
      amount: s.amount,
      scheduledDate: s.scheduledDate,
      reference: s.reference,
      description: s.description,
      isRecurring: s.isRecurring,
      recurringFrequency: s.recurringFrequency,
      status: s.status,
      failureReason: s.failureReason,
      executedAt: s.executedAt,
      createdAt: s.createdAt
    }));

    return {
      scheduledTransactions: formattedScheduled,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages
      }
    };
  }

  /**
   * Get single scheduled transaction
   * @param {string} id - Scheduled transaction ID
   * @param {string} userId - User ID
   * @returns {Object} Scheduled transaction details
   */
  async getScheduledById(id, userId) {
    const scheduled = await ScheduledTransaction.findOne({ _id: id, userId })
      .populate('receiverUserId', 'name email');

    if (!scheduled) {
      throw ApiError.notFound('Scheduled transaction not found');
    }

    return {
      id: scheduled._id,
      senderAccount: scheduled.senderAccount,
      receiverAccount: scheduled.receiverAccount,
      receiverName: scheduled.receiverUserId?.name || 'Unknown',
      amount: scheduled.amount,
      scheduledDate: scheduled.scheduledDate,
      reference: scheduled.reference,
      description: scheduled.description,
      isRecurring: scheduled.isRecurring,
      recurringFrequency: scheduled.recurringFrequency,
      status: scheduled.status,
      failureReason: scheduled.failureReason,
      executedAt: scheduled.executedAt,
      executedTransactionId: scheduled.executedTransactionId,
      retryCount: scheduled.retryCount,
      createdAt: scheduled.createdAt
    };
  }

  /**
   * Cancel a scheduled transaction
   * @param {string} id - Scheduled transaction ID
   * @param {string} userId - User ID
   * @returns {Object} Cancellation confirmation
   */
  async cancelScheduledTransaction(id, userId) {
    const scheduled = await ScheduledTransaction.findOne({ _id: id, userId });

    if (!scheduled) {
      throw ApiError.notFound('Scheduled transaction not found');
    }

    if (scheduled.status !== SCHEDULED_STATUS.PENDING) {
      throw ApiError.badRequest(`Cannot cancel a ${scheduled.status} transaction`);
    }

    scheduled.status = SCHEDULED_STATUS.CANCELLED;
    await scheduled.save();

    return {
      message: 'Scheduled transaction cancelled successfully',
      id: scheduled._id,
      status: scheduled.status
    };
  }

  /**
   * Execute a scheduled transaction
   * Called by cron job when scheduled time arrives
   * @param {Object} scheduled - Scheduled transaction document
   * @returns {Object} Execution result
   */
  async executeScheduledTransaction(scheduled) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get sender account
      const senderAccount = await Account.findOne({ accountNumber: scheduled.senderAccount });
      if (!senderAccount) {
        throw new Error('Sender account not found');
      }

      // Check sender account is active
      if (senderAccount.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new Error('Sender account is not active');
      }

      // Check balance
      if (senderAccount.balance < scheduled.amount) {
        throw new Error('Insufficient balance');
      }

      // Check daily limit
      const { LIMITS } = require('../config/constants');
      senderAccount.resetDailyLimitIfNeeded();
      if (senderAccount.dailyTransferTotal + scheduled.amount > LIMITS.DAILY_TRANSFER_LIMIT) {
        throw new Error(`Daily transfer limit of ${LIMITS.DAILY_TRANSFER_LIMIT} exceeded`);
      }

      // Get receiver account
      const receiverAccount = await Account.findOne({ accountNumber: scheduled.receiverAccount });
      if (!receiverAccount) {
        throw new Error('Receiver account not found');
      }

      // Check receiver account is active
      if (receiverAccount.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new Error('Receiver account is not active');
      }

      // Execute transfer
      const transactionId = generateTransactionId();

      // Deduct from sender
      senderAccount.balance -= scheduled.amount;
      senderAccount.dailyTransferTotal += scheduled.amount;
      senderAccount.lastTransferDate = new Date();
      await senderAccount.save({ session });

      // Add to receiver
      receiverAccount.balance += scheduled.amount;
      await receiverAccount.save({ session });

      // Create transaction record
      const transaction = await Transaction.create([{
        transactionId,
        senderAccount: scheduled.senderAccount,
        receiverAccount: scheduled.receiverAccount,
        senderUserId: scheduled.userId,
        receiverUserId: scheduled.receiverUserId,
        amount: scheduled.amount,
        type: TRANSACTION_TYPES.TRANSFER,
        status: TRANSACTION_STATUS.COMPLETED,
        reference: scheduled.reference,
        description: scheduled.description || 'Scheduled transfer',
        balanceAfterTransaction: {
          sender: senderAccount.balance,
          receiver: receiverAccount.balance
        },
        completedAt: new Date()
      }], { session });

      // Mark scheduled as completed
      scheduled.markCompleted(transactionId);
      await scheduled.save({ session });

      await session.commitTransaction();

      console.log(`✅ Scheduled transaction ${scheduled._id} executed successfully`);

      return {
        success: true,
        transactionId,
        scheduledId: scheduled._id
      };

    } catch (error) {
      await session.abortTransaction();

      // Mark as failed
      scheduled.markFailed(error.message);
      await scheduled.save();

      console.error(`❌ Scheduled transaction ${scheduled._id} failed:`, error.message);

      return {
        success: false,
        error: error.message,
        scheduledId: scheduled._id
      };

    } finally {
      session.endSession();
    }
  }

  /**
   * Get all pending scheduled transactions that are due
   * @returns {Array} Due scheduled transactions
   */
  async getDueTransactions() {
    return ScheduledTransaction.find({
      status: SCHEDULED_STATUS.PENDING,
      scheduledDate: { $lte: new Date() }
    });
  }
}

module.exports = new ScheduledService();
