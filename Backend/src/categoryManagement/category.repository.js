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
const createCategories = async (categories) => {
  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const createdCategories = await prisma.category.createMany({
      data: categories,
      skipDuplicates: true, // Skip if slug already exists
    });

    return createdCategories;
  } catch (error) {
    console.error('❌ createCategories error:', error);
    throw new Error(`Failed to create categories: ${error.message}`);
  }
};

/**
 * Get all categories without commission_rate
 * @returns {Promise<Array<Object>>} Array of category objects
 */
const getAllCategories = async () => {
  try {
    const prisma = getPrismaClient();

    if (!prisma) {
      throw new Error('Prisma client not available');
    }

    const categories = await prisma.category.findMany({
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

    return categories;
  } catch (error) {
    console.error('❌ getAllCategories error:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
};

module.exports = {
  createCategories,
  getAllCategories,
};
