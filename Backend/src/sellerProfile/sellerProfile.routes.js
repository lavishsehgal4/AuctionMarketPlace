const express = require('express');
const { verifyAccessTokenMiddleware } = require('../auth/auth.middleware');
const requireRole = require('../middleware/requireRole');
const validateRequest = require('../middleware/validateRequest');
const controller = require('./sellerProfile.controller');

const router = express.Router();

router.patch('/me', verifyAccessTokenMiddleware, requireRole('SELLER'), controller.updateMySellerProfileController);
router.get('/', controller.getPublicSellerDirectoryController);
router.get('/:sellerId', validateRequest({ params: ['sellerId'] }), controller.getPublicSellerProfileController);
router.get('/:sellerId/reviews', validateRequest({ params: ['sellerId'] }), controller.getSellerReviewsController);
router.post('/:sellerId/reviews', verifyAccessTokenMiddleware, requireRole('BIDDER'), validateRequest({ params: ['sellerId'], body: ['auction_id', 'rating'] }), controller.createSellerReviewController);

module.exports = router;