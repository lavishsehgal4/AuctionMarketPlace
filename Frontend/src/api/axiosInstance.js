import axios from 'axios';

// ============================================
// Axios Instance with Token Refresh
// ============================================
// Automatically refreshes access token when expired
// Intercepts 401 responses and retries with new token
// ============================================

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Include cookies in requests
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

/**
 * Response Interceptor
 * Handles 401 (token expired) responses
 * Automatically refreshes token and retries request
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized - token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if token expired specifically
      if (error.response?.data?.code === 'TOKEN_EXPIRED' || error.response?.data?.message?.includes('expired')) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => axiosInstance(originalRequest))
            .catch((err) => {
              // Refresh failed, redirect to login
              window.location.href = '/login';
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh token endpoint
          await axios.post('http://localhost:3000/api/v1/auth/refresh-token', {}, {
            withCredentials: true,
          });

          // Token refreshed successfully
          processQueue(null);

          // Retry original request with new token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - user needs to login again
          processQueue(refreshError, null);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
