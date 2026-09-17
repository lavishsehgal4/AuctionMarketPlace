const { registerUserService, loginUserService, refreshAccessTokenService, logoutUserService } = require('./auth.service');

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
const registerUserController = async (req, res) => {
  try {
    const { email, password, full_name, display_name, account_type } = req.body;

    // Basic validation
    if (!email || !password || !full_name || !display_name || !account_type) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, full name, display name, and account type are required',
      });
    }

    // Call service
    const result = await registerUserService({
      email,
      password,
      full_name,
      display_name,
      account_type,
    });

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
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    // Check for validation errors
    if (error.validationErrors) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: error.validationErrors,
      });
    }

    // Handle known errors
    if (error.message.includes('already registered')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

/**
 * Login user controller
 * POST /api/auth/login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Call service
    const result = await loginUserService({
      email,
      password,
    });

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
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    // Handle known errors
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('Account is')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

/**
 * Refresh access token controller
 * POST /api/auth/refresh-token
 * Uses refresh token from cookies to generate new access token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const refreshAccessTokenController = async (req, res) => {
  try {
    // Get refresh token from cookies (attached by middleware)
    const refreshToken = req.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found',
      });
    }

    // Call service
    const result = await refreshAccessTokenService(refreshToken);

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
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    // Handle token expired or invalid
    if (error.message.includes('Invalid refresh token') || error.message.includes('expired')) {
      // Clear invalid refresh token cookie
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: error.message,
        code: 'REFRESH_TOKEN_INVALID',
      });
    }

    if (error.message.includes('Account is')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
};

/**
 * Logout user controller
 * POST /api/auth/logout
 * Deletes refresh token from database and clears cookies
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const logoutUserController = async (req, res) => {
  try {
    // Get refresh token from cookies (attached by middleware)
    const refreshToken = req.refreshToken;

    if (refreshToken) {
      // Call service to delete refresh token from database
      await logoutUserService(refreshToken);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    // Even if deletion fails, still clear cookies and respond with success
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
};

module.exports = {
  registerUserController,
  loginUserController,
  refreshAccessTokenController,
  logoutUserController,
};
