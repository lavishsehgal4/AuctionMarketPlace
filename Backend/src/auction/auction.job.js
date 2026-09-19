const cron = require('node-cron');
const { activateScheduledAuctionsService } = require('./auction.service');

const runScheduledAuctionActivation = async () => {
  const result = await activateScheduledAuctionsService();

  if (result.count > 0) {
    console.log(`Activated ${result.count} scheduled auction(s)`);
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
    } catch (error) {
      console.error('Scheduled auction activation failed:', error.message);
    } finally {
      isRunning = false;
    }
  });

  return task;
};

module.exports = { registerAuctionJobs };