const authService = require('./auth.service');
const accountService = require('./account.service');
const transactionService = require('./transaction.service');
const beneficiaryService = require('./beneficiary.service');
const scheduledService = require('./scheduled.service');
const adminService = require('./admin.service');
const analyticsService = require('./analytics.service');

module.exports = {
  authService,
  accountService,
  transactionService,
  beneficiaryService,
  scheduledService,
  adminService,
  analyticsService
};
