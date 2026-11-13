import { Router } from 'express';
import { body } from 'express-validator';
import * as enquiryController from '../controllers/enquiry.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post(
  '/business/:businessId',
  authenticate,
  [
    body('coupleNames').trim().notEmpty().withMessage('Couple names are required'),
    body('message').trim().notEmpty().withMessage('Enquiry message is required'),
    body('contactEmail').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  enquiryController.createEnquiry
);

router.get('/sent', authenticate, enquiryController.getSentEnquiries);
router.get('/received', authenticate, enquiryController.getReceivedEnquiries);
router.get('/:enquiryId', authenticate, enquiryController.getEnquiryById);
router.patch('/:enquiryId/status', authenticate, enquiryController.updateEnquiryStatus);

export default router;
