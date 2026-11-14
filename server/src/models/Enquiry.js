import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    coupleNames: {
      type: String,
      required: [true, 'Couple names are required'],
      trim: true,
    },
    weddingDate: {
      type: Date,
    },
    guestCount: {
      type: Number,
      default: 0,
    },
    estimatedBudget: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      maxlength: 2000,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'viewed', 'in_discussion', 'booked', 'confirmed', 'declined'],
      default: 'new',
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

enquirySchema.virtual('coupleName').get(function () {
  return this.coupleNames;
});

enquirySchema.index({ businessId: 1, status: 1 });
enquirySchema.index({ userId: 1, createdAt: -1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
