import { Post, Business, CreatorProfile, Category, User } from '../models/index.js';

export const globalSearch = async (query, type = 'all', page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const regex = new RegExp(query, 'i');

  const results = {
    posts: [],
    vendors: [],
    creators: [],
    categories: [],
  };

  if (type === 'all' || type === 'posts') {
    results.posts = await Post.find({
      isPublished: true,
      $or: [{ title: regex }, { content: regex }, { tags: regex }],
    })
      .populate('authorId', 'firstName lastName avatarUrl')
      .populate('categoryId', 'name slug')
      .sort({ likesCount: -1 })
      .skip(skip)
      .limit(limit);
  }

  if (type === 'all' || type === 'vendors') {
    results.vendors = await Business.find({
      isActive: true,
      $or: [{ name: regex }, { tagline: regex }, { description: regex }, { 'location.city': regex }, { subcategories: regex }],
    })
      .populate('categoryId', 'name slug')
      .sort({ 'rating.average': -1 })
      .skip(skip)
      .limit(limit);
  }

  if (type === 'all' || type === 'creators') {
    results.creators = await CreatorProfile.find({
      $or: [{ displayName: regex }, { username: regex }, { bio: regex }, { specialties: regex }],
    })
      .populate('userId', 'firstName lastName avatarUrl')
      .sort({ 'stats.followersCount': -1 })
      .skip(skip)
      .limit(limit);
  }

  if (type === 'all' || type === 'categories') {
    results.categories = await Category.find({
      isActive: true,
      $or: [{ name: regex }, { description: regex }],
    }).limit(6);
  }

  return results;
};

export const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  const regex = new RegExp(`^${query}`, 'i');
  const [categories, businesses] = await Promise.all([
    Category.find({ name: regex }).select('name slug type').limit(4),
    Business.find({ name: regex, isActive: true }).select('name slug logoUrl').limit(4),
  ]);

  return [
    ...categories.map((c) => ({ type: 'category', text: c.name, slug: c.slug })),
    ...businesses.map((b) => ({ type: 'vendor', text: b.name, slug: b.slug, logoUrl: b.logoUrl })),
  ];
};
