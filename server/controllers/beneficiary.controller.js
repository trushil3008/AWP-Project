const { beneficiaryService } = require('../services');
const { ApiResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

/**
 * Beneficiary Controller
 * Handles beneficiary management endpoints
 */

/**
 * @desc    Add a new beneficiary
 * @route   POST /api/beneficiaries
 * @access  Private
 */
const addBeneficiary = asyncHandler(async (req, res) => {
  const { beneficiaryAccountNumber, name, nickname } = req.body;

  const beneficiary = await beneficiaryService.addBeneficiary(
    req.user._id,
    { beneficiaryAccountNumber, name, nickname }
  );

  return ApiResponse.created(res, beneficiary, 'Beneficiary added successfully');
});

/**
 * @desc    Get all beneficiaries
 * @route   GET /api/beneficiaries
 * @access  Private
 */
const getBeneficiaries = asyncHandler(async (req, res) => {
  const beneficiaries = await beneficiaryService.getBeneficiaries(req.user._id);
  return ApiResponse.success(res, beneficiaries, 'Beneficiaries retrieved successfully');
});

/**
 * @desc    Get single beneficiary
 * @route   GET /api/beneficiaries/:id
 * @access  Private
 */
const getBeneficiary = asyncHandler(async (req, res) => {
  const beneficiary = await beneficiaryService.getBeneficiaryById(
    req.params.id,
    req.user._id
  );
  return ApiResponse.success(res, beneficiary, 'Beneficiary retrieved successfully');
});

/**
 * @desc    Update beneficiary
 * @route   PATCH /api/beneficiaries/:id
 * @access  Private
 */
const updateBeneficiary = asyncHandler(async (req, res) => {
  const { name, nickname, isFavorite } = req.body;

  const beneficiary = await beneficiaryService.updateBeneficiary(
    req.params.id,
    req.user._id,
    { name, nickname, isFavorite }
  );

  return ApiResponse.success(res, beneficiary, 'Beneficiary updated successfully');
});

/**
 * @desc    Delete beneficiary
 * @route   DELETE /api/beneficiaries/:id
 * @access  Private
 */
const deleteBeneficiary = asyncHandler(async (req, res) => {
  const result = await beneficiaryService.deleteBeneficiary(
    req.params.id,
    req.user._id
  );
  return ApiResponse.success(res, result, 'Beneficiary deleted successfully');
});

/**
 * @desc    Toggle beneficiary favorite status
 * @route   PATCH /api/beneficiaries/:id/favorite
 * @access  Private
 */
const toggleFavorite = asyncHandler(async (req, res) => {
  const result = await beneficiaryService.toggleFavorite(
    req.params.id,
    req.user._id
  );
  return ApiResponse.success(res, result, 'Favorite status updated');
});

module.exports = {
  addBeneficiary,
  getBeneficiaries,
  getBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  toggleFavorite
};
