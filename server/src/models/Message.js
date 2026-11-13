import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 3000,
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        fileType: { type: String, default: 'image' },
        name: { type: String, default: '' },
        size: { type: Number, default: 0 },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    idempotencyId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
