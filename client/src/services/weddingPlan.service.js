import api from './api';

export const weddingPlanService = {
  getWeddingPlans: () => api.get('/wedding-plans'),
  createWeddingPlan: (data) => api.post('/wedding-plans', data),
  getPlanDetails: (planId) => api.get(`/wedding-plans/${planId}`),
  updatePlan: (planId, data) => api.patch(`/wedding-plans/${planId}`, data),
  deletePlan: (planId) => api.delete(`/wedding-plans/${planId}`),
  toggleSaveVendor: (planId, vendorId) => api.put(`/wedding-plans/${planId}/vendors`, { vendorId }),
  addTimelineEvent: (planId, data) => api.post(`/wedding-plans/${planId}/timeline`, data),
  deleteTimelineEvent: (planId, index) => api.delete(`/wedding-plans/${planId}/timeline/${index}`),
  addMember: (planId, data) => api.post(`/wedding-plans/${planId}/members`, data),
};

export default weddingPlanService;
