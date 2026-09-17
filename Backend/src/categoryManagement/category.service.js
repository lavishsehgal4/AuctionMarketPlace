// ============================================
// Category Service
// ============================================
// Business logic layer for categories
// Calls repository for DB operations
// ============================================

const categoryRepository = require('./category.repository');

/**
 * Add multiple categories to database
 * Validates input data before calling repository
 * @param {Array<Object>} categoriesData - Array of { name, slug, display_order, commission_rate, image_url }
 * @returns {Promise<Object>} { count, message }
 */
const addCategoriesService = async (categoriesData) => {
  try {
    // Validate array
    if (!Array.isArray(categoriesData)) {
      throw new Error('Categories must be an array');
    }

    if (categoriesData.length === 0) {
      throw new Error('Categories array cannot be empty');
    }

    // Validate each category
    categoriesData.forEach((category, index) => {
      if (!category.name || typeof category.name !== 'string') {
        throw new Error(`Category ${index}: name is required and must be a string`);
      }

      if (!category.slug || typeof category.slug !== 'string') {
        throw new Error(`Category ${index}: slug is required and must be a string`);
      }

      if (category.display_order === undefined || typeof category.display_order !== 'number') {
        throw new Error(`Category ${index}: display_order is required and must be a number`);
      }

      if (!category.commission_rate || typeof category.commission_rate !== 'number') {
        throw new Error(`Category ${index}: commission_rate is required and must be a number`);
      }

      if (category.commission_rate < 0 || category.commission_rate > 100) {
        throw new Error(`Category ${index}: commission_rate must be between 0 and 100`);
      }
    });

    // Call repository to create categories
    const result = await categoryRepository.createCategories(categoriesData);

    return {
      count: result.count,
      message: `${result.count} categories added successfully`,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all categories without commission_rate
 * @returns {Promise<Array<Object>>} Array of category objects
 */
const getAllCategoriesService = async () => {
  try {
    const categories = await categoryRepository.getAllCategories();
    return categories;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addCategoriesService,
  getAllCategoriesService,
};
