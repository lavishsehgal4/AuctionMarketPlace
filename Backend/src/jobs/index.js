const { registerAuctionJobs } = require('../auction/auction.job');

const registerJobs = () => [registerAuctionJobs()];

module.exports = { registerJobs };
