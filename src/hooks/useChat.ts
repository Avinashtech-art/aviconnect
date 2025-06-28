import { useState, useCallback, useEffect } from 'react';
import { ChatState, Message, User } from '../types';
import { themes } from '../data/mockData';
import { conversationsAPI, messagesAPI, usersAPI } from '../services/api';
import socketService from '../services/socket';

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    currentUser: null,
    conversations: [],
    activeConversationId: null,
    messages: {},
    searchQuery: '',
    contacts: [],
    blockedUsers: [],
    callHistory: [],
    theme: 'dark',
    activeView: 'chats',
  });

  const [typingTimeouts, setTypingTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      const response = await conversationsAPI.getConversations();
      setChatState(prev => ({
        ...prev,
        conversations: response.data,
      }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  // Load contacts from API
  const loadContacts = useCallback(async () => {
    try {
      const response = await usersAPI.getContacts();
      setChatState(prev => ({
        ...prev,
        contacts: response.data,
      }));
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await messagesAPI.getMessages(conversationId);
      setChatState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: response.data,
        },
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    setChatState(prev => ({
      ...prev,
      activeConversationId: conversationId,
      activeView: 'chats',
    }));

    // Load messages if not already loaded
    if (!chatState.messages[conversationId]) {
      await loadMessages(conversationId);
    }

    // Join conversation room
    socketService.joinConversation(conversationId);

    // Mark messages as read
    try {
      await messagesAPI.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [chatState.messages, loadMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatState.activeConversationId) return;

    try {
      const response = await messagesAPI.sendMessage(chatState.activeConversationId, content);
      const newMessage = response.data;

      // Update local state
      setChatState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatState.activeConversationId!]: [
            ...(prev.messages[chatState.activeConversationId!] || []),
            newMessage,
          ],
        },
        conversations: prev.conversations.map(conv =>
          conv._id === chatState.activeConversationId
            ? { ...conv, lastMessage: newMessage }
            : conv
        ),
      }));

      // Send via socket
      socketService.sendMessage({
        ...newMessage,
        conversationId: chatState.activeConversationId,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [chatState.activeConversationId]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      const response = await messagesAPI.addReaction(messageId, emoji);
      const updatedMessage = response.data;

      setChatState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatState.activeConversationId!]: prev.messages[chatState.activeConversationId!]?.map(msg =>
            msg._id === messageId ? updatedMessage : msg
          ) || [],
        },
      }));

      // Send via socket
      socketService.sendReaction({
        messageId,
        emoji,
        conversationId: chatState.activeConversationId,
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [chatState.activeConversationId]);

  const handleTyping = useCallback(() => {
    if (!chatState.activeConversationId) return;

    // Send typing indicator
    socketService.startTyping(chatState.activeConversationId);

    // Clear existing timeout
    if (typingTimeouts[chatState.activeConversationId]) {
      clearTimeout(typingTimeouts[chatState.activeConversationId]);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      socketService.stopTyping(chatState.activeConversationId!);
    }, 1000);

    setTypingTimeouts(prev => ({
      ...prev,
      [chatState.activeConversationId!]: timeout,
    }));
  }, [chatState.activeConversationId, typingTimeouts]);

  const updateSearchQuery = useCallback((query: string) => {
    setChatState(prev => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);

  const changeView = useCallback((view: string) => {
    setChatState(prev => ({
      ...prev,
      activeView: view as any,
    }));
  }, []);

  const changeTheme = useCallback((themeName: string) => {
    setChatState(prev => ({
      ...prev,
      theme: themeName as any,
    }));
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const response = await usersAPI.updateProfile(updates);
      setChatState(prev => ({
        ...prev,
        currentUser: response.data,
      }));
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, []);

  const updateStatus = useCallback(async (status: string) => {
    try {
      await usersAPI.updateProfile({ status });
      setChatState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? { ...prev.currentUser, status } : null,
      }));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }, []);

  const addContact = useCallback(async (phone: string) => {
    try {
      const response = await usersAPI.addContact(phone);
      setChatState(prev => ({
        ...prev,
        contacts: [...prev.contacts, response.data],
      }));
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  }, []);

  const blockUser = useCallback(async (userId: string) => {
    try {
      await usersAPI.blockUser(userId);
      setChatState(prev => {
        const userToBlock = prev.contacts.find(c => c._id === userId);
        if (!userToBlock) return prev;

        return {
          ...prev,
          contacts: prev.contacts.filter(c => c._id !== userId),
          blockedUsers: [...prev.blockedUsers, userToBlock],
        };
      });
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  }, []);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      await usersAPI.unblockUser(userId);
      setChatState(prev => {
        const userToUnblock = prev.blockedUsers.find(u => u._id === userId);
        if (!userToUnblock) return prev;

        return {
          ...prev,
          blockedUsers: prev.blockedUsers.filter(u => u._id !== userId),
          contacts: [...prev.contacts, userToUnblock],
        };
      });
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  }, []);

  const startChatWithContact = useCallback(async (userId: string) => {
    try {
      const response = await conversationsAPI.createConversation(userId);
      const conversation = response.data;

      setChatState(prev => {
        const existingConv = prev.conversations.find(c => c._id === conversation._id);
        if (existingConv) return prev;

        return {
          ...prev,
          conversations: [conversation, ...prev.conversations],
        };
      });

      selectConversation(conversation._id);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  }, [selectConversation]);

  const changeWallpaper = useCallback(async (conversationId: string, wallpaper: string) => {
    try {
      await conversationsAPI.updateWallpaper(conversationId, wallpaper);
      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv._id === conversationId
            ? { ...conv, wallpaper }
            : conv
        ),
      }));
    } catch (error) {
      console.error('Failed to change wallpaper:', error);
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Listen for new messages
    socketService.onNewMessage((data) => {
      setChatState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [data.conversationId]: [
            ...(prev.messages[data.conversationId] || []),
            data,
          ],
        },
        conversations: prev.conversations.map(conv =>
          conv._id === data.conversationId
            ? { ...conv, lastMessage: data }
            : conv
        ),
      }));
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      setChatState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv._id === data.conversationId
            ? { ...conv, isTyping: data.isTyping }
            : conv
        ),
      }));
    });

    // Listen for user online status
    socketService.onUserOnline((data) => {
      setChatState(prev => ({
        ...prev,
        contacts: prev.contacts.map(contact =>
          contact._id === data.userId
            ? { ...contact, isOnline: data.isOnline, lastSeen: data.lastSeen }
            : contact
        ),
        conversations: prev.conversations.map(conv => ({
          ...conv,
          participants: conv.participants.map(p =>
            p._id === data.userId
              ? { ...p, isOnline: data.isOnline, lastSeen: data.lastSeen }
              : p
          ),
        })),
      }));
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [typingTimeouts]);

  const filteredConversations = chatState.conversations.filter(conv => {
    if (!chatState.searchQuery) return true;
    const otherParticipant = conv.participants.find(p => p._id !== chatState.currentUser?._id);
    return otherParticipant?.name.toLowerCase().includes(chatState.searchQuery.toLowerCase());
  });

  const activeConversation = chatState.conversations.find(c => c._id === chatState.activeConversationId);
  const activeMessages = chatState.activeConversationId ? chatState.messages[chatState.activeConversationId] || [] : [];
  const currentTheme = themes[chatState.theme];

  return {
    ...chatState,
    conversations: filteredConversations,
    activeConversation,
    activeMessages,
    currentTheme,
    selectConversation,
    sendMessage,
    addReaction,
    handleTyping,
    updateSearchQuery,
    changeView,
    changeTheme,
    updateProfile,
    updateStatus,
    addContact,
    blockUser,
    unblockUser,
    startChatWithContact,
    changeWallpaper,
    loadConversations,
    loadContacts,
  };
};