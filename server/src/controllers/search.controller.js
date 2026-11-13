import * as searchService from '../services/search.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const search = asyncHandler(async (req, res) => {
  const { q, type, page, limit } = req.query;
  const results = await searchService.globalSearch(q || '', type || 'all', page, limit, req.user?._id);
  return res.status(200).json(new ApiResponse(200, results, 'Search results retrieved'));
});

export const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const suggestions = await searchService.getSearchSuggestions(q || '');
  return res.status(200).json(new ApiResponse(200, suggestions, 'Search suggestions'));
});
