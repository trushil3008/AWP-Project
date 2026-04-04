const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const accountRoutes = require('./account.routes');
const transactionRoutes = require('./transaction.routes');
const beneficiaryRoutes = require('./beneficiary.routes');
const scheduledRoutes = require('./scheduled.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');

/**
 * API Routes Index
 * 
 * /api/auth          - Authentication routes
 * /api/account       - Account routes
 * /api/transactions  - Transaction routes
 * /api/beneficiaries - Beneficiary routes
 * /api/scheduled     - Scheduled transaction routes
 * /api/admin         - Admin routes
 * /api/analytics     - Analytics routes
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/scheduled', scheduledRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
