// backend/src/config/database.js
const { PrismaClient } = require('@prisma/client');

/**
 * Singleton Prisma Client Instance
 * 
 * This ensures only ONE instance of PrismaClient exists throughout the app.
 * Multiple instances can cause connection pool conflicts and initialization errors.
 */

// Create a global variable to store the Prisma instance
// Using globalThis ensures it persists across hot-reloads in development
const globalForPrisma = globalThis;

// Create or reuse the Prisma Client instance
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] // Show SQL queries in development
    : ['error'], // Only show errors in production
});

// In development, store the instance globally to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handler
// This ensures connections are properly closed when the app stops
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting Prisma Client...');
  await prisma.$disconnect();
});

module.exports = prisma;