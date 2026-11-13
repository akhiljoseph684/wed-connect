import { Router } from 'express';
import { body } from 'express-validator';
import * as reportController from '../controllers/report.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('targetType').isIn(['post', 'comment', 'user', 'business', 'review']).withMessage('Valid target type is required'),
    body('targetId').notEmpty().withMessage('Target ID is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    validate,
  ],
  reportController.createReport
);

router.get('/', authenticate, requireRole('admin', 'moderator'), reportController.getReports);
router.patch('/:reportId/resolve', authenticate, requireRole('admin', 'moderator'), reportController.resolveReport);

export default router;
