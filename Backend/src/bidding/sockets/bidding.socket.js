const auctionRepository = require('../../auction/auction.repository');
const { getEffectiveAuctionStatus } = require('../../auction/auction.state');

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
  });
};

module.exports = { registerBiddingSocket };