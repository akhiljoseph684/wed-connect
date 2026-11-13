import * as interactionService from '../services/interaction.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const toggleLike = asyncHandler(async (req, res) => {
  const result = await interactionService.toggleLikePost(req.user._id, req.params.postId);
  return res.status(200).json(new ApiResponse(200, result, result.isLiked ? 'Post liked' : 'Post unliked'));
});

export const getLikes = asyncHandler(async (req, res) => {
  const users = await interactionService.getPostLikes(req.params.postId);
  return res.status(200).json(new ApiResponse(200, users, 'Likes retrieved'));
});

export const getComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await interactionService.getPostComments(req.params.postId, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Comments retrieved'));
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await interactionService.addComment(req.params.postId, req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, comment, 'Comment added'));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  await interactionService.deleteComment(req.params.commentId, req.user._id, isAdmin);
  return res.status(200).json(new ApiResponse(200, null, 'Comment deleted'));
});
