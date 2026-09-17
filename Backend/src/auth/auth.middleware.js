const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const AppError = require('../errors/AppError');

// ============================================
// Auth Middleware
// ============================================
// Middleware for protecting routes and validating tokens
// ============================================

/**
 * Verify Access Token Middleware
 * Extracts and verifies JWT from Authorization header
 * Attaches user data to request object if valid
 * @middleware
 */
const verifyAccessTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Authorization header missing', 401, 'AUTHENTICATION_REQUIRED');
    }

    // Extract token from "Bearer token" format
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      throw new AppError('Invalid authorization header format. Use: Bearer <token>', 401, 'INVALID_ACCESS_TOKEN');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user data to request
    req.user = decoded;

    return next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }

    if (error.message.includes('expired')) {
      return next(new AppError('Access token expired', 401, 'TOKEN_EXPIRED'));
    }

    return next(new AppError('Invalid access token', 401, 'INVALID_ACCESS_TOKEN'));
  }
};

/**
 * Extract Refresh Token from Cookies Middleware
 * Extracts refresh token from cookies and attaches to request
 * @middleware
 */
const extractRefreshTokenFromCookie = (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token not found in cookies', 401, 'REFRESH_TOKEN_INVALID');
    }

    // Attach refresh token to request
    req.refreshToken = refreshToken;

    return next();
  } catch (error) {
    return next(error.isOperational
      ? error
      : new AppError('Failed to extract refresh token', 401, 'REFRESH_TOKEN_INVALID'));
  }
};

module.exports = {
  verifyAccessTokenMiddleware,
  extractRefreshTokenFromCookie,
};
