import { User, Follow, Post, Notification } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendNotificationToUser } from '../config/socket.js';

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }
  return user;
};

export const updateProfile = async (userId, updateData) => {
  const allowedFields = ['firstName', 'lastName', 'displayName', 'bio', 'phone', 'location', 'preferences', 'coverUrl', 'avatarUrl'];
  const updatePayload = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updatePayload[field] = updateData[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, { new: true, runValidators: true }).select('-passwordHash');
  return updatedUser;
};

export const updateCapabilities = async (userId, capabilities) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.capabilities = {
    ...user.capabilities,
    ...capabilities,
  };
  await user.save();
  return user;
};

export const getUserPosts = async (userId, { page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;
  const posts = await Post.find({ authorId: userId, isPublished: true })
    .populate('authorId', 'firstName lastName avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments({ authorId: userId, isPublished: true });
  return { posts, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const followUser = async (followerId, targetUserId) => {
  if (followerId.toString() === targetUserId.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const existing = await Follow.findOne({ followerId, followingId: targetUserId });
  if (existing) {
    return { isFollowing: true, message: 'Already following' };
  }

  await Follow.create({ followerId, followingId: targetUserId, targetType: 'user' });

  // Update counts
  await User.findByIdAndUpdate(followerId, { $inc: { 'stats.followingCount': 1 } });
  await User.findByIdAndUpdate(targetUserId, { $inc: { 'stats.followersCount': 1 } });

  // Notify target user
  const follower = await User.findById(followerId).select('firstName lastName avatarUrl');
  const notification = await Notification.create({
    recipientId: targetUserId,
    senderId: followerId,
    type: 'follow',
    title: 'New Follower',
    message: `${follower?.firstName || 'Someone'} started following you.`,
    link: `/creators/${follower?._id}`,
  });

  sendNotificationToUser(targetUserId, notification);
  return { isFollowing: true };
};

export const unfollowUser = async (followerId, targetUserId) => {
  const deleted = await Follow.findOneAndDelete({ followerId, followingId: targetUserId });
  if (deleted) {
    await User.findByIdAndUpdate(followerId, { $inc: { 'stats.followingCount': -1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { 'stats.followersCount': -1 } });
  }
  return { isFollowing: false };
};

export const getUserFollowers = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const follows = await Follow.find({ followingId: userId })
    .populate('followerId', 'firstName lastName displayName avatarUrl bio')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ followingId: userId });
  return { followers: follows.map((f) => f.followerId), total };
};

export const getUserFollowing = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const follows = await Follow.find({ followerId: userId })
    .populate('followingId', 'firstName lastName displayName avatarUrl bio')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ followerId: userId });
  return { following: follows.map((f) => f.followingId), total };
};
