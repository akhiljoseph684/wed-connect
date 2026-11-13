import { Router } from 'express';
import { body } from 'express-validator';
import * as businessController from '../controllers/business.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/', businessController.getBusinesses);
router.get('/me', authenticate, businessController.getMyBusiness);
router.get('/slug/:slug', businessController.getBusinessBySlug);
router.get('/:businessId', businessController.getBusinessById);

router.post(
  '/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Business name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    validate,
  ],
  businessController.createBusiness
);

router.patch('/:businessId', authenticate, businessController.updateBusiness);
router.post('/:businessId/submit-verification', authenticate, businessController.submitVerification);

// Services
router.get('/:businessId/services', businessController.getServices);
router.post(
  '/:businessId/services',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Service title is required'),
    body('price').isNumeric().withMessage('Valid price is required'),
    validate,
  ],
  businessController.createService
);
router.patch('/services/:serviceId', authenticate, businessController.updateService);
router.delete('/services/:serviceId', authenticate, businessController.deleteService);

// Portfolio & Availability
router.post('/:businessId/portfolio', authenticate, businessController.addPortfolio);
router.put('/:businessId/availability', authenticate, businessController.updateAvailability);

export default router;
