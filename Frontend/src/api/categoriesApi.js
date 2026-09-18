import axiosInstance from './axiosInstance';

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/categories');
    return response.data.data.categories;
  } catch (error) {
    throw error.response?.data || { message: 'Unable to load categories' };
  }
};