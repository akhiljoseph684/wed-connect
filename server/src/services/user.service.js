import mongoose from "mongoose";
import { User, Follow, Post, Notification } from "../models/index.js";
import { ApiError } from "../utils/apiResponse.js";
import { sendNotificationToUser } from "../config/socket.js";
import { buildPostAggregationPipeline } from "./post.service.js";

export const getUserById = async (userId, currentUserId = null) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const currentUserIdObj =
    currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)
      ? new mongoose.Types.ObjectId(currentUserId)
      : null;

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $lookup: {
        from: Follow.collection.name,
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$followingId", "$$userId"] },
                  { $eq: ["$targetType", "user"] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "followersData",
      },
    },

    {
      $lookup: {
        from: Follow.collection.name,
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$followerId", "$$userId"] },
                  { $eq: ["$targetType", "user"] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "followingData",
      },
    },

    ...(currentUserIdObj
      ? [
          {
            $lookup: {
              from: Follow.collection.name,
              let: { profileUserId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$followerId", currentUserIdObj] },
                        { $eq: ["$followingId", "$$profileUserId"] },
                        { $eq: ["$targetType", "user"] },
                      ],
                    },
                  },
                },
                { $limit: 1 },
              ],
              as: "followingStatus",
            },
          },
        ]
      : []),

    {
      $addFields: {
        "stats.followersCount": {
          $ifNull: [{ $arrayElemAt: ["$followersData.count", 0] }, 0],
        },

        "stats.followingCount": {
          $ifNull: [{ $arrayElemAt: ["$followingData.count", 0] }, 0],
        },

        isFollowing: currentUserIdObj
          ? { $gt: [{ $size: "$followingStatus" }, 0] }
          : { $literal: false },
      },
    },

    {
      $project: {
        passwordHash: 0,
        followersData: 0,
        followingData: 0,
        followingStatus: 0,
      },
    },
  ]);

  if (!user.length) {
    throw new ApiError(404, "User profile not found");
  }

  return user[0];
};

export const updateProfile = async (userId, updateData) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "displayName",
    "bio",
    "phone",
    "location",
    "preferences",
    "coverUrl",
    "avatarUrl",
    "notificationPreferences",
  ];
  const updatePayload = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updatePayload[field] = updateData[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");
  return updatedUser;
};

export const updateCapabilities = async (userId, capabilities) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.capabilities = {
    ...user.capabilities,
    ...capabilities,
  };
  await user.save();
  return user;
};

export const getUserPosts = async (
  userId,
  { page = 1, limit = 12, currentUserId = null } = {},
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const pageLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : 12;

  const skip = (currentPage - 1) * pageLimit;

  // Match user's published posts
  const matchCriteria = {
    authorId: new mongoose.Types.ObjectId(userId),
    isPublished: true,
  };

  // Fetch posts and total count
  const [posts, total] = await Promise.all([
    Post.aggregate(
      buildPostAggregationPipeline({
        matchCriteria,
        currentUserId,
        sort: { createdAt: -1 },
        skip,
        limit: pageLimit,
      }),
    ),

    Post.countDocuments(matchCriteria),
  ]);

  return {
    posts,
    total,
    page: currentPage,
    pages: Math.ceil(total / pageLimit),
  };
};

export const followUser = async (followerId, targetUserId) => {
  if (followerId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const existing = await Follow.findOne({
    followerId,
    followingId: targetUserId,
  });
  if (existing) {
    return { isFollowing: true, message: "Already following" };
  }

  await Follow.create({
    followerId,
    followingId: targetUserId,
    targetType: "user",
  });

  // Update counts
  await User.findByIdAndUpdate(followerId, {
    $inc: { "stats.followingCount": 1 },
  });
  await User.findByIdAndUpdate(targetUserId, {
    $inc: { "stats.followersCount": 1 },
  });

  // Notify target user
  const follower = await User.findById(followerId).select(
    "firstName lastName avatarUrl",
  );
  const notification = await Notification.create({
    recipientId: targetUserId,
    senderId: followerId,
    type: "follow",
    title: "New Follower",
    message: `${follower?.firstName || "Someone"} started following you.`,
    link: `/users/${follower?._id}`,
  });

  sendNotificationToUser(targetUserId, notification);
  return { isFollowing: true };
};

export const unfollowUser = async (followerId, targetUserId) => {
  const deleted = await Follow.findOneAndDelete({
    followerId,
    followingId: targetUserId,
  });
  if (deleted) {
    await User.findByIdAndUpdate(followerId, {
      $inc: { "stats.followingCount": -1 },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $inc: { "stats.followersCount": -1 },
    });
  }
  return { isFollowing: false };
};

export const getUserFollowers = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const follows = await Follow.find({ followingId: userId })
    .populate("followerId", "firstName lastName displayName avatarUrl bio")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ followingId: userId });
  return { followers: follows.map((f) => f.followerId), total };
};

export const getUserFollowing = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const follows = await Follow.find({ followerId: userId })
    .populate("followingId", "firstName lastName displayName avatarUrl bio")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Follow.countDocuments({ followerId: userId });
  return { following: follows.map((f) => f.followingId), total };
};
