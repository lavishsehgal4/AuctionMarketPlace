const { getPrismaClient } = require('../config/supabase');

const placeBidTransaction = (auctionId, bidderId, bidAmount) => getPrismaClient().$transaction(async (transaction) => {
  const auctions = await transaction.$queryRaw`
    SELECT
      "id", "seller_id", "starting_price", "min_bid_increment", "highest_bid_id",
      "bid_count", "status", "start_time", "end_time", clock_timestamp() AS "database_now"
    FROM "Auction"
    WHERE "id" = ${auctionId}::uuid
    FOR UPDATE
  `;
  const auction = auctions[0];

  if (!auction) return { code: 'AUCTION_NOT_FOUND' };
  if (auction.seller_id === bidderId) return { code: 'SELLER_CANNOT_BID' };
  if (auction.status === 'CANCELLED') return { code: 'AUCTION_CANCELLED' };

  const databaseNow = new Date(auction.database_now);
  if (databaseNow < auction.start_time) return { code: 'AUCTION_NOT_STARTED' };
  if (databaseNow >= auction.end_time) return { code: 'AUCTION_ENDED' };

  const bidder = await transaction.user.findUnique({
    where: { id: bidderId },
    select: { account_type: true, account_status: true, display_name: true },
  });
  if (!bidder || bidder.account_status !== 'ACTIVE' || bidder.account_type !== 'BIDDER') {
    return { code: 'BIDDER_NOT_ELIGIBLE' };
  }

  const highestBid = auction.highest_bid_id
    ? await transaction.bid.findUnique({ where: { id: auction.highest_bid_id }, select: { amount: true } })
    : null;
  const minimumBid = Number(highestBid?.amount ?? auction.starting_price) + Number(auction.min_bid_increment);
  if (bidAmount < minimumBid) return { code: 'BID_TOO_LOW', minimum_bid: minimumBid };

  const bid = await transaction.bid.create({
    data: { auction_id: auctionId, bidder_id: bidderId, amount: bidAmount },
    select: { id: true, amount: true, placed_at: true },
  });
  const updatedAuctions = await transaction.$queryRaw`
    UPDATE "Auction"
    SET
      "highest_bid_id" = ${bid.id}::uuid,
      "bid_count" = "bid_count" + 1,
      "updated_at" = clock_timestamp()
    WHERE "id" = ${auctionId}::uuid
      AND "status" <> 'CANCELLED'
      AND "start_time" <= clock_timestamp()
      AND "end_time" > clock_timestamp()
    RETURNING "id", "bid_count"
  `;
  const updatedAuction = updatedAuctions[0];
  if (!updatedAuction) {
    const error = new Error('Auction expired before the bid could be accepted');
    error.code = 'AUCTION_ENDED';
    throw error;
  }

  return {
    code: 'BID_ACCEPTED',
    auction_id: updatedAuction.id,
    bid_count: updatedAuction.bid_count,
    highest_bid: { id: bid.id, amount: bid.amount },
    bid: { ...bid, bidder: { display_name: bidder.display_name } },
  };
});

module.exports = { placeBidTransaction };