require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectToSupabase, disconnectFromSupabase } = require('./config/supabase');
const { registerJobs } = require('./jobs');
const { createSocketServer } = require('./config/socket');
const { registerAllSockets } = require('./sockets');
const { registerAuctionEventHandlers } = require('./events/auction.eventHandlers');

// ============================================
// Configuration from Environment Variables
// ============================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    console.log(`ℹ️  Environment: ${NODE_ENV}`);
    console.log(`ℹ️  Server Port: ${PORT}`);

    // ============================================
    // Step 1: Connect to Supabase Database
    // ============================================
    await connectToSupabase();
    registerAuctionEventHandlers();

    // ============================================
    // Step 2: Start Express Server
    // ============================================
    const jobs = registerJobs();
    const server = http.createServer(app);
    const io = createSocketServer(server);
    registerAllSockets(io);

    server.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

    // ============================================
    // Graceful Shutdown Handlers
    // ============================================
    process.on('SIGINT', async () => {
      console.log('\n📛 Received SIGINT, shutting down gracefully...');
      await gracefulShutdown(server, jobs);
    });

    process.on('SIGTERM', async () => {
      console.log('\n📛 Received SIGTERM, shutting down gracefully...');
      await gracefulShutdown(server, jobs);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

/**
 * Gracefully shutdown server and database connections
 * @param {Object} server - Express server instance
 */
async function gracefulShutdown(server, jobs) {
  try {
    console.log('🔄 Closing server...');
    server.close(async () => {
      console.log('✅ Server closed');

      jobs.forEach((job) => job.stop());

      // ============================================
      // Step 3: Disconnect from Supabase Database
      // ============================================
      await disconnectFromSupabase();
      process.exit(0);
    });

    // Force shutdown after 10 seconds if server doesn't close
    setTimeout(() => {
      console.error('❌ Could not close server in time, forcing shutdown');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
    process.exit(1);
  }
}

startServer();
