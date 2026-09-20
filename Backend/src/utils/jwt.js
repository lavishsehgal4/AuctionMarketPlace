const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_EXPIRES_IN } = require('../config/constants');

// ============================================
// JWT Utility Functions
// ============================================
// Handles JWT token generation and verification for access tokens
// ============================================

/**
 * Generate Access Token (JWT)
 * Creates a short-lived JWT token with user data
 * Used for authenticating API requests
 * @param {string} userId - User's UUID from database
 * @param {string} email - User's email
 * @param {string} displayName - User's display name
 * @returns {string} Signed JWT access token
 * @throws {Error} If token generation fails
 */
const generateAccessToken = (userId, email, displayName) => {
  try {
    if (!userId || !email) {
      throw new Error('userId and email are required');
    }

    const payload = {
      userId,
      email,
      displayName,
      type: 'access_token',
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
};

/**
 * Verify Access Token (JWT)
 * Validates JWT signature, expiration, and returns decoded payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload containing userId, email, displayName
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (decoded.type !== 'access_token') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw new Error(`Access token verification failed: ${error.message}`);
  }
};

/**
 * Extract Token from Authorization Header
 * Extracts JWT token from Bearer format in Authorization header
 * Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token without 'Bearer ' prefix, or null if invalid format
 */
const extractTokenFromHeader = (authHeader) => {
  try {
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  } catch (error) {
    throw new Error(`Failed to extract token from header: ${error.message}`);
  }
};

/**
 * Decode JWT Token (without verification)
 * Decodes JWT without checking signature or expiration
 * Use with caution - only for inspection, not authentication
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 * @throws {Error} If token cannot be decoded
 */
const decodeAccessToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new Error('Token is invalid or malformed');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Failed to decode token: ${error.message}`);
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  extractTokenFromHeader,
  decodeAccessToken,
};
