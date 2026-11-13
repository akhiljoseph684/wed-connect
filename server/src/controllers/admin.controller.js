import * as adminService from '../services/admin.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return res.status(200).json(new ApiResponse(200, stats, 'Admin dashboard stats'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;
  const result = await adminService.getUsersList({ page, limit, role, search });
  return res.status(200).json(new ApiResponse(200, result, 'Users list'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body, req.user._id);
  return res.status(200).json(new ApiResponse(200, user, 'User status updated'));
});

export const getVendors = asyncHandler(async (req, res) => {
  const { page, limit, verificationStatus, search } = req.query;
  const result = await adminService.getVendorsList({ page, limit, verificationStatus, search });
  return res.status(200).json(new ApiResponse(200, result, 'Vendors list'));
});

export const updateVerification = asyncHandler(async (req, res) => {
  const business = await adminService.updateVerificationStatus(req.params.businessId, req.body, req.user._id);
  return res.status(200).json(new ApiResponse(200, business, 'Business verification updated'));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await adminService.getAuditLogs({ page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Audit logs'));
});

export const getReports = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await adminService.getReportsList({ page, limit, status });
  return res.status(200).json(new ApiResponse(200, result, 'Reports list'));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const result = await adminService.resolveReport(req.params.id, req.body, req.user._id);
  return res.status(200).json(new ApiResponse(200, result, 'Report resolved'));
});
