const authRepository = require('./auth.repository');
const { hashPassword, comparePassword, validatePasswordStrength, generateRefreshToken, verifyRefreshToken } = require('../utils/bcrypt');
const { generateAccessToken } = require('../utils/jwt');

// ============================================
// Auth Service
// ============================================
// Business logic layer - handles authentication logic
// Calls repository for DB operations
// ============================================

/**
 * Register new user
 * Validates input, checks email exists, hashes password, creates user and refresh token
 * @param {Object} credentials - { email, password, full_name, display_name, account_type }
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
const registerUserService = async (credentials) => {
  try {
    const { email, password, full_name, display_name, account_type } = credentials;

    // Validate required fields
    if (!email || !password || !full_name || !display_name || !account_type) {
      throw new Error('Email, password, full name, display name, and account type are required');
    }

    // Validate account_type is BIDDER or SELLER
    if (!['BIDDER', 'SELLER'].includes(account_type)) {
      throw new Error('Account type must be BIDDER or SELLER');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      const error = new Error('Password does not meet security requirements');
      error.validationErrors = passwordValidation.errors;
      throw error;
    }

    // Check if email already exists
    const userExists = await authRepository.emailExists(email);
    if (userExists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await authRepository.createUser({
      email,
      password_hash: passwordHash,
      full_name,
      display_name,
      account_type, // BIDDER or SELLER
    });

    // Generate access token (JWT)
    const accessToken = generateAccessToken(user.id, user.email, user.display_name);

    // Generate refresh token (random string)
    const { plainToken: refreshToken, hashedToken: refreshTokenHash } = generateRefreshToken();

    // Store hashed refresh token in database
    await authRepository.storeRefreshToken(user.id, refreshTokenHash);

    // Update last login
    await authRepository.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        display_name: user.display_name,
        account_type: user.account_type,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * Validates credentials, generates tokens, stores refresh token
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
const loginUserService = async (credentials) => {
  try {
    const { email, password } = credentials;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check account status
    if (user.account_status !== 'ACTIVE') {
      throw new Error(`Account is ${user.account_status.toLowerCase()}`);
    }

    // Compare passwords
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate access token (JWT)
    const accessToken = generateAccessToken(user.id, user.email, user.display_name);

    // Generate refresh token (random string)
    const { plainToken: refreshToken, hashedToken: refreshTokenHash } = generateRefreshToken();

    // Store hashed refresh token in database
    await authRepository.storeRefreshToken(user.id, refreshTokenHash);

    // Update last login
    await authRepository.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        display_name: user.display_name,
        account_type: user.account_type,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh access token
 * Validates refresh token, creates new access token
 * @param {string} refreshToken - Plain refresh token from client
 * @returns {Promise<Object>} { user, accessToken }
 */
const refreshAccessTokenService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Hash the refresh token to look it up in database
    const { hashPassword: crypto_hash } = require('crypto');
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find refresh token in database
    const storedToken = await authRepository.findRefreshTokenByHash(hashedToken);
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (new Date() > storedToken.expires_at) {
      // Delete expired token
      await authRepository.deleteRefreshToken(hashedToken);
      throw new Error('Refresh token has expired');
    }

    // Get user data
    const user = await authRepository.findUserById(storedToken.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check account status
    if (user.account_status !== 'ACTIVE') {
      throw new Error(`Account is ${user.account_status.toLowerCase()}`);
    }

    // Generate new access token
    const accessToken = generateAccessToken(user.id, user.email, user.display_name);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        display_name: user.display_name,
        account_type: user.account_type,
      },
      accessToken,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * Deletes refresh token from database
 * @param {string} refreshToken - Plain refresh token from client
 * @returns {Promise<Object>} { message }
 */
const logoutUserService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    // Hash the refresh token
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Delete refresh token from database
    await authRepository.deleteRefreshToken(hashedToken);

    return { message: 'Logout successful' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
};
