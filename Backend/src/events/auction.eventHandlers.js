const eventBus = require('./eventBus');
const { AUCTIONS_ENDED } = require('./auction.events');
const { processAuctionCompletionService } = require('../notifications/notification.service');

let isRegistered = false;

const registerAuctionEventHandlers = () => {
  if (isRegistered) return;
  isRegistered = true;

  eventBus.on(AUCTIONS_ENDED, ({ auctionIds }) => {
    auctionIds.forEach(async (auctionId) => {
      try {
        await processAuctionCompletionService(auctionId);
      } catch (error) {
        console.error(`Auction completion notification failed for ${auctionId}:`, error.message);
      }
    });
  });
};

module.exports = { registerAuctionEventHandlers };