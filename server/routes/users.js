import express from 'express';
import { dbHelpers } from '../database/sqlite.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all contacts
router.get('/contacts', auth, async (req, res) => {
  try {
    const userWithContacts = await dbHelpers.findUserWithContacts(req.userId);
    if (!userWithContacts) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userWithContacts.contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
});

// Add contact
router.post('/contacts', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const contactUser = await dbHelpers.findUserByPhone(phone);
    if (!contactUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (contactUser.id === req.userId) {
      return res.status(400).json({ error: 'Cannot add yourself as contact' });
    }

    const newContact = await dbHelpers.addContact(req.userId, contactUser.id);
    res.json(newContact);
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, status, avatar } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;
    if (avatar !== undefined) updates.avatar = avatar;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await dbHelpers.updateUser(req.userId, updates);
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Block user
router.post('/block', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    await dbHelpers.blockUser(req.userId, userId);
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock user
router.post('/unblock', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await dbHelpers.unblockUser(req.userId, userId);
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await dbHelpers.searchUsers(q.trim(), req.userId, 20);
    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;