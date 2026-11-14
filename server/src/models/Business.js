import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      default: '',
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Business description is required'],
      maxlength: 4000,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subcategories: [{
      type: String,
      trim: true,
    }],
    logoUrl: {
      type: String,
      default: '',
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, required: true, index: true },
      state: { type: String, default: '' },
      country: { type: String, default: 'USA' },
      zipCode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    serviceAreas: [{
      type: String,
      trim: true,
    }],
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    startingPrice: {
      type: Number,
      default: 0,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resubmission'],
      default: 'pending',
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verificationDocuments: [{
      type: String,
    }],
    verifiedAt: {
      type: Date,
    },
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        imageUrl: { type: String, required: true },
        featured: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    availability: {
      acceptingBookings: { type: Boolean, default: true },
      noticePeriodWeeks: { type: Number, default: 2 },
      blockedDates: [{ type: String }],
      entries: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
          date: { type: String, required: true },
          status: { type: String, enum: ['booked', 'unavailable', 'tentative'], default: 'booked' },
          notes: { type: String, default: '' },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    settings: {
      instantEmailAlerts: { type: Boolean, default: true },
      autoInquiryResponse: { type: Boolean, default: true },
      autoInquiryMessage: {
        type: String,
        default: 'Thank you for reaching out! We have received your inquiry and will respond shortly.',
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    enquiriesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.index({ 'location.city': 1, categoryId: 1 });
businessSchema.index({ 'rating.average': -1, startingPrice: 1 });
businessSchema.index({ name: 'text', description: 'text' });

export const Business = mongoose.model('Business', businessSchema);
export default Business;
