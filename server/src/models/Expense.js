import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeddingPlan',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    estimatedAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    actualAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['estimated', 'deposit_paid', 'paid_in_full'],
      default: 'estimated',
      index: true,
    },
    dueDate: {
      type: Date,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ planId: 1, category: 1 });

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
