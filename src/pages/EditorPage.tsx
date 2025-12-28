import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Undo2,
  Redo2,
  Keyboard,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { isDemoMode } from '@/lib/supabase';

// Components
import DropZone from '@/components/upload/DropZone';
import VideoPreview from '@/components/preview/VideoPreview';
import Timeline from '@/components/timeline/Timeline';
import Sidebar from '@/components/sidebar/Sidebar';
import ExportModal from '@/components/export/ExportModal';
import HelpModal from '@/components/modals/HelpModal';
import SettingsModal from '@/components/modals/SettingsModal';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function EditorPage() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuthStore();
  const { video, canUndo, canRedo, undo, redo, resetEditor } = useEditorStore();
  const { 
    isFFmpegLoading, 
    ffmpegLoadProgress, 
    isModalOpen, 
    modalType,
    openModal,
    closeModal,
  } = useUIStore();
  const { isLoaded: ffmpegLoaded, isLoading: ffmpegInitLoading, load: loadFFmpeg } = useFFmpeg();

  // Load FFmpeg on mount
  useEffect(() => {
    if (!ffmpegLoaded && !ffmpegInitLoading) {
      loadFFmpeg();
    }
  }, [ffmpegLoaded, ffmpegInitLoading, loadFFmpeg]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent shortcuts when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Ctrl/Cmd + Z = Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo) undo();
    }

    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      if (canRedo) redo();
    }

    // E = Export
    if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (video) openModal('export');
    }

    // Escape = Close modal
    if (e.key === 'Escape') {
      closeModal();
    }

    // ? = Show keyboard shortcuts
    if (e.key === '?') {
      openModal('keyboard-shortcuts');
    }
  }, [canUndo, canRedo, undo, redo, video, openModal, closeModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Handle new project
  const handleNewProject = () => {
    if (video) {
      // Confirm before resetting
      if (window.confirm('Start a new project? Current changes will be lost.')) {
        resetEditor();
      }
    }
  };

  // Show loading screen while FFmpeg loads
  if (isFFmpegLoading) {
    return (
      <LoadingScreen 
        message="Loading video processing engine..." 
        progress={ffmpegLoadProgress} 
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-editor-panel border-b border-editor-border flex items-center justify-between px-4 flex-shrink-0">
        {/* Left: Logo & Project Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Titan" className="h-12 w-auto object-contain" />
            <div className="hidden sm:block">
              <span className="font-bold text-white tracking-tight">TITAN</span>
              <span className="text-titan-light text-[10px] block -mt-0.5 tracking-[0.15em]">VIDEO EDITOR</span>
            </div>
          </button>

          <div className="h-6 w-px bg-editor-border" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {video && (
            <>
              <div className="h-6 w-px bg-editor-border" />
              <button
                onClick={handleNewProject}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:block">New Video</span>
              </button>
            </>
          )}
        </div>

        {/* Right: User & Settings */}
        <div className="flex items-center gap-2">
          {/* Keyboard shortcuts */}
          <button
            onClick={() => openModal('keyboard-shortcuts')}
            className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Help */}
          <button
            onClick={() => openModal('help')}
            className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => openModal('settings')}
            className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Menu */}
          {!isDemoMode() && isAuthenticated && user && (
            <>
              <div className="h-6 w-px bg-editor-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-titan-steel/30 flex items-center justify-center overflow-hidden border border-editor-border">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-4 h-4 text-titan-light" />
                  )}
                </div>
                <span className="text-sm text-gray-400 hidden lg:block max-w-[120px] truncate">
                  {user.name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Demo Mode Indicator */}
          {isDemoMode() && (
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-xs text-yellow-400">Demo Mode</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {!video ? (
            /* Upload State */
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center p-8"
            >
              <DropZone />
            </motion.div>
          ) : (
            /* Editor State */
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col lg:flex-row overflow-hidden"
            >
              {/* Main Editor Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Video Preview */}
                <div className="flex-1 min-h-0 p-4">
                  <VideoPreview />
                </div>

                {/* Timeline */}
                <div className="h-40 lg:h-48 border-t border-editor-border flex-shrink-0">
                  <Timeline />
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-editor-border flex-shrink-0 overflow-y-auto">
                <Sidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && modalType === 'export' && (
          <ExportModal onClose={closeModal} />
        )}
        {isModalOpen && modalType === 'keyboard-shortcuts' && (
          <KeyboardShortcutsModal onClose={closeModal} />
        )}
      </AnimatePresence>
      
      {/* Help and Settings Modals */}
      <HelpModal />
      <SettingsModal />
    </div>
  );
}

// Keyboard Shortcuts Modal
function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: ['Space'], description: 'Play/Pause video' },
    { keys: ['←', '→'], description: 'Seek backward/forward' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'E'], description: 'Export video' },
    { keys: ['Escape'], description: 'Close modal / Deselect' },
    { keys: ['Delete'], description: 'Remove selected overlay' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="card p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-titan-light" />
          Keyboard Shortcuts
        </h2>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-400">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2 py-1 bg-editor-surface rounded text-xs text-white font-mono">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-gray-500 mx-1">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="btn-secondary w-full mt-6"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

