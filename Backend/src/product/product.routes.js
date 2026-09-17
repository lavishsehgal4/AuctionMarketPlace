const express = require('express');
const { verifyAccessTokenMiddleware } = require('../auth/auth.middleware');
const requireRole = require('../middleware/requireRole');
const validateRequest = require('../middleware/validateRequest');
const loadOwnedResource = require('../middleware/loadOwnedResource');
const productController = require('./product.controller');

const router = express.Router();

const sellerOnly = [verifyAccessTokenMiddleware, requireRole('SELLER')];
const loadOwnedProduct = loadOwnedResource({
  model: 'product',
  idParam: 'productId',
  ownerField: 'seller_id',
  resourceKey: 'product',
  include: { auction: true },
});

router.post(
  '/',
  ...sellerOnly,
  validateRequest({ body: ['title', 'category_id', 'condition', 'images'] }),
  productController.createProductController,
);

router.get('/my-products', ...sellerOnly, productController.getMyProductsController);

router.get(
  '/:productId',
  validateRequest({ params: ['productId'] }),
  productController.getProductController,
);

router.patch(
  '/:productId',
  ...sellerOnly,
  validateRequest({ params: ['productId'] }),
  loadOwnedProduct,
  productController.updateProductController,
);

router.delete(
  '/:productId',
  ...sellerOnly,
  validateRequest({ params: ['productId'] }),
  loadOwnedProduct,
  productController.deleteProductController,
);

module.exports = router;