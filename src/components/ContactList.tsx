import React, { useState } from 'react';
import { Search, UserPlus, MessageCircle, Phone, Video, MoreHorizontal, UserX, UserCheck } from 'lucide-react';
import { User } from '../types';

interface ContactListProps {
  contacts: User[];
  blockedUsers: User[];
  currentUser: User;
  onStartChat: (userId: string) => void;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onAddContact: (user: User) => void;
  theme: any;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  blockedUsers,
  currentUser,
  onStartChat,
  onBlockUser,
  onUnblockUser,
  onAddContact,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'blocked'>('contacts');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = () => {
    if (newContactEmail.trim()) {
      // Simulate adding a contact
      const newContact: User = {
        id: `user-${Date.now()}`,
        name: newContactEmail.split('@')[0],
        email: newContactEmail,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isOnline: Math.random() > 0.5,
        status: 'New contact',
        phone: '+1 (555) 000-0000',
      };
      onAddContact(newContact);
      setNewContactEmail('');
      setShowAddContact(false);
    }
  };

  return (
    <div className={`flex-1 ${theme.background} flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${theme.text}`}>Contacts</h2>
          <button
            onClick={() => setShowAddContact(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
            title="Add Contact"
          >
            <UserPlus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200`}
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'contacts'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'blocked'
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Blocked ({blockedUsers.length})
          </button>
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'contacts' ? (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 ${theme.surface} border border-slate-700/30 rounded-xl hover:border-blue-500/30 transition-all duration-200 group`}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${theme.text} truncate`}>{contact.name}</h3>
                    <p className="text-sm text-slate-400 truncate">{contact.status}</p>
                    <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onStartChat(contact.id)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="Start Chat"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                      title="Voice Call"
                    >
                      <Phone size={18} />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                      title="Video Call"
                    >
                      <Video size={18} />
                    </button>
                    <button
                      onClick={() => onBlockUser(contact.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Block User"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 ${theme.surface} border border-red-700/30 rounded-xl`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover opacity-50"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${theme.text} truncate`}>{user.name}</h3>
                    <p className="text-sm text-red-400">Blocked</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => onUnblockUser(user.id)}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                    title="Unblock User"
                  >
                    <UserCheck size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${theme.secondary} p-6 rounded-2xl border border-slate-700/50 w-full max-w-md mx-4`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Add New Contact</h3>
            <input
              type="email"
              placeholder="Enter email address..."
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              className={`w-full p-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 mb-4`}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddContact(false)}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};