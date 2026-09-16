require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log('Query result:', result);
  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
