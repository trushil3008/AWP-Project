const express = require('express');
const router = express.Router();
const { transactionController } = require('../controllers');
const { authenticate, requireActiveAccount, transactionValidation } = require('../middlewares');

/**
 * Transaction Routes
 * 
 * POST   /api/transactions/transfer        - Transfer money
 * GET    /api/transactions                 - Get transaction history
 * GET    /api/transactions/summary         - Get transaction summary
 * GET    /api/transactions/:transactionId  - Get single transaction
 */

// All routes require authentication
router.use(authenticate);

// Transfer requires active account
router.post(
  '/transfer',
  requireActiveAccount,
  transactionValidation.transfer,
  transactionController.transfer
);

// Get transactions with optional filters
router.get('/', transactionValidation.history, transactionController.getTransactions);

// Get summary (must be before :transactionId to avoid conflict)
router.get('/summary', transactionController.getTransactionSummary);

// Get single transaction
router.get('/:transactionId', transactionController.getTransaction);

module.exports = router;
