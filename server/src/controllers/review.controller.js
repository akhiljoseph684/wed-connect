import * as reviewService from '../services/review.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getReviews = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await reviewService.getBusinessReviews(req.params.businessId, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Reviews retrieved'));
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.params.businessId, req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

export const replyReview = asyncHandler(async (req, res) => {
  const review = await reviewService.replyToReview(req.params.reviewId, req.user._id, req.body.text);
  return res.status(200).json(new ApiResponse(200, review, 'Reply posted'));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await reviewService.deleteReview(req.params.reviewId, req.user._id, isAdmin);
  return res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
});
