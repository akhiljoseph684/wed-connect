import { Router } from 'express';
import { body } from 'express-validator';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/business/:businessId', reviewController.getReviews);
router.post(
  '/business/:businessId',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').trim().notEmpty().withMessage('Review title is required'),
    body('comment').trim().notEmpty().withMessage('Review feedback comment is required'),
    validate,
  ],
  reviewController.createReview
);

router.post('/review/:reviewId/reply', authenticate, reviewController.replyReview);
router.patch('/review/:reviewId', authenticate, reviewController.updateReview);
router.delete('/review/:reviewId', authenticate, reviewController.deleteReview);

export default router;
