const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  beneficiaryAccountNumber: {
    type: String,
    required: [true, 'Beneficiary account number is required'],
    minlength: 10,
    maxlength: 10
  },
  beneficiaryUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Beneficiary name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [30, 'Nickname cannot exceed 30 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  transferCount: {
    type: Number,
    default: 0
  },
  lastTransferAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure unique beneficiary per user
beneficiarySchema.index({ userId: 1, beneficiaryAccountNumber: 1 }, { unique: true });
beneficiarySchema.index({ userId: 1, isFavorite: -1, transferCount: -1 });

/**
 * Update transfer stats when a transfer is made
 */
beneficiarySchema.methods.recordTransfer = async function() {
  this.transferCount += 1;
  this.lastTransferAt = new Date();
  await this.save();
};

/**
 * Static method to get user's beneficiaries sorted by usage
 */
beneficiarySchema.statics.getUserBeneficiaries = function(userId) {
  return this.find({ userId })
    .sort({ isFavorite: -1, transferCount: -1, createdAt: -1 })
    .populate('beneficiaryUserId', 'name email');
};

/**
 * Static method to check if beneficiary exists
 */
beneficiarySchema.statics.exists = async function(userId, beneficiaryAccountNumber) {
  const count = await this.countDocuments({ userId, beneficiaryAccountNumber });
  return count > 0;
};

const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);

module.exports = Beneficiary;
