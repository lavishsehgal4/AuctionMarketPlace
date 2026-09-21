const AppError = require('../errors/AppError');
const bidderHistoryRepository = require('./bidderHistory.repository');

const getDayBounds = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError('date must use YYYY-MM-DD format', 400, 'VALIDATION_ERROR');
  }
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(startOfDay.getTime())) {
    throw new AppError('date must be valid', 400, 'VALIDATION_ERROR');
  }
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
  return { startOfDay, endOfDay };
};

const getBidderHistoryService = async (bidderId, query) => {
  const date = query.date || new Date().toISOString().slice(0, 10);
  const page = Number.parseInt(query.page || '1', 10);
  const limit = Number.parseInt(query.limit || '20', 10);
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('page must be positive and limit must be between 1 and 50', 400, 'VALIDATION_ERROR');
  }
  if (search.length > 100) throw new AppError('search must be 100 characters or fewer', 400, 'VALIDATION_ERROR');

  const { startOfDay, endOfDay } = getDayBounds(date);
  const where = bidderHistoryRepository.getHistoryWhere(bidderId, startOfDay, endOfDay, search);
  const [bids, totalItems] = await Promise.all([
    bidderHistoryRepository.findBidderHistory(where, (page - 1) * limit, limit),
    bidderHistoryRepository.countBidderHistory(where),
  ]);
  return {
    auctions: bids.map((bid) => ({ id: bid.auction_id, bid_placed_at: bid.placed_at, ...bid.auction })),
    pagination: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
  };
};

module.exports = { getBidderHistoryService };