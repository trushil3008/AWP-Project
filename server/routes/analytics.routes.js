const express = require('express');
const router = express.Router();
const { analyticsController } = require('../controllers');
const { authenticate } = require('../middlewares');

/**
 * Analytics Routes
 * 
 * GET    /api/analytics/summary   - Get analytics summary
 * GET    /api/analytics/monthly   - Get monthly statistics
 * GET    /api/analytics/spending  - Get spending breakdown
 * GET    /api/analytics/trend     - Get daily trend
 */

// All routes require authentication
router.use(authenticate);

router.get('/summary', analyticsController.getSummary);
router.get('/monthly', analyticsController.getMonthlyStats);
router.get('/spending', analyticsController.getSpendingBreakdown);
router.get('/trend', analyticsController.getDailyTrend);

module.exports = router;
