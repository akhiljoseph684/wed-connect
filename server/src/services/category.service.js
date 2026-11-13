import { Category } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getCategories = async (type = null) => {
  const query = { isActive: true };
  if (type) {
    query.type = { $in: [type, 'both'] };
  }
  return await Category.find(query).sort({ order: 1, name: 1 });
};

export const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug: slug.toLowerCase(), isActive: true });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

export const createCategory = async (data) => {
  const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existing = await Category.findOne({ slug });
  if (existing) throw new ApiError(400, 'Category with this slug already exists');

  return await Category.create({
    ...data,
    slug,
  });
};

export const updateCategory = async (categoryId, data) => {
  const category = await Category.findByIdAndUpdate(categoryId, data, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  return category;
};

export const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new ApiError(404, 'Category not found');
  return true;
};
