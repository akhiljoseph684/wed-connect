import { Router } from 'express';
import { body } from 'express-validator';
import * as guestController from '../controllers/guest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requirePlanPermission } from '../middlewares/weddingPlan.middleware.js';

const router = Router();

router.get('/plan/:planId', authenticate, guestController.getGuests);
router.post(
  '/plan/:planId',
  authenticate,
  requirePlanPermission("edit"),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    validate,
  ],
  guestController.createGuest
);

router.patch('/:guestId/:planId', authenticate, requirePlanPermission("edit"), guestController.updateGuest);
router.patch('/:guestId/rsvp/:planId', authenticate, requirePlanPermission("edit"), guestController.updateRsvp); 
router.delete('/:guestId/:planId', authenticate, requirePlanPermission("edit"), guestController.deleteGuest);

export default router;
