const asyncHandler = require('../errors/asyncHandler');
const productService = require('./product.service');

const createProductController = asyncHandler(async (req, res) => {
  const product = await productService.createProductService(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

const getProductController = asyncHandler(async (req, res) => {
  const product = await productService.getProductService(req.params.productId);

  res.status(200).json({
    success: true,
    data: { product },
  });
});

const getMyProductsController = asyncHandler(async (req, res) => {
  const products = await productService.getMyProductsService(req.user.userId);

  res.status(200).json({
    success: true,
    data: { products },
  });
});

const updateProductController = asyncHandler(async (req, res) => {
  const product = await productService.updateProductService(req.product, req.body);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

const deleteProductController = asyncHandler(async (req, res) => {
  await productService.deleteProductService(req.product);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  createProductController,
  getProductController,
  getMyProductsController,
  updateProductController,
  deleteProductController,
};