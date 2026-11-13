import * as expenseService from '../services/expense.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getPlanExpenses(req.params.planId);
  return res.status(200).json(new ApiResponse(200, expenses, 'Expenses retrieved'));
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.params.planId, req.body);
  return res.status(201).json(new ApiResponse(201, expense, 'Expense added successfully'));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.expenseId, req.body);
  return res.status(200).json(new ApiResponse(200, expense, 'Expense updated'));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.expenseId);
  return res.status(200).json(new ApiResponse(200, null, 'Expense deleted'));
});
