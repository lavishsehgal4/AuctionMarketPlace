const asyncHandler = require('../errors/asyncHandler');
const { getBidderHistoryService } = require('./bidderHistory.service');

const getBidderHistoryController = asyncHandler(async (req, res) => {
  const result = await getBidderHistoryService(req.user.userId, req.query);
  res.status(200).json({ success: true, data: result });
});

module.exports = { getBidderHistoryController };