import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/conversations', authenticate, messageController.getConversations);
router.get('/unread-counts', authenticate, messageController.getUnreadCounts);
router.post('/conversations', authenticate, messageController.startConversation);
router.get('/conversations/:conversationId', authenticate, messageController.getConversationById);
router.get('/conversations/:conversationId/messages', authenticate, messageController.getMessages);
router.post('/conversations/:conversationId/messages', authenticate, messageController.sendMessage);
router.post('/conversations/:conversationId/read', authenticate, messageController.markAsRead);

export default router;
