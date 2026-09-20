const cron = require('node-cron');
const { activateScheduledAuctionsService, finalizeExpiredAuctionsService } = require('./auction.service');

const runScheduledAuctionActivation = async () => {
  const result = await activateScheduledAuctionsService();

  if (result.count > 0) {
    console.log(`Activated ${result.count} scheduled auction(s)`);
  }
};

const runExpiredAuctionFinalization = async () => {
  const result = await finalizeExpiredAuctionsService();

  if (result.ended > 0 || result.unsold > 0) {
    console.log(`Finalized ${result.ended} ended and ${result.unsold} unsold auction(s)`);
  }
};

const registerAuctionJobs = () => {
  let isRunning = false;

  // Five fields run at the beginning of every minute, never at a seconds offset.
  const task = cron.schedule('* * * * *', async () => {
    if (isRunning) return;

    isRunning = true;
    try {
      await runScheduledAuctionActivation();
      await runExpiredAuctionFinalization();
    } catch (error) {
      console.error('Auction lifecycle job failed:', error.message);
    } finally {
      isRunning = false;
    }
  });

  return task;
};

module.exports = { registerAuctionJobs };