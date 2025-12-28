import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Keyboard, Video, Type, Scissors, Download, Mail, ExternalLink, MessageCircle, Book } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const shortcuts = [
  { keys: ['Space'], description: 'Play/Pause video' },
  { keys: ['←', '→'], description: 'Seek backward/forward' },
  { keys: ['Shift', '←', '→'], description: 'Seek 10 seconds' },
  { keys: ['T'], description: 'Add text overlay' },
  { keys: ['Delete'], description: 'Remove selected overlay' },
  { keys: ['Ctrl/⌘', 'D'], description: 'Duplicate overlay' },
  { keys: ['Ctrl/⌘', 'Z'], description: 'Undo' },
  { keys: ['Ctrl/⌘', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Ctrl/⌘', 'E'], description: 'Export video' },
  { keys: ['Ctrl/⌘', 'S'], description: 'Save project' },
  { keys: ['F'], description: 'Toggle fullscreen preview' },
  { keys: ['M'], description: 'Mute/Unmute' },
];

const features = [
  {
    icon: Video,
    title: 'Video Upload',
    description: 'Drag and drop or click to upload MP4, WebM, MOV, and other video formats. Max file size: 500MB.',
  },
  {
    icon: Scissors,
    title: 'Trimming',
    description: 'Use the timeline handles to trim your video. Drag the start and end markers to set in/out points.',
  },
  {
    icon: Type,
    title: 'Text Overlays',
    description: 'Add text overlays with custom fonts, colors, and timing. Drag to position, resize with corners.',
  },
  {
    icon: Download,
    title: 'Export',
    description: 'Export in multiple formats (MP4, WebM) with quality presets. Processing happens in your browser.',
  },
];

const faqItems = [
  {
    question: 'Is my video uploaded to a server?',
    answer: 'No! All video processing happens directly in your browser using WebAssembly. Your files never leave your device.',
  },
  {
    question: 'What video formats are supported?',
    answer: 'We support MP4, WebM, MOV, AVI, and MKV for input. Export is available in MP4 and WebM formats.',
  },
  {
    question: 'Why is processing slow?',
    answer: 'Video processing is CPU-intensive. Longer videos take more time. For best results, close other tabs and applications.',
  },
  {
    question: 'Can I save my project?',
    answer: 'Projects are automatically saved to your browser\'s local storage. Sign in to save projects to the cloud.',
  },
];

export default function HelpModal() {
  const { modalType, closeModal } = useUIStore();
  const isOpen = modalType === 'help';

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
                <HelpCircle className="w-5 h-5 text-titan-light" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Help & Support</h2>
                <p className="text-sm text-gray-400">Learn how to use Titan Video Editor</p>
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
          <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 space-y-8">
            {/* Features */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-titan-light" />
                Features
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div key={feature.title} className="p-4 bg-editor-surface rounded-lg">
                    <feature.icon className="w-8 h-8 text-titan-light mb-2" />
                    <h4 className="text-white font-medium mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Keyboard Shortcuts */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-titan-light" />
                Keyboard Shortcuts
              </h3>
              <div className="bg-editor-surface rounded-lg divide-y divide-editor-border">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.description} className="flex items-center justify-between p-3">
                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 bg-editor-bg text-xs text-white rounded border border-editor-border font-mono">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && <span className="text-gray-500 mx-1">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-titan-light" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqItems.map((item) => (
                  <div key={item.question} className="p-4 bg-editor-surface rounded-lg">
                    <h4 className="text-white font-medium mb-1">{item.question}</h4>
                    <p className="text-sm text-gray-400">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Support */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-titan-light" />
                Need More Help?
              </h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="mailto:support@titangrouppartners.com"
                  className="flex items-center gap-2 px-4 py-2 bg-editor-surface hover:bg-editor-hover rounded-lg text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
                <a
                  href="https://titangrouppartners.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-editor-surface hover:bg-editor-hover rounded-lg text-white transition-colors"
                >
                  <Book className="w-4 h-4" />
                  Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

