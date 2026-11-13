import * as collectionService from '../services/collection.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getMyCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.getUserCollections(req.user._id, req.user._id);
  return res.status(200).json(new ApiResponse(200, collections, 'Collections retrieved'));
});

export const createCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.createCollection(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, collection, 'Collection created'));
});

export const getCollectionById = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const result = await collectionService.getCollectionById(req.params.collectionId, currentUserId);
  return res.status(200).json(new ApiResponse(200, result, 'Collection details retrieved'));
});

export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await collectionService.updateCollection(req.params.collectionId, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, collection, 'Collection updated'));
});

export const deleteCollection = asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(req.params.collectionId, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Collection deleted'));
});

export const addItemToCollection = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const result = await collectionService.addItemToCollection(req.params.collectionId, req.user._id, req.params.postId, note);
  return res.status(200).json(new ApiResponse(200, result, 'Post added to collection'));
});

export const removeItemFromCollection = asyncHandler(async (req, res) => {
  await collectionService.removeItemFromCollection(req.params.collectionId, req.user._id, req.params.postId);
  return res.status(200).json(new ApiResponse(200, null, 'Post removed from collection'));
});
