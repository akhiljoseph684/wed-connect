import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['business', 'creator', 'post'],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['impression', 'view', 'save', 'inquiry', 'click', 'share'],
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['search', 'category', 'direct', 'social', 'workspace', 'feed'],
      default: 'direct',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

analyticsEventSchema.index({ targetId: 1, eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ targetId: 1, source: 1 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
