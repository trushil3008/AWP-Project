const express = require('express');
const router = express.Router();
const { beneficiaryController } = require('../controllers');
const { authenticate, beneficiaryValidation } = require('../middlewares');

/**
 * Beneficiary Routes
 * 
 * POST   /api/beneficiaries              - Add beneficiary
 * GET    /api/beneficiaries              - Get all beneficiaries
 * GET    /api/beneficiaries/:id          - Get single beneficiary
 * PATCH  /api/beneficiaries/:id          - Update beneficiary
 * DELETE /api/beneficiaries/:id          - Delete beneficiary
 * PATCH  /api/beneficiaries/:id/favorite - Toggle favorite
 */

// All routes require authentication
router.use(authenticate);

router
  .route('/')
  .post(beneficiaryValidation.add, beneficiaryController.addBeneficiary)
  .get(beneficiaryController.getBeneficiaries);

router
  .route('/:id')
  .get(beneficiaryController.getBeneficiary)
  .patch(beneficiaryController.updateBeneficiary)
  .delete(beneficiaryValidation.delete, beneficiaryController.deleteBeneficiary);

router.patch('/:id/favorite', beneficiaryController.toggleFavorite);

module.exports = router;
