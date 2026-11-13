import { Task, WeddingPlan } from '../models/index.js';
import { ApiError } from '../utils/apiResponse.js';

export const getPlanTasks = async (planId, { status, priority, category } = {}) => {
  const filter = { planId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  return await Task.find(filter)
    .populate('assignedTo', 'firstName lastName avatarUrl')
    .sort({ dueDate: 1, priority: -1, order: 1 });
};

export const createTask = async (planId, taskData) => {
  return await Task.create({
    planId,
    title: taskData.title,
    description: taskData.description || '',
    category: taskData.category || 'other',
    priority: taskData.priority || 'medium',
    status: taskData.status || 'pending',
    dueDate: taskData.dueDate || null,
    assignedTo: taskData.assignedTo || null,
    estimatedCost: taskData.estimatedCost || 0,
    actualCost: taskData.actualCost || 0,
  });
};

export const updateTask = async (taskId, updateData) => {
  const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true, runValidators: true })
    .populate('assignedTo', 'firstName lastName avatarUrl');
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
};

export const deleteTask = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new ApiError(404, 'Task not found');
  return true;
};
