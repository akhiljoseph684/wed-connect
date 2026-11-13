import { Router } from 'express';
import { body } from 'express-validator';
import * as interactionController from '../controllers/interaction.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.put('/posts/:postId/like', authenticate, interactionController.toggleLike);
router.delete('/posts/:postId/like', authenticate, interactionController.toggleLike);
router.get('/posts/:postId/likes', interactionController.getLikes);

router.get('/posts/:postId/comments', interactionController.getComments);
router.post(
  '/posts/:postId/comments',
  authenticate,
  [
    body('text').trim().notEmpty().withMessage('Comment text is required'),
    validate,
  ],
  interactionController.addComment
);

router.delete('/comments/:commentId', authenticate, interactionController.deleteComment);

export default router;
