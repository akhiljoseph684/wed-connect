import * as creatorService from "../services/creator.service.js";
import { ApiResponse, asyncHandler } from "../utils/apiResponse.js";

export const getCreators = asyncHandler(async (req, res) => {
  const { page, limit, specialty, search } = req.query;
  const result = await creatorService.getCreators({
    page,
    limit,
    specialty,
    search,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Creators retrieved"));
});

export const getCreatorByUserId = asyncHandler(async (req, res) => {
  const result = await creatorService.getCreatorByUserId(req.params.username);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Creator profile retrieved"));
});

export const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await creatorService.upsertCreatorProfile(
    req.user._id,
    req.body,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Creator profile saved"));
});

export const addPortfolio = asyncHandler(async (req, res) => {
  const item = await creatorService.addPortfolioItem(req.user._id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, item, "Portfolio item added"));
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const item = await creatorService.updatePortfolioItem(
    req.user._id,
    req.params.id,
    req.body,
  );
  return res
    .status(200)
    .json(new ApiResponse(200, item, "Portfolio item updated"));
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  await creatorService.deletePortfolioItem(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Portfolio item deleted"));
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await creatorService.getCreatorAnalytics(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Creator analytics retrieved"));
});

export const getCollaborations = asyncHandler(async (req, res) => {
  const requests = await creatorService.getCollaborationRequests(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Collaboration requests retrieved"));
});

export const createCollaboration = asyncHandler(async (req, res) => {
  const request = await creatorService.createCollaborationRequest(
    req.user._id,
    req.body,
  );
  return res
    .status(201)
    .json(new ApiResponse(201, request, "Collaboration request sent"));
});
