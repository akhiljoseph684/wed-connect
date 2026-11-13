import { Collection, CollectionItem, Post } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

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
    description: data.description || '',
    isPrivate: Boolean(data.isPrivate),
    coverImageUrl: data.coverImageUrl || '',
  });
};

export const getCollectionById = async (collectionId, currentUserId = null) => {
  const collection = await Collection.findById(collectionId).populate('userId', 'firstName lastName avatarUrl');
  if (!collection) throw new ApiError(404, 'Collection not found');

  if (collection.isPrivate && (!currentUserId || collection.userId._id.toString() !== currentUserId.toString())) {
    throw new ApiError(403, 'This collection is private');
  }

  const items = await CollectionItem.find({ collectionId })
    .populate({
      path: 'postId',
      populate: { path: 'authorId', select: 'firstName lastName avatarUrl' },
    })
    .sort({ addedAt: -1 });

  return { collection, items: items.filter((i) => i.postId) };
};

export const updateCollection = async (collectionId, userId, data) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new ApiError(404, 'Collection not found');
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not own this collection');
  }

  if (data.title !== undefined) collection.title = data.title;
  if (data.description !== undefined) collection.description = data.description;
  if (data.isPrivate !== undefined) collection.isPrivate = data.isPrivate;
  if (data.coverImageUrl !== undefined) collection.coverImageUrl = data.coverImageUrl;

  await collection.save();
  return collection;
};

export const deleteCollection = async (collectionId, userId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new ApiError(404, 'Collection not found');
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not own this collection');
  }

  await Promise.all([
    Collection.findByIdAndDelete(collectionId),
    CollectionItem.deleteMany({ collectionId }),
  ]);

  return true;
};

export const addItemToCollection = async (collectionId, userId, postId, note = '') => {
  const [collection, post] = await Promise.all([
    Collection.findById(collectionId),
    Post.findById(postId),
  ]);

  if (!collection) throw new ApiError(404, 'Collection not found');
  if (!post) throw new ApiError(404, 'Post not found');
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not own this collection');
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

export const removeItemFromCollection = async (collectionId, userId, postId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) throw new ApiError(404, 'Collection not found');
  if (collection.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not own this collection');
  }

  const deleted = await CollectionItem.findOneAndDelete({ collectionId, postId });
  if (deleted) {
    await Collection.findByIdAndUpdate(collectionId, { $inc: { itemsCount: -1 } });
    await Post.findByIdAndUpdate(postId, { $inc: { savesCount: -1 } });
  }
  return true;
};
