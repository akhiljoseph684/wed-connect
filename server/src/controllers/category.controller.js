import * as categoryService from '../services/category.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const categories = await categoryService.getCategories(type);
  return res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved'));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  return res.status(200).json(new ApiResponse(200, category, 'Category details retrieved'));
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.categoryId, req.body);
  return res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);
  return res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});
