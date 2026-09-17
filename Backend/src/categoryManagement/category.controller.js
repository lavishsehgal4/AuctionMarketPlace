// ============================================
// Category Controller
// ============================================
// Request/Response handling layer for categories
// Connects routes with service layer
// ============================================

const { addCategoriesService, getAllCategoriesService } = require('./category.service');
const asyncHandler = require('../errors/asyncHandler');

/**
 * Add categories controller
 * POST /api/categories/add
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const addCategoriesController = asyncHandler(async (req, res) => {
  const result = await addCategoriesService(req.body.categories);

  return res.status(201).json({
    success: true,
    message: result.message,
    data: { count: result.count },
  });
});

/**
 * Get all categories controller
 * GET /api/categories
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllCategoriesController = asyncHandler(async (req, res) => {
  const categories = await getAllCategoriesService();

  return res.status(200).json({
    success: true,
    message: 'Categories fetched successfully',
    data: { categories },
  });
});

module.exports = {
  addCategoriesController,
  getAllCategoriesController,
};
