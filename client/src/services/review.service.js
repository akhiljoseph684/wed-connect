import api from './api';

export const reviewService = {
  getReviews: (businessId, params) => api.get(`/reviews/business/${businessId}`, { params }),
  createReview: (businessId, data) => api.post(`/reviews/business/${businessId}`, data),
  replyReview: (reviewId, text) => api.post(`/reviews/review/${reviewId}/reply`, { text }),
  updateReview: (reviewId, data) => api.patch(`/reviews/review/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/review/${reviewId}`),
};

export default reviewService;
