import api from './api';

export const enquiryService = {
  createEnquiry: (businessId, data) => api.post(`/enquiries/business/${businessId}`, data),
  getSentEnquiries: () => api.get('/enquiries/sent'),
  getReceivedEnquiries: () => api.get('/enquiries/received'),
  getEnquiryById: (id) => api.get(`/enquiries/${id}`),
  updateStatus: (id, status) => api.patch(`/enquiries/${id}/status`, { status }),
};

export default enquiryService;
