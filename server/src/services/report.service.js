import { Report, AuditLog } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const createReport = async (reporterId, reportData) => {
  return await Report.create({
    reporterId,
    targetType: reportData.targetType,
    targetId: reportData.targetId,
    reason: reportData.reason,
    details: reportData.details || '',
  });
};

export const getReports = async ({ page = 1, limit = 20, status }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporterId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return { reports, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const resolveReport = async (reportId, { status, resolutionNotes = '' }, adminId) => {
  const report = await Report.findById(reportId);
  if (!report) throw new ApiError(404, 'Report not found');

  report.status = status;
  report.resolutionNotes = resolutionNotes;
  report.resolvedBy = adminId;
  report.resolvedAt = new Date();
  await report.save();

  await AuditLog.create({
    actorId: adminId,
    action: `RESOLVE_REPORT_${status.toUpperCase()}`,
    targetType: 'Report',
    targetId: reportId,
    metadata: { status, resolutionNotes },
  });

  return report;
};
