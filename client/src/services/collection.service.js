import api from './api';

export const collectionService = {
  getMyCollections: () => api.get('/collections'),
  getCollectionById: (id) => api.get(`/collections/${id}`),
  createCollection: (data) => api.post('/collections', data),
  updateCollection: (id, data) => api.patch(`/collections/${id}`, data),
  deleteCollection: (id) => api.delete(`/collections/${id}`),
  addItem: (collectionId, postId, note = '') => api.put(`/collections/${collectionId}/items/${postId}`, { note }),
  removeItem: (collectionId, postId) => api.delete(`/collections/${collectionId}/items/${postId}`),
};

export default collectionService;
