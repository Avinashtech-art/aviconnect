import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database/sqlite.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await dbHelpers.findConversationsByUser(req.userId);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Create or get conversation
router.post('/', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let conversation = await dbHelpers.findDirectConversation(req.userId, participantId);

    if (!conversation) {
      const conversationData = {
        id: uuidv4(),
        participants: [req.userId, participantId],
        type: 'direct',
        isGroup: false
      };
      
      await dbHelpers.createConversation(conversationData);
      conversation = await dbHelpers.findDirectConversation(req.userId, participantId);
    }

    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Update conversation wallpaper
router.put('/:id/wallpaper', auth, async (req, res) => {
  try {
    const { wallpaper } = req.body;
    
    // Verify user is part of conversation
    const conversation = await dbHelpers.findConversationByIdAndUser(req.params.id, req.userId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updatedConversation = await dbHelpers.updateConversationWallpaper(req.params.id, wallpaper);
    res.json(updatedConversation);
  } catch (error) {
    console.error('Update wallpaper error:', error);
    res.status(500).json({ error: 'Failed to update wallpaper' });
  }
});

export default router;