const AppError = require('../errors/AppError');
const sellerProfileRepository = require('./sellerProfile.repository');

const validateProfileData = (data) => {
  const fields = ['short_bio', 'bio', 'banner_url', 'website_url'];
  const updates = Object.fromEntries(Object.entries(data).filter(([key, value]) => fields.includes(key) && value !== undefined));

  if (Object.keys(updates).length === 0) {
    throw new AppError('Provide at least one profile field', 400, 'VALIDATION_ERROR');
  }
  if (updates.bio !== undefined && (typeof updates.bio !== 'string' || updates.bio.length > 2000)) {
    throw new AppError('bio must be a string up to 2000 characters', 400, 'VALIDATION_ERROR');
  }
  if (updates.short_bio !== undefined) {
    if (typeof updates.short_bio !== 'string') {
      throw new AppError('short_bio must be a string', 400, 'VALIDATION_ERROR');
    }
    const shortBio = updates.short_bio.trim();
    if (shortBio.length > 150 || (shortBio ? shortBio.split(/\s+/).length : 0) > 5) {
      throw new AppError('short_bio must be no more than 5 words', 400, 'VALIDATION_ERROR');
    }
    updates.short_bio = shortBio || null;
  }
  for (const field of ['banner_url', 'website_url']) {
    if (updates[field] !== undefined && (typeof updates[field] !== 'string' || updates[field].length > 500)) {
      throw new AppError(`${field} must be a string up to 500 characters`, 400, 'VALIDATION_ERROR');
    }
  }

  return updates;
};

const getPublicSellerProfileService = async (sellerId) => {
  const seller = await sellerProfileRepository.findPublicSeller(sellerId);
  if (!seller) throw new AppError('Seller was not found', 404, 'SELLER_NOT_FOUND');

  return {
    ...seller,
    rating: {
      average: Number(seller.seller_profile?.rating_average || 0),
      count: seller.seller_profile?.rating_count || 0,
    },
  };
};

const getPublicSellerDirectoryService = async (query) => {
  const page = Number.parseInt(query.page || '1', 10);
  const limit = Number.parseInt(query.limit || '12', 10);
  const sort = query.sort || 'top_rated';
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('page must be positive and limit must be between 1 and 50', 400, 'VALIDATION_ERROR');
  }
  if (!sellerProfileRepository.directoryOrderBy[sort]) {
    throw new AppError('sort must be top_rated, most_reviewed, or newest', 400, 'VALIDATION_ERROR');
  }

  const [profiles, totalItems] = await Promise.all([
    sellerProfileRepository.findPublicSellerDirectory((page - 1) * limit, limit, sellerProfileRepository.directoryOrderBy[sort]),
    sellerProfileRepository.countPublicSellerDirectory(),
  ]);
  return {
    sellers: profiles.map(({ seller, ...profile }) => ({
      ...seller,
      seller_profile: profile,
      rating: { average: Number(profile.rating_average), count: profile.rating_count },
    })),
    pagination: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
  };
};

const getSellerReviewsService = async (sellerId, query) => {
  const page = Number.parseInt(query.page || '1', 10);
  const limit = Number.parseInt(query.limit || '10', 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('page must be positive and limit must be between 1 and 50', 400, 'VALIDATION_ERROR');
  }
  const seller = await sellerProfileRepository.findPublicSeller(sellerId);
  if (!seller) throw new AppError('Seller was not found', 404, 'SELLER_NOT_FOUND');

  const [reviews, totalItems] = await Promise.all([
    sellerProfileRepository.findSellerReviews(sellerId, (page - 1) * limit, limit),
    sellerProfileRepository.countSellerReviews(sellerId),
  ]);
  return { reviews, pagination: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) } };
};

const updateMySellerProfileService = (sellerId, data) => sellerProfileRepository.upsertSellerProfile(sellerId, validateProfileData(data));

const createSellerReviewService = async (reviewerId, sellerId, data) => {
  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError('rating must be an integer between 1 and 5', 400, 'VALIDATION_ERROR');
  }
  if (!data.auction_id || typeof data.auction_id !== 'string') {
    throw new AppError('auction_id is required', 400, 'VALIDATION_ERROR');
  }
  if (data.comment !== undefined && (typeof data.comment !== 'string' || data.comment.length > 2000)) {
    throw new AppError('comment must be a string up to 2000 characters', 400, 'VALIDATION_ERROR');
  }

  const auction = await sellerProfileRepository.findReviewEligibility(data.auction_id);
  if (!auction) throw new AppError('Auction was not found', 404, 'AUCTION_NOT_FOUND');
  if (auction.seller_id !== sellerId) throw new AppError('Auction does not belong to this seller', 409, 'REVIEW_SELLER_MISMATCH');
  if (auction.status === 'CANCELLED' || new Date() < auction.end_time) {
    throw new AppError('Reviews can only be submitted after the auction ends', 409, 'AUCTION_NOT_ENDED');
  }
  if (auction.highest_bid?.bidder_id !== reviewerId) {
    throw new AppError('Only the winning bidder can review this seller', 403, 'REVIEW_NOT_ALLOWED');
  }
  if (await sellerProfileRepository.reviewExistsForAuction(data.auction_id)) {
    throw new AppError('A review has already been submitted for this auction', 409, 'REVIEW_ALREADY_EXISTS');
  }

  return sellerProfileRepository.createSellerReview({
    seller_id: sellerId,
    reviewer_id: reviewerId,
    auction_id: data.auction_id,
    rating,
    comment: data.comment?.trim() || null,
  });
};

module.exports = {
  getPublicSellerProfileService,
  getPublicSellerDirectoryService,
  getSellerReviewsService,
  updateMySellerProfileService,
  createSellerReviewService,
};