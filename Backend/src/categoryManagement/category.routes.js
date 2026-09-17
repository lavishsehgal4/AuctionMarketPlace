// ============================================
// Category Routes
// ============================================
// API routes for category management
// ============================================

const express = require('express');
const { addCategoriesController, getAllCategoriesController } = require('./category.controller');

const router = express.Router();

/**
 * POST /api/categories/add
 * Add multiple categories
 */
router.post('/add', addCategoriesController);

/**
 * GET /api/categories
 * Get all categories
 */
router.get('/', getAllCategoriesController);

module.exports = router;
