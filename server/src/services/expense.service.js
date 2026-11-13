import { Expense } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getPlanExpenses = async (planId) => {
  return await Expense.find({ planId })
    .populate('vendorId', 'name slug logoUrl')
    .sort({ createdAt: -1 });
};

export const createExpense = async (planId, expenseData) => {
  return await Expense.create({
    planId,
    title: expenseData.title,
    category: expenseData.category || 'General',
    estimatedAmount: expenseData.estimatedAmount || 0,
    actualAmount: expenseData.actualAmount || 0,
    paidAmount: expenseData.paidAmount || 0,
    status: expenseData.status || 'estimated',
    dueDate: expenseData.dueDate || null,
    vendorId: expenseData.vendorId || null,
    notes: expenseData.notes || '',
  });
};

export const updateExpense = async (expenseId, updateData) => {
  const expense = await Expense.findByIdAndUpdate(expenseId, updateData, { new: true, runValidators: true })
    .populate('vendorId', 'name slug logoUrl');
  if (!expense) throw new ApiError(404, 'Expense not found');
  return expense;
};

export const deleteExpense = async (expenseId) => {
  const expense = await Expense.findByIdAndDelete(expenseId);
  if (!expense) throw new ApiError(404, 'Expense not found');
  return true;
};
