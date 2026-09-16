// ============================================
// Auth Service
// ============================================
// This file will contain all authentication
// related business logic and database operations.
// Services call Prisma for database queries.
// ============================================

// TODO: Implement registerNewUser service
// Purpose: Create new user in database
// Input: user email, password, name
// Output: Created user object or error
const registerNewUser = async (userData) => {
  // TODO: Validate input data
  // TODO: Check if user already exists (email uniqueness)
  // TODO: Hash password using bcrypt
  // TODO: Create user in database using Prisma
  // TODO: Return new user (without password)
};

// TODO: Implement authenticateUser service
// Purpose: Verify user credentials and generate JWT token
// Input: email, password
// Output: JWT token and user info or error
const authenticateUser = async (email, password) => {
  // TODO: Find user by email in database
  // TODO: Compare provided password with hashed password
  // TODO: If valid, generate JWT token
  // TODO: Return token and user info (without password)
  // TODO: If invalid, throw authentication error
};

// TODO: Implement fetchUserProfile service
// Purpose: Get user profile data by user ID
// Input: user ID
// Output: User profile data  
const fetchUserProfile = async (userId) => {
  // TODO: Find user by ID in database
  // TODO: Return user data (exclude sensitive info like password)
};

// TODO: Implement updateUserProfileData service
// Purpose: Update user profile information
// Input: user ID, updated profile data
// Output: Updated user profile
const updateUserProfileData = async (userId, profileData) => {
  // TODO: Validate input data
  // TODO: Update user in database using Prisma
  // TODO: Return updated user profile
};

// TODO: Implement updateUserPassword service
// Purpose: Change user's password
// Input: user ID, old password, new password
// Output: Success message or error
const updateUserPassword = async (userId, oldPassword, newPassword) => {
  // TODO: Find user by ID
  // TODO: Verify old password is correct
  // TODO: Hash new password
  // TODO: Update password in database
  // TODO: Return success message
};

// TODO: Implement generateNewToken service
// Purpose: Generate fresh JWT token
// Input: user ID
// Output: New JWT token
const generateNewToken = async (userId) => {
  // TODO: Find user by ID
  // TODO: Create new JWT token with user data
  // TODO: Return new token
};

// TODO: Implement invalidateUserToken service
// Purpose: Logout user by invalidating token
// Input: user ID, token
// Output: Success message
const invalidateUserToken = async (userId, token) => {
  // TODO: Add token to blacklist (in cache or database)
  // TODO: Return success message
};

module.exports = {
  registerNewUser,
  authenticateUser,
  fetchUserProfile,
  updateUserProfileData,
  updateUserPassword,
  generateNewToken,
  invalidateUserToken,
};
