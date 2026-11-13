import * as userService from '../services/user.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  return res.status(200).json(new ApiResponse(200, user, 'User profile retrieved'));
});

export const updateMe = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user._id, { avatarUrl: req.body.avatarUrl });
  return res.status(200).json(new ApiResponse(200, updatedUser, 'Avatar updated successfully'));
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getUserPosts(req.params.userId, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'User posts retrieved'));
});

export const followUser = asyncHandler(async (req, res) => {
  const result = await userService.followUser(req.user._id, req.params.userId);
  return res.status(200).json(new ApiResponse(200, result, 'User followed'));
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const result = await userService.unfollowUser(req.user._id, req.params.userId);
  return res.status(200).json(new ApiResponse(200, result, 'User unfollowed'));
});

export const getUserFollowers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getUserFollowers(req.params.userId, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'User followers retrieved'));
});

export const getUserFollowing = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.getUserFollowing(req.params.userId, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'User following list retrieved'));
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, { blocked: true }, 'User blocked status updated'));
});
