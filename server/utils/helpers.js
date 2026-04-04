const crypto = require('crypto');
const Account = require('../models/Account');

/**
 * Generate unique 10-digit account number
 * Format: YYMMDDXXXX (Year, Month, Day, Random 4 digits)
 * @returns {Promise<string>} Unique account number
 */
const generateAccountNumber = async () => {
  let accountNumber;
  let isUnique = false;
  
  while (!isUnique) {
    // Get current date parts
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Generate random 4 digits
    const random = Math.floor(1000 + Math.random() * 9000);
    
    accountNumber = `${year}${month}${day}${random}`;
    
    // Check if account number already exists
    const existingAccount = await Account.findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }
  
  return accountNumber;
};

/**
 * Generate unique transaction ID
 * Format: TXN + timestamp + random string
 * @returns {string} Unique transaction ID
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN${timestamp}${randomPart}`;
};

/**
 * Generate reference number for transactions
 * @returns {string} Reference number
 */
const generateReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REF${timestamp}${randomPart}`;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default INR)
 * @returns {string} Formatted amount
 */
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Mask account number for security
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked account number (e.g., ******7890)
 */
const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const lastFour = accountNumber.slice(-4);
  return `******${lastFour}`;
};

/**
 * Calculate pagination values
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination object
 */
const getPagination = (page = 1, limit = 10, total = 0) => {
  const currentPage = Math.max(1, parseInt(page));
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit)));
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    page: currentPage,
    limit: itemsPerPage,
    total,
    totalPages,
    skip: (currentPage - 1) * itemsPerPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

/**
 * Sanitize user object (remove sensitive fields)
 * @param {Object} user - User object
 * @returns {Object} Sanitized user
 */
const sanitizeUser = (user) => {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate account number format
 * @param {string} accountNumber - Account number to validate
 * @returns {boolean}
 */
const isValidAccountNumber = (accountNumber) => {
  return /^\d{10}$/.test(accountNumber);
};

module.exports = {
  generateAccountNumber,
  generateTransactionId,
  generateReference,
  formatCurrency,
  maskAccountNumber,
  getPagination,
  sanitizeUser,
  isValidEmail,
  isValidAccountNumber
};
