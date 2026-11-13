import { Router } from 'express';
import { body } from 'express-validator';
import * as postController from '../controllers/post.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

// Feed endpoints
router.get('/feed/for-you', optionalAuth, postController.getForYouFeed);
router.get('/feed/following', authenticate, postController.getFollowingFeed);
router.get('/feed/trending', optionalAuth, postController.getTrendingFeed);

// General posts listing and details
router.get('/', optionalAuth, postController.getForYouFeed);
router.get('/:postId', optionalAuth, postController.getPostById);

// Create, edit, delete
router.post(
  '/',
  authenticate,
  [
    body('content').trim().notEmpty().withMessage('Post content or caption is required'),
    validate,
  ],
  postController.createPost
);

router.patch('/:postId', authenticate, postController.updatePost);
router.delete('/:postId', authenticate, postController.deletePost);

export default router;
