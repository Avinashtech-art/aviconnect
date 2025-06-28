export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  isOnline: boolean;
  lastSeen?: Date;
  status?: string;
  isBlocked?: boolean;
  phone?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
  wallpaper?: string;
}

export interface CallRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  timestamp: Date;
  duration?: number; // in seconds
}

export interface ChatState {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  searchQuery: string;
  contacts: User[];
  blockedUsers: User[];
  callHistory: CallRecord[];
  theme: 'dark' | 'light' | 'blue' | 'purple';
  activeView: 'chats' | 'calls' | 'contacts' | 'settings' | 'status';
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}