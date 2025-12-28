import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Monitor, Volume2, Save, Palette, Bell, Shield, User, Trash2, AlertTriangle, Sun, Moon, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'account';

const tabs = [
  { id: 'general' as SettingsTab, label: 'General', icon: Settings },
  { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
  { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
  { id: 'account' as SettingsTab, label: 'Account', icon: User },
];

export default function SettingsModal() {
  const { modalType, closeModal } = useUIStore();
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const isOpen = modalType === 'settings';

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [settings, setSettings] = useState({
    // General
    autoSave: true,
    autoSaveInterval: 30,
    defaultQuality: 'high',
    hardwareAcceleration: true,
    
    // Appearance
    timelineHeight: 'medium',
    showWaveform: true,
    
    // Notifications
    emailNotifications: true,
    projectReminders: true,
    marketingEmails: false,
  });

  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('titan-editor-settings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
    closeModal();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user from Supabase
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      if (error) throw error;
      
      await signOut();
      toast.success('Account deleted successfully');
      closeModal();
      window.location.href = '/';
    } catch (error) {
      console.error('Delete error:', error);
      // For non-admin, sign out and show message
      await signOut();
      toast.success('You have been signed out. Contact support to complete account deletion.');
      closeModal();
      window.location.href = '/';
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-editor-panel border border-editor-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-editor-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-titan-steel/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-titan-light" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-sm text-gray-400">Customize your editing experience</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex min-h-[400px]">
            {/* Sidebar */}
            <div className="w-48 border-r border-editor-border p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-titan-navy/50 text-titan-light'
                      : 'text-gray-400 hover:text-white hover:bg-editor-surface'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-4">Project Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Auto-save projects</p>
                          <p className="text-gray-500 text-xs">Automatically save your work</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoSave}
                            onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-editor-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Auto-save interval</p>
                          <p className="text-gray-500 text-xs">How often to auto-save (seconds)</p>
                        </div>
                        <select
                          value={settings.autoSaveInterval}
                          onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
                          className="input-sm w-24"
                        >
                          <option value={15}>15s</option>
                          <option value={30}>30s</option>
                          <option value={60}>1min</option>
                          <option value={120}>2min</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Default export quality</p>
                          <p className="text-gray-500 text-xs">Quality preset for new exports</p>
                        </div>
                        <select
                          value={settings.defaultQuality}
                          onChange={(e) => setSettings({ ...settings, defaultQuality: e.target.value })}
                          className="input-sm w-24"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="ultra">Ultra</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-4">Performance</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">Hardware acceleration</p>
                        <p className="text-gray-500 text-xs">Use GPU for faster processing</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.hardwareAcceleration}
                          onChange={(e) => setSettings({ ...settings, hardwareAcceleration: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-editor-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-4">Theme</h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark' as const, icon: Moon, label: 'Dark' },
                        { id: 'light' as const, icon: Sun, label: 'Light' },
                        { id: 'system' as const, icon: Monitor, label: 'System' },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.id}
                          onClick={() => setTheme(themeOption.id)}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            theme === themeOption.id
                              ? 'border-titan-steel bg-titan-navy/30'
                              : 'border-editor-border bg-editor-surface hover:border-gray-500'
                          }`}
                        >
                          <themeOption.icon className={`w-6 h-6 mx-auto mb-2 ${
                            theme === themeOption.id ? 'text-titan-light' : 'text-gray-400'
                          }`} />
                          <p className="text-sm text-white">{themeOption.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-4">Editor</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Timeline height</p>
                          <p className="text-gray-500 text-xs">Height of the timeline area</p>
                        </div>
                        <select
                          value={settings.timelineHeight}
                          onChange={(e) => setSettings({ ...settings, timelineHeight: e.target.value })}
                          className="input-sm w-28"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Show audio waveform</p>
                          <p className="text-gray-500 text-xs">Display waveform in timeline</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showWaveform}
                            onChange={(e) => setSettings({ ...settings, showWaveform: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-editor-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-4">Email Notifications</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Email notifications</p>
                          <p className="text-gray-500 text-xs">Receive updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-editor-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Project reminders</p>
                          <p className="text-gray-500 text-xs">Reminders for unfinished projects</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.projectReminders}
                            onChange={(e) => setSettings({ ...settings, projectReminders: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-editor-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Marketing emails</p>
                          <p className="text-gray-500 text-xs">Tips, updates, and offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.marketingEmails}
                            onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-editor-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-titan-steel"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  {isAuthenticated && user ? (
                    <>
                      <div>
                        <h3 className="text-white font-medium mb-4">Account Information</h3>
                        
                        <div className="p-4 bg-editor-surface rounded-lg space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-titan-steel/30 flex items-center justify-center overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <User className="w-8 h-8 text-titan-light" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name || 'User'}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-white font-medium mb-4">Security</h3>
                        
                        <div className="space-y-3">
                          <button className="w-full flex items-center gap-3 p-3 bg-editor-surface hover:bg-editor-hover rounded-lg text-left transition-colors">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-white text-sm">Change password</p>
                              <p className="text-gray-500 text-xs">Update your password</p>
                            </div>
                          </button>
                          <button className="w-full flex items-center gap-3 p-3 bg-editor-surface hover:bg-editor-hover rounded-lg text-left transition-colors">
                            <Volume2 className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-white text-sm">Two-factor authentication</p>
                              <p className="text-gray-500 text-xs">Add an extra layer of security</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-red-400 font-medium mb-4">Danger Zone</h3>
                        
                        {!showDeleteConfirm ? (
                          <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-3 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        ) : (
                          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-red-400 font-medium">Are you sure?</p>
                                <p className="text-gray-400 text-sm mt-1">
                                  This action cannot be undone. All your projects, exports, and data will be permanently deleted.
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">
                                Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                              </label>
                              <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-3 py-2 bg-editor-bg border border-red-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                                placeholder="DELETE"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setShowDeleteConfirm(false);
                                  setDeleteConfirmText('');
                                }}
                                className="flex-1 px-4 py-2 bg-editor-surface hover:bg-editor-hover rounded-lg text-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                Delete Forever
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Not signed in</p>
                      <p className="text-gray-400 text-sm mb-4">Sign in to access account settings</p>
                      <button
                        onClick={() => {
                          closeModal();
                          window.location.href = '/auth';
                        }}
                        className="btn-primary"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-editor-border">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="btn-primary"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

