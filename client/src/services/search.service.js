import api from './api';

export const searchService = {
  search: (params) => api.get('/search', { params }),
  getSuggestions: (q) => api.get('/search/suggestions', { params: { q } }),
};

export default searchService;
