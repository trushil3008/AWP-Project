const express = require('express');
const router = express.Router();
const { scheduledController } = require('../controllers');
const { authenticate, requireActiveAccount, scheduledValidation } = require('../middlewares');

/**
 * Scheduled Transaction Routes
 * 
 * POST   /api/scheduled      - Create scheduled transaction
 * GET    /api/scheduled      - Get all scheduled transactions
 * GET    /api/scheduled/:id  - Get single scheduled transaction
 * DELETE /api/scheduled/:id  - Cancel scheduled transaction
 */

// All routes require authentication
router.use(authenticate);

router
  .route('/')
  .post(
    requireActiveAccount,
    scheduledValidation.create,
    scheduledController.createScheduled
  )
  .get(scheduledController.getScheduled);

router
  .route('/:id')
  .get(scheduledController.getScheduledById)
  .delete(scheduledValidation.cancel, scheduledController.cancelScheduled);

module.exports = router;
