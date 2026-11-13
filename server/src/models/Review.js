import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      required: [true, 'Review feedback is required'],
      maxlength: 2000,
    },
    weddingDate: {
      type: Date,
    },
    reply: {
      text: { type: String, default: '' },
      repliedAt: { type: Date },
    },
    isVerifiedWedding: {
      type: Boolean,
      default: true,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.virtual('content').get(function () {
  return this.comment;
});

reviewSchema.virtual('reviewText').get(function () {
  return this.comment;
});

// One review per user per business
reviewSchema.index({ businessId: 1, authorId: 1 }, { unique: true });
reviewSchema.index({ businessId: 1, rating: -1 });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
