const scheduledTransactionJob = require('./scheduledTransactionJob');

/**
 * Initialize all cron jobs
 */
const initializeJobs = () => {
  console.log('🚀 Initializing cron jobs...');
  
  // Start scheduled transaction job
  scheduledTransactionJob.start();
};

/**
 * Stop all cron jobs
 */
const stopJobs = () => {
  console.log('🛑 Stopping cron jobs...');
  
  scheduledTransactionJob.stop();
};

module.exports = {
  initializeJobs,
  stopJobs,
  scheduledTransactionJob
};
