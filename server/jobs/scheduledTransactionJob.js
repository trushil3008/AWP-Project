const cron = require('node-cron');
const { scheduledService } = require('../services');

/**
 * Scheduled Transaction Job
 * Runs every minute to check for due scheduled transactions
 */

class ScheduledTransactionJob {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  /**
   * Start the cron job
   */
  start() {
    // Run every minute
    this.job = cron.schedule('* * * * *', async () => {
      await this.execute();
    });

    console.log('⏰ Scheduled transaction job started');
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      console.log('⏰ Scheduled transaction job stopped');
    }
  }

  /**
   * Execute the job
   */
  async execute() {
    // Prevent concurrent execution
    if (this.isRunning) {
      console.log('⏰ Job already running, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      // Get all due transactions
      const dueTransactions = await scheduledService.getDueTransactions();

      if (dueTransactions.length === 0) {
        this.isRunning = false;
        return;
      }

      console.log(`⏰ Found ${dueTransactions.length} due scheduled transaction(s)`);

      // Process each transaction
      for (const scheduled of dueTransactions) {
        try {
          const result = await scheduledService.executeScheduledTransaction(scheduled);
          
          if (result.success) {
            console.log(`✅ Executed scheduled transaction ${scheduled._id}`);
          } else {
            console.log(`❌ Failed scheduled transaction ${scheduled._id}: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ Error processing scheduled transaction ${scheduled._id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Scheduled job error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger job execution
   */
  async runManually() {
    console.log('⏰ Manual job execution triggered');
    await this.execute();
  }
}

// Export singleton instance
module.exports = new ScheduledTransactionJob();
