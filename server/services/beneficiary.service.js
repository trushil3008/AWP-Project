const { Beneficiary, Account, User } = require('../models');
const { ApiError } = require('../utils');

/**
 * Beneficiary Service
 * Handles beneficiary management business logic
 */
class BeneficiaryService {
  /**
   * Add a new beneficiary
   * @param {string} userId - User ID
   * @param {Object} beneficiaryData - Beneficiary details
   * @returns {Object} Created beneficiary
   */
  async addBeneficiary(userId, beneficiaryData) {
    const { beneficiaryAccountNumber, name, nickname } = beneficiaryData;

    // Check if beneficiary account exists
    const account = await Account.findOne({ accountNumber: beneficiaryAccountNumber });
    if (!account) {
      throw ApiError.notFound('Beneficiary account does not exist');
    }

    // Get user's own account
    const userAccount = await Account.findOne({ userId });
    
    // Cannot add self as beneficiary
    if (userAccount && userAccount.accountNumber === beneficiaryAccountNumber) {
      throw ApiError.badRequest('Cannot add your own account as beneficiary');
    }

    // Check for duplicate
    const existingBeneficiary = await Beneficiary.findOne({ 
      userId, 
      beneficiaryAccountNumber 
    });
    
    if (existingBeneficiary) {
      throw ApiError.conflict('Beneficiary already exists');
    }

    // Create beneficiary
    const beneficiary = await Beneficiary.create({
      userId,
      beneficiaryAccountNumber,
      beneficiaryUserId: account.userId,
      name,
      nickname,
      isVerified: true
    });

    // Get beneficiary user details
    const beneficiaryUser = await User.findById(account.userId);

    return {
      id: beneficiary._id,
      accountNumber: beneficiary.beneficiaryAccountNumber,
      name: beneficiary.name,
      nickname: beneficiary.nickname,
      accountHolderName: beneficiaryUser?.name || name,
      isVerified: beneficiary.isVerified,
      isFavorite: beneficiary.isFavorite,
      createdAt: beneficiary.createdAt
    };
  }

  /**
   * Get all beneficiaries for a user
   * @param {string} userId - User ID
   * @returns {Array} List of beneficiaries
   */
  async getBeneficiaries(userId) {
    const beneficiaries = await Beneficiary.find({ userId })
      .sort({ isFavorite: -1, transferCount: -1, createdAt: -1 })
      .populate('beneficiaryUserId', 'name email');

    return beneficiaries.map(b => ({
      id: b._id,
      accountNumber: b.beneficiaryAccountNumber,
      name: b.name,
      nickname: b.nickname,
      accountHolderName: b.beneficiaryUserId?.name || b.name,
      isVerified: b.isVerified,
      isFavorite: b.isFavorite,
      transferCount: b.transferCount,
      lastTransferAt: b.lastTransferAt,
      createdAt: b.createdAt
    }));
  }

  /**
   * Get single beneficiary by ID
   * @param {string} beneficiaryId - Beneficiary ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} Beneficiary details
   */
  async getBeneficiaryById(beneficiaryId, userId) {
    const beneficiary = await Beneficiary.findOne({ 
      _id: beneficiaryId, 
      userId 
    }).populate('beneficiaryUserId', 'name email');

    if (!beneficiary) {
      throw ApiError.notFound('Beneficiary not found');
    }

    return {
      id: beneficiary._id,
      accountNumber: beneficiary.beneficiaryAccountNumber,
      name: beneficiary.name,
      nickname: beneficiary.nickname,
      accountHolderName: beneficiary.beneficiaryUserId?.name || beneficiary.name,
      isVerified: beneficiary.isVerified,
      isFavorite: beneficiary.isFavorite,
      transferCount: beneficiary.transferCount,
      lastTransferAt: beneficiary.lastTransferAt,
      createdAt: beneficiary.createdAt
    };
  }

  /**
   * Update beneficiary
   * @param {string} beneficiaryId - Beneficiary ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated beneficiary
   */
  async updateBeneficiary(beneficiaryId, userId, updateData) {
    const { name, nickname, isFavorite } = updateData;

    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, userId });
    
    if (!beneficiary) {
      throw ApiError.notFound('Beneficiary not found');
    }

    if (name) beneficiary.name = name;
    if (nickname !== undefined) beneficiary.nickname = nickname;
    if (isFavorite !== undefined) beneficiary.isFavorite = isFavorite;

    await beneficiary.save();

    return {
      id: beneficiary._id,
      accountNumber: beneficiary.beneficiaryAccountNumber,
      name: beneficiary.name,
      nickname: beneficiary.nickname,
      isFavorite: beneficiary.isFavorite,
      updatedAt: beneficiary.updatedAt
    };
  }

  /**
   * Delete beneficiary
   * @param {string} beneficiaryId - Beneficiary ID
   * @param {string} userId - User ID
   * @returns {Object} Deletion confirmation
   */
  async deleteBeneficiary(beneficiaryId, userId) {
    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, userId });
    
    if (!beneficiary) {
      throw ApiError.notFound('Beneficiary not found');
    }

    await Beneficiary.deleteOne({ _id: beneficiaryId });

    return {
      message: 'Beneficiary deleted successfully',
      deletedId: beneficiaryId
    };
  }

  /**
   * Toggle favorite status
   * @param {string} beneficiaryId - Beneficiary ID
   * @param {string} userId - User ID
   * @returns {Object} Updated beneficiary
   */
  async toggleFavorite(beneficiaryId, userId) {
    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, userId });
    
    if (!beneficiary) {
      throw ApiError.notFound('Beneficiary not found');
    }

    beneficiary.isFavorite = !beneficiary.isFavorite;
    await beneficiary.save();

    return {
      id: beneficiary._id,
      isFavorite: beneficiary.isFavorite
    };
  }

  /**
   * Record a transfer to beneficiary
   * Updates transfer count and last transfer date
   * @param {string} userId - User ID
   * @param {string} accountNumber - Beneficiary account number
   */
  async recordTransfer(userId, accountNumber) {
    const beneficiary = await Beneficiary.findOne({ 
      userId, 
      beneficiaryAccountNumber: accountNumber 
    });

    if (beneficiary) {
      await beneficiary.recordTransfer();
    }
  }

  /**
   * Check if account is a saved beneficiary
   * @param {string} userId - User ID
   * @param {string} accountNumber - Account number to check
   * @returns {boolean}
   */
  async isBeneficiary(userId, accountNumber) {
    const count = await Beneficiary.countDocuments({ 
      userId, 
      beneficiaryAccountNumber: accountNumber 
    });
    return count > 0;
  }
}

module.exports = new BeneficiaryService();
