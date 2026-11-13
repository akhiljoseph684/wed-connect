import { Conversation, Message, User } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';
import { getIO } from '../config/socket.js';

export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    'participants.userId': userId,
  })
    .populate('participants.userId', 'firstName lastName avatarUrl capabilities')
    .populate('businessId', 'name logoUrl slug')
    .sort({ 'lastMessage.sentAt': -1, updatedAt: -1 });

  return conversations;
};

export const getOrCreateDirectConversation = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, 'Cannot message yourself');
  }

  let conversation = await Conversation.findOne({
    type: 'direct',
    'participants.userId': { $all: [userId, targetUserId] },
  })
    .populate('participants.userId', 'firstName lastName avatarUrl')
    .populate('businessId', 'name logoUrl');

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: [
        { userId, role: 'participant' },
        { userId: targetUserId, role: 'participant' },
      ],
      lastMessage: {
        text: 'Started a conversation',
        senderId: userId,
        sentAt: new Date(),
      },
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants.userId', 'firstName lastName avatarUrl')
      .populate('businessId', 'name logoUrl');
  }

  return conversation;
};

export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('participants.userId', 'firstName lastName avatarUrl bio capabilities')
    .populate('businessId', 'name logoUrl slug startingPrice');

  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isMember = conversation.participants.some(
    (p) => p.userId && p.userId._id.toString() === userId.toString()
  );

  if (!isMember) {
    throw new ApiError(403, 'Unauthorized to view this conversation');
  }

  return conversation;
};

export const getConversationMessages = async (conversationId, userId, { page = 1, limit = 50 }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isMember = conversation.participants.some((p) => p.userId.toString() === userId.toString());
  if (!isMember) throw new ApiError(403, 'Unauthorized');

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .populate('senderId', 'firstName lastName avatarUrl')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId }),
  ]);

  return { messages, total };
};

export const sendMessage = async (conversationId, senderId, { content, attachments = [], idempotencyId }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isMember = conversation.participants.some((p) => p.userId.toString() === senderId.toString());
  if (!isMember) throw new ApiError(403, 'Unauthorized');

  const message = await Message.create({
    conversationId,
    senderId,
    text: content || '',
    attachments,
    idempotencyId,
  });

  const populatedMessage = await Message.findById(message._id).populate('senderId', 'firstName lastName avatarUrl');

  conversation.lastMessage = {
    text: content || (attachments.length > 0 ? 'Sent an attachment' : ''),
    senderId,
    sentAt: new Date(),
  };
  await conversation.save();

  // Socket emit if running
  const io = getIO();
  if (io) {
    io.to(`conversation:${conversationId}`).emit('message:new', populatedMessage);
    io.to(`conversation:${conversationId}`).emit('conversation:updated', {
      conversationId,
      lastMessage: populatedMessage,
    });
  }

  return populatedMessage;
};

export const markConversationRead = async (conversationId, userId) => {
  await Message.updateMany(
    { conversationId, senderId: { $ne: userId }, isRead: false },
    { isRead: true, $addToSet: { readBy: { userId, readAt: new Date() } } }
  );

  return true;
};
