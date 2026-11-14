import api from './api';

export const taskService = {
  getTasks: (planId, params) => api.get(`/tasks/plan/${planId}`, { params }),
  createTask: (planId, data) => api.post(`/tasks/plan/${planId}`, data),
  updateTask: (taskId, data, planId) => api.patch(`/tasks/${taskId}/${planId}`, data),
  deleteTask: (taskId, planId) => api.delete(`/tasks/${taskId}/${planId}`),
};

export default taskService;
