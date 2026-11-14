import { User, Business, CreatorProfile, Post, Review, Report, AuditLog, Notification, PlatformSettings } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendNotificationToUser } from '../config/socket.js';

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalVendors,
    totalCreators,
    totalPosts,
    pendingVerifications,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments(),
    Business.countDocuments(),
    CreatorProfile.countDocuments(),
    Post.countDocuments(),
    Business.countDocuments({ verificationStatus: 'pending' }),
    Report.countDocuments({ status: 'pending' }),
  ]);

  return {
    totalUsers,
    totalVendors,
    totalCreators,
    totalPosts,
    pendingVerifications,
    pendingReports,
  };
};

export const getUsersList = async ({ page = 1, limit = 20, role, search }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const updateUserStatus = async (userId, { isSuspended, status, suspensionReason = '' }, adminId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot suspend an administrator account');

  const shouldSuspend = status !== undefined ? status === 'suspended' : Boolean(isSuspended);
  user.isSuspended = shouldSuspend;
  user.suspensionReason = suspensionReason;
  await user.save();

  await AuditLog.create({
    actorId: adminId,
    action: shouldSuspend ? 'SUSPEND_USER' : 'ACTIVATE_USER',
    targetType: 'User',
    targetId: userId,
    metadata: { suspensionReason },
  });

  return user;
};

export const getVendorsList = async ({ page = 1, limit = 20, verificationStatus, search }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (search) {
    filter.$or = [{ name: new RegExp(search, 'i') }, { 'location.city': new RegExp(search, 'i') }];
  }

  const [vendors, total] = await Promise.all([
    Business.find(filter)
      .populate('categoryId', 'name slug')
      .populate('ownerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Business.countDocuments(filter),
  ]);

  return { vendors, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const updateVerificationStatus = async (businessId, { status, notes = '' }, adminId) => {
  const business = await Business.findById(businessId);
  if (!business) throw new ApiError(404, 'Business not found');

  business.verificationStatus = status;
  business.verificationNotes = notes;
  if (status === 'approved') {
    business.verifiedAt = new Date();
    await User.findByIdAndUpdate(business.ownerId, { 'capabilities.isVendor': true });
  } else {
    const hasOtherApproved = await Business.exists({
      ownerId: business.ownerId,
      _id: { $ne: businessId },
      verificationStatus: 'approved',
    });
    if (!hasOtherApproved) {
      await User.findByIdAndUpdate(business.ownerId, { 'capabilities.isVendor': false });
    }
  }
  await business.save();

  // Log action
  await AuditLog.create({
    actorId: adminId,
    action: `VERIFICATION_${status.toUpperCase()}`,
    targetType: 'Business',
    targetId: businessId,
    metadata: { status, notes },
  });

  // Notify business owner
  const notification = await Notification.create({
    recipientId: business.ownerId,
    senderId: adminId,
    type: 'verification',
    title: `Business Verification ${status === 'approved' ? 'Approved' : 'Updated'}`,
    message: `Your verification request for "${business.name}" has been marked as ${status}. ${notes}`,
    link: `/vendor/verification`,
  });
  sendNotificationToUser(business.ownerId, notification);

  return business;
};

export const getAuditLogs = async ({ page = 1, limit = 30 }) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('actorId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(),
  ]);

  return { logs, total };
};

export const getReportsList = async ({ page = 1, limit = 20, status }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporterId', 'firstName lastName email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return { reports, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const resolveReport = async (reportId, { status = 'resolved', resolutionNotes = '' }, adminId) => {
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

export const getPlatformSettings = async () => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({
      allowNewUserRegistrations: true,
      enforceEmailVerification: false,
      maintenanceMode: false,
    });
  }
  return settings;
};

export const updatePlatformSettings = async (updateData, adminId) => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create(updateData);
  } else {
    if (updateData.allowNewUserRegistrations !== undefined) {
      settings.allowNewUserRegistrations = Boolean(updateData.allowNewUserRegistrations);
    }
    if (updateData.enforceEmailVerification !== undefined) {
      settings.enforceEmailVerification = Boolean(updateData.enforceEmailVerification);
    }
    if (updateData.maintenanceMode !== undefined) {
      settings.maintenanceMode = Boolean(updateData.maintenanceMode);
    }
    await settings.save();
  }

  await AuditLog.create({
    actorId: adminId,
    action: 'UPDATE_PLATFORM_SETTINGS',
    targetType: 'PlatformSettings',
    targetId: settings._id,
    metadata: updateData,
  });

  return settings;
};

