const mongoose = require('mongoose');
const { ACCOUNT_TYPES, ACCOUNT_STATUS } = require('../config/constants');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // One account per user
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    minlength: 10,
    maxlength: 10
  },
  accountType: {
    type: String,
    enum: Object.values(ACCOUNT_TYPES),
    default: ACCOUNT_TYPES.SAVINGS
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  status: {
    type: String,
    enum: Object.values(ACCOUNT_STATUS),
    default: ACCOUNT_STATUS.ACTIVE
  },
  currency: {
    type: String,
    default: 'INR'
  },
  dailyTransferTotal: {
    type: Number,
    default: 0
  },
  lastTransferDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
accountSchema.index({ status: 1 });

// Virtual populate - get account owner
accountSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

/**
 * Check if account is active and can perform transactions
 * @returns {boolean}
 */
accountSchema.methods.isActive = function() {
  return this.status === ACCOUNT_STATUS.ACTIVE;
};

/**
 * Check if account has sufficient balance
 * @param {number} amount - Amount to check
 * @returns {boolean}
 */
accountSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount;
};

/**
 * Reset daily transfer total if new day
 */
accountSchema.methods.resetDailyLimitIfNeeded = function() {
  const today = new Date().toDateString();
  const lastTransfer = this.lastTransferDate ? this.lastTransferDate.toDateString() : null;
  
  if (today !== lastTransfer) {
    this.dailyTransferTotal = 0;
  }
};

/**
 * Static method to find account by account number
 */
accountSchema.statics.findByAccountNumber = function(accountNumber) {
  return this.findOne({ accountNumber });
};

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
