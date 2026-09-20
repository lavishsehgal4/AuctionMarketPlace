const { getPrismaClient } = require('../config/supabase');

const findAuctionCompletion = (auctionId) => getPrismaClient().auction.findUnique({
  where: { id: auctionId },
  select: {
    id: true,
    status: true,
    seller_id: true,
    winner_id: true,
    product: { select: { title: true } },
    highest_bid: { select: { bidder_id: true } },
    bids: { distinct: ['bidder_id'], select: { bidder_id: true } },
  },
});

const processAuctionCompletion = (auction) => getPrismaClient().$transaction(async (transaction) => {
  if (!['ENDED', 'UNSOLD'].includes(auction.status)) return;

  const notifications = [];
  if (auction.status === 'ENDED' && auction.highest_bid) {
    const winnerId = auction.highest_bid.bidder_id;
    await transaction.auction.updateMany({
      where: { id: auction.id, winner_id: null },
      data: { winner_id: winnerId },
    });
    notifications.push(
      {
        user_id: winnerId,
        auction_id: auction.id,
        type: 'AUCTION_WON',
        title: 'You won an auction',
        message: `You placed the winning bid for ${auction.product.title}.`,
      },
      {
        user_id: auction.seller_id,
        auction_id: auction.id,
        type: 'AUCTION_ENDED',
        title: 'Your auction ended',
        message: `${auction.product.title} has ended with a winning bid.`,
      },
      ...auction.bids
        .filter((bid) => bid.bidder_id !== winnerId)
        .map((bid) => ({
          user_id: bid.bidder_id,
          auction_id: auction.id,
          type: 'AUCTION_LOST',
          title: 'Auction ended',
          message: `Another bidder won ${auction.product.title}.`,
        })),
    );
  }
  if (auction.status === 'UNSOLD') {
    notifications.push({
      user_id: auction.seller_id,
      auction_id: auction.id,
      type: 'AUCTION_UNSOLD',
      title: 'Your auction ended unsold',
      message: `${auction.product.title} ended without any bids.`,
    });
  }
  if (notifications.length > 0) {
    await transaction.notification.createMany({ data: notifications, skipDuplicates: true });
  }
});

const findNotifications = (userId, where, skip, take) => getPrismaClient().notification.findMany({
  where: { user_id: userId, ...where },
  orderBy: { created_at: 'desc' },
  skip,
  take,
  select: { id: true, type: true, title: true, message: true, auction_id: true, read_at: true, created_at: true },
});

const countNotifications = (userId, where) => getPrismaClient().notification.count({ where: { user_id: userId, ...where } });
const countUnreadNotifications = (userId) => getPrismaClient().notification.count({ where: { user_id: userId, read_at: null } });

const markNotificationRead = (notificationId, userId) => getPrismaClient().notification.updateMany({
  where: { id: notificationId, user_id: userId, read_at: null },
  data: { read_at: new Date() },
});

module.exports = {
  findAuctionCompletion,
  processAuctionCompletion,
  findNotifications,
  countNotifications,
  countUnreadNotifications,
  markNotificationRead,
};