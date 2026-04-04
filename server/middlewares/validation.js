const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../utils');
const { LIMITS } = require('../config/constants');

/**
 * Validation result handler
 * Checks for validation errors and returns appropriate response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Auth validation rules
 */
const authValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number'),
    body('confirmPassword')
      .notEmpty().withMessage('Please confirm your password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
    validate
  ],
  
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    validate
  ]
};

/**
 * Transaction validation rules
 */
const transactionValidation = {
  transfer: [
    body('receiverAccount')
      .trim()
      .notEmpty().withMessage('Receiver account number is required')
      .isLength({ min: 10, max: 10 }).withMessage('Invalid account number'),
    body('amount')
      .notEmpty().withMessage('Amount is required')
      .isFloat({ min: LIMITS.MIN_TRANSFER, max: LIMITS.MAX_TRANSFER })
      .withMessage(`Amount must be between ${LIMITS.MIN_TRANSFER} and ${LIMITS.MAX_TRANSFER}`),
    body('reference')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Reference cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Description cannot exceed 255 characters'),
    validate
  ],
  
  history: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
    query('type')
      .optional()
      .isIn(['credit', 'debit', 'transfer']).withMessage('Invalid type'),
    validate
  ]
};

/**
 * Beneficiary validation rules
 */
const beneficiaryValidation = {
  add: [
    body('beneficiaryAccountNumber')
      .trim()
      .notEmpty().withMessage('Beneficiary account number is required')
      .isLength({ min: 10, max: 10 }).withMessage('Invalid account number'),
    body('name')
      .trim()
      .notEmpty().withMessage('Beneficiary name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('nickname')
      .optional()
      .trim()
      .isLength({ max: 30 }).withMessage('Nickname cannot exceed 30 characters'),
    validate
  ],
  
  delete: [
    param('id')
      .notEmpty().withMessage('Beneficiary ID is required')
      .isMongoId().withMessage('Invalid beneficiary ID'),
    validate
  ]
};

/**
 * Scheduled transaction validation rules
 */
const scheduledValidation = {
  create: [
    body('receiverAccount')
      .trim()
      .notEmpty().withMessage('Receiver account number is required')
      .isLength({ min: 10, max: 10 }).withMessage('Invalid account number'),
    body('amount')
      .notEmpty().withMessage('Amount is required')
      .isFloat({ min: LIMITS.MIN_TRANSFER, max: LIMITS.MAX_TRANSFER })
      .withMessage(`Amount must be between ${LIMITS.MIN_TRANSFER} and ${LIMITS.MAX_TRANSFER}`),
    body('scheduledDate')
      .notEmpty().withMessage('Scheduled date is required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Scheduled date must be in the future');
        }
        return true;
      }),
    body('reference')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Reference cannot exceed 100 characters'),
    validate
  ],
  
  cancel: [
    param('id')
      .notEmpty().withMessage('Scheduled transaction ID is required')
      .isMongoId().withMessage('Invalid ID'),
    validate
  ]
};

/**
 * Admin validation rules
 */
const adminValidation = {
  freezeAccount: [
    param('accountId')
      .notEmpty().withMessage('Account ID is required')
      .isMongoId().withMessage('Invalid account ID'),
    validate
  ],
  
  getUsers: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['active', 'frozen']).withMessage('Invalid status'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Search query too long'),
    validate
  ]
};

module.exports = {
  validate,
  authValidation,
  transactionValidation,
  beneficiaryValidation,
  scheduledValidation,
  adminValidation
};
