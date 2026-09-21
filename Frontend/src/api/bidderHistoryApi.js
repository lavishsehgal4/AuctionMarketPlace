import axiosInstance from './axiosInstance';

export const getBidderHistory = async (params) => {
  try {
    const response = await axiosInstance.get('/api/v1/bidder-history', { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load bid history' };
  }
};