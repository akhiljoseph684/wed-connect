import mongoose from "mongoose";
import {
  CreatorProfile,
  User,
  Post,
  Follow,
  Like,
  Comment,
  CollectionItem,
  AnalyticsEvent,
  CollaborationRequest,
} from "../models/index.js";
import { ApiError } from "../utils/apiResponse.js";

export const getCreators = async ({
  page = 1,
  limit = 12,
  specialty,
  search,
}) => {
  const skip = (page - 1) * limit;
  const filter = {};

  if (specialty) {
    filter.specialties = specialty;
  }
  if (search) {
    filter.$or = [
      { displayName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  const [creators, total] = await Promise.all([
    CreatorProfile.find(filter)
      .populate("userId", "firstName lastName avatarUrl bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CreatorProfile.countDocuments(filter),
  ]);

  // Issue 07: Dynamic aggregate followersCount from Follow collection
  const creatorUserIds = creators
    .map((c) => c.userId?._id || c.userId)
    .filter(Boolean);

  const followCounts = await Follow.aggregate([
    { $match: { followingId: { $in: creatorUserIds } } },
    { $group: { _id: "$followingId", count: { $sum: 1 } } },
  ]);

  const followMap = new Map(
    followCounts.map((f) => [f._id.toString(), f.count])
  );

  const enrichedCreators = creators.map((creator) => {
    const uId = (creator.userId?._id || creator.userId)?.toString();
    const dynamicFollowers = followMap.get(uId) || 0;
    return {
      ...creator,
      stats: {
        ...(creator.stats || {}),
        followersCount: dynamicFollowers,
      },
    };
  });

  return {
    creators: enrichedCreators,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

export const getCreatorByUserId = async (u, currentUserId = null) => {
  let query = { username: u.toLowerCase() };
  if (mongoose.Types.ObjectId.isValid(u)) {
    query = {
      $or: [{ userId: u }, { username: u.toLowerCase() }],
    };
  }

  const profile = await CreatorProfile.findOne(query).populate(
    "userId",
    "firstName lastName avatarUrl bio"
  );

  if (!profile) {
    throw new ApiError(404, "Creator profile not found");
  }

  const creatorUserId = profile.userId._id;

  const [posts, followersCount, followingCount, isFollowing] = await Promise.all([
    Post.find({
      authorId: creatorUserId,
      isPublished: true,
    })
      .populate("authorId", "firstName lastName avatarUrl bio")
      .sort({ createdAt: -1 })
      .limit(24)
      .lean(),
    Follow.countDocuments({ followingId: creatorUserId }),
    Follow.countDocuments({ followerId: creatorUserId }),
    currentUserId
      ? Follow.exists({
          followerId: currentUserId,
          followingId: creatorUserId,
        })
      : Promise.resolve(false),
  ]);

  const profileObj = profile.toObject();
  profileObj.stats = {
    ...(profileObj.stats || {}),
    followersCount,
    followingCount,
  };
  profileObj.isFollowing = Boolean(isFollowing);

  return { profile: profileObj, posts };
};

export const upsertCreatorProfile = async (userId, data) => {
  let profile = await CreatorProfile.findOne({ userId });

  if (profile) {
    if (data.username && data.username.toLowerCase() !== profile.username) {
      const existing = await CreatorProfile.findOne({
        username: data.username.toLowerCase(),
      });
      if (existing) throw new ApiError(400, "Username is already taken");
      profile.username = data.username.toLowerCase();
    }
    if (data.displayName !== undefined) profile.displayName = data.displayName;
    if (data.tagline !== undefined) profile.tagline = data.tagline;
    if (data.bio !== undefined) profile.bio = data.bio;
    if (data.specialties !== undefined) profile.specialties = data.specialties;
    if (data.coverImageUrl !== undefined)
      profile.coverImageUrl = data.coverImageUrl;
    if (data.socialLinks !== undefined)
      profile.socialLinks = { ...profile.socialLinks, ...data.socialLinks };
    if (data.acceptingBrandCollaborations !== undefined)
      profile.acceptingBrandCollaborations = Boolean(data.acceptingBrandCollaborations);

    await profile.save();
  } else {
    const username = data.username?.toLowerCase() || `creator_${Date.now()}`;
    const existing = await CreatorProfile.findOne({ username });
    if (existing) throw new ApiError(400, "Username is already taken");

    profile = await CreatorProfile.create({
      userId,
      username,
      displayName: data.displayName || "Wedding Creator",
      tagline: data.tagline || "",
      bio: data.bio || "",
      specialties: data.specialties || ["Photography"],
      coverImageUrl: data.coverImageUrl || "",
      socialLinks: data.socialLinks || {},
      acceptingBrandCollaborations:
        data.acceptingBrandCollaborations !== undefined
          ? Boolean(data.acceptingBrandCollaborations)
          : true,
    });

    // Update user capability
    await User.findByIdAndUpdate(userId, { "capabilities.isCreator": true });
  }

  return await profile.populate("userId", "firstName lastName avatarUrl");
};

export const addPortfolioItem = async (userId, itemData) => {
  const profile = await CreatorProfile.findOne({ userId });
  if (!profile)
    throw new ApiError(
      404,
      "Creator profile not found. Please create one first."
    );

  profile.portfolio.unshift({
    title: itemData.title,
    description: itemData.description || "",
    imageUrl: itemData.imageUrl,
    category: itemData.category || "General",
    tags: itemData.tags || [],
    featured: Boolean(itemData.featured),
  });

  await profile.save();
  return profile.portfolio[0];
};

export const updatePortfolioItem = async (userId, itemId, itemData) => {
  const profile = await CreatorProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, "Creator profile not found");

  const item = profile.portfolio.id(itemId);
  if (!item) throw new ApiError(404, "Portfolio item not found");

  if (itemData.title !== undefined) item.title = itemData.title;
  if (itemData.description !== undefined)
    item.description = itemData.description;
  if (itemData.imageUrl !== undefined) item.imageUrl = itemData.imageUrl;
  if (itemData.category !== undefined) item.category = itemData.category;
  if (itemData.tags !== undefined) item.tags = itemData.tags;
  if (itemData.featured !== undefined) item.featured = itemData.featured;

  await profile.save();
  return item;
};

export const deletePortfolioItem = async (userId, itemId) => {
  const profile = await CreatorProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, "Creator profile not found");

  profile.portfolio.pull({ _id: itemId });
  await profile.save();
  return true;
};

export const getCreatorAnalytics = async (userId) => {
  const posts = await Post.find({ authorId: userId }).select("_id").lean();
  const postIds = posts.map((p) => p._id);

  const [followersCount, totalLikes, totalComments, totalSaves, impressionsCount] =
    await Promise.all([
      Follow.countDocuments({ followingId: userId }),
      Like.countDocuments({ targetId: { $in: postIds }, targetType: "post" }),
      Comment.countDocuments({ postId: { $in: postIds } }),
      CollectionItem.countDocuments({ postId: { $in: postIds } }),
      AnalyticsEvent.countDocuments({
        targetId: { $in: postIds },
        eventType: { $in: ["view", "impression"] },
      }),
    ]);

  return {
    followersCount,
    totalPosts: posts.length,
    totalLikes,
    totalComments,
    totalSaves,
    monthlyReach: impressionsCount > 0 ? impressionsCount : totalLikes + totalComments * 2 + totalSaves * 3,
  };
};

export const getCollaborationRequests = async (userId) => {
  return await CollaborationRequest.find({
    $or: [{ receiverId: userId }, { requesterId: userId }],
  })
    .populate("requesterId", "firstName lastName avatarUrl email")
    .populate("receiverId", "firstName lastName avatarUrl email")
    .populate("businessId", "name logoUrl")
    .sort({ createdAt: -1 });
};

export const createCollaborationRequest = async (requesterId, data) => {
  // Issue 32: Check if receiver creator is accepting collaborations
  const targetCreator = await CreatorProfile.findOne({ userId: data.receiverId });
  if (targetCreator && targetCreator.acceptingBrandCollaborations === false) {
    throw new ApiError(
      400,
      "This creator is currently not accepting new brand collaboration requests."
    );
  }

  return await CollaborationRequest.create({
    requesterId,
    receiverId: data.receiverId,
    businessId: data.businessId || null,
    projectTitle: data.projectTitle,
    details: data.details,
    proposedDate: data.proposedDate,
    compensationType: data.compensationType || "paid",
  });
};

export const updateCollaborationStatus = async (requestId, userId, status) => {
  const validStatuses = ["accepted", "declined", "cancelled", "completed"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const request = await CollaborationRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Collaboration request not found");
  }

  const isReceiver = request.receiverId.toString() === userId.toString();
  const isRequester = request.requesterId.toString() === userId.toString();

  if (!isReceiver && !isRequester) {
    throw new ApiError(403, "You are not authorized to update this collaboration request.");
  }

  if (status === "accepted" || status === "declined") {
    if (!isReceiver) {
      throw new ApiError(403, "Only the recipient can accept or decline a collaboration request.");
    }
  }

  if (status === "cancelled") {
    if (!isRequester) {
      throw new ApiError(403, "Only the requester can cancel a pending collaboration request.");
    }
  }

  request.status = status;
  await request.save();

  return await request.populate([
    { path: "requesterId", select: "firstName lastName avatarUrl email" },
    { path: "receiverId", select: "firstName lastName avatarUrl email" },
    { path: "businessId", select: "name logoUrl" },
  ]);
};
