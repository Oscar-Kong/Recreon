// backend/src/middleware/rateLimiter.js
let rateLimit, RedisStore, Redis;

try {
  rateLimit = require('express-rate-limit');
  RedisStore = require('rate-limit-redis');
  Redis = require('redis');
} catch (error) {
  console.warn('⚠️ Rate limiting packages not installed. Install with: npm install express-rate-limit rate-limit-redis redis');
  console.warn('⚠️ Rate limiting will be disabled until packages are installed.');
}

/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting requests per IP/user.
 * Uses Redis for distributed rate limiting across multiple instances.
 */

// Create Redis client if REDIS_URL is available
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = Redis.createClient({
    url: process.env.REDIS_URL,
    legacyMode: false,
  });
  
  redisClient.connect().catch((err) => {
    console.error('❌ Redis connection error for rate limiter:', err);
    redisClient = null;
  });
}

/**
 * Dummy middleware if rate limiting isn't available
 */
const dummyLimiter = (req, res, next) => next();

/**
 * Auth Rate Limiter - Strict limits for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit ? rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window per IP
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Use Redis if available, otherwise use memory store
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }) : undefined,
  // Key generator - use IP + user agent for better accuracy
  keyGenerator: (req) => {
    return req.ip + ':' + (req.headers['user-agent'] || 'unknown');
  },
  // Skip successful requests (only count failed attempts)
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for auth: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please wait 15 minutes before trying again',
      retryAfter: 900, // seconds
    });
  },
}) : dummyLimiter;

/**
 * Password Reset Limiter - Prevent password reset spam
 */
const passwordResetLimiter = rateLimit ? rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    error: 'Too many password reset attempts. Please try again in 1 hour.',
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:reset:',
  }) : undefined,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    console.warn(`⚠️ Password reset rate limit exceeded: ${req.ip}`);
    res.status(429).json({
      error: 'Too many password reset requests',
      message: 'Please wait 1 hour before requesting another reset',
      retryAfter: 3600,
    });
  },
}) : dummyLimiter;

/**
 * API Rate Limiter - General API protection
 * More lenient for regular API usage
 */
const apiLimiter = rateLimit ? rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }) : undefined,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
  handler: (req, res) => {
    console.warn(`⚠️ API rate limit exceeded: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please wait a moment before making more requests',
      retryAfter: 60,
    });
  },
}) : dummyLimiter;

/**
 * Message Rate Limiter - Prevent message spam
 */
const messageLimiter = rateLimit ? rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    error: 'Too many messages. Please slow down.',
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:msg:',
  }) : undefined,
  keyGenerator: (req) => `user:${req.user?.id || req.ip}`,
  handler: (req, res) => {
    console.warn(`⚠️ Message rate limit exceeded: User ${req.user?.id}`);
    res.status(429).json({
      error: 'Sending messages too quickly',
      message: 'Please wait a moment before sending more messages',
      retryAfter: 60,
    });
  },
}) : dummyLimiter;

/**
 * Event Creation Limiter - Prevent event spam
 */
const eventCreationLimiter = rateLimit ? rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 events per hour
  message: {
    error: 'Too many events created. Please try again later.',
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:event:',
  }) : undefined,
  keyGenerator: (req) => `user:${req.user?.id || req.ip}`,
}) : dummyLimiter;

/**
 * Clean up on app shutdown
 */
process.on('SIGTERM', async () => {
  if (redisClient) {
    await redisClient.quit();
  }
});

module.exports = {
  authLimiter: authLimiter || dummyLimiter,
  passwordResetLimiter: passwordResetLimiter || dummyLimiter,
  apiLimiter: apiLimiter || dummyLimiter,
  messageLimiter: messageLimiter || dummyLimiter,
  eventCreationLimiter: eventCreationLimiter || dummyLimiter,
};

