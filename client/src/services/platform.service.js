// Platform Settings Service
import api from "./api.js";

export const platformService = {
  // GET platform settings (admin endpoint)
  getSettings: () => api.get("/admin/settings"),
};
