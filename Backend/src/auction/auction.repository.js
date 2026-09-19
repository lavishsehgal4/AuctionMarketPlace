const { getPrismaClient } = require('../config/supabase');

const auctionSelection = {
	id: true,
	starting_price: true,
	bid_count: true,
	highest_bid: {
		select: { id: true, amount: true },
	},
	min_bid_increment: true,
	start_time: true,
	end_time: true,
	status: true,
	created_at: true,
	updated_at: true,
	product: {
		select: {
			id: true,
			title: true,
			description: true,
			condition: true,
			primary_image: true,
			additional_images: true,
			category: {
				select: { id: true, name: true, slug: true },
			},
		},
	},
	seller: {
		select: { id: true, display_name: true },
	},
	winner: {
		select: { id: true, display_name: true },
	},
};

const sellerAuctionListSelection = {
	id: true,
	status: true,
	starting_price: true,
	bid_count: true,
	highest_bid: { select: { amount: true } },
	end_time: true,
	product: {
		select: {
			title: true,
			primary_image: true,
			condition: true,
			category: { select: { name: true } },
		},
	},
};

const publicAuctionListSelection = {
	id: true,
	status: true,
	starting_price: true,
	bid_count: true,
	highest_bid: { select: { amount: true } },
	min_bid_increment: true,
	start_time: true,
	end_time: true,
	product: {
		select: {
			title: true,
			primary_image: true,
			condition: true,
			category: { select: { id: true, name: true } },
		},
	},
};

const sellerAuctionDetailSelection = {
	...auctionSelection,
	bids: {
		orderBy: { placed_at: 'desc' },
		take: 20,
		select: {
			id: true,
			amount: true,
			placed_at: true,
			bidder: { select: { display_name: true } },
		},
	},
};

const findOwnedProductWithoutAuction = (productId, sellerId, now = new Date()) => getPrismaClient().product.findFirst({
	where: {
		id: productId,
		seller_id: sellerId,
		auctions: {
			none: { status: { not: 'CANCELLED' }, end_time: { gt: now } },
		},
	},
	select: { id: true },
});

const findAuctionRoomById = (auctionId) => getPrismaClient().auction.findUnique({
	where: { id: auctionId },
	select: { id: true, status: true, start_time: true, end_time: true },
});

const createAuction = (auctionData) => getPrismaClient().auction.create({
	data: auctionData,
	select: auctionSelection,
});

const findAuctionById = (auctionId) => getPrismaClient().auction.findUnique({
	where: { id: auctionId },
	select: auctionSelection,
});

const findPublicAuctionList = (where, orderBy, skip, take) => getPrismaClient().auction.findMany({
	where,
	select: publicAuctionListSelection,
	orderBy,
	skip,
	take,
});

const countPublicAuctions = (where) => getPrismaClient().auction.count({ where });

const findSellerAuctionList = (where, orderBy, skip, take) => getPrismaClient().auction.findMany({
	where,
	select: sellerAuctionListSelection,
	orderBy,
	skip,
	take,
});

const countSellerAuctions = (where) => getPrismaClient().auction.count({ where });

const countSellerAuctionsByStatus = (sellerId) => getPrismaClient().auction.groupBy({
	by: ['status'],
	where: { seller_id: sellerId },
	_count: { _all: true },
});

const findAuctionDetailBySellerId = (auctionId, sellerId) => getPrismaClient().auction.findFirst({
	where: { id: auctionId, seller_id: sellerId },
	select: sellerAuctionDetailSelection,
});

const findOwnedAuctionById = (auctionId, sellerId) => getPrismaClient().auction.findFirst({
	where: { id: auctionId, seller_id: sellerId },
	select: { id: true, start_time: true, status: true },
});

const cancelAuction = (auctionId) => getPrismaClient().auction.update({
	where: { id: auctionId },
	data: { status: 'CANCELLED' },
	select: auctionSelection,
});

const activateScheduledAuctions = (now) => getPrismaClient().auction.updateMany({
	where: {
		status: 'SCHEDULED',
		start_time: { lte: now },
	},
	data: { status: 'ACTIVE' },
});

module.exports = {
	findOwnedProductWithoutAuction,
	findAuctionRoomById,
	createAuction,
	findAuctionById,
	findPublicAuctionList,
	countPublicAuctions,
	findSellerAuctionList,
	countSellerAuctions,
	countSellerAuctionsByStatus,
	findAuctionDetailBySellerId,
	findOwnedAuctionById,
	cancelAuction,
	activateScheduledAuctions,
};
