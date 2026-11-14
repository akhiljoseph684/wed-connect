import mongoose from "mongoose";
import { Conversation, Message, User, Notification } from "../models/index.js";
import { ApiError } from "../utils/apiResponse.js";
import { getIO } from "../config/socket.js";

export const getUserConversations = async (userId, searchQuery = "") => {
  const query = {
    "participants.userId": userId,
  };

  const conversations = await Conversation.find(query)
    .populate(
      "participants.userId",
      "firstName lastName avatarUrl capabilities displayName",
    )
    .populate("businessId", "name logoUrl slug")
    .populate({
      path: "lastMessage.senderId",
      select: "firstName lastName displayName",
    })
    .sort({ "lastMessage.sentAt": -1, updatedAt: -1 })
    .lean();

  const conversationIds = conversations.map((c) => c._id);

  // Issue 17: Compute unread messages count per conversation for this user
  const unreadAgg = await Message.aggregate([
    {
      $match: {
        conversationId: { $in: conversationIds },
        senderId: { $ne: new mongoose.Types.ObjectId(userId) },
        isRead: false,
      },
    },
    {
      $group: {
        _id: "$conversationId",
        unreadCount: { $sum: 1 },
      },
    },
  ]);

  const unreadMap = new Map(
    unreadAgg.map((u) => [u._id.toString(), u.unreadCount]),
  );

  let enriched = conversations.map((c) => {
    const unread = unreadMap.get(c._id.toString()) || 0;
    return {
      ...c,
      unreadCount: unread,
      hasUnread: unread > 0,
    };
  });

  // Issue 15: Search conversations by participant name or business name
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    enriched = enriched.filter((c) => {
      const bizName = (c.businessId?.name || "").toLowerCase();
      const otherUser = c.participants?.find(
        (p) => (p.userId?._id || p.userId)?.toString() !== userId.toString(),
      )?.userId;
      const userName =
        `${otherUser?.firstName || ""} ${otherUser?.lastName || ""}`.toLowerCase();
      const displayName = (otherUser?.displayName || "").toLowerCase();
      const lastText = (c.lastMessage?.text || "").toLowerCase();
      return (
        bizName.includes(q) ||
        userName.includes(q) ||
        displayName.includes(q) ||
        lastText.includes(q)
      );
    });
  }

  return enriched;
};

export const getOrCreateDirectConversation = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "Cannot message yourself");
  }

  let conversation = await Conversation.findOne({
    type: "direct",
    "participants.userId": { $all: [userId, targetUserId] },
  })
    .populate("participants.userId", "firstName lastName avatarUrl displayName")
    .populate("businessId", "name logoUrl");

  if (!conversation) {
    conversation = await Conversation.create({
      type: "direct",
      participants: [
        { userId, role: "participant" },
        { userId: targetUserId, role: "participant" },
      ],
      lastMessage: {
        text: "Started a conversation",
        senderId: userId,
        sentAt: new Date(),
      },
    });

    conversation = await Conversation.findById(conversation._id)
      .populate(
        "participants.userId",
        "firstName lastName avatarUrl displayName",
      )
      .populate("businessId", "name logoUrl");
  }

  return conversation;
};

export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate(
      "participants.userId",
      "firstName lastName avatarUrl bio capabilities displayName",
    )
    .populate("businessId", "name logoUrl slug startingPrice");

  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants.some(
    (p) =>
      p.userId && (p.userId._id || p.userId).toString() === userId.toString(),
  );

  if (!isMember) {
    throw new ApiError(403, "Unauthorized to view this conversation");
  }

  return conversation;
};

export const getConversationMessages = async (
  conversationId,
  userId,
  { page = 1, limit = 50 },
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants.some(
    (p) => (p.userId?._id || p.userId).toString() === userId.toString(),
  );
  if (!isMember) throw new ApiError(403, "Unauthorized");

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .populate("senderId", "firstName lastName avatarUrl displayName")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId }),
  ]);

  return { messages, total };
};

export const sendMessage = async (
  conversationId,
  senderId,
  { content, attachments = [], idempotencyId },
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const isMember = conversation.participants.some(
    (p) => (p.userId?._id || p.userId).toString() === senderId.toString(),
  );
  if (!isMember) throw new ApiError(403, "Unauthorized");

  const message = await Message.create({
    conversationId,
    senderId,
    text: content || "",
    attachments,
    idempotencyId,
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "senderId",
    "firstName lastName avatarUrl displayName",
  );

  conversation.lastMessage = {
    text: content || (attachments.length > 0 ? "Sent an attachment" : ""),
    senderId,
    sentAt: new Date(),
  };
  await conversation.save();

  const io = getIO();

  if (io) {
    const conversationUpdate = {
      conversationId: conversation._id,
      lastMessage: populatedMessage,
    };

    // Notify users viewing this conversation
    io.to(`conversation:${conversationId}`).emit(
      "message:new",
      populatedMessage,
    );

    conversation.participants.forEach((participant) => {
      const participantId = (
        participant.userId?._id || participant.userId
      ).toString();

      io.to(`user:${participantId}`).emit(
        "conversation:updated",
        conversationUpdate,
      );
    });
  }

  return populatedMessage;
};

export const markConversationRead = async (conversationId, userId) => {
  const result = await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    },
    {
      $set: { isRead: true },
      $addToSet: {
        readBy: { userId, readAt: new Date() },
      },
    },
  );

  const io = getIO();

  if (io && result.modifiedCount > 0) {
    io.to(`conversation:${conversationId}`).emit("messages:read", {
      conversationId,
      readBy: userId,
    });
  }

  return true;
};

export const getUnreadCounts = async (userId) => {
  const userConvIds = await Conversation.find({
    "participants.userId": userId,
  }).distinct("_id");

  const [unreadNotifications, unreadMessages] = await Promise.all([
    Notification.countDocuments({ recipientId: userId, isRead: false }),
    Message.countDocuments({
      isRead: false,
      senderId: { $ne: userId },
      conversationId: { $in: userConvIds },
    }),
  ]);

  return {
    unreadNotifications,
    unreadMessages,
  };
};
