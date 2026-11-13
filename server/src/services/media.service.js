import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { MediaAsset } from '../models/index.js';
import fs from 'fs';

export const processUploadedFile = async (file, uploaderId, folder = 'wedconnect/general') => {
  if (!file) return null;

  let url = `/uploads/${file.filename}`;
  let publicId = '';
  const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

  if (isCloudinaryConfigured()) {
    try {
      const uploadRes = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: mediaType,
      });
      url = uploadRes.secure_url;
      publicId = uploadRes.public_id;

      // Remove temp file after uploading to Cloudinary
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.warn('[Cloudinary Upload Warning] Cloudinary failed, using local file URL fallback:', err.message);
    }
  }

  const asset = await MediaAsset.create({
    uploaderId,
    url,
    publicId,
    mediaType,
    size: file.size,
    folder,
  });

  return {
    url,
    publicId,
    mediaType,
    assetId: asset._id,
  };
};

export const deleteMediaAsset = async (assetId, uploaderId) => {
  const asset = await MediaAsset.findOne({ _id: assetId, uploaderId });
  if (!asset) return false;

  if (asset.publicId && isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(asset.publicId);
    } catch (e) {
      console.warn('[Cloudinary Delete Warning]:', e.message);
    }
  }

  await MediaAsset.findByIdAndDelete(assetId);
  return true;
};
