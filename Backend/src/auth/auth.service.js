const authRepository = require('./auth.repository');
const { hashPassword, comparePassword, validatePasswordStrength, generateRefreshToken } = require('../utils/bcrypt');
const { generateAccessToken } = require('../utils/jwt');
const AppError = require('../errors/AppError');
const { REFRESH_TOKEN_EXPIRES_IN_DAYS } = require('../config/constants');

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
  const { email, password, full_name, display_name, account_type } = credentials;

  if (!email || !password || !full_name || !display_name || !account_type) {
    throw new AppError('Email, password, full name, display name, and account type are required', 400, 'VALIDATION_ERROR');
  }

  if (!['BIDDER', 'SELLER'].includes(account_type)) {
    throw new AppError('Account type must be BIDDER or SELLER', 400, 'VALIDATION_ERROR');
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    throw new AppError('Password does not meet security requirements', 400, 'WEAK_PASSWORD', passwordValidation.errors);
  }

  const userExists = await authRepository.emailExists(email);
  if (userExists) {
    throw new AppError('Email already registered', 409, 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await hashPassword(password);

  const user = await authRepository.createUser({
    email,
    password_hash: passwordHash,
    full_name,
    display_name,
    account_type,
  });

  const accessToken = generateAccessToken(user.id, user.email, user.display_name);

  const { plainToken: refreshToken, hashedToken: refreshTokenHash } = generateRefreshToken();

  await authRepository.storeRefreshToken(user.id, refreshTokenHash, REFRESH_TOKEN_EXPIRES_IN_DAYS);

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
};

/**
 * Login user
 * Validates credentials, generates tokens, stores refresh token
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
const loginUserService = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  }

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.account_status !== 'ACTIVE') {
    throw new AppError(`Account is ${user.account_status.toLowerCase()}`, 403, 'ACCOUNT_INACTIVE');
  }

  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.display_name);

  const { plainToken: refreshToken, hashedToken: refreshTokenHash } = generateRefreshToken();

  await authRepository.storeRefreshToken(user.id, refreshTokenHash, REFRESH_TOKEN_EXPIRES_IN_DAYS);

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
};

/**
 * Refresh access token
 * Validates refresh token, creates new access token
 * @param {string} refreshToken - Plain refresh token from client
 * @returns {Promise<Object>} { user, accessToken }
 */
const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401, 'REFRESH_TOKEN_INVALID');
  }

  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const storedToken = await authRepository.findRefreshTokenByHash(hashedToken);
  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401, 'REFRESH_TOKEN_INVALID');
  }

  if (new Date() > storedToken.expires_at) {
    await authRepository.deleteRefreshToken(hashedToken);
    throw new AppError('Refresh token has expired', 401, 'REFRESH_TOKEN_INVALID');
  }

  const user = await authRepository.findUserById(storedToken.user_id);
  if (!user) {
    throw new AppError('User not found', 401, 'REFRESH_TOKEN_INVALID');
  }

  if (user.account_status !== 'ACTIVE') {
    throw new AppError(`Account is ${user.account_status.toLowerCase()}`, 403, 'ACCOUNT_INACTIVE');
  }

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
};

/**
 * Logout user
 * Deletes refresh token from database
 * @param {string} refreshToken - Plain refresh token from client
 * @returns {Promise<Object>} { message }
 */
const logoutUserService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401, 'REFRESH_TOKEN_INVALID');
  }

  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await authRepository.deleteRefreshToken(hashedToken);

  return { message: 'Logout successful' };
};

const getCurrentUserService = async (userId) => {
  const user = await authRepository.findProfileById(userId);

  if (!user) {
    throw new AppError('User was not found', 404, 'USER_NOT_FOUND');
  }

  if (user.account_status !== 'ACTIVE') {
    throw new AppError(`Account is ${user.account_status.toLowerCase()}`, 403, 'ACCOUNT_INACTIVE');
  }

  return user;
};

module.exports = {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
  getCurrentUserService,
};
