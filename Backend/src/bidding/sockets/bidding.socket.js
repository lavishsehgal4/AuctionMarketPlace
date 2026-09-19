const registerBiddingSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinAuction', (auctionId, callback) => {
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