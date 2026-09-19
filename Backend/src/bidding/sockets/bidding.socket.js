const auctionRepository = require('../../auction/auction.repository');
const { getEffectiveAuctionStatus } = require('../../auction/auction.state');
const { placeBidService } = require('../bidding.service');

const registerBiddingSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinAuction', async (auctionId, callback) => {
      const auction = await auctionRepository.findAuctionRoomById(auctionId);
      if (!auction || getEffectiveAuctionStatus(auction) !== 'ACTIVE') {
        callback?.({ error: 'Auction room is unavailable.' });
        return;
      }

      const roomName = `auction:${auctionId}`;
      socket.join(roomName);
      callback?.({ roomName });
    });

    socket.on('leaveAuction', (auctionId) => {
      const roomName = `auction:${auctionId}`;
      socket.leave(roomName);
    });

    socket.on('placeBid', async ({ auctionId, amount }, callback) => {
      try {
        const result = await placeBidService(auctionId, socket.user.userId, amount);
        io.to(`auction:${auctionId}`).emit('bidPlaced', result);
        callback?.({ success: true, code: 'BID_ACCEPTED', ...result });
      } catch (error) {
        callback?.({
          success: false,
          code: error.code || 'BID_FAILED',
          message: error.isOperational ? error.message : 'Unable to place bid',
          details: error.details,
        });
      }
    });
  });
};

module.exports = { registerBiddingSocket };