import jwt from 'jsonwebtoken';
import { dbHelpers } from '../database/sqlite.js';

const connectedUsers = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log('User connected:', socket.id);

  // Authenticate socket connection
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await dbHelpers.findUserById(decoded.userId);
      
      if (user) {
        socket.userId = user.id;
        connectedUsers.set(user.id, socket.id);
        
        // Update user online status
        await dbHelpers.updateUserStatus(user.id, user.status, true);
        
        // Join user to their personal room
        socket.join(user.id);
        
        // Notify contacts about online status
        socket.broadcast.emit('user_online', {
          userId: user.id,
          isOnline: true
        });
        
        socket.emit('authenticated', { userId: user.id });
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('auth_error', { error: 'Invalid token' });
    }
  });

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('send_message', (data) => {
    // Broadcast to conversation room
    socket.to(data.conversationId).emit('new_message', data);
  });

  // Handle typing indicator
  socket.on('typing_start', (data) => {
    socket.to(data.conversationId).emit('user_typing', {
      userId: socket.userId,
      conversationId: data.conversationId,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.conversationId).emit('user_typing', {
      userId: socket.userId,
      conversationId: data.conversationId,
      isTyping: false
    });
  });

  // Handle message reactions
  socket.on('message_reaction', (data) => {
    socket.to(data.conversationId).emit('message_reaction', data);
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      
      // Update user offline status
      await dbHelpers.updateUserStatus(socket.userId, 'offline', false, new Date().toISOString());
      
      // Notify contacts about offline status
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    }
  });
};