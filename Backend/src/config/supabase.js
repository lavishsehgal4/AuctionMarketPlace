const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../generated/prisma');
const { Pool } = require('pg');

// ============================================
// Supabase Database Connection Configuration
// ============================================

let prismaInstance = null;
let poolInstance = null;

/**
 * Connect to Supabase PostgreSQL database
 * Initializes connection pool and Prisma Client
 * @returns {Promise<Object>} Prisma client instance
 */
async function connectToSupabase() {
  try {
    console.log('🔄 Connecting to Supabase database...');

    // Initialize PostgreSQL connection pool
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Max connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await poolInstance.connect();
    console.log('✅ PostgreSQL pool connected successfully');
    client.release();

    // Initialize Prisma Client with PostgreSQL adapter
    const adapter = new PrismaPg(poolInstance);
    prismaInstance = new PrismaClient({ adapter });

    // Test Prisma connection
    await prismaInstance.$queryRaw`SELECT 1`;
    console.log('✅ Prisma Client connected to Supabase successfully');

    return prismaInstance;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    throw error;
  }
}

/**
 * Disconnect from Supabase database
 * Closes Prisma Client and connection pool
 * @returns {Promise<void>}
 */
async function disconnectFromSupabase() {
  try {
    console.log('🔄 Disconnecting from Supabase database...');

    if (prismaInstance) {
      await prismaInstance.$disconnect();
      console.log('✅ Prisma Client disconnected');
      prismaInstance = null;
    }

    if (poolInstance) {
      await poolInstance.end();
      console.log('✅ PostgreSQL pool closed');
      poolInstance = null;
    }

    console.log('✅ Successfully disconnected from Supabase');
  } catch (error) {
    console.error('❌ Error disconnecting from Supabase:', error.message);
    throw error;
  }
}

/**
 * Get the active Prisma Client instance
 * @returns {Object} Prisma client instance
 */
function getPrismaClient() {
  if (!prismaInstance) {
    throw new Error('Prisma Client is not initialized. Call connectToSupabase() first.');
  }
  return prismaInstance;
}

module.exports = {
  connectToSupabase,
  disconnectFromSupabase,
  getPrismaClient,
};
