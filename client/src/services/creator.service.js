import api from "./api";

export const creatorService = {
  getCreators: (params) => api.get("/creators", { params }),
  getCreatorByUserId: (username) => api.get(`/creators/profile/${username}`),
  upsertProfile: (data) => api.post("/creators/profile", data),
  addPortfolio: (data) => api.post("/creators/portfolio", data),
  updatePortfolio: (id, data) => api.patch(`/creators/portfolio/${id}`, data),
  deletePortfolio: (id) => api.delete(`/creators/portfolio/${id}`),
  getAnalytics: () => api.get("/creators/analytics"),
  getCollaborations: () => api.get("/creators/collaborations"),
  createCollaboration: (data) => api.post("/creators/collaborations", data),
  updateCollaborationStatus: (id, status) => api.patch(`/creators/collaborations/${id}/status`, { status }),
};

export default creatorService;
