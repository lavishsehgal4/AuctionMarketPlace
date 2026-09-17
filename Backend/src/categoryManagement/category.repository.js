// ============================================
// Category Repository
// ============================================
// Data access layer for categories
// All database operations for categories go here
// ============================================

const { getPrismaClient } = require('../config/supabase');

/**
 * Create multiple categories in database
 * @param {Array<Object>} categories - Array of { name, slug, display_order, commission_rate, image_url }
 * @returns {Promise<Array<Object>>} Created category objects
 */
const createCategories = (categories) => getPrismaClient().category.createMany({
  data: categories,
  skipDuplicates: true,
});

/**
 * Get all categories without commission_rate
 * @returns {Promise<Array<Object>>} Array of category objects
 */
const getAllCategories = () => getPrismaClient().category.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    display_order: true,
    image_url: true,
  },
  orderBy: {
    display_order: 'asc',
  },
});

module.exports = {
  createCategories,
  getAllCategories,
};
