// ============================================
// Auth Controller
// ============================================
// This file will contain all authentication
// related controller methods. These methods
// handle incoming requests and call the
// appropriate service functions.
// ============================================

// TODO: Implement registerUser controller
const registerUser = (req, res) => {
  // TODO: Extract user data from request body
  // TODO: Call authService.registerNewUser()
  // TODO: Return success/error response
};

// TODO: Implement loginUser controller
const loginUser = (req, res) => {
  // TODO: Extract email and password from request body
  // TODO: Call authService.authenticateUser()
  // TODO: Return JWT token and user info
};

// TODO: Implement logoutUser controller
const logoutUser = (req, res) => {
  // TODO: Invalidate user's JWT token
  // TODO: Clear authentication session
  // TODO: Return success message
};

// TODO: Implement getCurrentUserProfile controller
const getCurrentUserProfile = (req, res) => {
  // TODO: Extract user ID from verified token (req.user)
  // TODO: Call authService.fetchUserProfile()
  // TODO: Return user profile data
};

// TODO: Implement refreshAuthToken controller
const refreshAuthToken = (req, res) => {
  // TODO: Extract current JWT token from request
  // TODO: Call authService.generateNewToken()
  // TODO: Return new JWT token
};

// TODO: Implement updateUserProfile controller
const updateUserProfile = (req, res) => {
  // TODO: Extract user ID from verified token
  // TODO: Extract updated profile data from request body
  // TODO: Call authService.updateUserProfileData()
  // TODO: Return updated profile
};

// TODO: Implement changeUserPassword controller
const changeUserPassword = (req, res) => {
  // TODO: Extract user ID from verified token
  // TODO: Extract old password and new password from request body
  // TODO: Call authService.updateUserPassword()
  // TODO: Return success message
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUserProfile,
  refreshAuthToken,
  updateUserProfile,
  changeUserPassword,
};
