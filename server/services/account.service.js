const { Account, User } = require('../models');
const { ApiError } = require('../utils');
const { ACCOUNT_STATUS } = require('../config/constants');

/**
 * Account Service
 * Handles account-related business logic
 */
class AccountService {
  /**
   * Get account details by user ID
   * @param {string} userId - User ID
   * @returns {Object} Account details
   */
  async getAccountByUserId(userId) {
    const account = await Account.findOne({ userId }).populate('userId', 'name email');
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    return {
      id: account._id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      status: account.status,
      currency: account.currency,
      createdAt: account.createdAt,
      user: {
        name: account.userId.name,
        email: account.userId.email
      }
    };
  }

  /**
   * Get account by account number
   * @param {string} accountNumber - Account number
   * @returns {Object} Account details
   */
  async getAccountByNumber(accountNumber) {
    const account = await Account.findOne({ accountNumber }).populate('userId', 'name email');
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    return account;
  }

  /**
   * Get account balance
   * @param {string} userId - User ID
   * @returns {Object} Balance info
   */
  async getBalance(userId) {
    const account = await Account.findOne({ userId });
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    return {
      balance: account.balance,
      currency: account.currency,
      status: account.status,
      lastUpdated: account.updatedAt
    };
  }

  /**
   * Check if account exists and is active
   * @param {string} accountNumber - Account number
   * @returns {Object} Account if valid
   */
  async validateAccount(accountNumber) {
    const account = await Account.findOne({ accountNumber });
    
    if (!account) {
      throw ApiError.notFound('Account does not exist');
    }

    if (account.status !== ACCOUNT_STATUS.ACTIVE) {
      throw ApiError.forbidden(`Account is ${account.status}`);
    }

    return account;
  }

  /**
   * Update account balance
   * @param {string} accountNumber - Account number
   * @param {number} amount - Amount to add (negative for deduction)
   * @param {Object} session - MongoDB session for transaction
   * @returns {Object} Updated account
   */
  async updateBalance(accountNumber, amount, session = null) {
    const options = session ? { session } : {};
    
    const account = await Account.findOne({ accountNumber });
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    const newBalance = account.balance + amount;
    
    if (newBalance < 0) {
      throw ApiError.badRequest('Insufficient balance');
    }

    account.balance = newBalance;
    await account.save(options);

    return account;
  }

  /**
   * Freeze account
   * @param {string} accountId - Account ID
   * @returns {Object} Updated account
   */
  async freezeAccount(accountId) {
    const account = await Account.findById(accountId);
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    if (account.status === ACCOUNT_STATUS.FROZEN) {
      throw ApiError.badRequest('Account is already frozen');
    }

    account.status = ACCOUNT_STATUS.FROZEN;
    await account.save();

    return account;
  }

  /**
   * Unfreeze account
   * @param {string} accountId - Account ID
   * @returns {Object} Updated account
   */
  async unfreezeAccount(accountId) {
    const account = await Account.findById(accountId);
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    if (account.status !== ACCOUNT_STATUS.FROZEN) {
      throw ApiError.badRequest('Account is not frozen');
    }

    account.status = ACCOUNT_STATUS.ACTIVE;
    await account.save();

    return account;
  }

  /**
   * Get account statistics
   * @param {string} userId - User ID
   * @returns {Object} Account stats
   */
  async getAccountStats(userId) {
    const account = await Account.findOne({ userId });
    
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    return {
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      status: account.status,
      currency: account.currency,
      dailyTransferTotal: account.dailyTransferTotal,
      createdAt: account.createdAt
    };
  }
}

module.exports = new AccountService();
