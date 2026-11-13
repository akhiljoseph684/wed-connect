import api from './api';

export const postService = {
  getForYouFeed: (params) => api.get('/posts/feed/for-you', { params }),
  getFollowingFeed: (params) => api.get('/posts/feed/following', { params }),
  getTrendingFeed: (params) => api.get('/posts/feed/trending', { params }),
  getPostById: (postId) => api.get(`/posts/${postId}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (postId, data) => api.patch(`/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

export default postService;
