const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

const router = express.Router();

// ============================================
// Authentication Routes
// ============================================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', authController.loginUser);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout', authMiddleware.verifyToken, authController.logoutUser);

// @route   GET /api/auth/profile
// @desc    Get current authenticated user's profile
// @access  Private
router.get('/profile', authMiddleware.verifyToken, authController.getCurrentUserProfile);

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', authMiddleware.verifyToken, authController.refreshAuthToken);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile information
// @access  Private
router.put('/update-profile', authMiddleware.verifyToken, authController.updateUserProfile);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authMiddleware.verifyToken, authController.changeUserPassword);

module.exports = router;
