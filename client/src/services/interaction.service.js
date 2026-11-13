import api from './api';

export const interactionService = {
  toggleLike: (postId) => api.put(`/interactions/posts/${postId}/like`),
  getLikes: (postId) => api.get(`/interactions/posts/${postId}/likes`),
  getComments: (postId, params) => api.get(`/interactions/posts/${postId}/comments`, { params }),
  addComment: (postId, data) => api.post(`/interactions/posts/${postId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/interactions/comments/${commentId}`),
};

export default interactionService;
