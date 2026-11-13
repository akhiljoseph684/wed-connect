import * as reportService from '../services/report.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const createReport = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, report, 'Report filed successfully'));
});

export const getReports = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await reportService.getReports({ page, limit, status });
  return res.status(200).json(new ApiResponse(200, result, 'Reports retrieved'));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await reportService.resolveReport(req.params.reportId, req.body, req.user._id);
  return res.status(200).json(new ApiResponse(200, report, 'Report resolved'));
});
