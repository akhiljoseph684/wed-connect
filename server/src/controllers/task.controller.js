import * as taskService from '../services/task.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, category } = req.query;
  const tasks = await taskService.getPlanTasks(req.params.planId, { status, priority, category });
  return res.status(200).json(new ApiResponse(200, tasks, 'Tasks retrieved'));
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.params.planId, req.body);
  return res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.body);
  return res.status(200).json(new ApiResponse(200, task, 'Task updated'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId);
  return res.status(200).json(new ApiResponse(200, null, 'Task deleted'));
});
