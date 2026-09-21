const express = require('express');
const { verifyAccessTokenMiddleware } = require('../auth/auth.middleware');
const requireRole = require('../middleware/requireRole');
const { getBidderHistoryController } = require('./bidderHistory.controller');

const router = express.Router();

router.get('/', verifyAccessTokenMiddleware, requireRole('BIDDER'), getBidderHistoryController);

module.exports = router;