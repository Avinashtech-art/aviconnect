import React, { useState } from 'react';
import { Plus, Eye, Camera, Edit3 } from 'lucide-react';
import { User } from '../types';

interface StatusViewProps {
  currentUser: User;
  contacts: User[];
  onUpdateStatus: (status: string) => void;
  theme: any;
}

export const StatusView: React.FC<StatusViewProps> = ({ currentUser, contacts, onUpdateStatus, theme }) => {
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [newStatus, setNewStatus] = useState(currentUser.status || '');

  const handleUpdateStatus = () => {
    onUpdateStatus(newStatus);
    setShowStatusEditor(false);
  };

  const statusContacts = contacts.filter(contact => contact.status);

  return (
    <div className={`flex-1 ${theme.background} flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Status</h2>
      </div>

      {/* Status List */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* My Status */}
        <div className="mb-8">
          <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>My Status</h3>
          <div
            className={`p-4 ${theme.surface} border border-slate-700/30 rounded-xl hover:border-blue-500/30 transition-all duration-200 cursor-pointer group`}
            onClick={() => setShowStatusEditor(true)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <Plus size={14} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className={`font-semibold ${theme.text}`}>My Status</h4>
                <p className="text-sm text-slate-400">
                  {currentUser.status || 'Tap to add status update'}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Edit3 size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        {statusContacts.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Recent Updates</h3>
            <div className="space-y-3">
              {statusContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 ${theme.surface} border border-slate-700/30 rounded-xl hover:border-blue-500/30 transition-all duration-200 cursor-pointer group`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-green-500"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-semibold ${theme.text}`}>{contact.name}</h4>
                      <p className="text-sm text-slate-400">{contact.status}</p>
                      <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Editor Modal */}
      {showStatusEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${theme.secondary} p-6 rounded-2xl border border-slate-700/50 w-full max-w-md mx-4`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Update Status</h3>
            <textarea
              placeholder="What's on your mind?"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={`w-full p-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 mb-4 resize-none`}
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusEditor(false)}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};