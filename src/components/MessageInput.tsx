import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic, Image } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  theme: any;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping, theme }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`p-6 border-t border-slate-700/50 ${theme.secondary} backdrop-blur-xl`}>
      <form onSubmit={handleSubmit} className="flex items-end space-x-4">
        {/* Attachment Button */}
        <button
          type="button"
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        {/* Image Button */}
        <button
          type="button"
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-200"
          title="Send image"
        >
          <Image size={20} />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={`w-full px-4 py-3 pr-12 ${theme.surface} border border-slate-700/50 rounded-2xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none`}
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
            title="Add emoji"
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Send/Voice Button */}
        {message.trim() ? (
          <button
            type="submit"
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Send message"
          >
            <Send size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            <Mic size={20} />
          </button>
        )}
      </form>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-red-400">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Recording...</span>
        </div>
      )}
    </div>
  );
};