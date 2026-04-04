/**
 * Server Entry Point
 * Online Banking System Backend
 */

// Load environment variables first
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { initializeJobs, stopJobs } = require('./jobs');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
let isShuttingDown = false;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connected');

    // Initialize cron jobs
    initializeJobs();
    console.log('✅ Cron jobs initialized');

    // Start Express server
    const server = app.listen(PORT, () => {
      const boxWidth = 60;
      const logLine = (label, value) => {
        const content = `   ${label}: ${value}`;
        return `║ ${content.padEnd(boxWidth - 4)} ║`;
      };

      const header = `║   🏦 Online Banking API Server`;
      
      console.log(`
╔${'═'.repeat(boxWidth - 2)}╗
║${' '.repeat(boxWidth - 2)}║
${header.padEnd(boxWidth - 1)}║
║${' '.repeat(boxWidth - 2)}║
${logLine('Environment', process.env.NODE_ENV)}
${logLine('Port', PORT)}
${logLine('URL', `http://localhost:${PORT}`)}
║${' '.repeat(boxWidth - 2)}║
${logLine('API Health', `http://localhost:${PORT}/api/health`)}
║${' '.repeat(boxWidth - 2)}║
╚${'═'.repeat(boxWidth - 2)}╝
      `);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal, exitCode = 0) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n${signal} received. Shutting down gracefully...`);

      const forceShutdownTimer = setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
      
      // Stop cron jobs
      stopJobs();

      try {
        // Close HTTP server first if it started listening
        if (server.listening) {
          await new Promise((resolve, reject) => {
            server.close((err) => {
              if (err) return reject(err);
              resolve();
            });
          });
          console.log('✅ HTTP server closed');
        }

        // Close database connection (Mongoose 8 async API)
        await mongoose.connection.close(false);
        console.log('✅ MongoDB connection closed');
      } catch (error) {
        console.error('⚠️ Error during graceful shutdown:', error);
        exitCode = 1;
      }

      clearTimeout(forceShutdownTimer);
      process.exit(exitCode);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));
    process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION', 1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION', 1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
