// Video Types
export interface VideoFile {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  size: number;
  type: string;
  thumbnail?: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
}

// Timeline Types
export interface TimelineState {
  currentTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
}

export interface TrimRange {
  start: number;
  end: number;
}

// Text Overlay Types
export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  backgroundColor: string;
  opacity: number;
  rotation: number;
  startTime: number;
  endTime: number;
  textAlign: 'left' | 'center' | 'right';
  isVisible: boolean;
  isSelected: boolean;
}

export type FontFamily = 
  | 'Inter'
  | 'Arial'
  | 'Times New Roman'
  | 'Georgia'
  | 'Verdana'
  | 'Courier New'
  | 'Impact'
  | 'Comic Sans MS';

export type FontWeight = 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800';

// Aspect Ratio Types
export type AspectRatioPreset = 'landscape' | 'portrait' | 'square' | 'custom';

export interface AspectRatio {
  id: AspectRatioPreset;
  label: string;
  width: number;
  height: number;
  ratio: string;
  icon: string;
}

export const ASPECT_RATIOS: Record<AspectRatioPreset, AspectRatio> = {
  landscape: {
    id: 'landscape',
    label: 'Landscape',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    icon: 'Monitor',
  },
  portrait: {
    id: 'portrait',
    label: 'Portrait',
    width: 1080,
    height: 1920,
    ratio: '9:16',
    icon: 'Smartphone',
  },
  square: {
    id: 'square',
    label: 'Square',
    width: 1080,
    height: 1080,
    ratio: '1:1',
    icon: 'Square',
  },
  custom: {
    id: 'custom',
    label: 'Custom',
    width: 0,
    height: 0,
    ratio: 'Custom',
    icon: 'Settings',
  },
};

// Export Types
export type ExportQuality = 'low' | 'medium' | 'high' | 'ultra';
export type ExportFormat = 'mp4' | 'webm' | 'mov';

export interface ExportSettings {
  quality: ExportQuality;
  format: ExportFormat;
  aspectRatio: AspectRatioPreset;
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
}

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'processing' | 'encoding' | 'complete' | 'error';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export const EXPORT_QUALITY_SETTINGS: Record<ExportQuality, { videoBitrate: string; audioBitrate: string }> = {
  low: { videoBitrate: '1M', audioBitrate: '96k' },
  medium: { videoBitrate: '2.5M', audioBitrate: '128k' },
  high: { videoBitrate: '5M', audioBitrate: '192k' },
  ultra: { videoBitrate: '10M', audioBitrate: '320k' },
};

// Editor State Types
export interface EditorState {
  video: VideoFile | null;
  timeline: TimelineState;
  textOverlays: TextOverlay[];
  selectedOverlayId: string | null;
  aspectRatio: AspectRatioPreset;
  exportSettings: ExportSettings;
  exportProgress: ExportProgress;
  isExporting: boolean;
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
}

export interface EditorSnapshot {
  timestamp: number;
  textOverlays: TextOverlay[];
  trimStart: number;
  trimEnd: number;
  aspectRatio: AspectRatioPreset;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'export' | 'settings' | 'confirm' | 'auth' | null;
  data?: unknown;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  userId: string;
  videoFile?: string;
  editorState: Partial<EditorState>;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

// FFmpeg Types
export interface FFmpegCommand {
  input: string;
  output: string;
  filters: string[];
  options: string[];
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

