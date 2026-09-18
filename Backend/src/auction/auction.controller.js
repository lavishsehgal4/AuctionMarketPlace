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
	const result = await auctionService.getAuctionsService(req.query);

	res.status(200).json({ success: true, data: result });
});

const getMyAuctionsController = asyncHandler(async (req, res) => {
	const result = await auctionService.getMyAuctionsService(req.user.userId, req.query);

	res.status(200).json({ success: true, data: result });
});

const getMyAuctionDetailController = asyncHandler(async (req, res) => {
	const auction = await auctionService.getMyAuctionDetailService(req.user.userId, req.params.auctionId);

	res.status(200).json({ success: true, data: { auction } });
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
	getMyAuctionDetailController,
	getAuctionController,
	cancelAuctionController,
};
