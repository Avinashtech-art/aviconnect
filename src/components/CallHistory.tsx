import React, { useState } from 'react';
import { Phone, Video, PhoneCall, PhoneIncoming, PhoneMissed, Search, Clock } from 'lucide-react';
import { CallRecord } from '../types';

interface CallHistoryProps {
  callHistory: CallRecord[];
  theme: any;
}

export const CallHistory: React.FC<CallHistoryProps> = ({ callHistory, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = callHistory.filter(call =>
    call.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getCallIcon = (call: CallRecord) => {
    if (call.type === 'missed') {
      return <PhoneMissed size={18} className="text-red-400" />;
    } else if (call.type === 'incoming') {
      return <PhoneIncoming size={18} className="text-green-400" />;
    } else {
      return <PhoneCall size={18} className="text-blue-400" />;
    }
  };

  const getCallTypeIcon = (callType: string) => {
    return callType === 'video' ? <Video size={16} /> : <Phone size={16} />;
  };

  return (
    <div className={`flex-1 ${theme.background} flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Call History</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search call history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200`}
          />
        </div>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className={`p-4 ${theme.surface} border border-slate-700/30 rounded-xl hover:border-blue-500/30 transition-all duration-200 group`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={call.participantAvatar}
                    alt={call.participantName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                    {getCallTypeIcon(call.callType)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getCallIcon(call)}
                    <h3 className={`font-semibold ${theme.text} truncate`}>{call.participantName}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span className="capitalize">{call.type} {call.callType}</span>
                    {call.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-400">{formatTime(call.timestamp)}</p>
                  <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                      title="Voice Call"
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                      title="Video Call"
                    >
                      <Video size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};