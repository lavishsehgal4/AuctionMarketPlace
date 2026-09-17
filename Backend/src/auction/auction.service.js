const AppError = require('../errors/AppError');
const auctionRepository = require('./auction.repository');

const toPositiveNumber = (value, fieldName) => {
	const numberValue = Number(value);

	if (!Number.isFinite(numberValue) || numberValue <= 0) {
		throw new AppError(`${fieldName} must be a positive number`, 400, 'VALIDATION_ERROR');
	}

	return numberValue;
};

const parseAuctionTimes = (startTime, endTime) => {
	const startDate = new Date(startTime);
	const endDate = new Date(endTime);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		throw new AppError('start_time and end_time must be valid ISO 8601 dates', 400, 'VALIDATION_ERROR');
	}

	if (endDate <= startDate) {
		throw new AppError('end_time must be after start_time', 400, 'VALIDATION_ERROR');
	}

	return { startDate, endDate };
};

const createAuctionService = async (sellerId, auctionData) => {
	const {
		product_id: productId,
		starting_price: startingPrice,
		min_bid_increment: minBidIncrement,
		start_time: startTime,
		end_time: endTime,
	} = auctionData;

	const normalizedStartingPrice = toPositiveNumber(startingPrice, 'starting_price');
	const normalizedMinIncrement = toPositiveNumber(minBidIncrement, 'min_bid_increment');
	const { startDate, endDate } = parseAuctionTimes(startTime, endTime);
	const product = await auctionRepository.findOwnedProductWithoutAuction(productId, sellerId);

	if (!product) {
		throw new AppError('Product was not found or is already registered for auction', 409, 'PRODUCT_UNAVAILABLE');
	}

	return auctionRepository.createAuction({
		product_id: productId,
		seller_id: sellerId,
		starting_price: normalizedStartingPrice,
		current_bid: normalizedStartingPrice,
		min_bid_increment: normalizedMinIncrement,
		start_time: startDate,
		end_time: endDate,
	});
};

const getAuctionService = async (auctionId) => {
	const auction = await auctionRepository.findAuctionById(auctionId);

	if (!auction) {
		throw new AppError('Auction was not found', 404, 'AUCTION_NOT_FOUND');
	}

	return auction;
};

const getAuctionsService = () => auctionRepository.findAuctions();

const getMyAuctionsService = (sellerId) => auctionRepository.findAuctionsBySellerId(sellerId);

const cancelAuctionService = async (sellerId, auctionId) => {
	const auction = await auctionRepository.findOwnedAuctionById(auctionId, sellerId);

	if (!auction) {
		throw new AppError('Auction was not found', 404, 'AUCTION_NOT_FOUND');
	}

	if (auction.status !== 'SCHEDULED' || new Date() >= auction.start_time) {
		throw new AppError('Auction can only be cancelled before its start time', 409, 'AUCTION_CANNOT_BE_CANCELLED');
	}

	return auctionRepository.cancelAuction(auction.id);
};

module.exports = {
	createAuctionService,
	getAuctionService,
	getAuctionsService,
	getMyAuctionsService,
	cancelAuctionService,
};
