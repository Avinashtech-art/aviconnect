import React, { useState } from 'react';
import { Check, CheckCheck, Smile, Reply, MoreHorizontal } from 'lucide-react';
import { Message, User } from '../types';

interface MessageBubbleProps {
  message: Message;
  sender: User;
  currentUser: User;
  onReact: (messageId: string, emoji: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  currentUser,
  onReact,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.senderId === currentUser.id;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowActions(false);
  };

  return (
    <div
      className={`flex items-end space-x-3 mb-6 group ${
        isOwn ? 'flex-row-reverse space-x-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && (
        <img
          src={sender.avatar}
          alt={sender.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
        {!isOwn && (
          <span className="text-xs text-slate-400 mb-1 px-1">{sender.name}</span>
        )}
        
        <div className="relative">
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-slate-800 text-white rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-700/50 rounded-full text-xs flex items-center space-x-1"
                    title={reaction.userName}
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-slate-400">1</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message Actions */}
          {showActions && (
            <div
              className={`absolute top-0 flex items-center space-x-1 transition-all duration-200 ${
                isOwn ? '-left-32' : '-right-32'
              }`}
            >
              <button
                onClick={() => handleReaction('👍')}
                className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                title="Like"
              >
                👍
              </button>
              <button
                onClick={() => handleReaction('❤️')}
                className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                title="Love"
              >
                ❤️
              </button>
              <button
                onClick={() => handleReaction('😂')}
                className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                title="Laugh"
              >
                😂
              </button>
              <button className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors">
                <Reply size={16} />
              </button>
              <button className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )}
        </div>

        <div className={`flex items-center space-x-2 mt-1 px-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <div className="text-slate-500">
              {message.isRead ? (
                <CheckCheck size={14} className="text-blue-400" />
              ) : (
                <Check size={14} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};