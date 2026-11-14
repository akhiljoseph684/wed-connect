import * as weddingPlanService from '../services/weddingPlan.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getWeddingPlans = asyncHandler(async (req, res) => {
  const plans = await weddingPlanService.getUserWeddingPlans(req.user._id);
  return res.status(200).json(new ApiResponse(200, plans, 'Wedding plans retrieved'));
});

export const createWeddingPlan = asyncHandler(async (req, res) => {
  const plan = await weddingPlanService.createWeddingPlan(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, plan, 'Wedding plan created successfully'));
});

export const getWeddingPlanDetails = asyncHandler(async (req, res) => {
  const details = await weddingPlanService.getWeddingPlanDetails(req.params.planId);
  return res.status(200).json(new ApiResponse(200, details, 'Wedding plan details'));
});

export const updateWeddingPlan = asyncHandler(async (req, res) => {
  const plan = await weddingPlanService.updateWeddingPlan(req.params.planId, req.body);
  return res.status(200).json(new ApiResponse(200, plan, 'Wedding plan updated'));
});

export const deleteWeddingPlan = asyncHandler(async (req, res) => {
  await weddingPlanService.deleteWeddingPlan(req.params.planId);
  return res.status(200).json(new ApiResponse(200, null, 'Wedding plan deleted'));
});

export const toggleSaveVendor = asyncHandler(async (req, res) => {
  const result = await weddingPlanService.toggleSaveVendorToPlan(req.params.planId, req.body.vendorId);
  return res.status(200).json(new ApiResponse(200, result, 'Vendor save status updated in wedding plan'));
});

export const addTimelineEvent = asyncHandler(async (req, res) => {
  const events = await weddingPlanService.addTimelineEvent(req.params.planId, req.body);
  return res.status(201).json(new ApiResponse(201, events, 'Timeline event added'));
});

export const deleteTimelineEvent = asyncHandler(async (req, res) => {
  const events = await weddingPlanService.deleteTimelineEvent(req.params.planId, req.params.eventIndex);
  return res.status(200).json(new ApiResponse(200, events, 'Timeline event deleted'));
});

export const addMember = asyncHandler(async (req, res) => {
  const member = await weddingPlanService.addPlanMember(req.params.planId, req.body.email, req.body.role, req.user);
  return res.status(201).json(new ApiResponse(201, member, 'Member added to wedding plan'));
});

export const removeMember = asyncHandler(async (req, res) => {
  await weddingPlanService.removePlanMember(req.params.planId, req.params.memberId, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Member removed from wedding plan'));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const updated = await weddingPlanService.updatePlanMemberRole(
    req.params.planId,
    req.params.memberId,
    req.body.role,
    req.user._id
  );
  return res.status(200).json(new ApiResponse(200, updated, 'Member permissions updated'));
});
