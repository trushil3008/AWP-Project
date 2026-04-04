const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { authenticate, adminOnly, adminValidation } = require('../middlewares');

/**
 * Admin Routes
 * 
 * GET    /api/admin/stats                      - Get dashboard stats
 * GET    /api/admin/users                      - Get all users
 * GET    /api/admin/users/:userId              - Get user by ID
 * PATCH  /api/admin/users/:accountId/freeze    - Freeze account
 * PATCH  /api/admin/users/:accountId/unfreeze  - Unfreeze account
 * GET    /api/admin/transactions               - Get all transactions
 */

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminValidation.getUsers, adminController.getUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch(
  '/users/:accountId/freeze',
  adminValidation.freezeAccount,
  adminController.freezeAccount
);
router.patch(
  '/users/:accountId/unfreeze',
  adminValidation.freezeAccount,
  adminController.unfreezeAccount
);

// Transaction monitoring
router.get('/transactions', adminController.getAllTransactions);

module.exports = router;
