import mongoose from 'mongoose';

const weddingPlanSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Wedding plan title is required'],
      trim: true,
      maxlength: 120,
    },
    partner1Name: {
      type: String,
      required: [true, 'Partner 1 name is required'],
      trim: true,
    },
    partner2Name: {
      type: String,
      required: [true, 'Partner 2 name is required'],
      trim: true,
    },
    weddingDate: {
      type: Date,
      required: [true, 'Wedding date is required'],
      index: true,
    },
    city: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    venueName: {
      type: String,
      default: '',
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: 0,
      default: 25000,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    weddingTheme: {
      type: String,
      default: 'Classic Romantic',
    },
    estimatedGuests: {
      type: Number,
      default: 100,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    coverImageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    savedVendorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
      },
    ],
    timelineEvents: [
      {
        title: { type: String, required: true },
        time: { type: String, required: true },
        description: { type: String, default: '' },
        location: { type: String, default: '' },
        order: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

weddingPlanSchema.virtual('daysRemaining').get(function () {
  if (!this.weddingDate) return null;
  const now = new Date();
  const diffTime = new Date(this.weddingDate) - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

weddingPlanSchema.virtual('coupleNames').get(function () {
  return {
    partner1: this.partner1Name || '',
    partner2: this.partner2Name || '',
    partner1Name: this.partner1Name || '',
    partner2Name: this.partner2Name || '',
  };
});

weddingPlanSchema.virtual('location').get(function () {
  return {
    city: this.city || '',
    country: this.country || '',
    venue: this.venueName || '',
    venueName: this.venueName || '',
  };
});

weddingPlanSchema.virtual('budget').get(function () {
  return {
    total: this.totalBudget || 0,
    currency: this.currency || 'USD',
  };
});

weddingPlanSchema.virtual('timeline').get(function () {
  return this.timelineEvents || [];
});

weddingPlanSchema.virtual('savedVendors').get(function () {
  return this.savedVendorIds || [];
});

export const WeddingPlan = mongoose.model('WeddingPlan', weddingPlanSchema);
export default WeddingPlan;
