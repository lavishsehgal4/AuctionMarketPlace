import axiosInstance from './axiosInstance';
import auctions from '../data/auctions.json';

const API_BASE = '/api/v1/auctions';

export const registerAuction = async (auctionData) => {
  try {
    const response = await axiosInstance.post(API_BASE, auctionData);
    return response.data.data.auction;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to register auction' };
  }
};

export const getMyAuctions = async (filters) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/my-auctions`, { params: filters });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load your auctions' };
  }
};

export const getMyAuctionDetail = async (auctionId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/my-auctions/${auctionId}`);
    return response.data.data.auction;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load auction details' };
  }
};

export const cancelAuction = async (auctionId) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/${auctionId}/cancel`);
    return response.data.data.auction;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to cancel auction' };
  }
};

export const getPublicAuctions = async (filters) => {
  try {
    const response = await axiosInstance.get(API_BASE, { params: filters });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load auctions' };
  }
};

export const getPublicAuction = async (auctionId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/${auctionId}`);
    return response.data.data.auction;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load auction details' };
  }
};

export function getAuctions() {
  return Promise.resolve(auctions);
}

export function getAuctionById(id) {
  const auction = auctions.find((a) => a.id === id) || null;
  return Promise.resolve(auction);
}

export function createAuction(auctionData) {
  // No-op in MVP — would POST to backend later.
  return Promise.resolve({ ...auctionData, id: `a${Date.now()}` });
}
