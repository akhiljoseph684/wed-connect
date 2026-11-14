import { Router } from 'express';
import { body } from 'express-validator';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requirePlanPermission } from '../middlewares/weddingPlan.middleware.js';

const router = Router();

router.get('/plan/:planId', authenticate, taskController.getTasks);
router.post(
  '/plan/:planId',
  authenticate,
  requirePlanPermission("edit"),
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    validate,
  ],
  taskController.createTask
);

router.patch('/:taskId/:planId', authenticate, requirePlanPermission("edit"), taskController.updateTask);
router.delete('/:taskId/:planId', authenticate, requirePlanPermission("edit"), taskController.deleteTask);

export default router;
