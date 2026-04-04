const { User, Account, Transaction } = require('../models');
const { ApiError, emailService, getPagination } = require('../utils');
const { ACCOUNT_STATUS, TRANSACTION_STATUS } = require('../config/constants');

/**
 * Admin Service
 * Handles admin-only operations
 */
class AdminService {
  /**
   * Get all users with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Users and pagination
   */
  async getUsers(options = {}) {
    const { page = 1, limit = 10, search, status } = options;

    const query = { role: 'user' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Get accounts for users
    const userIds = users.map(u => u._id);
    const accounts = await Account.find({ userId: { $in: userIds } });
    const accountMap = {};
    accounts.forEach(acc => {
      accountMap[acc.userId.toString()] = acc;
    });

    // Filter by account status if provided
    let formattedUsers = users.map(user => {
      const account = accountMap[user._id.toString()];
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        account: account ? {
          id: account._id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          status: account.status,
          accountType: account.accountType
        } : null
      };
    });

    // Filter by account status
    if (status) {
      formattedUsers = formattedUsers.filter(u => u.account?.status === status);
    }

    return {
      users: formattedUsers,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: status ? formattedUsers.length : pagination.total,
        totalPages: pagination.totalPages
      }
    };
  }

  /**
   * Get user by ID with account details
   * @param {string} userId - User ID
   * @returns {Object} User details
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const account = await Account.findOne({ userId });

    // Get recent transactions
    let recentTransactions = [];
    if (account) {
      recentTransactions = await Transaction.find({
        $or: [
          { senderAccount: account.accountNumber },
          { receiverAccount: account.accountNumber }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('senderUserId', 'name')
        .populate('receiverUserId', 'name');
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      account: account ? {
        id: account._id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        status: account.status,
        accountType: account.accountType,
        currency: account.currency,
        createdAt: account.createdAt
      } : null,
      recentTransactions: recentTransactions.map(t => ({
        transactionId: t.transactionId,
        amount: t.amount,
        type: t.senderAccount === account?.accountNumber ? 'debit' : 'credit',
        status: t.status,
        createdAt: t.createdAt
      }))
    };
  }

  /**
   * Freeze user account
   * @param {string} accountId - Account ID
   * @returns {Object} Updated account
   */
  async freezeAccount(accountId) {
    const account = await Account.findById(accountId).populate('userId', 'name email');
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    if (account.status === ACCOUNT_STATUS.FROZEN) {
      throw ApiError.badRequest('Account is already frozen');
    }

    account.status = ACCOUNT_STATUS.FROZEN;
    await account.save();

    // Send notification
    emailService.sendAccountFrozenNotification(account.userId);

    return {
      message: 'Account frozen successfully',
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        status: account.status,
        userName: account.userId.name
      }
    };
  }

  /**
   * Unfreeze user account
   * @param {string} accountId - Account ID
   * @returns {Object} Updated account
   */
  async unfreezeAccount(accountId) {
    const account = await Account.findById(accountId).populate('userId', 'name email');
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    if (account.status !== ACCOUNT_STATUS.FROZEN) {
      throw ApiError.badRequest('Account is not frozen');
    }

    account.status = ACCOUNT_STATUS.ACTIVE;
    await account.save();

    // Send notification
    emailService.sendAccountUnfrozenNotification(account.userId);

    return {
      message: 'Account unfrozen successfully',
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        status: account.status,
        userName: account.userId.name
      }
    };
  }

  /**
   * Get all transactions (admin view)
   * @param {Object} options - Query options
   * @returns {Object} Transactions and pagination
   */
  async getAllTransactions(options = {}) {
    const { page = 1, limit = 10, status, type, startDate, endDate, search } = options;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Transaction.countDocuments(query);
    const pagination = getPagination(page, limit, total);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('senderUserId', 'name email')
      .populate('receiverUserId', 'name email');

    return {
      transactions: transactions.map(t => ({
        id: t._id,
        transactionId: t.transactionId,
        senderAccount: t.senderAccount,
        receiverAccount: t.receiverAccount,
        senderName: t.senderUserId?.name || 'Unknown',
        receiverName: t.receiverUserId?.name || 'Unknown',
        amount: t.amount,
        type: t.type,
        status: t.status,
        reference: t.reference,
        createdAt: t.createdAt,
        completedAt: t.completedAt
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages
      }
    };
  }

  /**
   * Get dashboard statistics
   * @returns {Object} Dashboard stats
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      frozenAccounts,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      transactionVolume
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      Account.countDocuments({ status: ACCOUNT_STATUS.FROZEN }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.COMPLETED }),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.PENDING }),
      Transaction.countDocuments({ status: TRANSACTION_STATUS.FAILED }),
      Transaction.aggregate([
        { $match: { status: TRANSACTION_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderUserId', 'name')
      .populate('receiverUserId', 'name');

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayTransactions, todayVolume] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: today }, status: TRANSACTION_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        frozenAccounts
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
        totalVolume: transactionVolume[0]?.total || 0
      },
      today: {
        transactions: todayTransactions,
        volume: todayVolume[0]?.total || 0
      },
      recentTransactions: recentTransactions.map(t => ({
        transactionId: t.transactionId,
        senderName: t.senderUserId?.name || 'Unknown',
        receiverName: t.receiverUserId?.name || 'Unknown',
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt
      }))
    };
  }
}

module.exports = new AdminService();
