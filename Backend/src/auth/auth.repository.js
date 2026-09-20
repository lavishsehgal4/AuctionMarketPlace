const { getPrismaClient } = require('../config/supabase');

// ============================================
// Auth Repository
// ============================================
// Data access layer - communicates with database
// All database operations for auth go here
// ============================================

/**
 * Create new user in database
 * @param {Object} userData - { email, password_hash, full_name, display_name, account_type }
 * @returns {Promise<Object>} Created user object
 */
const createUser = (userData) => getPrismaClient().user.create({
  data: {
    email: userData.email,
    password_hash: userData.password_hash,
    full_name: userData.full_name,
    display_name: userData.display_name,
    account_type: userData.account_type,
  },
  select: {
    id: true,
    email: true,
    full_name: true,
    display_name: true,
    account_type: true,
    account_status: true,
    created_at: true,
  },
});

/**
 * Find user by email
 * @param {string} email - User's email
 * @returns {Promise<Object>} User object with password_hash or null
 */
const findUserByEmail = (email) => getPrismaClient().user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    password_hash: true,
    full_name: true,
    display_name: true,
    account_type: true,
    account_status: true,
  },
});

/**
 * Find user by ID
 * @param {string} userId - User's UUID
 * @returns {Promise<Object>} User object
 */
const findUserById = (userId) => getPrismaClient().user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    full_name: true,
    display_name: true,
    account_type: true,
    account_status: true,
    last_login_at: true,
    created_at: true,
  },
});

const findProfileById = (userId) => getPrismaClient().user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    full_name: true,
    display_name: true,
    phone: true,
    avatar_url: true,
    account_type: true,
    account_status: true,
    kyc_status: true,
    created_at: true,
  },
});

/**
 * Check if email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
const emailExists = async (email) => {
  const user = await getPrismaClient().user.findUnique({
      where: { email },
      select: { id: true },
    });

  return Boolean(user);
};

/**
 * Store refresh token in database
 * @param {string} userId - User's UUID
 * @param {string} hashedToken - Hashed refresh token
 * @param {number} expiresInDays - Days until token expires
 * @returns {Promise<Object>} Created refresh token record
 */
const storeRefreshToken = (userId, hashedToken, expiresInDays) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  return getPrismaClient().refreshToken.create({
    data: {
      user_id: userId,
      token_hash: hashedToken,
      expires_at: expiresAt,
    },
    select: {
      id: true,
      expires_at: true,
    },
  });
};

/**
 * Find refresh token by hash
 * @param {string} tokenHash - Hashed refresh token
 * @returns {Promise<Object>} Refresh token record
 */
const findRefreshTokenByHash = (tokenHash) => getPrismaClient().refreshToken.findUnique({
  where: { token_hash: tokenHash },
  select: {
    id: true,
    user_id: true,
    expires_at: true,
  },
});

/**
 * Delete refresh token (logout from device)
 * @param {string} tokenHash - Hashed refresh token to delete
 * @returns {Promise<Object>} Deleted token record
 */
const deleteRefreshToken = (tokenHash) => getPrismaClient().refreshToken.delete({
  where: { token_hash: tokenHash },
  select: { id: true },
});

/**
 * Update user's last login timestamp
 * @param {string} userId - User's UUID
 * @returns {Promise<Object>} Updated user record
 */
const updateLastLogin = (userId) => getPrismaClient().user.update({
  where: { id: userId },
  data: { last_login_at: new Date() },
  select: { id: true, last_login_at: true },
});

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findProfileById,
  emailExists,
  storeRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshToken,
  updateLastLogin,
};
