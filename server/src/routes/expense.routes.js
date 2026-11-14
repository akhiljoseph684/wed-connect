import { Router } from 'express';
import { body } from 'express-validator';
import * as expenseController from '../controllers/expense.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requirePlanPermission } from '../middlewares/weddingPlan.middleware.js';

const router = Router();

router.get('/plan/:planId', authenticate, expenseController.getExpenses);
router.post(
  '/plan/:planId',
  authenticate,
  requirePlanPermission("edit"),
  [
    body('title').trim().notEmpty().withMessage('Expense title is required'),
    validate,
  ],
  expenseController.createExpense
);

router.patch('/:expenseId/:planId', authenticate, requirePlanPermission("edit"), expenseController.updateExpense);
router.delete('/:expenseId/:planId', authenticate, requirePlanPermission("edit"), expenseController.deleteExpense);

export default router;
