import { Business, BusinessMember, Service, User, Category } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getBusinesses = async ({ page = 1, limit = 12, categoryId, categorySlug, city, priceRange, sort = 'rating', search }) => {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug.toLowerCase() });
    if (category) {
      filter.categoryId = category._id;
    }
  } else if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (city) {
    filter['location.city'] = new RegExp(city, 'i');
  }

  if (priceRange) {
    filter.priceRange = priceRange;
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { tagline: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  let sortOption = { 'rating.average': -1, 'rating.count': -1 };
  if (sort === 'price_asc') sortOption = { startingPrice: 1 };
  if (sort === 'price_desc') sortOption = { startingPrice: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };

  const [businesses, total] = await Promise.all([
    Business.find(filter)
      .populate('categoryId', 'name slug icon')
      .populate('ownerId', 'firstName lastName avatarUrl')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Business.countDocuments(filter),
  ]);

  return { businesses, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getBusinessBySlug = async (slug) => {
  const business = await Business.findOne({ slug: slug.toLowerCase() })
    .populate('categoryId', 'name slug icon')
    .populate('ownerId', 'firstName lastName avatarUrl bio');

  if (!business) {
    throw new ApiError(404, 'Business not found');
  }

  const services = await Service.find({ businessId: business._id, isActive: true }).sort({ order: 1 });

  // Increment view count
  await Business.findByIdAndUpdate(business._id, { $inc: { viewsCount: 1 } });

  return { business, services };
};

export const getBusinessById = async (businessId) => {
  const business = await Business.findById(businessId).populate('categoryId', 'name slug');
  if (!business) throw new ApiError(404, 'Business not found');
  return business;
};

export const getMyBusiness = async (userId) => {
  const business = await Business.findOne({ ownerId: userId }).populate('categoryId', 'name slug');
  return business;
};

export const createBusiness = async (ownerId, data) => {
  const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existing = await Business.findOne({ slug });
  if (existing) throw new ApiError(400, 'A business with this slug/name already exists');

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
  });

  await BusinessMember.create({
    businessId: business._id,
    userId: ownerId,
    role: 'owner',
    permissions: ['all'],
  });

  await User.findByIdAndUpdate(ownerId, { 'capabilities.isVendor': true });
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

export const updateAvailability = async (businessId, ownerId, availabilityData) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');
  if (business.ownerId.toString() !== ownerId.toString()) throw new ApiError(403, 'Unauthorized');
  business.availability = {
    ...business.availability,
    ...availabilityData,
  };
  await business.save();
  return business.availability;
};
