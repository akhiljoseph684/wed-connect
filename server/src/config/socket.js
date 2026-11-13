import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';
import { User, Message, Conversation, Notification } from '../models/index.js';

let io = null;
const userSockets = new Map(); // userId -> Set of socket IDs

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1] || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('_id firstName lastName email avatarUrl role');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket] User connected: ${socket.user.firstName} (${userId}), socketId: ${socket.id}`);

    // Track user presence
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join personal room for private notifications
    socket.join(`user:${userId}`);

    // Broadcast online presence
    io.emit('presence:changed', {
      userId,
      status: 'online',
      onlineUserIds: Array.from(userSockets.keys()),
    });

    // Join conversation room
    socket.on('conversation:join', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
        console.log(`[Socket] User ${userId} joined room conversation:${conversationId}`);
      }
    });

    // Typing start
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId,
        userName: socket.user.firstName,
      });
    });

    // Typing stop
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    // Send Message
    socket.on('message:send', async ({ conversationId, text, attachments = [], idempotencyId }) => {
      try {
        if (!conversationId || (!text && attachments.length === 0)) return;

        // Save to DB
        const message = await Message.create({
          conversationId,
          senderId: userId,
          text: text || '',
          attachments,
          idempotencyId,
        });

        const populatedMessage = await Message.findById(message._id).populate('senderId', 'firstName lastName avatarUrl');

        // Update conversation's lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: text || 'Sent an attachment',
            senderId: userId,
            sentAt: new Date(),
          },
          $inc: { [`unreadCounts.${userId}`]: 0 },
        });

        // Emit to room
        io.to(`conversation:${conversationId}`).emit('message:new', populatedMessage);
        io.to(`conversation:${conversationId}`).emit('conversation:updated', {
          conversationId,
          lastMessage: populatedMessage,
        });

        // Acknowledge delivery
        socket.emit('message:delivered', {
          tempId: idempotencyId,
          messageId: message._id,
        });
      } catch (err) {
        console.error('[Socket Error] message:send failed:', err);
      }
    });

    // Mark messages read
    socket.on('message:read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversationId, senderId: { $ne: userId }, isRead: false },
          { isRead: true, $addToSet: { readBy: { userId, readAt: new Date() } } }
        );

        io.to(`conversation:${conversationId}`).emit('message:read', {
          conversationId,
          readByUserId: userId,
          readAt: new Date(),
        });
      } catch (err) {
        console.error('[Socket Error] message:read failed:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userSet = userSockets.get(userId);
      if (userSet) {
        userSet.delete(socket.id);
        if (userSet.size === 0) {
          userSockets.delete(userId);
          io.emit('presence:changed', {
            userId,
            status: 'offline',
            onlineUserIds: Array.from(userSockets.keys()),
          });
        }
      }
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const sendNotificationToUser = (userId, notificationData) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notificationData);
  }
};
