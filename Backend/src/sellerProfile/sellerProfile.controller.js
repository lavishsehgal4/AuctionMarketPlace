const asyncHandler = require('../errors/asyncHandler');
const sellerProfileService = require('./sellerProfile.service');

const getPublicSellerDirectoryController = asyncHandler(async (req, res) => {
  const result = await sellerProfileService.getPublicSellerDirectoryService(req.query);
  res.status(200).json({ success: true, data: result });
});

const getPublicSellerProfileController = asyncHandler(async (req, res) => {
  const seller = await sellerProfileService.getPublicSellerProfileService(req.params.sellerId);
  res.status(200).json({ success: true, data: { seller } });
});

const getSellerReviewsController = asyncHandler(async (req, res) => {
  const result = await sellerProfileService.getSellerReviewsService(req.params.sellerId, req.query);
  res.status(200).json({ success: true, data: result });
});

const updateMySellerProfileController = asyncHandler(async (req, res) => {
  const profile = await sellerProfileService.updateMySellerProfileService(req.user.userId, req.body);
  res.status(200).json({ success: true, data: { profile } });
});

const createSellerReviewController = asyncHandler(async (req, res) => {
  const review = await sellerProfileService.createSellerReviewService(req.user.userId, req.params.sellerId, req.body);
  res.status(201).json({ success: true, data: { review } });
});

module.exports = {
  getPublicSellerDirectoryController,
  getPublicSellerProfileController,
  getSellerReviewsController,
  updateMySellerProfileController,
  createSellerReviewController,
};