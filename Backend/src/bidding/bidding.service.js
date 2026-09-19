const AppError = require('../errors/AppError');
const { placeBidTransaction } = require('./bidding.repository');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const placeBidService = async (auctionId, bidderId, amount) => {
  if (!UUID_PATTERN.test(auctionId)) {
    throw new AppError('Auction was not found', 404, 'AUCTION_NOT_FOUND');
  }

  const bidAmount = Number(amount);
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
    throw new AppError('Bid amount must be a positive number', 400, 'INVALID_BID_AMOUNT');
  }

  let result;
  try {
    result = await placeBidTransaction(auctionId, bidderId, bidAmount);
  } catch (error) {
    if (error.code === 'AUCTION_ENDED') {
      throw new AppError('Auction has ended', 409, 'AUCTION_ENDED');
    }
    throw error;
  }
  if (result.code === 'BID_ACCEPTED') return result;

  const errors = {
    AUCTION_NOT_FOUND: ['Auction was not found', 404],
    SELLER_CANNOT_BID: ['Sellers cannot bid on their own auctions', 403],
    AUCTION_CANCELLED: ['Auction has been cancelled', 409],
    AUCTION_NOT_STARTED: ['Auction has not started', 409],
    AUCTION_ENDED: ['Auction has ended', 409],
    BIDDER_NOT_ELIGIBLE: ['Only active bidder accounts can place bids', 403],
    BID_TOO_LOW: [`Bid must be at least ${result.minimum_bid.toFixed(2)}`, 409],
  };
  const [message, statusCode] = errors[result.code];
  throw new AppError(message, statusCode, result.code, result.minimum_bid ? { minimum_bid: result.minimum_bid } : undefined);
};

module.exports = { placeBidService };