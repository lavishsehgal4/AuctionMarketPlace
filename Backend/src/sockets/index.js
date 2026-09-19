const { registerBiddingSocket } = require('../bidding/sockets/bidding.socket');

const registerAllSockets = (io) => {
  registerBiddingSocket(io);
};

module.exports = { registerAllSockets };