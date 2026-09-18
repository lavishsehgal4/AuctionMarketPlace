import axiosInstance from './axiosInstance';

const API_BASE = '/api/v1/products';

const getError = (error, fallbackMessage) => error.response?.data || { message: fallbackMessage };

export const getMyProducts = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/my-products`);
    return response.data.data.products;
  } catch (error) {
    throw getError(error, 'Unable to load products');
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post(API_BASE, productData);
    return response.data.data.product;
  } catch (error) {
    throw getError(error, 'Unable to create product');
  }
};