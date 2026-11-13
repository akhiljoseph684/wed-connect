import * as enquiryService from '../services/enquiry.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.createEnquiry(req.user._id, req.params.businessId, req.body);
  return res.status(201).json(new ApiResponse(201, enquiry, 'Enquiry sent to vendor successfully'));
});

export const getSentEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await enquiryService.getSentEnquiries(req.user._id);
  return res.status(200).json(new ApiResponse(200, enquiries, 'Sent enquiries'));
});

export const getReceivedEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await enquiryService.getReceivedEnquiries(req.user._id);
  return res.status(200).json(new ApiResponse(200, enquiries, 'Received enquiries'));
});

export const getEnquiryById = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.getEnquiryById(req.params.enquiryId, req.user._id);
  return res.status(200).json(new ApiResponse(200, enquiry, 'Enquiry details'));
});

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await enquiryService.updateEnquiryStatus(req.params.enquiryId, req.user._id, req.body.status);
  return res.status(200).json(new ApiResponse(200, enquiry, 'Enquiry status updated'));
});
