import * as mediaService from '../services/media.service.js';
import { ApiResponse, asyncHandler, ApiError } from '../utils/apiResponse.js';

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    throw new ApiError(400, 'Please select a file to upload');
  }

  if (req.file) {
    const uploaded = await mediaService.processUploadedFile(req.file, req.user._id);
    return res.status(201).json(new ApiResponse(201, uploaded, 'File uploaded successfully'));
  }

  if (req.files) {
    const uploadPromises = req.files.map((file) => mediaService.processUploadedFile(file, req.user._id));
    const results = await Promise.all(uploadPromises);
    return res.status(201).json(new ApiResponse(201, results, 'Files uploaded successfully'));
  }
});

export const deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMediaAsset(req.params.mediaId, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Media deleted'));
});
