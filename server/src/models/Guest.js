import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeddingPlan',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    side: {
      type: String,
      enum: ['partner1', 'partner2', 'both'],
      default: 'both',
    },
    group: {
      type: String,
      enum: ['family', 'friends', 'wedding_party', 'colleagues', 'vip', 'other'],
      default: 'friends',
    },
    invitationStatus: {
      type: String,
      enum: ['not_sent', 'sent', 'delivered'],
      default: 'not_sent',
    },
    rsvpStatus: {
      type: String,
      enum: ['pending', 'attending', 'declined'],
      default: 'pending',
      index: true,
    },
    dietaryRestrictions: {
      type: String,
      default: '',
    },
    plusOne: {
      allowed: { type: Boolean, default: false },
      hasPlusOne: { type: Boolean, default: false },
      name: { type: String, default: '' },
    },
    tableNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

guestSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

guestSchema.index({ planId: 1, rsvpStatus: 1 });
guestSchema.index({ planId: 1, group: 1 });

export const Guest = mongoose.model('Guest', guestSchema);
export default Guest;
