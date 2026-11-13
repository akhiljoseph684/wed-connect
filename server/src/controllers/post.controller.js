import * as postService from '../services/post.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, post, 'Post published successfully'));
});

export const getPostById = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const post = await postService.getPostById(req.params.postId, currentUserId);
  return res.status(200).json(new ApiResponse(200, post, 'Post retrieved'));
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.postId, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, post, 'Post updated successfully'));
});

export const deletePost = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  await postService.deletePost(req.params.postId, req.user._id, isAdmin);
  return res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

export const getForYouFeed = asyncHandler(async (req, res) => {
  const { page, limit, categoryId, tag, search } = req.query;
  const currentUserId = req.user?._id;
  const result = await postService.getForYouFeed({ page, limit, categoryId, tag, search, currentUserId });
  return res.status(200).json(new ApiResponse(200, result, 'For You feed retrieved'));
});

export const getFollowingFeed = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await postService.getFollowingFeed(req.user._id, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Following feed retrieved'));
});

export const getTrendingFeed = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const currentUserId = req.user?._id;
  const result = await postService.getTrendingFeed({ page, limit, currentUserId });
  return res.status(200).json(new ApiResponse(200, result, 'Trending feed retrieved'));
});
