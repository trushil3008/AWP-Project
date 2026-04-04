const { authenticate, optionalAuth } = require('./auth');
const { authorize, adminOnly, userOnly, requireActiveAccount, ownerOnly } = require('./role');
const { errorHandler, notFoundHandler, asyncHandler } = require('./error');
const { 
  validate, 
  authValidation, 
  transactionValidation, 
  beneficiaryValidation, 
  scheduledValidation,
  adminValidation 
} = require('./validation');

module.exports = {
  // Auth middleware
  authenticate,
  optionalAuth,
  
  // Role middleware
  authorize,
  adminOnly,
  userOnly,
  requireActiveAccount,
  ownerOnly,
  
  // Error handlers
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Validation
  validate,
  authValidation,
  transactionValidation,
  beneficiaryValidation,
  scheduledValidation,
  adminValidation
};
