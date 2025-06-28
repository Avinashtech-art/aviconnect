import React from 'react';
import { Phone, Video, MoreHorizontal, Search, Info } from 'lucide-react';
import { User } from '../types';

interface ChatHeaderProps {
  user: User;
  isTyping?: boolean;
  theme: any;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, isTyping, theme }) => {
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

  return (
    <div className={`h-20 px-6 border-b border-slate-700/50 flex items-center justify-between ${theme.secondary} backdrop-blur-xl`}>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className={`font-semibold ${theme.text} text-lg`}>{user.name}</h3>
          <p className="text-sm text-slate-400">
            {isTyping ? (
              <span className="flex items-center space-x-2">
                <span>Typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </span>
            ) : user.isOnline ? (
              'Online'
            ) : user.lastSeen ? (
              `Last seen ${formatLastSeen(user.lastSeen)}`
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200">
          <Phone size={20} />
        </button>
        <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200">
          <Video size={20} />
        </button>
        <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200">
          <Search size={20} />
        </button>
        <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200">
          <Info size={20} />
        </button>
        <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};