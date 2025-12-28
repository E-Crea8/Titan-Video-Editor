import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Crop,
  Download,
  Plus,
  Trash2,
  Copy,
  Monitor,
  Smartphone,
  Square,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Clock,
  Search,
  X,
  Sparkles,
  Wand2,
  Loader2,
  Image,
  Music,
  FileVideo,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import type { TextOverlay, AspectRatioPreset } from '@/types';
import toast from 'react-hot-toast';

type TabId = 'text' | 'format' | 'export' | 'ai';

const tabs = [
  { id: 'text' as TabId, label: 'Text', icon: Type },
  { id: 'format' as TabId, label: 'Format', icon: Crop },
  { id: 'export' as TabId, label: 'Export', icon: Download },
  { id: 'ai' as TabId, label: 'AI', icon: Sparkles },
];

const aspectRatios = [
  { id: 'landscape' as AspectRatioPreset, label: 'Landscape', ratio: '16:9', icon: Monitor },
  { id: 'portrait' as AspectRatioPreset, label: 'Portrait', ratio: '9:16', icon: Smartphone },
  { id: 'square' as AspectRatioPreset, label: 'Square', ratio: '1:1', icon: Square },
];

// Comprehensive font list with categories
const fontCategories = {
  'Sans Serif': [
    'Inter', 'Arial', 'Helvetica', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Nunito', 'Raleway', 'Ubuntu', 'Oswald', 'Source Sans Pro',
    'PT Sans', 'Noto Sans', 'Work Sans', 'Fira Sans', 'Rubik', 'Quicksand',
    'Karla', 'Josefin Sans', 'Cabin', 'Exo 2', 'Barlow', 'DM Sans',
  ],
  'Serif': [
    'Times New Roman', 'Georgia', 'Playfair Display', 'Merriweather', 'Lora',
    'PT Serif', 'Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Cormorant',
    'Spectral', 'Source Serif Pro', 'Noto Serif', 'Bitter', 'Arvo',
  ],
  'Display': [
    'Impact', 'Bebas Neue', 'Anton', 'Righteous', 'Alfa Slab One', 'Bangers',
    'Staatliches', 'Bungee', 'Black Ops One', 'Permanent Marker', 'Lobster',
    'Pacifico', 'Dancing Script', 'Satisfy', 'Great Vibes',
  ],
  'Monospace': [
    'Courier New', 'Consolas', 'Monaco', 'Fira Code', 'JetBrains Mono',
    'Source Code Pro', 'Roboto Mono', 'Space Mono', 'IBM Plex Mono', 'Inconsolata',
  ],
};

// Flatten all fonts for search
const allFonts = Object.entries(fontCategories).flatMap(([category, fonts]) => 
  fonts.map(font => ({ font, category }))
);

export default function Sidebar() {
  const { sidebarTab, setSidebarTab, openModal } = useUIStore();
  const {
    textOverlays,
    selectedOverlayId,
    aspectRatio,
    duration,
    addTextOverlay,
    updateTextOverlay,
    removeTextOverlay,
    duplicateTextOverlay,
    selectTextOverlay,
    setAspectRatio,
    exportSettings,
    setExportSettings,
  } = useEditorStore();

  const selectedOverlay = textOverlays.find((o) => o.id === selectedOverlayId);

  return (
    <div className="h-full flex flex-col bg-editor-panel">
      {/* Tabs */}
      <div className="flex border-b border-editor-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
              transition-colors border-b-2 -mb-px
              ${sidebarTab === tab.id
                ? 'text-titan-light border-titan-steel'
                : 'text-gray-400 border-transparent hover:text-white hover:bg-editor-surface/50'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {sidebarTab === 'text' && (
            <TextTab
              key="text"
              overlays={textOverlays}
              selectedOverlay={selectedOverlay}
              onAdd={addTextOverlay}
              onUpdate={updateTextOverlay}
              onRemove={removeTextOverlay}
              onDuplicate={duplicateTextOverlay}
              onSelect={selectTextOverlay}
              duration={duration}
            />
          )}
          {sidebarTab === 'format' && (
            <FormatTab
              key="format"
              aspectRatio={aspectRatio}
              onSetAspectRatio={setAspectRatio}
              exportSettings={exportSettings}
              onSetExportSettings={setExportSettings}
            />
          )}
          {sidebarTab === 'export' && (
            <ExportTab
              key="export"
              exportSettings={exportSettings}
              onSetExportSettings={setExportSettings}
              onExport={() => openModal('export')}
            />
          )}
          {sidebarTab === 'ai' && (
            <AITab key="ai" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Text Tab
interface TextTabProps {
  overlays: TextOverlay[];
  selectedOverlay: TextOverlay | undefined;
  onAdd: (partial?: Partial<TextOverlay>) => string;
  onUpdate: (id: string, updates: Partial<TextOverlay>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => string | null;
  onSelect: (id: string | null) => void;
  duration: number;
}

function TextTab({ overlays, selectedOverlay, onAdd, onUpdate, onRemove, onDuplicate, onSelect, duration }: TextTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-4"
    >
      {/* Add Text Button */}
      <button
        onClick={() => onAdd()}
        className="btn-primary w-full"
      >
        <Plus className="w-4 h-4" />
        Add Text Overlay
      </button>

      {/* Text Layers List */}
      {overlays.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Text Layers</h4>
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              onClick={() => onSelect(overlay.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors
                ${overlay.id === selectedOverlay?.id
                  ? 'bg-titan-navy/50 border border-titan-steel/50'
                  : 'bg-editor-surface hover:bg-editor-hover'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Type className="w-4 h-4 text-titan-light flex-shrink-0" />
                  <span className="text-sm text-white truncate">{overlay.text}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(overlay.id);
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(overlay.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTime(overlay.startTime)} - {formatTime(overlay.endTime)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Text Properties */}
      {selectedOverlay && (
        <div className="space-y-4 pt-4 border-t border-editor-border">
          <h4 className="text-sm font-medium text-gray-400">Text Properties</h4>

          {/* Text Content */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Text Content</label>
            <input
              type="text"
              value={selectedOverlay.text}
              onChange={(e) => onUpdate(selectedOverlay.id, { text: e.target.value })}
              className="input-sm"
              placeholder="Enter text..."
            />
          </div>

          {/* Font Family with Search */}
          <FontSelector 
            value={selectedOverlay.fontFamily}
            onChange={(font) => onUpdate(selectedOverlay.id, { fontFamily: font })}
          />

          {/* Font Size */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Font Size: {selectedOverlay.fontSize}px</label>
            <input
              type="range"
              min="12"
              max="120"
              value={selectedOverlay.fontSize}
              onChange={(e) => onUpdate(selectedOverlay.id, { fontSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <Palette className="w-3 h-3 inline mr-1" />
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedOverlay.color}
                onChange={(e) => onUpdate(selectedOverlay.id, { color: e.target.value })}
                className="w-10 h-10"
              />
              <input
                type="text"
                value={selectedOverlay.color}
                onChange={(e) => onUpdate(selectedOverlay.id, { color: e.target.value })}
                className="input-sm flex-1"
              />
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Alignment</label>
            <div className="flex gap-1">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdate(selectedOverlay.id, { textAlign: value as 'left' | 'center' | 'right' })}
                  className={`
                    flex-1 p-2 rounded transition-colors
                    ${selectedOverlay.textAlign === value
                      ? 'bg-titan-steel text-white'
                      : 'bg-editor-surface text-gray-400 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Font Weight */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
            <select
              value={selectedOverlay.fontWeight}
              onChange={(e) => onUpdate(selectedOverlay.id, { fontWeight: e.target.value })}
              className="input-sm"
            >
              <option value="normal">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="bold">Bold</option>
              <option value="800">Extra Bold</option>
            </select>
          </div>

          {/* Timing */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              <Clock className="w-3 h-3 inline mr-1" />
              Timing
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-600">Start</label>
                <input
                  type="number"
                  min="0"
                  max={selectedOverlay.endTime - 0.1}
                  step="0.1"
                  value={selectedOverlay.startTime.toFixed(1)}
                  onChange={(e) => onUpdate(selectedOverlay.id, { startTime: parseFloat(e.target.value) })}
                  className="input-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-600">End</label>
                <input
                  type="number"
                  min={selectedOverlay.startTime + 0.1}
                  max={duration}
                  step="0.1"
                  value={selectedOverlay.endTime.toFixed(1)}
                  onChange={(e) => onUpdate(selectedOverlay.id, { endTime: parseFloat(e.target.value) })}
                  className="input-sm"
                />
              </div>
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Opacity: {Math.round(selectedOverlay.opacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedOverlay.opacity}
              onChange={(e) => onUpdate(selectedOverlay.id, { opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Format Tab
interface FormatTabProps {
  aspectRatio: AspectRatioPreset;
  onSetAspectRatio: (ratio: AspectRatioPreset) => void;
  exportSettings: any;
  onSetExportSettings: (settings: any) => void;
}

function FormatTab({ aspectRatio, onSetAspectRatio, exportSettings, onSetExportSettings: _setExportSettings }: FormatTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Aspect Ratio */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Aspect Ratio</h4>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => onSetAspectRatio(ratio.id)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-lg transition-colors
                ${aspectRatio === ratio.id
                  ? 'bg-titan-navy border border-titan-steel'
                  : 'bg-editor-surface hover:bg-editor-hover'
                }
              `}
            >
              <ratio.icon className={`w-6 h-6 ${aspectRatio === ratio.id ? 'text-titan-light' : 'text-gray-400'}`} />
              <div className="text-center">
                <div className={`text-xs font-medium ${aspectRatio === ratio.id ? 'text-white' : 'text-gray-300'}`}>
                  {ratio.label}
                </div>
                <div className="text-[10px] text-gray-500">{ratio.ratio}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Preview */}
      <div className="p-4 bg-editor-surface rounded-lg">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Output Resolution</h4>
        <div className="text-lg font-mono text-white">
          {exportSettings.width} × {exportSettings.height}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {exportSettings.fps} FPS • {exportSettings.format.toUpperCase()}
        </div>
      </div>

      {/* Custom Resolution (for future) */}
      <div className="text-xs text-gray-500 text-center">
        Custom resolutions coming soon
      </div>
    </motion.div>
  );
}

// Export Tab
interface ExportTabProps {
  exportSettings: any;
  onSetExportSettings: (settings: any) => void;
  onExport: () => void;
}

function ExportTab({ exportSettings, onSetExportSettings: setExportSettings, onExport }: ExportTabProps) {
  const qualityOptions = [
    { value: 'low', label: 'Low', desc: '720p • Fast' },
    { value: 'medium', label: 'Medium', desc: '1080p • Balanced' },
    { value: 'high', label: 'High', desc: '1080p • Best quality' },
    { value: 'ultra', label: 'Ultra', desc: '4K • Maximum' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      {/* Quality Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Export Quality</h4>
        <div className="space-y-2">
          {qualityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setExportSettings({ quality: option.value })}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg transition-colors
                ${exportSettings.quality === option.value
                  ? 'bg-titan-navy border border-titan-steel'
                  : 'bg-editor-surface hover:bg-editor-hover'
                }
              `}
            >
              <div className="text-left">
                <div className={`text-sm font-medium ${exportSettings.quality === option.value ? 'text-white' : 'text-gray-300'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </div>
              {exportSettings.quality === option.value && (
                <div className="w-2 h-2 rounded-full bg-titan-light" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Format</h4>
        <div className="flex gap-2">
          {['mp4', 'webm'].map((format) => (
            <button
              key={format}
              onClick={() => setExportSettings({ format })}
              className={`
                flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${exportSettings.format === format
                  ? 'bg-titan-steel text-white'
                  : 'bg-editor-surface text-gray-400 hover:text-white'
                }
              `}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Export Summary */}
      <div className="p-4 bg-editor-surface rounded-lg">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Export Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Resolution</span>
            <span className="text-white">{exportSettings.width}×{exportSettings.height}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Format</span>
            <span className="text-white">{exportSettings.format.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quality</span>
            <span className="text-white capitalize">{exportSettings.quality}</span>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="btn-primary w-full py-3"
      >
        <Download className="w-5 h-5" />
        Export Video
      </button>
    </motion.div>
  );
}

// Font Selector Component with Search
interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
}

function FontSelector({ value, onChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFonts = searchQuery
    ? allFonts.filter(({ font }) => 
        font.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allFonts;

  // Group filtered fonts by category
  const groupedFonts = filteredFonts.reduce((acc, { font, category }) => {
    if (!acc[category]) acc[category] = [];
    acc[category].push(font);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="relative">
      <label className="block text-xs text-gray-500 mb-1">Font Family</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input-sm w-full text-left flex items-center justify-between"
      >
        <span style={{ fontFamily: value }}>{value}</span>
        <Type className="w-4 h-4 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-editor-bg border border-editor-border rounded-lg shadow-xl max-h-80 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-editor-border sticky top-0 bg-editor-bg">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-editor-surface border border-editor-border rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-titan-steel"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Font List */}
            <div className="overflow-y-auto max-h-60">
              {Object.entries(groupedFonts).map(([category, fonts]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-xs font-medium text-titan-light bg-editor-surface/50 sticky top-0">
                    {category}
                  </div>
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        onChange(font);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                        font === value 
                          ? 'bg-titan-navy/50 text-titan-light' 
                          : 'text-white hover:bg-editor-surface'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      <span>{font}</span>
                      {font === value && (
                        <div className="w-2 h-2 rounded-full bg-titan-steel" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
              {Object.keys(groupedFonts).length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No fonts found
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="p-2 border-t border-editor-border bg-editor-bg">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className="w-full py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}

// AI Tab Component
function AITab() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<'video' | 'image' | 'audio'>('video');

  const aiFeatures = [
    {
      id: 'text-to-video',
      icon: FileVideo,
      title: 'Text to Video',
      description: 'Generate videos from text descriptions',
      type: 'video' as const,
    },
    {
      id: 'image-gen',
      icon: Image,
      title: 'AI Images',
      description: 'Generate images for your video',
      type: 'image' as const,
    },
    {
      id: 'ai-music',
      icon: Music,
      title: 'AI Music',
      description: 'Generate background music',
      type: 'audio' as const,
    },
  ];

  const examplePrompts = [
    'A serene sunset over the ocean with gentle waves',
    'Modern office with professionals working on computers',
    'Aerial view of a cityscape at night with lights',
    'Nature documentary style forest with wildlife',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation (in production, this would call an AI API)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success(`AI ${generationType} generation complete! (Demo)`);
      toast('In production, this would generate real content using AI APIs like Runway, Pika, or Stable Video Diffusion.', {
        icon: 'ℹ️',
        duration: 5000,
      });
    } catch {
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-4"
    >
      {/* AI Badge */}
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <div>
          <p className="text-sm text-white font-medium">AI-Powered Features</p>
          <p className="text-xs text-gray-400">Generate content with artificial intelligence</p>
        </div>
      </div>

      {/* Generation Type */}
      <div className="space-y-2">
        <label className="block text-xs text-gray-500">Generation Type</label>
        <div className="grid grid-cols-3 gap-2">
          {aiFeatures.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setGenerationType(feature.type)}
              className={`p-2 rounded-lg text-center transition-colors ${
                generationType === feature.type
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'bg-editor-surface border border-editor-border text-gray-400 hover:text-white'
              }`}
            >
              <feature.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">{feature.type === 'video' ? 'Video' : feature.type === 'image' ? 'Image' : 'Audio'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="block text-xs text-gray-500">Describe what you want to generate</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A beautiful mountain landscape with snow-capped peaks and a clear blue sky..."
          className="w-full h-24 px-3 py-2 bg-editor-surface border border-editor-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-titan-steel resize-none"
        />
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <label className="block text-xs text-gray-500">Example prompts</label>
        <div className="flex flex-wrap gap-1">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              onClick={() => setPrompt(example)}
              className="px-2 py-1 text-xs bg-editor-surface hover:bg-editor-hover text-gray-400 hover:text-white rounded transition-colors truncate max-w-full"
              title={example}
            >
              {example.substring(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="btn-primary w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Generate {generationType === 'video' ? 'Video' : generationType === 'image' ? 'Image' : 'Audio'}
          </>
        )}
      </button>

      {/* AI Info */}
      <div className="p-3 bg-editor-surface rounded-lg">
        <h4 className="text-xs font-medium text-gray-400 mb-2">How it works</h4>
        <ul className="space-y-1.5 text-xs text-gray-500">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">1.</span>
            Describe your desired content in detail
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">2.</span>
            Our AI processes your prompt
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">3.</span>
            Generated content is added to your timeline
          </li>
        </ul>
      </div>

      {/* API Status */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-xs text-yellow-400">
          <strong>Demo Mode:</strong> AI features require API integration with services like Runway, Pika Labs, or OpenAI. Contact us to enable.
        </p>
      </div>
    </motion.div>
  );
}

// Helper function
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

