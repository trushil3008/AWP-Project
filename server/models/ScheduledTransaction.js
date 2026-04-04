const mongoose = require('mongoose');
const { SCHEDULED_STATUS } = require('../config/constants');

const scheduledTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  senderAccount: {
    type: String,
    required: [true, 'Sender account is required']
  },
  receiverAccount: {
    type: String,
    required: [true, 'Receiver account is required']
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(value) {
        // Only validate on creation, not on updates
        if (this.isNew) {
          return value > new Date();
        }
        return true;
      },
      message: 'Scheduled date must be in the future'
    }
  },
  status: {
    type: String,
    enum: Object.values(SCHEDULED_STATUS),
    default: SCHEDULED_STATUS.PENDING
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
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  },
  executedTransactionId: {
    type: String
  },
  failureReason: {
    type: String
  },
  executedAt: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes
scheduledTransactionSchema.index({ userId: 1, status: 1 });
scheduledTransactionSchema.index({ scheduledDate: 1, status: 1 });
scheduledTransactionSchema.index({ status: 1 });

/**
 * Get pending scheduled transactions that are due
 */
scheduledTransactionSchema.statics.getDueTransactions = function() {
  return this.find({
    status: SCHEDULED_STATUS.PENDING,
    scheduledDate: { $lte: new Date() }
  }).populate('userId', 'name email');
};

/**
 * Mark as completed or reschedule if recurring
 */
scheduledTransactionSchema.methods.markCompleted = function(transactionId) {
  this.executedTransactionId = transactionId;
  this.executedAt = new Date();
  
  if (this.isRecurring && this.recurringFrequency) {
    this.reschedule();
  } else {
    this.status = SCHEDULED_STATUS.COMPLETED;
  }
};

/**
 * Reschedule for the next occurrence
 */
scheduledTransactionSchema.methods.reschedule = function() {
  const nextDate = new Date(this.scheduledDate);
  
  switch (this.recurringFrequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      this.status = SCHEDULED_STATUS.COMPLETED;
      return;
  }
  
  this.scheduledDate = nextDate;
  this.status = SCHEDULED_STATUS.PENDING;
  this.retryCount = 0; // Reset retry count for next run
};

/**
 * Mark as failed
 */
scheduledTransactionSchema.methods.markFailed = function(reason) {
  this.retryCount += 1;
  
  if (this.retryCount >= this.maxRetries) {
    this.status = SCHEDULED_STATUS.FAILED;
  }
  
  this.failureReason = reason;
};

/**
 * Cancel scheduled transaction
 */
scheduledTransactionSchema.methods.cancel = function() {
  if (this.status === SCHEDULED_STATUS.PENDING) {
    this.status = SCHEDULED_STATUS.CANCELLED;
    return true;
  }
  return false;
};

const ScheduledTransaction = mongoose.model('ScheduledTransaction', scheduledTransactionSchema);

module.exports = ScheduledTransaction;
