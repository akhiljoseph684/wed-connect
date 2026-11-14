import mongoose from "mongoose";
import { Collection, CollectionItem, Like, Post, Comment } from "../models/index.js";
import { ApiError } from "../utils/apiResponse.js";

export const getUserCollections = async (userId, currentUserId = null) => {
  const query = { userId };
  if (!currentUserId || currentUserId.toString() !== userId.toString()) {
    query.isPrivate = false;
  }
  return await Collection.find(query).sort({ updatedAt: -1 });
};

export const createCollection = async (userId, data) => {
  return await Collection.create({
    userId,
    title: data.title || data.name,
    description: data.description || "",
    isPrivate: Boolean(data.isPrivate),
    coverImageUrl: data.coverImageUrl || "",
  });
};

export const getCollectionById = async (collectionId, currentUserId = null) => {
  const collection = await Collection.findById(collectionId).populate(
    "userId",
    "firstName lastName avatarUrl",
  );

  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  if (
    collection.isPrivate &&
    (!currentUserId ||
      collection.userId._id.toString() !== currentUserId.toString())
  ) {
    throw new ApiError(403, "This collection is private");
  }

  const items = await CollectionItem.find({ collectionId })
    .populate({
      path: "postId",
      populate: {
        path: "authorId",
        select: "firstName lastName avatarUrl",
      },
    })
    .sort({ addedAt: -1 })
    .lean();

  const validItems = items.filter((item) => item.postId);

  const postIds = validItems.map((item) => item.postId._id);

  const postStats = await Post.aggregate([
    {
      $match: {
        _id: { $in: postIds },
      },
    },
    {
      $lookup: {
        from: Like.collection.name,
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
            $facet: {
              count: [{ $count: "total" }],
              userLike: currentUserId
                ? [
                    {
                      $match: {
                        userId: new mongoose.Types.ObjectId(currentUserId),
                      },
                    },
                    { $limit: 1 },
                  ]
                : [{ $match: { _id: null } }],
            },
          },
        ],
        as: "likeStats",
      },
    },
    {
      $lookup: {
        from: Comment.collection.name,
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$postId", "$$postId"],
              },
            },
          },
          { $count: "total" },
        ],
        as: "commentStats",
      },
    },
    {
      $addFields: {
        likesCount: {
          $ifNull: [{ $arrayElemAt: ["$likeStats.count.total", 0] }, 0],
        },
        commentsCount: {
          $ifNull: [{ $arrayElemAt: ["$commentStats.total", 0] }, 0],
        },
        isLiked: currentUserId
          ? {
              $gt: [{ $size: { $arrayElemAt: ["$likeStats.userLike", 0] } }, 0],
            }
          : { $literal: false },
      },
    },
    {
      $project: {
        likeStats: 0,
        commentStats: 0,
      },
    },
  ]);

  const statsMap = new Map(
    postStats.map((post) => [post._id.toString(), post]),
  );

  const enrichedItems = validItems.map((item) => {
    const stats = statsMap.get(item.postId._id.toString());

    return {
      ...item,
      postId: {
        ...item.postId,
        likesCount: stats?.likesCount || 0,
        commentsCount: stats?.commentsCount || 0,
        isLiked: stats?.isLiked || false,
      },
    };
  });

  return {
    collection,
    items: enrichedItems,
  };
};

export const updateCollection = async (collectionId, userId, data) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new ApiError(404, "Collection not found");
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not own this collection");
  }

  if (data.title !== undefined) collection.title = data.title;
  if (data.description !== undefined) collection.description = data.description;
  if (data.isPrivate !== undefined) collection.isPrivate = data.isPrivate;
  if (data.coverImageUrl !== undefined)
    collection.coverImageUrl = data.coverImageUrl;

  await collection.save();
  return collection;
};

export const deleteCollection = async (collectionId, userId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new ApiError(404, "Collection not found");
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not own this collection");
  }

  await Promise.all([
    Collection.findByIdAndDelete(collectionId),
    CollectionItem.deleteMany({ collectionId }),
  ]);

  return true;
};

export const addItemToCollection = async (
  collectionId,
  userId,
  postId,
  note = "",
) => {
  const [collection, post] = await Promise.all([
    Collection.findById(collectionId),
    Post.findById(postId),
  ]);

  if (!collection) throw new ApiError(404, "Collection not found");
  if (!post) throw new ApiError(404, "Post not found");
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not own this collection");
  }

  const existing = await CollectionItem.findOne({ collectionId, postId });
  if (existing) {
    return { alreadyInCollection: true, item: existing };
  }

  const item = await CollectionItem.create({ collectionId, postId, note });

  // Update collection cover image if empty
  const update = { $inc: { itemsCount: 1 } };
  if (!collection.coverImageUrl && post.media?.[0]?.url) {
    update.coverImageUrl = post.media[0].url;
  }
  await Collection.findByIdAndUpdate(collectionId, update);
  await Post.findByIdAndUpdate(postId, { $inc: { savesCount: 1 } });

  return { alreadyInCollection: false, item };
};

export const removeItemFromCollection = async (
  collectionId,
  userId,
  postId,
) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new ApiError(404, "Collection not found");
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not own this collection");
  }

  const deleted = await CollectionItem.findOneAndDelete({
    collectionId,
    postId,
  });
  if (deleted) {
    await Collection.findByIdAndUpdate(collectionId, {
      $inc: { itemsCount: -1 },
    });
    await Post.findByIdAndUpdate(postId, { $inc: { savesCount: -1 } });
  }
  return true;
};
