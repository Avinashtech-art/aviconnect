import React, { useState } from 'react';
import { User, Palette, Image, Bell, Shield, HelpCircle, LogOut, Camera, Edit3 } from 'lucide-react';
import { Theme } from '../types';
import { themes, wallpapers } from '../data/mockData';

interface SettingsProps {
  currentUser: any;
  theme: Theme;
  onThemeChange: (themeName: string) => void;
  onProfileUpdate: (updates: any) => void;
  onWallpaperChange: (conversationId: string, wallpaper: string) => void;
  onLogout: () => void;
  conversations: any[];
  activeConversationId: string | null;
}

export const Settings: React.FC<SettingsProps> = ({
  currentUser,
  theme,
  onThemeChange,
  onProfileUpdate,
  onWallpaperChange,
  onLogout,
  conversations,
  activeConversationId,
}) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    status: currentUser?.status || '',
    avatar: currentUser?.avatar || '',
  });

  const settingSections = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'themes', icon: Palette, label: 'Themes' },
    { id: 'wallpapers', icon: Image, label: 'Wallpapers' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'privacy', icon: Shield, label: 'Privacy' },
    { id: 'help', icon: HelpCircle, label: 'Help' },
  ];

  const handleProfileUpdate = () => {
    onProfileUpdate(profileData);
    setShowProfileEditor(false);
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className={`p-6 ${theme.surface} border border-slate-700/30 rounded-xl`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-900">
              <Camera size={16} className="text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${theme.text}`}>{currentUser?.name}</h3>
            <p className="text-slate-400">{currentUser?.status}</p>
            <p className="text-sm text-slate-500">{currentUser?.phone}</p>
          </div>
          <button
            onClick={() => setShowProfileEditor(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      <div className={`p-6 ${theme.surface} border border-slate-700/30 rounded-xl`}>
        <h4 className={`font-semibold ${theme.text} mb-4`}>Account Information</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Phone</span>
            <span className={theme.text}>{currentUser?.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className="text-green-400">Online</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThemesSection = () => (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Choose Theme</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(themes).map(([key, themeOption]) => (
          <button
            key={key}
            onClick={() => onThemeChange(key)}
            className={`p-4 border rounded-xl transition-all duration-200 ${
              theme.name === themeOption.name
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700/30 hover:border-slate-600'
            }`}
          >
            <div className={`w-full h-20 bg-gradient-to-br ${themeOption.primary} rounded-lg mb-3`}></div>
            <p className={`font-medium ${theme.text}`}>{themeOption.name}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderWallpapersSection = () => (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Chat Wallpapers</h3>
      {activeConversationId && (
        <div className="grid grid-cols-3 gap-4">
          {wallpapers.map((wallpaper, index) => (
            <button
              key={index}
              onClick={() => onWallpaperChange(activeConversationId, wallpaper)}
              className="aspect-video rounded-lg overflow-hidden border-2 border-slate-700/30 hover:border-blue-500 transition-all duration-200"
            >
              <img
                src={wallpaper}
                alt={`Wallpaper ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      {!activeConversationId && (
        <p className="text-slate-400 text-center py-8">
          Select a conversation to change its wallpaper
        </p>
      )}
    </div>
  );

  return (
    <div className={`flex-1 ${theme.background} flex`}>
      {/* Settings Sidebar */}
      <div className={`w-80 ${theme.secondary} border-r border-slate-700/50 p-6`}>
        <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Settings</h2>
        <nav className="space-y-2">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={20} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6">
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'themes' && renderThemesSection()}
        {activeSection === 'wallpapers' && renderWallpapersSection()}
        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.text}`}>Notification Settings</h3>
            <p className="text-slate-400">Notification settings will be implemented here.</p>
          </div>
        )}
        {activeSection === 'privacy' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.text}`}>Privacy Settings</h3>
            <p className="text-slate-400">Privacy settings will be implemented here.</p>
          </div>
        )}
        {activeSection === 'help' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${theme.text}`}>Help & Support</h3>
            <p className="text-slate-400">Help and support options will be implemented here.</p>
          </div>
        )}
      </div>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${theme.secondary} p-6 rounded-2xl border border-slate-700/50 w-full max-w-md mx-4`}>
            <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Edit Profile</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className={`w-full p-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200`}
              />
              <textarea
                placeholder="Status"
                value={profileData.status}
                onChange={(e) => setProfileData({ ...profileData, status: e.target.value })}
                className={`w-full p-3 ${theme.surface} border border-slate-700/50 rounded-xl ${theme.text} placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none`}
                rows={3}
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowProfileEditor(false)}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};