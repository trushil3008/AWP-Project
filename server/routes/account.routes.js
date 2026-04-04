const express = require('express');
const router = express.Router();
const { accountController } = require('../controllers');
const { authenticate } = require('../middlewares');

/**
 * Account Routes
 * 
 * GET    /api/account                      - Get account details
 * GET    /api/account/balance              - Get balance only
 * GET    /api/account/stats                - Get account statistics
 * GET    /api/account/verify/:accountNumber - Verify if account exists
 */

// All routes require authentication
router.use(authenticate);

router.get('/', accountController.getAccount);
router.get('/balance', accountController.getBalance);
router.get('/stats', accountController.getAccountStats);
router.get('/verify/:accountNumber', accountController.verifyAccount);

module.exports = router;
