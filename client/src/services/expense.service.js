import api from './api';

export const expenseService = {
  getExpenses: (planId) => api.get(`/expenses/plan/${planId}`),
  createExpense: (planId, data) => api.post(`/expenses/plan/${planId}`, data),
  updateExpense: (expenseId, data) => api.patch(`/expenses/${expenseId}`, data),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),
};

export default expenseService;
