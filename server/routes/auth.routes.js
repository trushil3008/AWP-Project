const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate, authValidation } = require('../middlewares');

/**
 * Auth Routes
 * 
 * POST   /api/auth/register       - Register new user
 * POST   /api/auth/login          - Login user
 * POST   /api/auth/logout         - Logout user
 * GET    /api/auth/me             - Get current user
 * PATCH  /api/auth/update-password - Update password
 */

// Public routes
router.post('/register', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
