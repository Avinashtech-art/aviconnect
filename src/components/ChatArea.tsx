import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { Message, User } from '../types';

interface ChatAreaProps {
  messages: Message[];
  currentUser: User;
  otherUser: User;
  onSendMessage: (content: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onTyping: () => void;
  isTyping?: boolean;
  wallpaper?: string;
  theme: any;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentUser,
  otherUser,
  onSendMessage,
  onReact,
  onTyping,
  isTyping,
  wallpaper,
  theme,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSender = (senderId: string): User => {
    return senderId === currentUser.id ? currentUser : otherUser;
  };

  const backgroundStyle = wallpaper
    ? {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  return (
    <div className="flex flex-col h-full">
      <ChatHeader user={otherUser} isTyping={isTyping} theme={theme} />
      
      {/* Messages Area */}
      <div 
        className={`flex-1 overflow-y-auto p-6 space-y-4 relative ${!wallpaper ? theme.background : ''}`}
        style={backgroundStyle}
      >
        {wallpaper && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        )}
        
        <div className="relative z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Start a conversation with {otherUser.name}
              </h3>
              <p className="text-slate-400 max-w-md">
                Send a message to begin your conversation. You can share text, images, and files.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  sender={getSender(message.senderId)}
                  currentUser={currentUser}
                  onReact={onReact}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} theme={theme} />
    </div>
  );
};