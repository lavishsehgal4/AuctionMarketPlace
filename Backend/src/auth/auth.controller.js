const asyncHandler = require('../errors/asyncHandler');
const {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
  getCurrentUserService,
} = require('./auth.service');

// ============================================
// Auth Controller
// ============================================
// Request/Response handling layer
// Connects routes with service layer
// ============================================

/**
 * Register user controller
 * POST /api/auth/register
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const registerUserController = asyncHandler(async (req, res) => {
  const result = await registerUserService(req.body);

    // Set tokens in cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user: result.user },
  });
});

/**
 * Login user controller
 * POST /api/auth/login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const loginUserController = asyncHandler(async (req, res) => {
  const result = await loginUserService(req.body);

    // Set tokens in cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: result.user },
  });
});

/**
 * Refresh access token controller
 * POST /api/auth/refresh-token
 * Uses refresh token from cookies to generate new access token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const refreshAccessTokenController = asyncHandler(async (req, res) => {
  const result = await refreshAccessTokenService(req.refreshToken);

    // Set new access token in cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

  return res.status(200).json({
    success: true,
    message: 'Access token refreshed',
    data: { user: result.user },
  });
});

/**
 * Logout user controller
 * POST /api/auth/logout
 * Deletes refresh token from database and clears cookies
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const logoutUserController = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.refreshToken;

    if (refreshToken) {
      await logoutUserService(refreshToken);
    }
  } catch (error) {
    console.error(error);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

const getCurrentUserController = asyncHandler(async (req, res) => {
  const user = await getCurrentUserService(req.user.userId);

  return res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = {
  registerUserController,
  loginUserController,
  refreshAccessTokenController,
  logoutUserController,
  getCurrentUserController,
};
