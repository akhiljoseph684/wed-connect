import api from './api';

export const userService = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateMe: (data) => api.patch('/users/me', data),
  updateAvatar: (avatarUrl) => api.put('/users/me/avatar', { avatarUrl }),
  getUserPosts: (userId, params) => api.get(`/users/${userId}/posts`, { params }),
  getUserFollowers: (userId, params) => api.get(`/users/${userId}/followers`, { params }),
  getUserFollowing: (userId, params) => api.get(`/users/${userId}/following`, { params }),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  blockUser: (userId) => api.post(`/users/${userId}/block`),
};

export default userService;
