const { getPrismaClient } = require('../config/supabase');

const getHistoryWhere = (bidderId, startOfDay, endOfDay, search) => ({
  bidder_id: bidderId,
  placed_at: { gte: startOfDay, lt: endOfDay },
  ...(search ? { auction: { product: { title: { contains: search, mode: 'insensitive' } } } } : {}),
});

const findBidderHistory = (where, skip, take) => getPrismaClient().bid.findMany({
  where,
  distinct: ['auction_id'],
  orderBy: { placed_at: 'desc' },
  skip,
  take,
  select: {
    auction_id: true,
    placed_at: true,
    auction: {
      select: {
        status: true,
        start_time: true,
        end_time: true,
        product: { select: { title: true, primary_image: true, condition: true, category: { select: { name: true } } } },
        seller: { select: { display_name: true } },
      },
    },
  },
});

const countBidderHistory = async (where) => {
  const auctions = await getPrismaClient().bid.groupBy({ by: ['auction_id'], where });
  return auctions.length;
};

module.exports = { getHistoryWhere, findBidderHistory, countBidderHistory };