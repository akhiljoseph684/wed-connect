import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Unique creator username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_.-]+$/, 'Username can only contain alphanumeric characters, dots, underscores, and dashes'],
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      maxlength: 150,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    specialties: [{
      type: String,
      trim: true,
    }],
    coverImageUrl: {
      type: String,
      default: '',
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      pinterest: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        imageUrl: { type: String, required: true },
        category: { type: String, default: 'General' },
        tags: [{ type: String }],
        featured: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    stats: {
      followersCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      viewsCount: { type: Number, default: 0 },
      collaborationsCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

creatorProfileSchema.index({ specialties: 1 });
creatorProfileSchema.index({ 'stats.followersCount': -1 });

export const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);
export default CreatorProfile;
