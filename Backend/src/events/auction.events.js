const eventBus = require('./eventBus');

const AUCTIONS_ENDED = 'auctions.ended';

const emitAuctionsEnded = (auctionIds) => {
  if (auctionIds.length > 0) eventBus.emit(AUCTIONS_ENDED, { auctionIds });
};

module.exports = { AUCTIONS_ENDED, emitAuctionsEnded };