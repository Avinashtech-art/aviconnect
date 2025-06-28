import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      autoConnect: false,
    });

    this.socket.connect();

    // Authenticate after connection
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket?.emit('authenticate', token);
    });

    this.socket.on('authenticated', (data) => {
      console.log('Authenticated:', data);
    });

    this.socket.on('auth_error', (error) => {
      console.error('Authentication error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Conversation methods
  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  // Message methods
  sendMessage(data: any) {
    this.socket?.emit('send_message', data);
  }

  // Typing methods
  startTyping(conversationId: string) {
    this.socket?.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing_stop', { conversationId });
  }

  // Reaction methods
  sendReaction(data: any) {
    this.socket?.emit('message_reaction', data);
  }

  // Event listeners
  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserOnline(callback: (data: any) => void) {
    this.socket?.on('user_online', callback);
  }

  onMessageReaction(callback: (data: any) => void) {
    this.socket?.on('message_reaction', callback);
  }

  // Remove listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
export default socketService;