import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/messages/:conversationId', authenticate, getMessages);
router.post('/send', authenticate, sendMessage);

export default router;
