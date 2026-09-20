import axiosInstance from './axiosInstance';

const API_BASE = '/api/v1/notifications';

export const getNotifications = async (params) => {
  try {
    const response = await axiosInstance.get(API_BASE, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load notifications' };
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    await axiosInstance.patch(`${API_BASE}/${notificationId}/read`);
  } catch (error) {
    throw error.response?.data || { message: 'Unable to update notification' };
  }
};