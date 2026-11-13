import mongoose from 'mongoose';

const collectionItemSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: 300,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

collectionItemSchema.index({ collectionId: 1, postId: 1 }, { unique: true });

export const CollectionItem = mongoose.model('CollectionItem', collectionItemSchema);
export default CollectionItem;
