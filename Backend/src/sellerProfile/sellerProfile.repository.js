const { getPrismaClient } = require('../config/supabase');

const publicSellerSelection = {
  id: true,
  display_name: true,
  avatar_url: true,
  seller_profile: {
    select: { short_bio: true, bio: true, banner_url: true, website_url: true, rating_average: true, rating_count: true, created_at: true },
  },
};

const findPublicSeller = (sellerId) => getPrismaClient().user.findFirst({
  where: { id: sellerId, account_type: 'SELLER', account_status: 'ACTIVE' },
  select: publicSellerSelection,
});

const findPublicSellerDirectory = (skip, take, orderBy) => getPrismaClient().sellerProfile.findMany({
  where: { seller: { account_type: 'SELLER', account_status: 'ACTIVE' } },
  skip,
  take,
  orderBy,
  select: {
    short_bio: true,
    bio: true,
    banner_url: true,
    website_url: true,
    rating_average: true,
    rating_count: true,
    seller: { select: { id: true, display_name: true, avatar_url: true } },
  },
});

const countPublicSellerDirectory = () => getPrismaClient().sellerProfile.count({
  where: { seller: { account_type: 'SELLER', account_status: 'ACTIVE' } },
});

const directoryOrderBy = {
  top_rated: [{ rating_average: 'desc' }, { rating_count: 'desc' }, { created_at: 'desc' }],
  most_reviewed: [{ rating_count: 'desc' }, { rating_average: 'desc' }, { created_at: 'desc' }],
  newest: [{ created_at: 'desc' }],
};

const findSellerReviews = (sellerId, skip, take) => getPrismaClient().sellerReview.findMany({
  where: { seller_id: sellerId },
  orderBy: { created_at: 'desc' },
  skip,
  take,
  select: {
    id: true,
    rating: true,
    comment: true,
    created_at: true,
    reviewer: { select: { display_name: true, avatar_url: true } },
    auction: { select: { id: true, product: { select: { title: true } } } },
  },
});

const countSellerReviews = (sellerId) => getPrismaClient().sellerReview.count({ where: { seller_id: sellerId } });

const upsertSellerProfile = (sellerId, data) => getPrismaClient().sellerProfile.upsert({
  where: { seller_id: sellerId },
  create: { seller_id: sellerId, ...data },
  update: data,
  select: { id: true, seller_id: true, short_bio: true, bio: true, banner_url: true, website_url: true, rating_average: true, rating_count: true, created_at: true, updated_at: true },
});

const findReviewEligibility = (auctionId) => getPrismaClient().auction.findUnique({
  where: { id: auctionId },
  select: {
    seller_id: true,
    end_time: true,
    status: true,
    highest_bid: { select: { bidder_id: true } },
  },
});

const reviewExistsForAuction = (auctionId) => getPrismaClient().sellerReview.findUnique({
  where: { auction_id: auctionId },
  select: { id: true },
});

const createSellerReview = (data) => getPrismaClient().$transaction(async (transaction) => {
  const review = await transaction.sellerReview.create({
    data,
    select: {
      id: true,
      rating: true,
      comment: true,
      created_at: true,
      reviewer: { select: { display_name: true, avatar_url: true } },
      auction: { select: { id: true, product: { select: { title: true } } } },
    },
  });
  const rating = await transaction.sellerReview.aggregate({
    where: { seller_id: data.seller_id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await transaction.sellerProfile.upsert({
    where: { seller_id: data.seller_id },
    create: { seller_id: data.seller_id, rating_average: rating._avg.rating || 0, rating_count: rating._count.rating },
    update: { rating_average: rating._avg.rating || 0, rating_count: rating._count.rating },
  });
  return review;
});

module.exports = {
  findPublicSeller,
  findPublicSellerDirectory,
  countPublicSellerDirectory,
  directoryOrderBy,
  findSellerReviews,
  countSellerReviews,
  upsertSellerProfile,
  findReviewEligibility,
  reviewExistsForAuction,
  createSellerReview,
};