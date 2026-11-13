import { Router } from 'express';
import { body } from 'express-validator';
import * as guestController from '../controllers/guest.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/plan/:planId', authenticate, guestController.getGuests);
router.post(
  '/plan/:planId',
  authenticate,
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    validate,
  ],
  guestController.createGuest
);

router.patch('/:guestId', authenticate, guestController.updateGuest);
router.patch('/:guestId/rsvp', guestController.updateRsvp); // Can be public via invite link or auth
router.delete('/:guestId', authenticate, guestController.deleteGuest);

export default router;
