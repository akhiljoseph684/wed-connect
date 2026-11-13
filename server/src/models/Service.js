import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: 2000,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'starting_at', 'hourly', 'custom_quote'],
      default: 'fixed',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    duration: {
      type: String,
      default: 'Full Day',
    },
    features: [{
      type: String,
      trim: true,
    }],
    media: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ businessId: 1, isActive: 1 });

export const Service = mongoose.model('Service', serviceSchema);
export default Service;
