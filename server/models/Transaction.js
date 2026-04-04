const mongoose = require('mongoose');
const { TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../config/constants');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  senderAccount: {
    type: String,
    required: [true, 'Sender account is required']
  },
  receiverAccount: {
    type: String,
    required: [true, 'Receiver account is required']
  },
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    enum: Object.values(TRANSACTION_TYPES),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TRANSACTION_STATUS),
    default: TRANSACTION_STATUS.PENDING
  },
  reference: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [255, 'Description cannot exceed 255 characters']
  },
  balanceAfterTransaction: {
    sender: { type: Number },
    receiver: { type: Number }
  },
  failureReason: {
    type: String
  },
  completedAt: {
    type: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ senderAccount: 1, createdAt: -1 });
transactionSchema.index({ receiverAccount: 1, createdAt: -1 });
transactionSchema.index({ senderUserId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Compound index for user transaction history
transactionSchema.index({ 
  senderUserId: 1, 
  receiverUserId: 1, 
  createdAt: -1 
});

/**
 * Mark transaction as completed
 */
transactionSchema.methods.markCompleted = function(senderBalance, receiverBalance) {
  this.status = TRANSACTION_STATUS.COMPLETED;
  this.completedAt = new Date();
  this.balanceAfterTransaction = {
    sender: senderBalance,
    receiver: receiverBalance
  };
};

/**
 * Mark transaction as failed
 */
transactionSchema.methods.markFailed = function(reason) {
  this.status = TRANSACTION_STATUS.FAILED;
  this.failureReason = reason;
  this.completedAt = new Date();
};

/**
 * Static method to get user transactions
 */
transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const { page = 1, limit = 10, status, type, startDate, endDate } = options;
  
  const query = {
    $or: [
      { senderUserId: userId },
      { receiverUserId: userId }
    ]
  };

  if (status) query.status = status;
  if (type) query.type = type;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('senderUserId', 'name email')
    .populate('receiverUserId', 'name email');
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
