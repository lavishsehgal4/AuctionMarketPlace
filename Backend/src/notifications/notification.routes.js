const express = require('express');
const { verifyAccessTokenMiddleware } = require('../auth/auth.middleware');
const validateRequest = require('../middleware/validateRequest');
const controller = require('./notification.controller');

const router = express.Router();

router.use(verifyAccessTokenMiddleware);
router.get('/', controller.getMyNotificationsController);
router.patch('/:notificationId/read', validateRequest({ params: ['notificationId'] }), controller.markNotificationReadController);

module.exports = router;