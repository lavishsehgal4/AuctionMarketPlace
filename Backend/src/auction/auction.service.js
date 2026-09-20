const AppError = require('../errors/AppError');
const auctionRepository = require('./auction.repository');
const { getEffectiveAuctionStatus, getEffectiveStatusWhere } = require('./auction.state');
const { AUCTION_CANCELLATION_WINDOW_MS } = require('../config/constants');

const auctionStatuses = ['SCHEDULED', 'ACTIVE', 'ENDED', 'UNSOLD', 'CANCELLED'];
const sortOrders = {
	ending_soon: { end_time: 'asc' },
	newest: { created_at: 'desc' },
	oldest: { created_at: 'asc' },
	highest_bid: { highest_bid: { amount: 'desc' } },
	starting_price: { starting_price: 'desc' },
};
const publicSortOrders = {
	ending_soon: { end_time: 'asc' },
	starting_soon: { start_time: 'asc' },
	newest: { created_at: 'desc' },
	starting_price: { starting_price: 'asc' },
};

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

	if (startDate <= new Date()) {
		throw new AppError('start_time must be in the future', 400, 'VALIDATION_ERROR');
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

	return { ...auction, status: getEffectiveAuctionStatus(auction) };
};

const getAuctionsService = async (query) => {
	const view = query.view || 'LIVE';
	const sort = query.sort || (view === 'UPCOMING' ? 'starting_soon' : 'ending_soon');
	const page = Number.parseInt(query.page || '1', 10);
	const limit = Number.parseInt(query.limit || '12', 10);
	const now = new Date();

	if (!['LIVE', 'UPCOMING'].includes(view)) {
		throw new AppError('view must be LIVE or UPCOMING', 400, 'VALIDATION_ERROR');
	}

	if (!publicSortOrders[sort] || (view === 'LIVE' && sort === 'starting_soon')) {
		throw new AppError('sort is not supported for this view', 400, 'VALIDATION_ERROR');
	}

	if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
		throw new AppError('page must be positive and limit must be between 1 and 50', 400, 'VALIDATION_ERROR');
	}

	const timeFilter = view === 'LIVE'
		? getEffectiveStatusWhere('ACTIVE', now)
		: getEffectiveStatusWhere('SCHEDULED', now);
	const where = {
		...timeFilter,
		...(query.category_id ? { product: { category_id: query.category_id } } : {}),
	};
	const [auctions, totalItems] = await Promise.all([
		auctionRepository.findPublicAuctionList(where, publicSortOrders[sort], (page - 1) * limit, limit),
		auctionRepository.countPublicAuctions(where),
	]);

	return {
		auctions: auctions.map(({ product, ...auction }) => ({
			...auction,
			status: getEffectiveAuctionStatus(auction, now),
			product: {
				title: product.title,
				image_url: product.primary_image,
				category_name: product.category.name,
				condition: product.condition,
			},
		})),
		pagination: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
	};
};

const getMyAuctionsService = async (sellerId, query) => {
	const status = query.status || 'ACTIVE';
	const sort = query.sort || 'ending_soon';
	const page = Number.parseInt(query.page || '1', 10);
	const limit = Number.parseInt(query.limit || '10', 10);
	const now = new Date();

	if (status !== 'ALL' && !auctionStatuses.includes(status)) {
		throw new AppError('status must be a valid auction status or ALL', 400, 'VALIDATION_ERROR');
	}

	if (!sortOrders[sort]) {
		throw new AppError('sort is not supported', 400, 'VALIDATION_ERROR');
	}

	if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
		throw new AppError('page must be positive and limit must be between 1 and 50', 400, 'VALIDATION_ERROR');
	}

	const where = { seller_id: sellerId, ...(status === 'ALL' ? {} : getEffectiveStatusWhere(status, now)) };
	const summaryQueries = auctionStatuses.map((auctionStatus) => auctionRepository.countSellerAuctions({
		seller_id: sellerId,
		...getEffectiveStatusWhere(auctionStatus, now),
	}));
	const [auctions, totalItems, statusCounts] = await Promise.all([
		auctionRepository.findSellerAuctionList(where, sortOrders[sort], (page - 1) * limit, limit),
		auctionRepository.countSellerAuctions(where),
		Promise.all(summaryQueries),
	]);
	const summary = Object.fromEntries(auctionStatuses.map((auctionStatus) => [auctionStatus.toLowerCase(), 0]));
	statusCounts.forEach((count, index) => {
		summary[auctionStatuses[index].toLowerCase()] = count;
	});

	return {
		auctions: auctions.map(({ product, ...auction }) => ({
			...auction,
			status: getEffectiveAuctionStatus(auction, now),
			product: {
				title: product.title,
				image_url: product.primary_image,
				category_name: product.category.name,
				condition: product.condition,
			},
		})),
		summary,
		pagination: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
	};
};

const getMyAuctionDetailService = async (sellerId, auctionId) => {
	const auction = await auctionRepository.findAuctionDetailBySellerId(auctionId, sellerId);

	if (!auction) {
		throw new AppError('Auction was not found', 404, 'AUCTION_NOT_FOUND');
	}

	return { ...auction, status: getEffectiveAuctionStatus(auction) };
};

const cancelAuctionService = async (sellerId, auctionId) => {
	const cancellationDeadline = new Date(Date.now() + AUCTION_CANCELLATION_WINDOW_MS);
	const result = await auctionRepository.cancelScheduledAuction(auctionId, sellerId, cancellationDeadline);

	if (result.count === 0) {
		throw new AppError('Only scheduled auctions starting more than five minutes from now can be cancelled', 409, 'AUCTION_CANNOT_BE_CANCELLED');
	}

	return auctionRepository.findAuctionById(auctionId);
};

const activateScheduledAuctionsService = () => auctionRepository.activateScheduledAuctions(new Date());
const finalizeExpiredAuctionsService = () => auctionRepository.finalizeExpiredAuctions(new Date());

module.exports = {
	createAuctionService,
	getAuctionService,
	getAuctionsService,
	getMyAuctionsService,
	getMyAuctionDetailService,
	cancelAuctionService,
	activateScheduledAuctionsService,
	finalizeExpiredAuctionsService,
};
