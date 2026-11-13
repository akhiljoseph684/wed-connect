import { Post, Like, User, Follow } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const createPost = async (authorId, postData) => {
  const user = await User.findById(authorId);
  if (!user) throw new ApiError(404, 'User not found');

  const authorType = user.capabilities?.isVendor ? 'vendor' : user.capabilities?.isCreator ? 'creator' : 'user';

  const post = await Post.create({
    authorId,
    authorType,
    businessId: postData.businessId || null,
    title: postData.title || '',
    content: postData.content,
    media: postData.media || [],
    tags: Array.isArray(postData.tags) ? postData.tags : (postData.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    categoryId: postData.categoryId || null,
    location: postData.location || '',
  });

  await User.findByIdAndUpdate(authorId, { $inc: { 'stats.postsCount': 1 } });
  return await Post.findById(post._id).populate('authorId', 'firstName lastName displayName avatarUrl');
};

export const getPostById = async (postId, currentUserId = null) => {
  const post = await Post.findById(postId)
    .populate('authorId', 'firstName lastName displayName avatarUrl bio capabilities')
    .populate('categoryId', 'name slug')
    .populate('businessId', 'name slug logoUrl rating');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  let isLiked = false;
  if (currentUserId) {
    const like = await Like.findOne({ userId: currentUserId, targetId: postId, targetType: 'post' });
    isLiked = !!like;
  }

  return { ...post.toObject(), isLiked };
};

export const updatePost = async (postId, authorId, updateData) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  if (post.authorId.toString() !== authorId.toString()) {
    throw new ApiError(403, 'You are not authorized to edit this post');
  }

  if (updateData.title !== undefined) post.title = updateData.title;
  if (updateData.content !== undefined) post.content = updateData.content;
  if (updateData.tags !== undefined) {
    post.tags = Array.isArray(updateData.tags) ? updateData.tags : updateData.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  if (updateData.categoryId !== undefined) post.categoryId = updateData.categoryId;
  if (updateData.location !== undefined) post.location = updateData.location;

  await post.save();
  return await post.populate('authorId', 'firstName lastName displayName avatarUrl');
};

export const deletePost = async (postId, authorId, isAdmin = false) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  if (!isAdmin && post.authorId.toString() !== authorId.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this post');
  }

  await Post.findByIdAndDelete(postId);
  await User.findByIdAndUpdate(post.authorId, { $inc: { 'stats.postsCount': -1 } });
  return true;
};

export const getForYouFeed = async ({ page = 1, limit = 12, categoryId, tag, search, currentUserId = null }) => {
  const skip = (page - 1) * limit;
  const filter = { isPublished: true };

  if (categoryId) {
    filter.categoryId = categoryId;
  }
  if (tag) {
    filter.tags = tag.toLowerCase();
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('authorId', 'firstName lastName displayName avatarUrl capabilities')
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  let userLikesSet = new Set();
  if (currentUserId && posts.length > 0) {
    const postIds = posts.map((p) => p._id);
    const likes = await Like.find({ userId: currentUserId, targetId: { $in: postIds } });
    userLikesSet = new Set(likes.map((l) => l.targetId.toString()));
  }

  const postsWithLikedState = posts.map((p) => ({
    ...p.toObject(),
    isLiked: userLikesSet.has(p._id.toString()),
  }));

  return {
    posts: postsWithLikedState,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

export const getFollowingFeed = async (userId, { page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;
  const following = await Follow.find({ followerId: userId }).select('followingId');
  const followingIds = following.map((f) => f.followingId);

  const filter = {
    authorId: { $in: followingIds },
    isPublished: true,
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('authorId', 'firstName lastName displayName avatarUrl capabilities')
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  const postIds = posts.map((p) => p._id);
  const likes = await Like.find({ userId, targetId: { $in: postIds } });
  const userLikesSet = new Set(likes.map((l) => l.targetId.toString()));

  const postsWithLikedState = posts.map((p) => ({
    ...p.toObject(),
    isLiked: userLikesSet.has(p._id.toString()),
  }));

  return {
    posts: postsWithLikedState,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

export const getTrendingFeed = async ({ page = 1, limit = 12, currentUserId = null }) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ isPublished: true })
      .populate('authorId', 'firstName lastName displayName avatarUrl')
      .populate('categoryId', 'name slug')
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ isPublished: true }),
  ]);

  let userLikesSet = new Set();
  if (currentUserId && posts.length > 0) {
    const postIds = posts.map((p) => p._id);
    const likes = await Like.find({ userId: currentUserId, targetId: { $in: postIds } });
    userLikesSet = new Set(likes.map((l) => l.targetId.toString()));
  }

  const postsWithLikedState = posts.map((p) => ({
    ...p.toObject(),
    isLiked: userLikesSet.has(p._id.toString()),
  }));

  return {
    posts: postsWithLikedState,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};
