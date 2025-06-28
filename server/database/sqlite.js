import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection
const dbPath = join(__dirname, 'aviconnect.db');
const db = new sqlite3.Database(dbPath);
// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT UNIQUE NOT NULL,
          avatar TEXT DEFAULT 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          status TEXT DEFAULT 'Hey there! I am using AviConnect',
          isOnline BOOLEAN DEFAULT FALSE,
          lastSeen DATETIME DEFAULT CURRENT_TIMESTAMP,
          isVerified BOOLEAN DEFAULT FALSE,
          blockedUsers TEXT DEFAULT '[]',
          contacts TEXT DEFAULT '[]',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // OTP table
      db.run(`
        CREATE TABLE IF NOT EXISTS otps (
          id TEXT PRIMARY KEY,
          phone TEXT NOT NULL,
          code TEXT NOT NULL,
          expiresAt DATETIME NOT NULL,
          isUsed BOOLEAN DEFAULT FALSE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Conversations table
      db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          participants TEXT NOT NULL,
          type TEXT DEFAULT 'direct',
          name TEXT,
          avatar TEXT,
          wallpaper TEXT,
          isGroup BOOLEAN DEFAULT FALSE,
          groupName TEXT,
          groupAvatar TEXT,
          admin TEXT,
          lastMessage TEXT,
          lastMessageAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversationId TEXT NOT NULL,
          senderId TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'text',
          fileUrl TEXT,
          fileName TEXT,
          fileSize INTEGER,
          readBy TEXT DEFAULT '[]',
          reactions TEXT DEFAULT '[]',
          isDeleted BOOLEAN DEFAULT FALSE,
          status TEXT DEFAULT 'sent',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversationId) REFERENCES conversations(id),
          FOREIGN KEY (senderId) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ SQLite database initialized successfully');
          resolve();
        }
      });
    });
  });
};

// Database helper functions
export const dbHelpers = {
  // User operations
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { id, name, email, phone, avatar, isVerified = false } = userData;
      const defaultAvatar = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2';
      db.run(
        'INSERT INTO users (id, name, email, phone, avatar, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, phone, avatar || defaultAvatar, isVerified],
        function(err) {
          if (err) reject(err);
          else resolve({ id, name, email, phone, avatar: avatar || defaultAvatar, isVerified });
        }
      );
    });
  },

  findUserByPhone: (phone) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            row.blockedUsers = JSON.parse(row.blockedUsers || '[]');
            row.contacts = JSON.parse(row.contacts || '[]');
          }
          resolve(row);
        }
      });
    });
  },

  findUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            row.blockedUsers = JSON.parse(row.blockedUsers || '[]');
            row.contacts = JSON.parse(row.contacts || '[]');
          }
          resolve(row);
        }
      });
    });
  },

  updateUserStatus: (userId, status, isOnline = null, lastSeen = null) => {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE users SET status = ?';
      let params = [status];
      
      if (isOnline !== null) {
        query += ', isOnline = ?';
        params.push(isOnline);
      }
      
      if (lastSeen !== null) {
        query += ', lastSeen = ?';
        params.push(lastSeen);
      } else {
        query += ', lastSeen = CURRENT_TIMESTAMP';
      }
      
      query += ' WHERE id = ?';
      params.push(userId);

      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  updateUser: (userId, updates) => {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      db.run(
        `UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, userId],
        function(err) {
          if (err) reject(err);
          else {
            dbHelpers.findUserById(userId).then(resolve).catch(reject);
          }
        }
      );
    });
  },

  // OTP operations
  deleteOTPsByPhone: (phone) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM otps WHERE phone = ?', [phone], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

createOTP: (otpData) => {
  return new Promise((resolve, reject) => {
    const { id, phone, code, expiresAt } = otpData;
    console.log('📥 Storing OTP in DB with phone:', phone, 'and code:', code, 'expiresAt:', expiresAt);
    db.run(
      'INSERT INTO otps (id, phone, code, expiresAt) VALUES (?, ?, ?, ?)',
      [id, phone, code, expiresAt],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...otpData });
      }
    );
  });
}
,

 findValidOTP: (phone, code) => {
  return new Promise((resolve, reject) => {
    const query ='SELECT * FROM otps WHERE phone = ? AND code = ? AND expiresAt > CURRENT_TIMESTAMP AND isUsed = 0'
;
    console.log('🕵️‍♂️ findValidOTP query with:', phone, code);

    db.get(query, [phone, code], (err, row) => {
      if (err) {
        console.error('❌ DB error in findValidOTP:', err);
        reject(err);
      } else {
        console.log('🔍 OTP found:', row);
        resolve(row);
      }
    });
  });
}
,

  markOTPAsUsed: (id) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE otps SET isUsed = TRUE WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  // Conversation operations
  createConversation: (conversationData) => {
    return new Promise((resolve, reject) => {
      const { id, participants, type, name, avatar, isGroup = false } = conversationData;
      db.run(
        'INSERT INTO conversations (id, participants, type, name, avatar, isGroup) VALUES (?, ?, ?, ?, ?, ?)',
        [id, JSON.stringify(participants), type, name, avatar, isGroup],
        function(err) {
          if (err) reject(err);
          else resolve({ id, participants, type, name, avatar, isGroup });
        }
      );
    });
  },

  findConversationsByUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM conversations WHERE participants LIKE ? ORDER BY lastMessageAt DESC',
        [`%"${userId}"%`],
        async (err, rows) => {
          if (err) reject(err);
          else {
            const conversations = [];
            for (const row of rows) {
              const participants = JSON.parse(row.participants);
              const participantDetails = [];
              
              for (const participantId of participants) {
                const user = await dbHelpers.findUserById(participantId);
                if (user) {
                  participantDetails.push({
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen
                  });
                }
              }
              
              conversations.push({
                ...row,
                participants: participantDetails
              });
            }
            resolve(conversations);
          }
        }
      );
    });
  },

  findDirectConversation: (userId1, userId2) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM conversations WHERE participants = ? OR participants = ? AND isGroup = FALSE',
        [JSON.stringify([userId1, userId2]), JSON.stringify([userId2, userId1])],
        async (err, row) => {
          if (err) reject(err);
          else {
            if (row) {
              const participants = JSON.parse(row.participants);
              const participantDetails = [];
              
              for (const participantId of participants) {
                const user = await dbHelpers.findUserById(participantId);
                if (user) {
                  participantDetails.push({
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen
                  });
                }
              }
              
              resolve({
                ...row,
                participants: participantDetails
              });
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  },

  findConversationByIdAndUser: (conversationId, userId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM conversations WHERE id = ? AND participants LIKE ?',
        [conversationId, `%"${userId}"%`],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },

  updateConversationWallpaper: (conversationId, wallpaper) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE conversations SET wallpaper = ? WHERE id = ?',
        [wallpaper, conversationId],
        function(err) {
          if (err) reject(err);
          else {
            db.get('SELECT * FROM conversations WHERE id = ?', [conversationId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  },

  // Message operations
  createMessage: (messageData) => {
    return new Promise((resolve, reject) => {
      const { id, conversationId, senderId, content, type = 'text' } = messageData;
      db.run(
        'INSERT INTO messages (id, conversationId, senderId, content, type) VALUES (?, ?, ?, ?, ?)',
        [id, conversationId, senderId, content, type],
        function(err) {
          if (err) reject(err);
          else {
            // Update conversation's last message
            db.run(
              'UPDATE conversations SET lastMessage = ?, lastMessageAt = CURRENT_TIMESTAMP WHERE id = ?',
              [content, conversationId]
            );
            
            // Get the created message with sender details
            dbHelpers.findUserById(senderId).then(sender => {
              resolve({
                id,
                conversationId,
                senderId,
                content,
                type,
                sender: {
                  id: sender.id,
                  name: sender.name,
                  avatar: sender.avatar
                },
                createdAt: new Date().toISOString()
              });
            }).catch(reject);
          }
        }
      );
    });
  },

  findMessagesByConversation: (conversationId, limit = 50, page = 1) => {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      db.all(
        'SELECT * FROM messages WHERE conversationId = ? AND isDeleted = FALSE ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [conversationId, limit, offset],
        async (err, rows) => {
          if (err) reject(err);
          else {
            const messages = [];
            for (const row of rows) {
              const sender = await dbHelpers.findUserById(row.senderId);
              messages.push({
                ...row,
                sender: sender ? {
                  id: sender.id,
                  name: sender.name,
                  avatar: sender.avatar
                } : null,
                readBy: JSON.parse(row.readBy || '[]'),
                reactions: JSON.parse(row.reactions || '[]')
              });
            }
            resolve(messages.reverse());
          }
        }
      );
    });
  },

  findMessageById: (messageId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM messages WHERE id = ?', [messageId], (err, row) => {
        if (err) reject(err);
        else {
          if (row) {
            row.readBy = JSON.parse(row.readBy || '[]');
            row.reactions = JSON.parse(row.reactions || '[]');
          }
          resolve(row);
        }
      });
    });
  },

  addMessageReaction: (messageId, userId, emoji) => {
    return new Promise((resolve, reject) => {
      dbHelpers.findMessageById(messageId).then(message => {
        if (!message) {
          reject(new Error('Message not found'));
          return;
        }

        let reactions = message.reactions;
        // Remove existing reaction from this user
        reactions = reactions.filter(reaction => reaction.user !== userId);
        
        // Add new reaction
        reactions.push({
          user: userId,
          emoji,
          createdAt: new Date().toISOString()
        });

        db.run(
          'UPDATE messages SET reactions = ? WHERE id = ?',
          [JSON.stringify(reactions), messageId],
          function(err) {
            if (err) reject(err);
            else {
              dbHelpers.findMessageById(messageId).then(resolve).catch(reject);
            }
          }
        );
      }).catch(reject);
    });
  },

  markMessagesAsRead: (conversationId, userId) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM messages WHERE conversationId = ? AND senderId != ?',
        [conversationId, userId],
        (err, rows) => {
          if (err) reject(err);
          else {
            const updates = [];
            for (const row of rows) {
              const readBy = JSON.parse(row.readBy || '[]');
              const alreadyRead = readBy.some(read => read.user === userId);
              
              if (!alreadyRead) {
                readBy.push({
                  user: userId,
                  readAt: new Date().toISOString()
                });
                updates.push([JSON.stringify(readBy), row.id]);
              }
            }

            if (updates.length === 0) {
              resolve(0);
              return;
            }

            let completed = 0;
            for (const [readByJson, messageId] of updates) {
              db.run(
                'UPDATE messages SET readBy = ? WHERE id = ?',
                [readByJson, messageId],
                function(err) {
                  if (err) reject(err);
                  else {
                    completed++;
                    if (completed === updates.length) {
                      resolve(updates.length);
                    }
                  }
                }
              );
            }
          }
        }
      );
    });
  },

  // Contact operations
  findUserWithContacts: (userId) => {
    return new Promise((resolve, reject) => {
      dbHelpers.findUserById(userId).then(async user => {
        if (!user) {
          resolve(null);
          return;
        }

        const contactDetails = [];
        for (const contactId of user.contacts) {
          const contact = await dbHelpers.findUserById(contactId);
          if (contact) {
            contactDetails.push({
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              avatar: contact.avatar,
              status: contact.status,
              isOnline: contact.isOnline,
              lastSeen: contact.lastSeen
            });
          }
        }

        resolve({
          ...user,
          contacts: contactDetails
        });
      }).catch(reject);
    });
  },

  addContact: (userId, contactId) => {
    return new Promise((resolve, reject) => {
      dbHelpers.findUserById(userId).then(user => {
        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        const contacts = user.contacts;
        if (!contacts.includes(contactId)) {
          contacts.push(contactId);
          
          db.run(
            'UPDATE users SET contacts = ? WHERE id = ?',
            [JSON.stringify(contacts), userId],
            function(err) {
              if (err) reject(err);
              else {
                dbHelpers.findUserById(contactId).then(resolve).catch(reject);
              }
            }
          );
        } else {
          dbHelpers.findUserById(contactId).then(resolve).catch(reject);
        }
      }).catch(reject);
    });
  },

  blockUser: (userId, targetUserId) => {
    return new Promise((resolve, reject) => {
      dbHelpers.findUserById(userId).then(user => {
        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        const blockedUsers = user.blockedUsers;
        if (!blockedUsers.includes(targetUserId)) {
          blockedUsers.push(targetUserId);
          
          db.run(
            'UPDATE users SET blockedUsers = ? WHERE id = ?',
            [JSON.stringify(blockedUsers), userId],
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        } else {
          resolve(0);
        }
      }).catch(reject);
    });
  },

  unblockUser: (userId, targetUserId) => {
    return new Promise((resolve, reject) => {
      dbHelpers.findUserById(userId).then(user => {
        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        const blockedUsers = user.blockedUsers.filter(id => id !== targetUserId);
        
        db.run(
          'UPDATE users SET blockedUsers = ? WHERE id = ?',
          [JSON.stringify(blockedUsers), userId],
          function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          }
        );
      }).catch(reject);
    });
  },

  searchUsers: (query, excludeUserId, limit = 20) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, name, phone, avatar, status, isOnline FROM users WHERE id != ? AND (name LIKE ? OR phone LIKE ?) LIMIT ?',
        [excludeUserId, `%${query}%`, `%${query}%`, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
};

export { db, initializeDatabase };