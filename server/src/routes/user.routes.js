import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.patch('/me', authenticate, userController.updateMe);
router.put('/me/avatar', authenticate, userController.updateAvatar);
router.get('/:userId', optionalAuth, userController.getUserProfile);
router.get('/:userId/posts', optionalAuth, userController.getUserPosts);
router.get('/:userId/followers', userController.getUserFollowers);
router.get('/:userId/following', userController.getUserFollowing);
router.post('/:userId/follow', authenticate, userController.followUser);
router.delete('/:userId/follow', authenticate, userController.unfollowUser);
router.post('/:userId/block', authenticate, userController.toggleBlockUser);

export default router;
