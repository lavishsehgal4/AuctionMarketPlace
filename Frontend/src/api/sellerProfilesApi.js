import axiosInstance from './axiosInstance';

const API_BASE = '/api/v1/sellers';

export const getAuctioneers = async (params) => {
  try {
    const response = await axiosInstance.get(API_BASE, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load auctioneers' };
  }
};

export const getSellerProfile = async (sellerId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/${sellerId}`);
    return response.data.data.seller;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load auctioneer profile' };
  }
};

export const getSellerReviews = async (sellerId, params) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/${sellerId}/reviews`, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load seller reviews' };
  }
};

export const updateMySellerProfile = async (profile) => {
  try {
    const response = await axiosInstance.patch(`${API_BASE}/me`, profile);
    return response.data.data.profile;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to update public seller profile' };
  }
};