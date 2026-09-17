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
const createUser = async (userData) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password_hash: userData.password_hash,
        full_name: userData.full_name,
        display_name: userData.display_name,
        account_type: userData.account_type, // BIDDER or SELLER
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

    return user;
  } catch (error) {
    console.error('❌ createUser error:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Find user by email
 * @param {string} email - User's email
 * @returns {Promise<Object>} User object with password_hash or null
 */
const findUserByEmail = async (email) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        full_name: true,
        display_name: true,
        account_status: true,
      },
    });

    return user;
  } catch (error) {
    console.error('❌ findUserByEmail error:', error);
    throw new Error(`Failed to find user by email: ${error.message}`);
  }
};

/**
 * Find user by ID
 * @param {string} userId - User's UUID
 * @returns {Promise<Object>} User object
 */
const findUserById = async (userId) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const user = await prisma.user.findUnique({
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

    return user;
  } catch (error) {
    console.error('❌ findUserById error:', error);
    throw new Error(`Failed to find user by ID: ${error.message}`);
  }
};

/**
 * Check if email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
const emailExists = async (email) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
  } catch (error) {
    console.error('❌ emailExists error:', error);
    throw new Error(`Failed to check email existence: ${error.message}`);
  }
};

/**
 * Store refresh token in database
 * @param {string} userId - User's UUID
 * @param {string} hashedToken - Hashed refresh token
 * @param {number} expiresInDays - Days until token expires (default 7)
 * @returns {Promise<Object>} Created refresh token record
 */
const storeRefreshToken = async (userId, hashedToken, expiresInDays = 7) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshToken = await prisma.refreshToken.create({
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

    return refreshToken;
  } catch (error) {
    console.error('❌ storeRefreshToken error:', error);
    throw new Error(`Failed to store refresh token: ${error.message}`);
  }
};

/**
 * Find refresh token by hash
 * @param {string} tokenHash - Hashed refresh token
 * @returns {Promise<Object>} Refresh token record
 */
const findRefreshTokenByHash = async (tokenHash) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const token = await prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      select: {
        id: true,
        user_id: true,
        expires_at: true,
      },
    });

    return token;
  } catch (error) {
    console.error('❌ findRefreshTokenByHash error:', error);
    throw new Error(`Failed to find refresh token: ${error.message}`);
  }
};

/**
 * Delete refresh token (logout from device)
 * @param {string} tokenHash - Hashed refresh token to delete
 * @returns {Promise<Object>} Deleted token record
 */
const deleteRefreshToken = async (tokenHash) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const token = await prisma.refreshToken.delete({
      where: { token_hash: tokenHash },
      select: { id: true },
    });

    return token;
  } catch (error) {
    console.error('❌ deleteRefreshToken error:', error);
    throw new Error(`Failed to delete refresh token: ${error.message}`);
  }
};

/**
 * Update user's last login timestamp
 * @param {string} userId - User's UUID
 * @returns {Promise<Object>} Updated user record
 */
const updateLastLogin = async (userId) => {
  try {
    const prisma = getPrismaClient();
    
    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
      select: { id: true, last_login_at: true },
    });

    return user;
  } catch (error) {
    console.error('❌ updateLastLogin error:', error);
    throw new Error(`Failed to update last login: ${error.message}`);
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  emailExists,
  storeRefreshToken,
  findRefreshTokenByHash,
  deleteRefreshToken,
  updateLastLogin,
};
