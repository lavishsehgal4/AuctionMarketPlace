require('dotenv').config();
const app = require('./app');
const { connectToSupabase, disconnectFromSupabase } = require('./config/supabase');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // ============================================
    // Step 1: Connect to Supabase Database
    // ============================================
    await connectToSupabase();

    // ============================================
    // Step 2: Start Express Server
    // ============================================
    const server = app.listen(PORT, () => {
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
      await gracefulShutdown(server);
    });

    process.on('SIGTERM', async () => {
      console.log('\n📛 Received SIGTERM, shutting down gracefully...');
      await gracefulShutdown(server);
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
async function gracefulShutdown(server) {
  try {
    console.log('🔄 Closing server...');
    server.close(async () => {
      console.log('✅ Server closed');

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
