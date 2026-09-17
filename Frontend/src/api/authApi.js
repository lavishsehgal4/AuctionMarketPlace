import axiosInstance from './axiosInstance';

// ============================================
// Auth API
// ============================================
// All authentication API calls to backend
// ============================================

const API_BASE = 'http://localhost:3000/api/auth';

/**
 * Register new user
 * @param {Object} data - { email, password, full_name, display_name }
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
export const registerUser = async (data) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/register`, data);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

/**
 * Login user
 * @param {Object} data - { email, password }
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
export const loginUser = async (data) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/login`, data);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

/**
 * Logout user
 * Invalidates refresh token on backend and clears cookies
 * @returns {Promise<Object>} { message }
 */
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/logout`);
    return response.data;
  } catch (error) {
    // Even if logout fails, we'll clear frontend auth
    return { message: 'Logout completed' };
  }
};

/**
 * Refresh access token
 * Called automatically when access token expires
 * @returns {Promise<Object>} { user, accessToken }
 */
export const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/refresh-token`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Token refresh failed' };
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
};
