import mongoose from 'mongoose';
import {
  Business,
  BusinessMember,
  Service,
  User,
  Category,
  Review,
  Enquiry,
  WeddingPlan,
  AnalyticsEvent,
} from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getBusinesses = async ({
  page = 1,
  limit = 12,
  categoryId,
  categorySlug,
  city,
  priceRange,
  sort = 'rating',
  search,
}) => {
  const skip = (page - 1) * limit;
  const matchCriteria = { isActive: true };

  limit = Number(limit)

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug.toLowerCase() });
    if (category) {
      matchCriteria.categoryId = category._id;
    }
  } else if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    matchCriteria.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (city) {
    matchCriteria['location.city'] = new RegExp(city, 'i');
  }

  if (priceRange) {
    matchCriteria.priceRange = priceRange;
  }

  if (search) {
    matchCriteria.$or = [
      { name: new RegExp(search, 'i') },
      { tagline: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  let sortStage = { averageRating: -1, totalReviews: -1, createdAt: -1 };
  if (sort === 'price_asc') sortStage = { startingPrice: 1, createdAt: -1 };
  if (sort === 'price_desc') sortStage = { startingPrice: -1, createdAt: -1 };
  if (sort === 'newest') sortStage = { createdAt: -1 };

  const pipeline = [
    { $match: matchCriteria },
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
        from: 'users',
        localField: 'ownerId',
        foreignField: '_id',
        as: 'ownerData',
      },
    },
    { $unwind: { path: '$ownerData', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'businessId',
        as: 'reviewsList',
      },
    },
    {
      $addFields: {
        totalReviews: { $size: '$reviewsList' },
        averageRating: {
          $cond: [
            { $gt: [{ $size: '$reviewsList' }, 0] },
            { $round: [{ $avg: '$reviewsList.rating' }, 1] },
            0,
          ],
        },
        categoryId: {
          _id: '$categoryData._id',
          name: '$categoryData.name',
          slug: '$categoryData.slug',
          icon: '$categoryData.icon',
        },
        ownerId: {
          _id: '$ownerData._id',
          firstName: '$ownerData.firstName',
          lastName: '$ownerData.lastName',
          avatarUrl: '$ownerData.avatarUrl',
        },
        rating: {
          average: {
            $cond: [
              { $gt: [{ $size: '$reviewsList' }, 0] },
              { $round: [{ $avg: '$reviewsList.rating' }, 1] },
              0,
            ],
          },
          count: { $size: '$reviewsList' },
        },
      },
    },
    { $project: { reviewsList: 0, categoryData: 0, ownerData: 0 } },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
  ];

  const [businesses, total] = await Promise.all([
    Business.aggregate(pipeline),
    Business.countDocuments(matchCriteria),
  ]);

  return { businesses, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getBusinessBySlug = async (slug) => {
  const businessDoc = await Business.findOne({ slug: slug.toLowerCase() })
    .populate('categoryId', 'name slug icon')
    .populate('ownerId', 'firstName lastName avatarUrl bio');

  if (!businessDoc) {
    throw new ApiError(404, 'Business not found');
  }

  const [services, reviews] = await Promise.all([
    Service.find({ businessId: businessDoc._id, isActive: true }).sort({ order: 1 }),
    Review.find({ businessId: businessDoc._id }),
  ]);

  // Aggregate review statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
  });

  const business = {
    ...businessDoc.toObject(),
    totalReviews,
    averageRating,
    ratingDistribution,
    rating: {
      average: averageRating,
      count: totalReviews,
    },
  };

  // Track view analytics
  await AnalyticsEvent.create({
    targetType: 'business',
    targetId: businessDoc._id,
    eventType: 'view',
    source: 'direct',
  }).catch(() => {});

  await Business.findByIdAndUpdate(businessDoc._id, { $inc: { viewsCount: 1 } });

  return { business, services };
};

export const getBusinessById = async (businessId) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw new ApiError(400, 'Invalid business ID');
  }

  const business = await Business.findById(businessId).populate('categoryId', 'name slug icon');
  if (!business) throw new ApiError(404, 'Business not found');

  const reviews = await Review.find({ businessId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  return {
    ...business.toObject(),
    totalReviews,
    averageRating,
    rating: { average: averageRating, count: totalReviews },
  };
};

export const getMyBusiness = async (userId) => {
  const pipeline = [
    { $match: { ownerId: new mongoose.Types.ObjectId(userId) } },
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
        from: 'services',
        localField: '_id',
        foreignField: 'businessId',
        as: 'services',
      },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'businessId',
        as: 'reviewsList',
      },
    },
    {
      $addFields: {
        totalReviews: { $size: '$reviewsList' },
        averageRating: {
          $cond: [
            { $gt: [{ $size: '$reviewsList' }, 0] },
            { $round: [{ $avg: '$reviewsList.rating' }, 1] },
            0,
          ],
        },
        categoryId: {
          _id: '$categoryData._id',
          name: '$categoryData.name',
          slug: '$categoryData.slug',
          icon: '$categoryData.icon',
        },
        rating: {
          average: {
            $cond: [
              { $gt: [{ $size: '$reviewsList' }, 0] },
              { $round: [{ $avg: '$reviewsList.rating' }, 1] },
              0,
            ],
          },
          count: { $size: '$reviewsList' },
        },
      },
    },
    { $project: { reviewsList: 0, categoryData: 0 } },
  ];

  const results = await Business.aggregate(pipeline);
  return results.length > 0 ? results[0] : null;
};

export const createBusiness = async (ownerId, data) => {
  const slug = (data.slug || data.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existing = await Business.findOne({ slug });
  if (existing) throw new ApiError(400, 'A business with this slug or name already exists');

  const business = await Business.create({
    ownerId,
    name: data.name,
    slug,
    tagline: data.tagline || '',
    description: data.description,
    categoryId: data.categoryId,
    subcategories: data.subcategories || [],
    logoUrl: data.logoUrl || '',
    coverImageUrl: data.coverImageUrl || '',
    location: data.location || { city: 'New York', state: 'NY', country: 'USA' },
    serviceAreas: data.serviceAreas || [],
    contactInfo: data.contactInfo,
    priceRange: data.priceRange || '$$',
    startingPrice: data.startingPrice || 1000,
    verificationStatus: 'pending',
  });

  await BusinessMember.create({
    businessId: business._id,
    userId: ownerId,
    role: 'owner',
    permissions: ['all'],
  });

  return business;
};

export const updateBusiness = async (businessId, ownerId, data, isAdmin = false) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');

  if (!isAdmin && business.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this business');
  }

  const updated = await Business.findByIdAndUpdate(businessId, data, { new: true, runValidators: true });
  return updated;
};

export const submitVerification = async (businessId, ownerId, { documents = [], notes = '' }) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');

  if (business.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  business.verificationStatus = 'pending';
  business.verificationNotes = notes;
  if (documents.length > 0) {
    business.verificationDocuments = documents;
  }
  await business.save();

  return business;
};

export const getBusinessServices = async (businessId) => {
  return await Service.find({ businessId, isActive: true }).sort({ order: 1 });
};

export const createService = async (businessId, ownerId, serviceData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  return await Service.create({
    businessId,
    name: serviceData.name,
    description: serviceData.description,
    categoryId: serviceData.categoryId || business.categoryId,
    pricingType: serviceData.pricingType || 'fixed',
    price: serviceData.price,
    currency: serviceData.currency || 'USD',
    duration: serviceData.duration || 'Full Day',
    features: serviceData.features || [],
    media: serviceData.media || [],
  });
};

export const updateService = async (serviceId, ownerId, serviceData) => {
  const service = await Service.findById(serviceId).populate('businessId');
  if (!service) throw new ApiError(404, 'Service package not found');

  if (service.businessId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  const updated = await Service.findByIdAndUpdate(serviceId, serviceData, { new: true });
  return updated;
};

export const deleteService = async (serviceId, ownerId) => {
  const service = await Service.findById(serviceId).populate('businessId');
  if (!service) throw new ApiError(404, 'Service not found');

  if (service.businessId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Unauthorized');
  }

  await Service.findByIdAndDelete(serviceId);
  return true;
};

export const addPortfolioItem = async (businessId, ownerId, itemData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  business.portfolio.unshift({
    title: itemData.title,
    description: itemData.description || '',
    imageUrl: itemData.imageUrl,
    featured: Boolean(itemData.featured),
  });

  await business.save();
  return business.portfolio[0];
};

export const deletePortfolioItem = async (businessId, ownerId, itemId) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  business.portfolio = business.portfolio.filter((p) => p._id.toString() !== itemId.toString());
  await business.save();
  return true;
};

// ============================================
// ISSUE 04: Vendor Availability Management
// ============================================
export const addAvailabilityEntry = async (businessId, ownerId, entryData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  if (!entryData.date) {
    throw new ApiError(400, 'Availability date is required');
  }

  const existingAvailability = business.availability || {
    acceptingBookings: true,
    noticePeriodWeeks: 2,
    blockedDates: [],
    entries: [],
  };

  const currentEntries = existingAvailability.entries || [];
  const currentBlocked = existingAvailability.blockedDates || [];

  const entryIndex = currentEntries.findIndex((e) => e.date === entryData.date);
  if (entryIndex >= 0) {
    // Update existing entry rather than duplicate
    currentEntries[entryIndex].status = entryData.status || currentEntries[entryIndex].status;
    currentEntries[entryIndex].notes = entryData.notes ?? currentEntries[entryIndex].notes;
  } else {
    currentEntries.push({
      date: entryData.date,
      status: entryData.status || 'booked',
      notes: entryData.notes || '',
      createdAt: new Date(),
    });
  }

  // Synchronize blockedDates array
  const updatedBlockedDates = Array.from(new Set([...currentBlocked, entryData.date]));

  business.availability = {
    acceptingBookings:
      entryData.acceptingBookings !== undefined
        ? entryData.acceptingBookings
        : existingAvailability.acceptingBookings,
    noticePeriodWeeks: existingAvailability.noticePeriodWeeks || 2,
    blockedDates: updatedBlockedDates,
    entries: currentEntries,
  };

  await business.save();
  return business.availability;
};

export const updateAvailabilityEntry = async (businessId, ownerId, entryId, updateData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  const entries = business.availability?.entries || [];
  const entry = entries.find((e) => e._id.toString() === entryId.toString() || e.date === entryId);
  if (!entry) throw new ApiError(404, 'Availability entry not found');

  if (updateData.status !== undefined) entry.status = updateData.status;
  if (updateData.notes !== undefined) entry.notes = updateData.notes;
  if (updateData.date !== undefined) {
    // Update blocked dates list
    business.availability.blockedDates = business.availability.blockedDates
      .filter((d) => d !== entry.date)
      .concat(updateData.date);
    entry.date = updateData.date;
  }

  await business.save();
  return business.availability;
};

export const deleteAvailabilityEntry = async (businessId, ownerId, entryIdOrDate) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  const entries = business.availability?.entries || [];
  const targetEntry = entries.find(
    (e) => e._id.toString() === entryIdOrDate.toString() || e.date === entryIdOrDate
  );

  const targetDate = targetEntry ? targetEntry.date : entryIdOrDate;

  business.availability.entries = entries.filter(
    (e) => e._id.toString() !== entryIdOrDate.toString() && e.date !== entryIdOrDate
  );
  business.availability.blockedDates = (business.availability.blockedDates || []).filter(
    (d) => d !== targetDate
  );

  await business.save();
  return business.availability;
};

export const updateAvailability = async (businessId, ownerId, availabilityData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  const existing = business.availability || {
    acceptingBookings: true,
    noticePeriodWeeks: 2,
    blockedDates: [],
    entries: [],
  };

  // Merge blockedDates preserving all existing
  let updatedBlocked = existing.blockedDates || [];
  if (Array.isArray(availabilityData.blockedDates)) {
    updatedBlocked = Array.from(new Set([...updatedBlocked, ...availabilityData.blockedDates]));
  }

  // Merge entries preserving all existing
  let updatedEntries = existing.entries || [];
  if (Array.isArray(availabilityData.entries)) {
    availabilityData.entries.forEach((newEnt) => {
      const idx = updatedEntries.findIndex((e) => e.date === newEnt.date);
      if (idx >= 0) {
        updatedEntries[idx] = { ...updatedEntries[idx], ...newEnt };
      } else {
        updatedEntries.push(newEnt);
      }
    });
  }

  business.availability = {
    acceptingBookings:
      availabilityData.acceptingBookings !== undefined
        ? availabilityData.acceptingBookings
        : existing.acceptingBookings,
    noticePeriodWeeks:
      availabilityData.noticePeriodWeeks !== undefined
        ? availabilityData.noticePeriodWeeks
        : existing.noticePeriodWeeks,
    blockedDates: updatedBlocked,
    entries: updatedEntries,
  };

  await business.save();
  return business.availability;
};

// ============================================
// ISSUE 26: Real Vendor Analytics & Dashboard Data
// ============================================
export const getVendorDashboardStats = async (businessId, ownerId) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  const [
    enquiriesReceived,
    reviews,
    servicesCount,
    savedVendorCount,
    viewsEvents,
    impressionsEvents,
  ] = await Promise.all([
    Enquiry.countDocuments({ businessId }),
    Review.find({ businessId }),
    Service.countDocuments({ businessId, isActive: true }),
    WeddingPlan.countDocuments({ savedVendorIds: businessId }),
    AnalyticsEvent.countDocuments({ targetId: businessId, eventType: 'view' }),
    AnalyticsEvent.countDocuments({ targetId: businessId, eventType: 'impression' }),
  ]);

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
    : 0;

  const profileVisits = Math.max(business.viewsCount || 0, viewsEvents);
  const profileImpressions = Math.max(profileVisits * 3, impressionsEvents);

  return {
    profileImpressions,
    profileVisits,
    enquiriesReceived,
    savedVendorCount,
    reviewCount,
    averageRating,
    serviceStatistics: {
      totalServices: servicesCount,
      activeServices: servicesCount,
    },
  };
};

export const getVendorAnalytics = async (businessId, ownerId) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  const [searchTraffic, directTraffic, workspaceSaves] = await Promise.all([
    AnalyticsEvent.countDocuments({
      targetId: businessId,
      source: { $in: ['search', 'category'] },
    }),
    AnalyticsEvent.countDocuments({
      targetId: businessId,
      source: { $in: ['direct', 'social'] },
    }),
    WeddingPlan.countDocuments({ savedVendorIds: businessId }),
  ]);

  const totalTraffic = searchTraffic + directTraffic + workspaceSaves || 1;

  const trafficBreakdown = [
    {
      source: 'Search & Category Listings',
      count: searchTraffic,
      percentage: Math.round((searchTraffic / totalTraffic) * 100),
    },
    {
      source: 'Direct Link & Social Shares',
      count: directTraffic,
      percentage: Math.round((directTraffic / totalTraffic) * 100),
    },
    {
      source: 'Saved in Wedding Workspaces',
      count: workspaceSaves,
      percentage: Math.round((workspaceSaves / totalTraffic) * 100),
    },
  ];

  return {
    trafficBreakdown,
    totalInteractions: totalTraffic,
  };
};

// ============================================
// ISSUE 28: Vendor Settings (Email alerts & Auto-response)
// ============================================
export const updateVendorSettings = async (businessId, ownerId, settingsData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');

  business.settings = {
    ...business.settings,
    ...settingsData,
  };

  await business.save();
  return business.settings;
};
