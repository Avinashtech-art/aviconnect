import jwt from 'jsonwebtoken';
import { dbHelpers } from '../database/sqlite.js';

const connectedUsers = new Map();

export const handleSocketAuthentication = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Missing auth token'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await dbHelpers.findUserById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });
};

export const handleSocketConnection = (socket, io) => {
  console.log('✅ Socket connected:', socket.id);

  const user = socket.user;
  if (!user) {
    console.warn('⚠️ No user found on socket after auth');
    return;
  }

  connectedUsers.set(user.id, socket.id);

  // Mark user online in DB
  dbHelpers.updateUserStatus(user.id, user.status, true);

  // Join personal room
  socket.join(user.id);

  // Notify contacts
  socket.broadcast.emit('user_online', {
    userId: user.id,
    isOnline: true
  });

  // Confirm to client
  socket.emit('authenticated', { userId: user.id });

  // Join conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`📥 ${user.id} joined conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`📤 ${user.id} left conversation ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.conversationId).emit('new_message', data);
  });

  socket.on('typing_start', ({ conversationId }) => {
    socket.to(conversationId).emit('user_typing', {
      userId: user.id,
      conversationId,
      isTyping: true
    });
  });

  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(conversationId).emit('user_typing', {
      userId: user.id,
      conversationId,
      isTyping: false
    });
  });

  socket.on('message_reaction', (data) => {
    socket.to(data.conversationId).emit('message_reaction', data);
  });

  socket.on('disconnect', async () => {
    connectedUsers.delete(user.id);
    console.log(`❌ ${user.id} disconnected`);

    await dbHelpers.updateUserStatus(user.id, 'offline', false, new Date().toISOString());

    socket.broadcast.emit('user_online', {
      userId: user.id,
      isOnline: false,
      lastSeen: new Date()
    });
  });
};
