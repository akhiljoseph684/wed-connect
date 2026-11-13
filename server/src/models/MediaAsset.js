import mongoose from 'mongoose';

const mediaAssetSchema = new mongoose.Schema(
  {
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    format: {
      type: String,
      default: 'jpeg',
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 0,
    },
    folder: {
      type: String,
      default: 'wedconnect/general',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);
export default MediaAsset;
