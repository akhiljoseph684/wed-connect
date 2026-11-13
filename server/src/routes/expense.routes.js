import { Router } from 'express';
import { body } from 'express-validator';
import * as expenseController from '../controllers/expense.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/plan/:planId', authenticate, expenseController.getExpenses);
router.post(
  '/plan/:planId',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Expense title is required'),
    validate,
  ],
  expenseController.createExpense
);

router.patch('/:expenseId', authenticate, expenseController.updateExpense);
router.delete('/:expenseId', authenticate, expenseController.deleteExpense);

export default router;
