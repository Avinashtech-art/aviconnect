import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database/sqlite.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await dbHelpers.findConversationByIdAndUser(conversationId, req.userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await dbHelpers.findMessagesByConversation(
      conversationId, 
      parseInt(limit), 
      parseInt(page)
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, content, type = 'text' } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

    // Verify user is part of conversation
    const conversation = await dbHelpers.findConversationByIdAndUser(conversationId, req.userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messageData = {
      id: uuidv4(),
      conversationId,
      senderId: req.userId,
      content,
      type
    };

    const message = await dbHelpers.createMessage(messageData);
    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Add reaction to message
router.post('/:messageId/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await dbHelpers.findMessageById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const updatedMessage = await dbHelpers.addMessageReaction(req.params.messageId, req.userId, emoji);
    res.json(updatedMessage);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Mark messages as read
router.put('/:conversationId/read', auth, async (req, res) => {
  try {
    const updatedCount = await dbHelpers.markMessagesAsRead(req.params.conversationId, req.userId);
    res.json({ message: 'Messages marked as read', count: updatedCount });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

export default router;