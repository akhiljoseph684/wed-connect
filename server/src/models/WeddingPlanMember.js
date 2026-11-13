import mongoose from 'mongoose';

const weddingPlanMemberSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeddingPlan',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'partner', 'planner', 'collaborator', 'viewer'],
      default: 'partner',
    },
    permissions: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'accepted',
    },
  },
  {
    timestamps: true,
  }
);

weddingPlanMemberSchema.index({ planId: 1, userId: 1 }, { unique: true });

export const WeddingPlanMember = mongoose.model('WeddingPlanMember', weddingPlanMemberSchema);
export default WeddingPlanMember;
