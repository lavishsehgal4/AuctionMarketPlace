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
		select: {
			id: true,
			display_name: true,
			avatar_url: true,
			seller_profile: { select: { banner_url: true, rating_average: true, rating_count: true } },
		},
	},
	winner: {
		select: { id: true, display_name: true },
	},
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
	seller: {
		select: {
			id: true,
			display_name: true,
			avatar_url: true,
			seller_profile: { select: { banner_url: true, rating_average: true, rating_count: true } },
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

const cancelScheduledAuction = (auctionId, sellerId, cancellationDeadline) => getPrismaClient().auction.updateMany({
	where: {
		id: auctionId,
		seller_id: sellerId,
		status: 'SCHEDULED',
		start_time: { gt: cancellationDeadline },
	},
	data: { status: 'CANCELLED' },
});

const activateScheduledAuctions = (now) => getPrismaClient().auction.updateMany({
	where: {
		status: 'SCHEDULED',
		start_time: { lte: now },
	},
	data: { status: 'ACTIVE' },
});

const finalizeExpiredAuctions = async (now) => {
	const finalized = await getPrismaClient().$queryRaw`
		UPDATE "Auction"
		SET "status" = CASE WHEN "highest_bid_id" IS NULL THEN 'UNSOLD'::"AuctionStatus" ELSE 'ENDED'::"AuctionStatus" END,
			"updated_at" = CURRENT_TIMESTAMP
		WHERE "status" IN ('SCHEDULED'::"AuctionStatus", 'ACTIVE'::"AuctionStatus")
			AND "end_time" <= ${now}
		RETURNING "id", "status";
	`;
	const endedAuctionIds = finalized.filter((auction) => auction.status === 'ENDED').map((auction) => auction.id);
	const unsoldAuctionIds = finalized.filter((auction) => auction.status === 'UNSOLD').map((auction) => auction.id);
	return { ended: endedAuctionIds.length, unsold: unsoldAuctionIds.length, auctionIds: [...endedAuctionIds, ...unsoldAuctionIds] };
};

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
	cancelScheduledAuction,
	activateScheduledAuctions,
	finalizeExpiredAuctions,
};
