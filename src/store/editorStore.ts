import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  VideoFile,
  TextOverlay,
  AspectRatioPreset,
  ExportSettings,
  ExportProgress,
  EditorSnapshot,
  TrimRange,
} from '@/types';

interface EditorStore {
  // Video State
  video: VideoFile | null;
  setVideo: (video: VideoFile | null) => void;
  clearVideo: () => void;

  // Timeline State
  currentTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setTrimRange: (range: TrimRange) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Text Overlays
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  
  addTextOverlay: (overlay?: Partial<TextOverlay>) => string;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  duplicateTextOverlay: (id: string) => string | null;
  selectTextOverlay: (id: string | null) => void;
  clearTextOverlays: () => void;
  reorderTextOverlays: (fromIndex: number, toIndex: number) => void;

  // Aspect Ratio
  aspectRatio: AspectRatioPreset;
  customWidth: number;
  customHeight: number;
  setAspectRatio: (ratio: AspectRatioPreset) => void;
  setCustomDimensions: (width: number, height: number) => void;

  // Export
  exportSettings: ExportSettings;
  exportProgress: ExportProgress;
  isExporting: boolean;
  exportedVideoUrl: string | null;
  
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  setExportProgress: (progress: Partial<ExportProgress>) => void;
  setIsExporting: (isExporting: boolean) => void;
  setExportedVideoUrl: (url: string | null) => void;
  resetExport: () => void;

  // Undo/Redo
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Reset
  resetEditor: () => void;
}

const DEFAULT_TEXT_OVERLAY: Omit<TextOverlay, 'id'> = {
  text: 'Your text here',
  x: 50,
  y: 50,
  width: 300,
  height: 60,
  fontSize: 32,
  fontFamily: 'Inter',
  fontWeight: 'bold',
  fontStyle: 'normal',
  color: '#ffffff',
  backgroundColor: 'transparent',
  opacity: 1,
  rotation: 0,
  startTime: 0,
  endTime: 5,
  textAlign: 'center',
  isVisible: true,
  isSelected: false,
};

const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  quality: 'high',
  format: 'mp4',
  aspectRatio: 'landscape',
  width: 1920,
  height: 1080,
  fps: 30,
  videoBitrate: '5M',
  audioBitrate: '192k',
};

const DEFAULT_EXPORT_PROGRESS: ExportProgress = {
  status: 'idle',
  progress: 0,
  message: '',
};

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        video: null,
        currentTime: 0,
        duration: 0,
        trimStart: 0,
        trimEnd: 0,
        isPlaying: false,
        playbackRate: 1,
        volume: 1,
        isMuted: false,
        textOverlays: [],
        selectedOverlayId: null,
        aspectRatio: 'landscape',
        customWidth: 1920,
        customHeight: 1080,
        exportSettings: DEFAULT_EXPORT_SETTINGS,
        exportProgress: DEFAULT_EXPORT_PROGRESS,
        isExporting: false,
        exportedVideoUrl: null,
        undoStack: [],
        redoStack: [],
        canUndo: false,
        canRedo: false,

        // Video Actions
        setVideo: (video) => {
          set({ video });
          if (video) {
            set({
              duration: video.duration,
              trimStart: 0,
              trimEnd: video.duration,
              currentTime: 0,
            });
            // Update text overlay end times
            const { textOverlays } = get();
            if (textOverlays.length > 0) {
              const updated = textOverlays.map((overlay) => ({
                ...overlay,
                endTime: Math.min(overlay.endTime, video.duration),
              }));
              set({ textOverlays: updated });
            }
          }
        },

        clearVideo: () => {
          const { video } = get();
          if (video?.url) {
            URL.revokeObjectURL(video.url);
          }
          set({
            video: null,
            currentTime: 0,
            duration: 0,
            trimStart: 0,
            trimEnd: 0,
            isPlaying: false,
          });
        },

        // Timeline Actions
        setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
        
        setDuration: (duration) => set({ duration, trimEnd: duration }),
        
        setTrimRange: (range) => {
          const { duration } = get();
          set({
            trimStart: Math.max(0, range.start),
            trimEnd: Math.min(duration, range.end),
          });
        },
        
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        
        togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
        
        setPlaybackRate: (rate) => set({ playbackRate: Math.max(0.25, Math.min(2, rate)) }),
        
        setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: volume === 0 }),
        
        toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

        // Text Overlay Actions
        addTextOverlay: (partial) => {
          const id = uuidv4();
          const { duration, trimStart, trimEnd } = get();
          const overlay: TextOverlay = {
            ...DEFAULT_TEXT_OVERLAY,
            ...partial,
            id,
            startTime: partial?.startTime ?? trimStart,
            endTime: partial?.endTime ?? Math.min(trimStart + 5, trimEnd, duration),
          };
          set((state) => ({
            textOverlays: [...state.textOverlays, overlay],
            selectedOverlayId: id,
          }));
          get().saveSnapshot();
          return id;
        },

        updateTextOverlay: (id, updates) => {
          set((state) => ({
            textOverlays: state.textOverlays.map((overlay) =>
              overlay.id === id ? { ...overlay, ...updates } : overlay
            ),
          }));
        },

        removeTextOverlay: (id) => {
          set((state) => ({
            textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id),
            selectedOverlayId: state.selectedOverlayId === id ? null : state.selectedOverlayId,
          }));
          get().saveSnapshot();
        },

        duplicateTextOverlay: (id) => {
          const { textOverlays } = get();
          const overlay = textOverlays.find((o) => o.id === id);
          if (!overlay) return null;
          
          const newId = uuidv4();
          const duplicated: TextOverlay = {
            ...overlay,
            id: newId,
            x: overlay.x + 20,
            y: overlay.y + 20,
            text: `${overlay.text} (copy)`,
          };
          
          set((state) => ({
            textOverlays: [...state.textOverlays, duplicated],
            selectedOverlayId: newId,
          }));
          get().saveSnapshot();
          return newId;
        },

        selectTextOverlay: (id) => {
          set((state) => ({
            selectedOverlayId: id,
            textOverlays: state.textOverlays.map((overlay) => ({
              ...overlay,
              isSelected: overlay.id === id,
            })),
          }));
        },

        clearTextOverlays: () => {
          set({ textOverlays: [], selectedOverlayId: null });
          get().saveSnapshot();
        },

        reorderTextOverlays: (fromIndex, toIndex) => {
          set((state) => {
            const overlays = [...state.textOverlays];
            const [removed] = overlays.splice(fromIndex, 1);
            overlays.splice(toIndex, 0, removed);
            return { textOverlays: overlays };
          });
        },

        // Aspect Ratio Actions
        setAspectRatio: (ratio) => {
          set({ aspectRatio: ratio });
          
          const dimensions: Record<AspectRatioPreset, { width: number; height: number }> = {
            landscape: { width: 1920, height: 1080 },
            portrait: { width: 1080, height: 1920 },
            square: { width: 1080, height: 1080 },
            custom: { width: get().customWidth, height: get().customHeight },
          };
          
          set((state) => ({
            exportSettings: {
              ...state.exportSettings,
              aspectRatio: ratio,
              ...dimensions[ratio],
            },
          }));
          
          get().saveSnapshot();
        },

        setCustomDimensions: (width, height) => {
          set({ 
            customWidth: width, 
            customHeight: height,
            aspectRatio: 'custom',
          });
        },

        // Export Actions
        setExportSettings: (settings) => {
          set((state) => ({
            exportSettings: { ...state.exportSettings, ...settings },
          }));
        },

        setExportProgress: (progress) => {
          set((state) => ({
            exportProgress: { ...state.exportProgress, ...progress },
          }));
        },

        setIsExporting: (isExporting) => set({ isExporting }),

        setExportedVideoUrl: (url) => set({ exportedVideoUrl: url }),

        resetExport: () => {
          const { exportedVideoUrl } = get();
          if (exportedVideoUrl) {
            URL.revokeObjectURL(exportedVideoUrl);
          }
          set({
            exportProgress: DEFAULT_EXPORT_PROGRESS,
            isExporting: false,
            exportedVideoUrl: null,
          });
        },

        // Undo/Redo Actions
        saveSnapshot: () => {
          const { textOverlays, trimStart, trimEnd, aspectRatio, undoStack } = get();
          const snapshot: EditorSnapshot = {
            timestamp: Date.now(),
            textOverlays: JSON.parse(JSON.stringify(textOverlays)),
            trimStart,
            trimEnd,
            aspectRatio,
          };
          
          const newStack = [...undoStack, snapshot].slice(-MAX_HISTORY);
          set({
            undoStack: newStack,
            redoStack: [],
            canUndo: newStack.length > 0,
            canRedo: false,
          });
        },

        undo: () => {
          const { undoStack, redoStack, textOverlays, trimStart, trimEnd, aspectRatio } = get();
          if (undoStack.length === 0) return;
          
          // Save current state to redo stack
          const currentSnapshot: EditorSnapshot = {
            timestamp: Date.now(),
            textOverlays: JSON.parse(JSON.stringify(textOverlays)),
            trimStart,
            trimEnd,
            aspectRatio,
          };
          
          const newUndoStack = [...undoStack];
          const prevSnapshot = newUndoStack.pop()!;
          
          set({
            textOverlays: prevSnapshot.textOverlays,
            trimStart: prevSnapshot.trimStart,
            trimEnd: prevSnapshot.trimEnd,
            aspectRatio: prevSnapshot.aspectRatio,
            undoStack: newUndoStack,
            redoStack: [...redoStack, currentSnapshot],
            canUndo: newUndoStack.length > 0,
            canRedo: true,
          });
        },

        redo: () => {
          const { undoStack, redoStack, textOverlays, trimStart, trimEnd, aspectRatio } = get();
          if (redoStack.length === 0) return;
          
          const currentSnapshot: EditorSnapshot = {
            timestamp: Date.now(),
            textOverlays: JSON.parse(JSON.stringify(textOverlays)),
            trimStart,
            trimEnd,
            aspectRatio,
          };
          
          const newRedoStack = [...redoStack];
          const nextSnapshot = newRedoStack.pop()!;
          
          set({
            textOverlays: nextSnapshot.textOverlays,
            trimStart: nextSnapshot.trimStart,
            trimEnd: nextSnapshot.trimEnd,
            aspectRatio: nextSnapshot.aspectRatio,
            undoStack: [...undoStack, currentSnapshot],
            redoStack: newRedoStack,
            canUndo: true,
            canRedo: newRedoStack.length > 0,
          });
        },

        clearHistory: () => {
          set({
            undoStack: [],
            redoStack: [],
            canUndo: false,
            canRedo: false,
          });
        },

        // Reset Editor
        resetEditor: () => {
          const { video, exportedVideoUrl } = get();
          if (video?.url) URL.revokeObjectURL(video.url);
          if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
          
          set({
            video: null,
            currentTime: 0,
            duration: 0,
            trimStart: 0,
            trimEnd: 0,
            isPlaying: false,
            playbackRate: 1,
            volume: 1,
            isMuted: false,
            textOverlays: [],
            selectedOverlayId: null,
            aspectRatio: 'landscape',
            exportSettings: DEFAULT_EXPORT_SETTINGS,
            exportProgress: DEFAULT_EXPORT_PROGRESS,
            isExporting: false,
            exportedVideoUrl: null,
            undoStack: [],
            redoStack: [],
            canUndo: false,
            canRedo: false,
          });
        },
      }),
      {
        name: 'titan-editor-store',
        partialize: (state) => ({
          aspectRatio: state.aspectRatio,
          exportSettings: state.exportSettings,
          volume: state.volume,
          playbackRate: state.playbackRate,
        }),
      }
    ),
    { name: 'EditorStore' }
  )
);

