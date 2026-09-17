const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ============================================
// Bcrypt & Crypto Utility Functions
// ============================================
// Handles password hashing, comparison, and refresh token generation
// ============================================

/**
 * Hash Password
 * Encrypts a plain password using bcrypt algorithm
 * @param {string} plainPassword - Plain text password to hash
 * @param {number} saltRounds - Number of salt rounds (default 10, higher = more secure but slower)
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If hashing fails
 */
const hashPassword = async (plainPassword, saltRounds = 10) => {
  try {
    if (!plainPassword || plainPassword.trim() === '') {
      throw new Error('Password cannot be empty');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
};

/**
 * Compare Password
 * Compares a plain password with its hashed version
 * @param {string} plainPassword - Plain text password to compare
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If comparison fails
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) {
      throw new Error('Both plain and hashed passwords are required');
    }

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Failed to compare passwords: ${error.message}`);
  }
};

/**
 * Validate Password Strength
 * Checks if password meets security requirements
 * Requirements:
 *   - Minimum 8 characters
 *   - At least one uppercase letter (A-Z)
 *   - At least one lowercase letter (a-z)
 *   - At least one number (0-9)
 *   - At least one special character (!@#$%^&*)
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, errors: array of error messages }
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  // Check minimum length
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Hash and Validate Password
 * Validates password strength first, then hashes it
 * @param {string} plainPassword - Plain text password
 * @returns {Promise<Object>} { hashed: string, isValid: boolean, errors: array }
 * @throws {Error} If hashing fails
 */
const hashAndValidatePassword = async (plainPassword) => {
  try {
    // Validate password strength
    const validation = validatePasswordStrength(plainPassword);

    if (!validation.isValid) {
      return {
        hashed: null,
        isValid: false,
        errors: validation.errors,
      };
    }

    // Hash the password
    const hashedPassword = await hashPassword(plainPassword);

    return {
      hashed: hashedPassword,
      isValid: true,
      errors: [],
    };
  } catch (error) {
    throw new Error(`Failed to hash and validate password: ${error.message}`);
  }
};

/**
 * Generate Refresh Token (Random String)
 * Creates a cryptographically secure random refresh token
 * Returns the plain token (to send to client) and hash (to store in DB)
 * @returns {Object} { plainToken: string, hashedToken: string }
 * @throws {Error} If token generation fails
 */
const generateRefreshToken = () => {
  try {
    // Generate 32 bytes (256 bits) of random data
    const plainToken = crypto.randomBytes(32).toString('hex');

    // Hash the token using SHA-256 for storage in database
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    return {
      plainToken, // Send this to client
      hashedToken, // Store this in database
    };
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
};

/**
 * Verify Refresh Token
 * Compares a plain refresh token with its hashed version from DB
 * @param {string} plainToken - Refresh token from client/request
 * @param {string} hashedToken - Refresh token hash from database
 * @returns {boolean} True if tokens match, false otherwise
 * @throws {Error} If verification fails
 */
const verifyRefreshToken = (plainToken, hashedToken) => {
  try {
    if (!plainToken || !hashedToken) {
      throw new Error('Both plain and hashed refresh tokens are required');
    }

    // Hash the plain token and compare with stored hash
    const computedHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    return computedHash === hashedToken;
  } catch (error) {
    throw new Error(`Failed to verify refresh token: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  hashAndValidatePassword,
  generateRefreshToken,
  verifyRefreshToken,
};
