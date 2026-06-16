import prisma from '../config/db.js';

// Map storing active SSE streams: userId (String) -> Array of Response streams
const activeStreams = new Map();

/**
 * Register a client's response stream for Server-Sent Events
 */
export const registerClient = (userId, res) => {
  const userKey = userId.toString();
  if (!activeStreams.has(userKey)) {
    activeStreams.set(userKey, []);
  }
  activeStreams.get(userKey).push(res);

  // Keep-alive heartbeat every 20 seconds
  const heartbeatInterval = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 20000);

  res.on('close', () => {
    clearInterval(heartbeatInterval);
    const streams = activeStreams.get(userKey) || [];
    const index = streams.indexOf(res);
    if (index !== -1) {
      streams.splice(index, 1);
    }
    if (streams.length === 0) {
      activeStreams.delete(userKey);
    }
  });
};

/**
 * Persist and push a notification to a specific user
 */
export const sendRealTimeNotification = async (userId, text) => {
  try {
    const notification = await prisma.notifications.create({
      data: {
        user_id: BigInt(userId),
        text,
        is_read: false,
        created_at: new Date()
      }
    });

    const userKey = userId.toString();
    const streams = activeStreams.get(userKey) || [];
    const payload = {
      id: Number(notification.id),
      text: notification.text,
      is_read: notification.is_read,
      created_at: notification.created_at
    };

    streams.forEach(res => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });

    return notification;
  } catch (err) {
    console.error(`Failed to send notification to user ${userId}:`, err);
  }
};

/**
 * Broadcast a notification to all users of a certain role
 */
export const broadcastNotificationToRole = async (role, text) => {
  try {
    const targetUsers = await prisma.users.findMany({
      where: { role },
      select: { id: true }
    });

    for (const u of targetUsers) {
      await sendRealTimeNotification(u.id, text);
    }
  } catch (err) {
    console.error(`Failed to broadcast notification to role ${role}:`, err);
  }
};
