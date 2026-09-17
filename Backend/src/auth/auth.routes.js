const express = require('express');
const authController = require('./auth.controller');
const { verifyAccessTokenMiddleware, extractRefreshTokenFromCookie } = require('./auth.middleware');

const router = express.Router();

// ============================================
// Authentication Routes
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @body    { email, password, full_name, display_name }
 * @returns { success, message, data: { user } }
 * @cookies Sets accessToken and refreshToken
 */
router.post('/register', authController.registerUserController);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 * @body    { email, password }
 * @returns { success, message, data: { user } }
 * @cookies Sets accessToken and refreshToken
 */
router.post('/login', authController.loginUserController);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Private (requires refresh token in cookies)
 * @cookies Requires refreshToken, sets new accessToken
 * @returns { success, message, data: { user } }
 * @note    Called when access token expires (frontend sends 401 to trigger this)
 */
router.post('/refresh-token', extractRefreshTokenFromCookie, authController.refreshAccessTokenController);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private (requires refresh token in cookies)
 * @cookies Clears accessToken and refreshToken
 * @returns { success, message }
 */
router.post('/logout', extractRefreshTokenFromCookie, authController.logoutUserController);

module.exports = router;
