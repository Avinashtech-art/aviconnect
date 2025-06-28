import { User, Message, Conversation, CallRecord, Theme } from '../types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  isOnline: true,
  status: 'Building amazing things! 🚀',
  phone: '+1 (555) 123-4567',
};

export const users: User[] = [
  {
    id: 'user-2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: true,
    status: 'Coffee lover ☕',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000),
    status: 'Busy with work 💼',
    phone: '+1 (555) 345-6789',
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: true,
    status: 'Living my best life! ✨',
    phone: '+1 (555) 456-7890',
  },
  {
    id: 'user-5',
    name: 'David Brown',
    email: 'david@example.com',
    avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 86400000),
    status: 'Traveling the world 🌍',
    phone: '+1 (555) 567-8901',
  },
  {
    id: 'user-6',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: true,
    status: 'Designer & dreamer 🎨',
    phone: '+1 (555) 678-9012',
  },
  {
    id: 'user-7',
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1800000),
    status: 'Coding enthusiast 💻',
    phone: '+1 (555) 789-0123',
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'Hey Alex! How are you doing today?',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-2',
      senderId: 'user-1',
      receiverId: 'user-2',
      content: 'Hi Sarah! I\'m doing great, thanks for asking. Just finished up with a client meeting.',
      timestamp: new Date(Date.now() - 3500000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-3',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'That sounds awesome! How did it go?',
      timestamp: new Date(Date.now() - 3400000),
      isRead: true,
      type: 'text',
      reactions: [{ emoji: '👍', userId: 'user-1', userName: 'Alex Johnson' }],
    },
    {
      id: 'msg-4',
      senderId: 'user-1',
      receiverId: 'user-2',
      content: 'Really well! We\'re moving forward with the project. I\'ll keep you updated on the progress.',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true,
      type: 'text',
    },
  ],
  'conv-2': [
    {
      id: 'msg-5',
      senderId: 'user-3',
      receiverId: 'user-1',
      content: 'Are we still on for lunch tomorrow?',
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-6',
      senderId: 'user-1',
      receiverId: 'user-3',
      content: 'Absolutely! See you at 12:30 at the usual place.',
      timestamp: new Date(Date.now() - 7100000),
      isRead: false,
      type: 'text',
    },
  ],
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [currentUser, users[0]],
    lastMessage: mockMessages['conv-1'][mockMessages['conv-1'].length - 1],
    unreadCount: 0,
    wallpaper: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
  },
  {
    id: 'conv-2',
    participants: [currentUser, users[1]],
    lastMessage: mockMessages['conv-2'][mockMessages['conv-2'].length - 1],
    unreadCount: 1,
  },
  {
    id: 'conv-3',
    participants: [currentUser, users[2]],
    unreadCount: 0,
  },
  {
    id: 'conv-4',
    participants: [currentUser, users[3]],
    unreadCount: 2,
  },
];

export const mockCallHistory: CallRecord[] = [
  {
    id: 'call-1',
    participantId: 'user-2',
    participantName: 'Sarah Wilson',
    participantAvatar: users[0].avatar,
    type: 'outgoing',
    callType: 'video',
    timestamp: new Date(Date.now() - 3600000),
    duration: 1245, // 20 minutes 45 seconds
  },
  {
    id: 'call-2',
    participantId: 'user-3',
    participantName: 'Mike Chen',
    participantAvatar: users[1].avatar,
    type: 'incoming',
    callType: 'voice',
    timestamp: new Date(Date.now() - 7200000),
    duration: 320, // 5 minutes 20 seconds
  },
  {
    id: 'call-3',
    participantId: 'user-4',
    participantName: 'Emma Davis',
    participantAvatar: users[2].avatar,
    type: 'missed',
    callType: 'video',
    timestamp: new Date(Date.now() - 10800000),
  },
  {
    id: 'call-4',
    participantId: 'user-2',
    participantName: 'Sarah Wilson',
    participantAvatar: users[0].avatar,
    type: 'incoming',
    callType: 'voice',
    timestamp: new Date(Date.now() - 86400000),
    duration: 890, // 14 minutes 50 seconds
  },
];

export const themes: Record<string, Theme> = {
  dark: {
    name: 'Dark',
    primary: 'from-slate-900 via-slate-800 to-slate-900',
    secondary: 'bg-slate-900/95',
    background: 'bg-slate-950/50',
    surface: 'bg-slate-800/60',
    text: 'text-white',
    accent: 'bg-blue-600',
  },
  light: {
    name: 'Light',
    primary: 'from-gray-50 via-white to-gray-50',
    secondary: 'bg-white/95',
    background: 'bg-gray-50/50',
    surface: 'bg-white/60',
    text: 'text-gray-900',
    accent: 'bg-blue-600',
  },
  blue: {
    name: 'Ocean Blue',
    primary: 'from-blue-900 via-blue-800 to-slate-900',
    secondary: 'bg-blue-900/95',
    background: 'bg-blue-950/50',
    surface: 'bg-blue-800/60',
    text: 'text-white',
    accent: 'bg-cyan-500',
  },
  purple: {
    name: 'Purple Dream',
    primary: 'from-purple-900 via-purple-800 to-slate-900',
    secondary: 'bg-purple-900/95',
    background: 'bg-purple-950/50',
    surface: 'bg-purple-800/60',
    text: 'text-white',
    accent: 'bg-pink-500',
  },
};

export const wallpapers = [
  'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
  'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
  'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
  'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
];