import express from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { registerClient } from '../services/notificationService.js';

const router = express.Router();

// 1. Establish SSE Connection Stream
router.get('/stream', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish stream connection

  registerClient(req.user.id, res);
});

// 2. Fetch Notifications List for User
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: { user_id: BigInt(req.user.id) },
      orderBy: { created_at: 'desc' }
    });
    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
});

// 3. Mark Notification as Read
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notifications.update({
      where: { id: BigInt(id) },
      data: { is_read: true }
    });
    return res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
});

// 4. Mark All Notifications as Read
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notifications.updateMany({
      where: { user_id: BigInt(req.user.id), is_read: false },
      data: { is_read: true }
    });
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;
