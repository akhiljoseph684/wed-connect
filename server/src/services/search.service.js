import mongoose from 'mongoose';
import { Post, Business, CreatorProfile, Category, User, Review } from '../models/index.js';
import { buildPostAggregationPipeline } from './post.service.js';

export const globalSearch = async (query, type = 'all', page = 1, limit = 12, currentUserId = null) => {
  const skip = (page - 1) * limit;
  const regex = new RegExp(query, 'i');

  const results = {
    posts: [],
    vendors: [],
    creators: [],
    categories: [],
  };

  if (type === 'all' || type === 'posts') {
    const postMatch = {
      isPublished: true,
      ...(query
        ? {
            $or: [{ title: regex }, { content: regex }, { tags: regex }],
          }
        : {}),
    };

    results.posts = await Post.aggregate(
      buildPostAggregationPipeline({
        matchCriteria: postMatch,
        currentUserId,
        sort: { likesCount: -1, createdAt: -1 },
        skip,
        limit,
      })
    );
  }

  if (type === 'all' || type === 'vendors') {
    const vendorMatch = {
      isActive: true,
      ...(query
        ? {
            $or: [
              { name: regex },
              { tagline: regex },
              { description: regex },
              { 'location.city': regex },
              { subcategories: regex },
            ],
          }
        : {}),
    };

    // Aggregate vendors with review calculations
    results.vendors = await Business.aggregate([
      { $match: vendorMatch },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'businessId',
          as: 'reviewsData',
        },
      },
      {
        $addFields: {
          totalReviews: { $size: '$reviewsData' },
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviewsData' }, 0] },
              { $round: [{ $avg: '$reviewsData.rating' }, 1] },
              0,
            ],
          },
          categoryId: {
            _id: '$categoryData._id',
            name: '$categoryData.name',
            slug: '$categoryData.slug',
          },
        },
      },
      {
        $addFields: {
          rating: {
            average: '$averageRating',
            count: '$totalReviews',
          },
        },
      },
      { $project: { reviewsData: 0, categoryData: 0 } },
      { $sort: { averageRating: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
  }

  if (type === 'all' || type === 'creators') {
    results.creators = await CreatorProfile.find({
      ...(query
        ? {
            $or: [{ displayName: regex }, { username: regex }, { bio: regex }, { specialties: regex }],
          }
        : {}),
    })
      .populate('userId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  if (type === 'all' || type === 'categories') {
    results.categories = await Category.find({
      isActive: true,
      ...(query ? { $or: [{ name: regex }, { description: regex }] } : {}),
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
