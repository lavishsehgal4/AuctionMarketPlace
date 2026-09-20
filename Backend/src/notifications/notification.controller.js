const asyncHandler = require('../errors/asyncHandler');
const notificationService = require('./notification.service');

const getMyNotificationsController = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotificationsService(req.user.userId, req.query);
  res.status(200).json({ success: true, data: result });
});

const markNotificationReadController = asyncHandler(async (req, res) => {
  await notificationService.markNotificationReadService(req.user.userId, req.params.notificationId);
  res.status(204).send();
});

module.exports = { getMyNotificationsController, markNotificationReadController };