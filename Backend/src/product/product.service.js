const AppError = require('../errors/AppError');
const productRepository = require('./product.repository');

const PRODUCT_CONDITIONS = ['NEW', 'USED', 'REFURBISHED'];

const validateProductData = async (productData, isUpdate = false) => {
  const { title, category_id: categoryId, condition, images } = productData;

  if (!isUpdate && (!title || !categoryId || !condition || !images)) {
    throw new AppError('Title, category_id, condition, and images are required', 400, 'VALIDATION_ERROR');
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0 || title.length > 200)) {
    throw new AppError('Title must be a non-empty string up to 200 characters', 400, 'VALIDATION_ERROR');
  }

  if (condition !== undefined && !PRODUCT_CONDITIONS.includes(condition)) {
    throw new AppError('Condition must be NEW, USED, or REFURBISHED', 400, 'VALIDATION_ERROR');
  }

  if (images !== undefined && (!Array.isArray(images) || images.length === 0)) {
    throw new AppError('Images must contain at least one image URL', 400, 'VALIDATION_ERROR');
  }

  if (categoryId && !(await productRepository.categoryExists(categoryId))) {
    throw new AppError('Category was not found', 404, 'CATEGORY_NOT_FOUND');
  }
};

const ensureProductCanChange = (product) => {
  if (product.auction) {
    throw new AppError('A product registered for auction cannot be changed', 409, 'PRODUCT_REGISTERED_FOR_AUCTION');
  }
};

const createProductService = async (sellerId, productData) => {
  await validateProductData(productData);

  return productRepository.createProduct({
    seller_id: sellerId,
    title: productData.title.trim(),
    description: productData.description,
    detailed_specs: productData.detailed_specs,
    category_id: productData.category_id,
    condition: productData.condition,
    images: productData.images,
  });
};

const getProductService = async (productId) => {
  const product = await productRepository.findProductById(productId);

  if (!product) {
    throw new AppError('Product was not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return product;
};

const getMyProductsService = (sellerId) => productRepository.findProductsBySellerId(sellerId);

const updateProductService = async (product, productData) => {
  ensureProductCanChange(product);
  await validateProductData(productData, true);

  const permittedFields = ['title', 'description', 'detailed_specs', 'category_id', 'condition', 'images'];
  const updates = Object.fromEntries(
    Object.entries(productData).filter(([key, value]) => permittedFields.includes(key) && value !== undefined),
  );

  if (Object.keys(updates).length === 0) {
    throw new AppError('Provide at least one product field to update', 400, 'VALIDATION_ERROR');
  }

  if (updates.title) {
    updates.title = updates.title.trim();
  }

  return productRepository.updateProduct(product.id, updates);
};

const deleteProductService = async (product) => {
  ensureProductCanChange(product);
  await productRepository.deleteProduct(product.id);
};

module.exports = {
  createProductService,
  getProductService,
  getMyProductsService,
  updateProductService,
  deleteProductService,
};