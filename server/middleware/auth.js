import jwt from 'jsonwebtoken';
import { dbHelpers } from '../database/sqlite.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Debug log
    console.log('🔐 Incoming Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const user = await dbHelpers.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token: user not found' });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
