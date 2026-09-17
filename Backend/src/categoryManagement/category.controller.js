// ============================================
// Category Controller
// ============================================
// Request/Response handling layer for categories
// Connects routes with service layer
// ============================================

const { addCategoriesService, getAllCategoriesService } = require('./category.service');

/**
 * Add categories controller
 * POST /api/categories/add
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const addCategoriesController = async (req, res) => {
  try {
    const { categories } = req.body;

    // Validate input
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required',
      });
    }

    // Call service
    const result = await addCategoriesService(categories);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('must be an array') || error.message.includes('Category')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Handle duplicate slug errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'One or more category slugs already exist',
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add categories',
    });
  }
};

/**
 * Get all categories controller
 * GET /api/categories
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await getAllCategoriesService();

    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: {
        categories,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
};

module.exports = {
  addCategoriesController,
  getAllCategoriesController,
};
