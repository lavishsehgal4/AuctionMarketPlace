const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');

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
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing',
      });
    }

    // Extract token from "Bearer token" format
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    // Check if it's a token expiration error
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid access token',
    });
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
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found in cookies',
      });
    }

    // Attach refresh token to request
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Failed to extract refresh token',
    });
  }
};

module.exports = {
  verifyAccessTokenMiddleware,
  extractRefreshTokenFromCookie,
};
