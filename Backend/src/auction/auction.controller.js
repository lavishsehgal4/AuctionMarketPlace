const asyncHandler = require('../errors/asyncHandler');
const auctionService = require('./auction.service');

const createAuctionController = asyncHandler(async (req, res) => {
	const auction = await auctionService.createAuctionService(req.user.userId, req.body);

	res.status(201).json({
		success: true,
		message: 'Auction registered successfully',
		data: { auction },
	});
});

const getAuctionsController = asyncHandler(async (req, res) => {
	const auctions = await auctionService.getAuctionsService();

	res.status(200).json({ success: true, data: { auctions } });
});

const getMyAuctionsController = asyncHandler(async (req, res) => {
	const auctions = await auctionService.getMyAuctionsService(req.user.userId);

	res.status(200).json({ success: true, data: { auctions } });
});

const getAuctionController = asyncHandler(async (req, res) => {
	const auction = await auctionService.getAuctionService(req.params.auctionId);

	res.status(200).json({ success: true, data: { auction } });
});

const cancelAuctionController = asyncHandler(async (req, res) => {
	const auction = await auctionService.cancelAuctionService(req.user.userId, req.params.auctionId);

	res.status(200).json({
		success: true,
		message: 'Auction cancelled successfully',
		data: { auction },
	});
});

module.exports = {
	createAuctionController,
	getAuctionsController,
	getMyAuctionsController,
	getAuctionController,
	cancelAuctionController,
};
