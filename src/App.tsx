import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ContactList } from './components/ContactList';
import { CallHistory } from './components/CallHistory';
import { StatusView } from './components/StatusView';
import { Settings } from './components/Settings';
import { useChat } from './hooks/useChat';
import { authAPI } from './services/api';
import socketService from './services/socket';
import { MessageCircle, Users, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    searchQuery,
    contacts,
    blockedUsers,
    callHistory,
    activeView,
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
  } = useChat();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        
        // Connect to socket
        socketService.connect(token);
        
        // Load initial data
        loadConversations();
        loadContacts();
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (token: string, user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Connect to socket
    socketService.connect(token);
    
    // Load initial data
    loadConversations();
    loadContacts();
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      socketService.disconnect();
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle size={32} className="text-white" />
          </div>
          <p className="text-white text-lg">Loading AviConnect...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p._id !== currentUser?.id);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'chats':
        return (
          <div className="flex flex-1">
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onConversationSelect={selectConversation}
              onSearchChange={updateSearchQuery}
              theme={currentTheme}
            />

            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <ChatArea
                  messages={activeMessages}
                  currentUser={currentUser}
                  otherUser={getOtherParticipant(activeConversation)}
                  onSendMessage={sendMessage}
                  onReact={addReaction}
                  onTyping={handleTyping}
                  isTyping={activeConversation.isTyping}
                  wallpaper={activeConversation.wallpaper}
                  theme={currentTheme}
                />
              ) : (
                <div className={`flex-1 flex items-center justify-center ${currentTheme.background}`}>
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                      <MessageCircle size={40} className="text-white" />
                    </div>
                    <h2 className={`text-2xl font-bold ${currentTheme.text} mb-4`}>
                      Welcome to AviConnect
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                      Select a conversation from the sidebar to start chatting with your friends and colleagues.
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Users size={20} />
                        <span className="text-sm">{conversations.length} Conversations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SettingsIcon size={20} />
                        <span className="text-sm">Secure & Private</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'contacts':
        return (
          <ContactList
            contacts={contacts}
            blockedUsers={blockedUsers}
            currentUser={currentUser}
            onStartChat={startChatWithContact}
            onBlockUser={blockUser}
            onUnblockUser={unblockUser}
            onAddContact={addContact}
            theme={currentTheme}
          />
        );

      case 'calls':
        return (
          <CallHistory
            callHistory={callHistory}
            theme={currentTheme}
          />
        );

      case 'status':
        return (
          <StatusView
            currentUser={currentUser}
            contacts={contacts}
            onUpdateStatus={updateStatus}
            theme={currentTheme}
          />
        );

      case 'settings':
        return (
          <Settings
            currentUser={currentUser}
            theme={currentTheme}
            onThemeChange={changeTheme}
            onProfileUpdate={updateProfile}
            onWallpaperChange={changeWallpaper}
            onLogout={handleLogout}
            conversations={conversations}
            activeConversationId={activeConversationId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`h-screen bg-gradient-to-br ${currentTheme.primary} flex overflow-hidden`}>
      <Navigation
        activeView={activeView}
        onViewChange={changeView}
        theme={currentTheme}
      />
      {renderMainContent()}
    </div>
  );
}

export default App;