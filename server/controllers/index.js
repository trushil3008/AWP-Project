const authController = require('./auth.controller');
const accountController = require('./account.controller');
const transactionController = require('./transaction.controller');
const beneficiaryController = require('./beneficiary.controller');
const scheduledController = require('./scheduled.controller');
const adminController = require('./admin.controller');
const analyticsController = require('./analytics.controller');

module.exports = {
  authController,
  accountController,
  transactionController,
  beneficiaryController,
  scheduledController,
  adminController,
  analyticsController
};
