import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  wallpaper: {
    type: String,
    default: null
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String
  },
  groupAvatar: {
    type: String
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Conversation', conversationSchema);