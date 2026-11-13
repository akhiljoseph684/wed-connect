import api from './api';

export const taskService = {
  getTasks: (planId, params) => api.get(`/tasks/plan/${planId}`, { params }),
  createTask: (planId, data) => api.post(`/tasks/plan/${planId}`, data),
  updateTask: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};

export default taskService;
