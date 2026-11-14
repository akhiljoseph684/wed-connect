import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    details: {
      type: String,
      required: [true, 'Collaboration details are required'],
      maxlength: 2000,
    },
    proposedDate: {
      type: Date,
    },
    compensationType: {
      type: String,
      enum: ['paid', 'barter', 'exposure'],
      default: 'paid',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

collaborationRequestSchema.index({ receiverId: 1, status: 1 });
collaborationRequestSchema.index({ requesterId: 1, status: 1 });

export const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);
export default CollaborationRequest;
