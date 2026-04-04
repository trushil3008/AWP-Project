/**
 * Application constants
 * Centralized configuration values
 */

module.exports = {
  // User roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin'
  },

  // Account types
  ACCOUNT_TYPES: {
    SAVINGS: 'savings',
    CURRENT: 'current'
  },

  // Account status
  ACCOUNT_STATUS: {
    ACTIVE: 'active',
    FROZEN: 'frozen',
    CLOSED: 'closed'
  },

  // Transaction types
  TRANSACTION_TYPES: {
    CREDIT: 'credit',
    DEBIT: 'debit',
    TRANSFER: 'transfer'
  },

  // Transaction status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },

  // Scheduled transaction status
  SCHEDULED_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // Transaction limits
  LIMITS: {
    MIN_TRANSFER: 1,
    MAX_TRANSFER: 1000000,
    DAILY_TRANSFER_LIMIT: 5000000
  }
};
