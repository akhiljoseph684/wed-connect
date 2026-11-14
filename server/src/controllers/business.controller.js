import * as businessService from '../services/business.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getBusinesses = asyncHandler(async (req, res) => {
  const { page, limit, categoryId, categorySlug, city, priceRange, sort, search } = req.query;
  const result = await businessService.getBusinesses({ page, limit, categoryId, categorySlug, city, priceRange, sort, search });
  return res.status(200).json(new ApiResponse(200, result, 'Businesses retrieved'));
});

export const getBusinessBySlug = asyncHandler(async (req, res) => {
  const result = await businessService.getBusinessBySlug(req.params.slug);
  return res.status(200).json(new ApiResponse(200, result, 'Business details retrieved'));
});

export const getBusinessById = asyncHandler(async (req, res) => {
  const business = await businessService.getBusinessById(req.params.businessId);
  return res.status(200).json(new ApiResponse(200, business, 'Business retrieved'));
});

export const getMyBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.getMyBusiness(req.user._id);
  return res.status(200).json(new ApiResponse(200, business, 'My business profile'));
});

export const createBusiness = asyncHandler(async (req, res) => {
  const business = await businessService.createBusiness(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, business, 'Business created successfully'));
});

export const updateBusiness = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const business = await businessService.updateBusiness(req.params.businessId, req.user._id, req.body, isAdmin);
  return res.status(200).json(new ApiResponse(200, business, 'Business updated successfully'));
});

export const submitVerification = asyncHandler(async (req, res) => {
  const business = await businessService.submitVerification(req.params.businessId, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, business, 'Verification submitted'));
});

export const getServices = asyncHandler(async (req, res) => {
  const services = await businessService.getBusinessServices(req.params.businessId);
  return res.status(200).json(new ApiResponse(200, services, 'Services retrieved'));
});

export const createService = asyncHandler(async (req, res) => {
  const service = await businessService.createService(req.params.businessId, req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, service, 'Service package created'));
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await businessService.updateService(req.params.serviceId, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, service, 'Service package updated'));
});

export const deleteService = asyncHandler(async (req, res) => {
  await businessService.deleteService(req.params.serviceId, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Service package deleted'));
});

export const addPortfolio = asyncHandler(async (req, res) => {
  const item = await businessService.addPortfolioItem(req.params.businessId, req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, item, 'Portfolio image added'));
});

export const deletePortfolio = asyncHandler(async (req, res) => {
  await businessService.deletePortfolioItem(req.params.businessId, req.user._id, req.params.itemId);
  return res.status(200).json(new ApiResponse(200, null, 'Portfolio item deleted'));
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const availability = await businessService.updateAvailability(req.params.businessId, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, availability, 'Availability updated'));
});

export const addAvailabilityEntry = asyncHandler(async (req, res) => {
  const availability = await businessService.addAvailabilityEntry(req.params.businessId, req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, availability, 'Availability entry added'));
});

export const updateAvailabilityEntry = asyncHandler(async (req, res) => {
  const availability = await businessService.updateAvailabilityEntry(
    req.params.businessId,
    req.user._id,
    req.params.entryId,
    req.body
  );
  return res.status(200).json(new ApiResponse(200, availability, 'Availability entry updated'));
});

export const deleteAvailabilityEntry = asyncHandler(async (req, res) => {
  const availability = await businessService.deleteAvailabilityEntry(
    req.params.businessId,
    req.user._id,
    req.params.entryId
  );
  return res.status(200).json(new ApiResponse(200, availability, 'Availability entry removed'));
});

export const getVendorDashboardStats = asyncHandler(async (req, res) => {
  const stats = await businessService.getVendorDashboardStats(req.params.businessId, req.user._id);
  return res.status(200).json(new ApiResponse(200, stats, 'Vendor dashboard statistics'));
});

export const getVendorAnalytics = asyncHandler(async (req, res) => {
  const analytics = await businessService.getVendorAnalytics(req.params.businessId, req.user._id);
  return res.status(200).json(new ApiResponse(200, analytics, 'Vendor analytics data'));
});

export const updateVendorSettings = asyncHandler(async (req, res) => {
  const settings = await businessService.updateVendorSettings(req.params.businessId, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, settings, 'Vendor settings updated'));
});
