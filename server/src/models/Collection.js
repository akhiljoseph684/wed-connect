import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Collection title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    itemsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

collectionSchema.virtual('name').get(function () {
  return this.title;
});

collectionSchema.index({ userId: 1, createdAt: -1 });

export const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
