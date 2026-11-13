import {
  CreatorProfile,
  User,
  Post,
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
      .sort({ "stats.followersCount": -1 })
      .skip(skip)
      .limit(limit),
    CreatorProfile.countDocuments(filter),
  ]);

  return {
    creators,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

export const getCreatorByUserId = async (u) => {
  const profile = await CreatorProfile.findOne({
    $or: [{ userId: u }, { username: u }],
  }).populate("userId", "firstName lastName avatarUrl bio");

  if (!profile) {
    throw new ApiError(404, "Creator profile not found");
  }

  const posts = await Post.find({
    authorId: profile.userId._id,
    isPublished: true,
  })
    .populate("authorId", "firstName lastName avatarUrl bio")
    .sort({ createdAt: -1 })
    .limit(24);

  return { profile, posts };
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
      "Creator profile not found. Please create one first.",
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
  const profile = await CreatorProfile.findOne({ userId });
  const posts = await Post.find({ authorId: userId });

  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce(
    (sum, p) => sum + (p.commentsCount || 0),
    0,
  );
  const totalSaves = posts.reduce((sum, p) => sum + (p.savesCount || 0), 0);

  return {
    followersCount: profile?.stats?.followersCount || 0,
    totalPosts: posts.length,
    totalLikes,
    totalComments,
    totalSaves,
    monthlyReach: totalLikes * 12 + 450,
  };
};

export const getCollaborationRequests = async (userId) => {
  console.log(userId);
  return await CollaborationRequest.find({
    $or: [{ receiverId: userId }, { requesterId: userId }],
  })
    .populate("requesterId", "firstName lastName avatarUrl")
    .populate("receiverId", "firstName lastName avatarUrl")
    .populate("businessId", "name logoUrl")
    .sort({ createdAt: -1 });
};

export const createCollaborationRequest = async (requesterId, data) => {
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
