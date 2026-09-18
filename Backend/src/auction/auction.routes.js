const express = require('express');
const { verifyAccessTokenMiddleware } = require('../auth/auth.middleware');
const requireRole = require('../middleware/requireRole');
const validateRequest = require('../middleware/validateRequest');
const auctionController = require('./auction.controller');

const router = express.Router();

const sellerOnly = [verifyAccessTokenMiddleware, requireRole('SELLER')];

router.post(
	'/',
	...sellerOnly,
	validateRequest({ body: ['product_id', 'starting_price', 'min_bid_increment', 'start_time', 'end_time'] }),
	auctionController.createAuctionController,
);

router.get('/my-auctions', ...sellerOnly, auctionController.getMyAuctionsController);

router.get(
	'/my-auctions/:auctionId',
	...sellerOnly,
	validateRequest({ params: ['auctionId'] }),
	auctionController.getMyAuctionDetailController,
);

router.get('/', auctionController.getAuctionsController);

router.get(
	'/:auctionId',
	validateRequest({ params: ['auctionId'] }),
	auctionController.getAuctionController,
);

router.post(
	'/:auctionId/cancel',
	...sellerOnly,
	validateRequest({ params: ['auctionId'] }),
	auctionController.cancelAuctionController,
);

module.exports = router;
