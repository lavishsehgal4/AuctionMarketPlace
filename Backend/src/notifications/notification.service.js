const AppError = require('../errors/AppError');
const notificationRepository = require('./notification.repository');

const processAuctionCompletionService = async (auctionId) => {
  const auction = await notificationRepository.findAuctionCompletion(auctionId);
  if (!auction) return;
  await notificationRepository.processAuctionCompletion(auction);
};

const getMyNotificationsService = async (userId, query) => {
  const page = Number.parseInt(query.page || '1', 10);
  const limit = Number.parseInt(query.limit || '20', 10);
  const unreadOnly = query.unread_only === 'true';
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('page must be positive and limit must be between 1 and 50', 400, 'VALIDATION_ERROR');
  }

  const where = unreadOnly ? { read_at: null } : {};
  const [notifications, totalItems, unreadCount] = await Promise.all([
    notificationRepository.findNotifications(userId, where, (page - 1) * limit, limit),
    notificationRepository.countNotifications(userId, where),
    notificationRepository.countUnreadNotifications(userId),
  ]);
  return {
    notifications,
    unread_count: unreadCount,
    pagination: { page, limit, total_items: totalItems, total_pages: Math.ceil(totalItems / limit) },
  };
};

const markNotificationReadService = async (userId, notificationId) => {
  const result = await notificationRepository.markNotificationRead(notificationId, userId);
  if (result.count === 0) throw new AppError('Notification was not found or already read', 404, 'NOTIFICATION_NOT_FOUND');
};

module.exports = { processAuctionCompletionService, getMyNotificationsService, markNotificationReadService };