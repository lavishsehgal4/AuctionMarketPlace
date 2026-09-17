const { getPrismaClient } = require('../config/supabase');

const auctionSelection = {
	id: true,
	starting_price: true,
	current_bid: true,
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
			images: true,
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

const findOwnedProductWithoutAuction = (productId, sellerId) => getPrismaClient().product.findFirst({
	where: {
		id: productId,
		seller_id: sellerId,
		auction: null,
	},
	select: { id: true },
});

const createAuction = (auctionData) => getPrismaClient().auction.create({
	data: auctionData,
	select: auctionSelection,
});

const findAuctionById = (auctionId) => getPrismaClient().auction.findUnique({
	where: { id: auctionId },
	select: auctionSelection,
});

const findAuctions = () => getPrismaClient().auction.findMany({
	where: { status: { in: ['SCHEDULED', 'ACTIVE'] } },
	select: auctionSelection,
	orderBy: { start_time: 'asc' },
});

const findAuctionsBySellerId = (sellerId) => getPrismaClient().auction.findMany({
	where: { seller_id: sellerId },
	select: auctionSelection,
	orderBy: { created_at: 'desc' },
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

module.exports = {
	findOwnedProductWithoutAuction,
	createAuction,
	findAuctionById,
	findAuctions,
	findAuctionsBySellerId,
	findOwnedAuctionById,
	cancelAuction,
};
