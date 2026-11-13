import { Router } from 'express';
import { body } from 'express-validator';
import * as weddingPlanController from '../controllers/weddingPlan.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/', authenticate, weddingPlanController.getWeddingPlans);
router.post(
  '/',
  authenticate,
  [
    body().custom((value) => {
      const p1 = value.partner1Name || value.coupleNames?.partner1Name || value.coupleNames?.partner1;
      const p2 = value.partner2Name || value.coupleNames?.partner2Name || value.coupleNames?.partner2;
      if (!p1 || !p1.toString().trim()) throw new Error('Partner 1 name is required');
      if (!p2 || !p2.toString().trim()) throw new Error('Partner 2 name is required');
      return true;
    }),
    body('weddingDate').notEmpty().withMessage('Wedding date is required'),
    validate,
  ],
  weddingPlanController.createWeddingPlan
);

router.get('/:planId', authenticate, weddingPlanController.getWeddingPlanDetails);
router.patch('/:planId', authenticate, weddingPlanController.updateWeddingPlan);
router.delete('/:planId', authenticate, weddingPlanController.deleteWeddingPlan);

router.put('/:planId/vendors', authenticate, weddingPlanController.toggleSaveVendor);
router.post('/:planId/timeline', authenticate, weddingPlanController.addTimelineEvent);
router.delete('/:planId/timeline/:eventIndex', authenticate, weddingPlanController.deleteTimelineEvent);
router.post('/:planId/members', authenticate, weddingPlanController.addMember);

export default router;
