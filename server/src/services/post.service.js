import mongoose from "mongoose";
import { Post, Like, Comment, User, Follow } from "../models/index.js";
import { ApiError } from "../utils/apiResponse.js";

export const buildPostAggregationPipeline = ({
  matchCriteria = {},
  currentUserId = null,
  sort = { createdAt: -1 },
  skip = 0,
  limit = 12,
}) => {
  const currentUserIdObj =
    currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)
      ? new mongoose.Types.ObjectId(currentUserId)
      : null;

  return [
    // 1. Match posts
    {
      $match: matchCriteria,
    },

    // 2. Join author
    {
      $lookup: {
        from: "users",
        localField: "authorId",
        foreignField: "_id",
        as: "authorData",
      },
    },
    {
      $unwind: {
        path: "$authorData",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 3. Join category
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    {
      $unwind: {
        path: "$categoryData",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Join business
    {
      $lookup: {
        from: "businesses",
        localField: "businessId",
        foreignField: "_id",
        as: "businessData",
      },
    },
    {
      $unwind: {
        path: "$businessData",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 5. Count likes
    {
      $lookup: {
        from: "likes",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$targetId", "$$postId"] },
                  { $eq: ["$targetType", "post"] },
                ],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "likesData",
      },
    },

    // 6. Count comments
    {
      $lookup: {
        from: "comments",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$postId", "$$postId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "commentsData",
      },
    },

    // 7. Check whether current user liked the post
    ...(currentUserIdObj
      ? [
          {
            $lookup: {
              from: "likes",
              let: { postId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$targetId", "$$postId"] },
                        { $eq: ["$targetType", "post"] },
                        { $eq: ["$userId", currentUserIdObj] },
                      ],
                    },
                  },
                },
                {
                  $limit: 1,
                },
              ],
              as: "userLikeData",
            },
          },
        ]
      : []),

    // 8. Project response
    {
      $project: {
        title: 1,
        content: 1,
        media: 1,
        tags: 1,
        location: 1,
        authorType: 1,
        isPublished: 1,
        isFeatured: 1,
        trendingScore: 1,
        createdAt: 1,
        updatedAt: 1,

        authorId: {
          _id: "$authorData._id",
          firstName: "$authorData.firstName",
          lastName: "$authorData.lastName",
          displayName: "$authorData.displayName",
          avatarUrl: "$authorData.avatarUrl",
          bio: "$authorData.bio",
          capabilities: "$authorData.capabilities",
        },

        categoryId: {
          _id: "$categoryData._id",
          name: "$categoryData.name",
          slug: "$categoryData.slug",
        },

        businessId: {
          _id: "$businessData._id",
          name: "$businessData.name",
          slug: "$businessData.slug",
          logoUrl: "$businessData.logoUrl",
        },

        likesCount: {
          $ifNull: [{ $arrayElemAt: ["$likesData.count", 0] }, 0],
        },

        commentsCount: {
          $ifNull: [{ $arrayElemAt: ["$commentsData.count", 0] }, 0],
        },

        isLiked: currentUserIdObj
          ? { $gt: [{ $size: "$userLikeData" }, 0] }
          : { $literal: false },
      },
    },

    // 9. Sort
    {
      $sort: sort,
    },

    // 10. Pagination
    {
      $skip: Math.max(0, Number(skip) || 0),
    },
    {
      $limit: Math.max(1, Number(limit) || 12),
    },
  ];
};

export const createPost = async (authorId, postData) => {
  const user = await User.findById(authorId);
  if (!user) throw new ApiError(404, "User not found");

  const authorType = user.capabilities?.isVendor
    ? "vendor"
    : user.capabilities?.isCreator
      ? "creator"
      : "user";

  const post = await Post.create({
    authorId,
    authorType,
    businessId: postData.businessId || null,
    title: postData.title || "",
    content: postData.content,
    media: postData.media || [],
    tags: Array.isArray(postData.tags)
      ? postData.tags
      : (postData.tags || "")
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
    categoryId: postData.categoryId || null,
    location: postData.location || "",
  });

  await User.findByIdAndUpdate(authorId, { $inc: { "stats.postsCount": 1 } });
  return await getPostById(post._id, authorId);
};

export const getPostById = async (postId, currentUserId = null) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const pipeline = buildPostAggregationPipeline({
    matchCriteria: { _id: new mongoose.Types.ObjectId(postId) },
    currentUserId,
    limit: 1,
  });

  const results = await Post.aggregate(pipeline);
  if (!results || results.length === 0) {
    throw new ApiError(404, "Post not found");
  }

  return results[0];
};

export const updatePost = async (postId, authorId, updateData) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (post.authorId.toString() !== authorId.toString()) {
    throw new ApiError(403, "You are not authorized to edit this post");
  }

  if (updateData.title !== undefined) post.title = updateData.title;
  if (updateData.content !== undefined) post.content = updateData.content;
  if (updateData.tags !== undefined) {
    post.tags = Array.isArray(updateData.tags)
      ? updateData.tags
      : updateData.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
  }
  if (updateData.categoryId !== undefined)
    post.categoryId = updateData.categoryId;
  if (updateData.location !== undefined) post.location = updateData.location;

  await post.save();
  return await getPostById(post._id, authorId);
};

export const deletePost = async (postId, authorId, isAdmin = false) => {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  if (!isAdmin && post.authorId.toString() !== authorId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await Post.findByIdAndDelete(postId);
  await Like.deleteMany({ targetId: postId, targetType: "post" });
  await Comment.deleteMany({ postId });
  await User.findByIdAndUpdate(post.authorId, {
    $inc: { "stats.postsCount": -1 },
  });
  return true;
};

export const getForYouFeed = async ({
  page = 1,
  limit = 12,
  categoryId,
  tag,
  search,
  currentUserId = null,
}) => {
  const skip = (page - 1) * limit;
  const matchCriteria = { isPublished: true };

  if (categoryId) {
    matchCriteria.categoryId = mongoose.Types.ObjectId.isValid(categoryId)
      ? new mongoose.Types.ObjectId(categoryId)
      : categoryId;
  }
  if (tag) {
    matchCriteria.tags = tag.toLowerCase();
  }
  if (search) {
    matchCriteria.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.aggregate(
      buildPostAggregationPipeline({
        matchCriteria,
        currentUserId,
        sort: { createdAt: -1 },
        skip,
        limit,
      }),
    ),
    Post.countDocuments(matchCriteria),
  ]);

  return {
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

export const getFollowingFeed = async (userId, { page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;
  const following = await Follow.find({ followerId: userId }).select(
    "followingId",
  );
  const followingIds = following.map((f) => f.followingId);

  const matchCriteria = {
    authorId: { $in: followingIds },
    isPublished: true,
  };

  const [posts, total] = await Promise.all([
    Post.aggregate(
      buildPostAggregationPipeline({
        matchCriteria,
        currentUserId: userId,
        sort: { createdAt: -1 },
        skip,
        limit,
      }),
    ),
    Post.countDocuments(matchCriteria),
  ]);

  return {
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

export const getTrendingFeed = async ({
  page = 1,
  limit = 12,
  currentUserId = null,
}) => {
  const skip = (page - 1) * limit;
  const matchCriteria = { isPublished: true };

  const [posts, total] = await Promise.all([
    Post.aggregate(
      buildPostAggregationPipeline({
        matchCriteria,
        currentUserId,
        sort: { likesCount: -1, commentsCount: -1, createdAt: -1 },
        skip,
        limit,
      }),
    ),
    Post.countDocuments(matchCriteria),
  ]);

  return {
    posts,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};
