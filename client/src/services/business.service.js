import api from './api';

export const businessService = {
  getBusinesses: (params) => api.get('/businesses', { params }),
  getMyBusiness: () => api.get('/businesses/me'),
  getBusinessBySlug: (slug) => api.get(`/businesses/slug/${slug}`),
  getBusinessById: (id) => api.get(`/businesses/${id}`),
  createBusiness: (data) => api.post('/businesses', data),
  updateBusiness: (id, data) => api.patch(`/businesses/${id}`, data),
  submitVerification: (id, data) => api.post(`/businesses/${id}/submit-verification`, data),
  getServices: (businessId) => api.get(`/businesses/${businessId}/services`),
  createService: (businessId, data) => api.post(`/businesses/${businessId}/services`, data),
  updateService: (serviceId, data) => api.patch(`/businesses/services/${serviceId}`, data),
  deleteService: (serviceId) => api.delete(`/businesses/services/${serviceId}`),
  addPortfolio: (businessId, data) => api.post(`/businesses/${businessId}/portfolio`, data),
  deletePortfolio: (businessId, itemId) => api.delete(`/businesses/${businessId}/portfolio/${itemId}`),
  updateAvailability: (businessId, data) => api.put(`/businesses/${businessId}/availability`, data),
  addAvailabilityEntry: (businessId, data) => api.post(`/businesses/${businessId}/availability/entries`, data),
  updateAvailabilityEntry: (businessId, entryId, data) => api.patch(`/businesses/${businessId}/availability/entries/${entryId}`, data),
  deleteAvailabilityEntry: (businessId, entryId) => api.delete(`/businesses/${businessId}/availability/entries/${entryId}`),
  getVendorDashboardStats: (businessId) => api.get(`/businesses/${businessId}/dashboard-stats`),
  getVendorAnalytics: (businessId) => api.get(`/businesses/${businessId}/analytics`),
  updateVendorSettings: (businessId, data) => api.patch(`/businesses/${businessId}/settings`, data),
};

export default businessService;
