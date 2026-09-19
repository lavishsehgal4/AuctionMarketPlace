const AppError = require('../errors/AppError');
const productRepository = require('./product.repository');

const PRODUCT_CONDITIONS = ['NEW', 'USED', 'REFURBISHED'];

const isValidDetailedSpecs = (value) => value !== null
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.entries(value).every(([key, entryValue]) => (
    typeof key === 'string'
    && key.trim().length > 0
    && typeof entryValue === 'string'
    && entryValue.trim().length > 0
  ));

const toInventoryProduct = ({ auctions, ...product }) => {
  const activeAuction = auctions?.[0] || null;

  return {
    ...product,
    registration_status: activeAuction?.status || 'READY',
    active_auction: activeAuction,
  };
};

const validateProductData = async (productData, isUpdate = false) => {
  const { title, category_id: categoryId, condition, primary_image: primaryImage, additional_images: additionalImages, detailed_specs: detailedSpecs } = productData;

  if (!isUpdate && (!title || !categoryId || !condition || !primaryImage)) {
    throw new AppError('Title, category_id, condition, and primary_image are required', 400, 'VALIDATION_ERROR');
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0 || title.length > 200)) {
    throw new AppError('Title must be a non-empty string up to 200 characters', 400, 'VALIDATION_ERROR');
  }

  if (condition !== undefined && !PRODUCT_CONDITIONS.includes(condition)) {
    throw new AppError('Condition must be NEW, USED, or REFURBISHED', 400, 'VALIDATION_ERROR');
  }

  if (primaryImage !== undefined && (typeof primaryImage !== 'string' || primaryImage.trim().length === 0 || primaryImage.length > 500)) {
    throw new AppError('primary_image must be a non-empty URL up to 500 characters', 400, 'VALIDATION_ERROR');
  }

  if (additionalImages !== undefined && (!Array.isArray(additionalImages) || additionalImages.some((image) => typeof image !== 'string' || image.trim().length === 0 || image.length > 500))) {
    throw new AppError('additional_images must be an array of non-empty image URLs up to 500 characters', 400, 'VALIDATION_ERROR');
  }

  if (detailedSpecs !== undefined && !isValidDetailedSpecs(detailedSpecs)) {
    throw new AppError('detailed_specs must be an object with non-empty specification names and values', 400, 'VALIDATION_ERROR');
  }

  if (categoryId && !(await productRepository.categoryExists(categoryId))) {
    throw new AppError('Category was not found', 404, 'CATEGORY_NOT_FOUND');
  }
};

const ensureProductCanChange = (product) => {
  if (product.auctions?.some((auction) => ['SCHEDULED', 'ACTIVE'].includes(auction.status))) {
    throw new AppError('A product registered for auction cannot be changed', 409, 'PRODUCT_REGISTERED_FOR_AUCTION');
  }
};

const createProductService = async (sellerId, productData) => {
  await validateProductData(productData);

  const product = await productRepository.createProduct({
    seller_id: sellerId,
    title: productData.title.trim(),
    description: productData.description,
    detailed_specs: productData.detailed_specs,
    category_id: productData.category_id,
    condition: productData.condition,
    primary_image: productData.primary_image.trim(),
    additional_images: productData.additional_images || [],
  });

  return toInventoryProduct(product);
};

const getProductService = async (productId) => {
  const product = await productRepository.findProductById(productId);

  if (!product) {
    throw new AppError('Product was not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return toInventoryProduct(product);
};

const getMyProductsService = async (sellerId) => {
  const products = await productRepository.findProductsBySellerId(sellerId);
  return products.map(toInventoryProduct);
};

const updateProductService = async (product, productData) => {
  ensureProductCanChange(product);
  await validateProductData(productData, true);

  const permittedFields = ['title', 'description', 'detailed_specs', 'category_id', 'condition', 'primary_image', 'additional_images'];
  const updates = Object.fromEntries(
    Object.entries(productData).filter(([key, value]) => permittedFields.includes(key) && value !== undefined),
  );

  if (Object.keys(updates).length === 0) {
    throw new AppError('Provide at least one product field to update', 400, 'VALIDATION_ERROR');
  }

  if (updates.title) {
    updates.title = updates.title.trim();
  }

  if (updates.primary_image) {
    updates.primary_image = updates.primary_image.trim();
  }

  return toInventoryProduct(await productRepository.updateProduct(product.id, updates));
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