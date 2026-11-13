import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorType: {
      type: String,
      enum: ['user', 'creator', 'vendor'],
      default: 'user',
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Post description/caption is required'],
      maxlength: 3000,
    },
    media: [
      {
        url: { type: String, required: true },
        mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
        publicId: { type: String, default: '' },
        width: { type: Number },
        height: { type: Number },
        aspectRatio: { type: String, default: '4:5' },
        thumbnail: { type: String, default: '' },
      },
    ],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    location: {
      type: String,
      default: '',
    },
    likesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    trendingScore: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isPublished: 1, createdAt: -1 });
postSchema.index({ isFeatured: 1, createdAt: -1 });
postSchema.index({ trendingScore: -1 });

export const Post = mongoose.model('Post', postSchema);
export default Post;
