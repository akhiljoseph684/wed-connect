import api from './api';

export const messageService = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getUnreadCounts: () => api.get('/messages/unread-counts'),
  startConversation: (recipientId) => api.post('/messages/conversations', { recipientId }),
  getConversationById: (id) => api.get(`/messages/conversations/${id}`),
  getMessages: (conversationId, params) => api.get(`/messages/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) => api.post(`/messages/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId) => api.post(`/messages/conversations/${conversationId}/read`),
};

export default messageService;
