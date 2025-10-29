// backend/src/utils/tokenManager.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Token Manager
 * 
 * Handles JWT access tokens and refresh tokens.
 * Implements secure token generation and validation.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || JWT_SECRET + '-refresh';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// In-memory store for refresh tokens (use Redis in production)
// Structure: { userId: Set of refresh tokens }
const refreshTokenStore = new Map();

/**
 * Generate Access Token
 * Short-lived token for API authentication
 */
function generateAccessToken(userId, email) {
  return jwt.sign(
    {
      userId,
      email,
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'recreon-api',
      audience: 'recreon-app',
    }
  );
}

/**
 * Generate Refresh Token
 * Long-lived token for getting new access tokens
 */
function generateRefreshToken(userId, email) {
  const tokenId = crypto.randomBytes(32).toString('hex');
  
  const token = jwt.sign(
    {
      userId,
      email,
      tokenId,
      type: 'refresh',
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'recreon-api',
      audience: 'recreon-app',
    }
  );

  // Store refresh token
  if (!refreshTokenStore.has(userId)) {
    refreshTokenStore.set(userId, new Set());
  }
  refreshTokenStore.get(userId).add(tokenId);

  return token;
}

/**
 * Generate Token Pair
 * Returns both access and refresh tokens
 */
function generateTokenPair(userId, email) {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
    expiresIn: 900, // 15 minutes in seconds
  };
}

/**
 * Verify Access Token
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'recreon-api',
      audience: 'recreon-app',
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('ACCESS_TOKEN_EXPIRED');
    }
    throw new Error('INVALID_TOKEN');
  }
}

/**
 * Verify Refresh Token
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, {
      issuer: 'recreon-api',
      audience: 'recreon-app',
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if token exists in store
    const userTokens = refreshTokenStore.get(decoded.userId);
    if (!userTokens || !userTokens.has(decoded.tokenId)) {
      throw new Error('REFRESH_TOKEN_REVOKED');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error.message === 'REFRESH_TOKEN_REVOKED') {
      throw error;
    }
    throw new Error('INVALID_REFRESH_TOKEN');
  }
}

/**
 * Revoke Refresh Token
 * Used for logout or security purposes
 */
function revokeRefreshToken(userId, tokenId) {
  const userTokens = refreshTokenStore.get(userId);
  if (userTokens) {
    userTokens.delete(tokenId);
    if (userTokens.size === 0) {
      refreshTokenStore.delete(userId);
    }
  }
}

/**
 * Revoke All User Tokens
 * Used when user changes password or for security
 */
function revokeAllUserTokens(userId) {
  refreshTokenStore.delete(userId);
}

/**
 * Get Active Tokens Count
 * Returns number of active refresh tokens for a user
 */
function getActiveTokensCount(userId) {
  const userTokens = refreshTokenStore.get(userId);
  return userTokens ? userTokens.size : 0;
}

/**
 * Decode Token Without Verification
 * Useful for getting user info from expired tokens
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getActiveTokensCount,
  decodeToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};

