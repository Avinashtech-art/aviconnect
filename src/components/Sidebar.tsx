import React from 'react';
import { Search, Plus, Settings, MessageCircle } from 'lucide-react';
import { Conversation, User } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUser: User;
  searchQuery: string;
  onConversationSelect: (conversationId: string) => void;
  onSearchChange: (query: string) => void;
  theme: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  currentUser,
  searchQuery,
  onConversationSelect,
  onSearchChange,
  theme,
}) => {
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getOtherParticipant = (conversation: Conversation): User => {
    return conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];
  };

  return (
    <div className={`w-80 ${theme.secondary} backdrop-blur-xl border-r border-slate-700/50 flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${theme.text}`}>{currentUser.name}</h2>
              <p className="text-sm text-slate-400">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200">
              <Plus size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200`}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Recent Conversations
          </h3>
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isActive = conversation.id === activeConversationId;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {otherParticipant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${theme.text} truncate group-hover:text-blue-400 transition-colors`}>
                          {otherParticipant.name}
                        </h4>
                        {conversation.lastMessage && (
                          <span className="text-xs text-slate-500">
                            {formatLastSeen(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {conversation.lastMessage ? (
                          <p className="text-sm text-slate-400 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No messages yet</p>
                        )}
                        {conversation.isTyping && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </div>
                      {!otherParticipant.isOnline && otherParticipant.lastSeen && (
                        <p className="text-xs text-slate-500 mt-1">
                          Last seen {formatLastSeen(otherParticipant.lastSeen)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};