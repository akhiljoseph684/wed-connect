import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => api.patch(`/admin/users/${userId}/status`, data),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  updateVerification: (businessId, data) => api.patch(`/admin/verifications/${businessId}`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (reportId, data) => api.patch(`/admin/reports/${reportId}/resolve`, data),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),
};

export default adminService;
