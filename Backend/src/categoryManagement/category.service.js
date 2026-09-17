// ============================================
// Category Service
// ============================================
// Business logic layer for categories
// Calls repository for DB operations
// ============================================

const categoryRepository = require('./category.repository');
const AppError = require('../errors/AppError');

/**
 * Add multiple categories to database
 * Validates input data before calling repository
 * @param {Array<Object>} categoriesData - Array of { name, slug, display_order, commission_rate, image_url }
 * @returns {Promise<Object>} { count, message }
 */
const addCategoriesService = async (categoriesData) => {
  if (!Array.isArray(categoriesData)) {
    throw new AppError('Categories must be an array', 400, 'VALIDATION_ERROR');
  }

  if (categoriesData.length === 0) {
    throw new AppError('Categories array cannot be empty', 400, 'VALIDATION_ERROR');
  }

  categoriesData.forEach((category, index) => {
      if (!category.name || typeof category.name !== 'string') {
        throw new AppError(`Category ${index}: name is required and must be a string`, 400, 'VALIDATION_ERROR');
      }

      if (!category.slug || typeof category.slug !== 'string') {
        throw new AppError(`Category ${index}: slug is required and must be a string`, 400, 'VALIDATION_ERROR');
      }

      if (category.display_order === undefined || typeof category.display_order !== 'number') {
        throw new AppError(`Category ${index}: display_order is required and must be a number`, 400, 'VALIDATION_ERROR');
      }

      if (!category.commission_rate || typeof category.commission_rate !== 'number') {
        throw new AppError(`Category ${index}: commission_rate is required and must be a number`, 400, 'VALIDATION_ERROR');
      }

      if (category.commission_rate < 0 || category.commission_rate > 100) {
        throw new AppError(`Category ${index}: commission_rate must be between 0 and 100`, 400, 'VALIDATION_ERROR');
      }
    });

  const result = await categoryRepository.createCategories(categoriesData);

  return {
    count: result.count,
    message: `${result.count} categories added successfully`,
  };
};

/**
 * Fetch all categories without commission_rate
 * @returns {Promise<Array<Object>>} Array of category objects
 */
const getAllCategoriesService = () => categoryRepository.getAllCategories();

module.exports = {
  addCategoriesService,
  getAllCategoriesService,
};
