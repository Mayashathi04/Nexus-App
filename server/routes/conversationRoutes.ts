import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '../controllers/conversationController.ts';
import { protect } from '../middleware/authMiddleware.ts';

const router = Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);

export default router;
