import * as messageService from '../services/message.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getUserConversations(req.user._id, req.query.search);
  return res.status(200).json(new ApiResponse(200, conversations, 'Conversations retrieved'));
});

export const getUnreadCounts = asyncHandler(async (req, res) => {
  const counts = await messageService.getUnreadCounts(req.user._id);
  return res.status(200).json(new ApiResponse(200, counts, 'Unread counts retrieved'));
});

export const startConversation = asyncHandler(async (req, res) => {
  const conversation = await messageService.getOrCreateDirectConversation(req.user._id, req.body.recipientId);
  return res.status(201).json(new ApiResponse(201, conversation, 'Conversation created/retrieved'));
});

export const getConversationById = asyncHandler(async (req, res) => {
  const conversation = await messageService.getConversationById(req.params.conversationId, req.user._id);
  return res.status(200).json(new ApiResponse(200, conversation, 'Conversation details'));
});

export const getMessages = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await messageService.getConversationMessages(req.params.conversationId, req.user._id, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Messages retrieved'));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(req.params.conversationId, req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

export const markAsRead = asyncHandler(async (req, res) => {
  await messageService.markConversationRead(req.params.conversationId, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Messages marked as read'));
});
