import React from 'react';
import { MessageCircle, Phone, Users, Settings, User } from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  theme: any;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange, theme }) => {
  const navItems = [
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'calls', icon: Phone, label: 'Calls' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'status', icon: User, label: 'Status' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`w-20 ${theme.secondary} backdrop-blur-xl border-r border-slate-700/50 flex flex-col items-center py-6`}>
      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8">
        <MessageCircle size={24} className="text-white" />
      </div>
      
      <nav className="flex flex-col space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`p-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={item.label}
            >
              <Icon size={20} />
              {isActive && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};