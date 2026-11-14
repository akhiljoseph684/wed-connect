import api from './api';

export const expenseService = {
  getExpenses: (planId) => api.get(`/expenses/plan/${planId}`),
  createExpense: (planId, data) => api.post(`/expenses/plan/${planId}`, data),
  updateExpense: (expenseId, data, planId) => api.patch(`/expenses/${expenseId}/${planId}`, data),
  deleteExpense: (expenseId, planId) => api.delete(`/expenses/${expenseId}/${planId}`),
};

export default expenseService;
