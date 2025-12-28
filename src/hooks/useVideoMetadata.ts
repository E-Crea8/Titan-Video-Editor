import { useCallback } from 'react';
import type { VideoMetadata, VideoFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Supported video formats
const SUPPORTED_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/ogg',
];

// Max file size (500MB)
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export function useVideoMetadata() {
  // Extract metadata from video file
  const extractMetadata = useCallback((file: File): Promise<VideoMetadata> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          fps: 30, // Default, actual FPS detection requires more complex logic
        };
        
        URL.revokeObjectURL(url);
        resolve(metadata);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video metadata'));
      };

      video.src = url;
    });
  }, []);

  // Validate video file
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported format: ${file.type || 'unknown'}. Please use MP4, WebM, MOV, AVI, or MKV.`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024));
      return {
        valid: false,
        error: `File too large (${sizeMB}MB). Maximum size is 500MB.`,
      };
    }

    return { valid: true };
  }, []);

  // Process video file and create VideoFile object
  const processVideoFile = useCallback(async (file: File): Promise<VideoFile> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const metadata = await extractMetadata(file);
    const url = URL.createObjectURL(file);

    return {
      id: uuidv4(),
      file,
      url,
      name: file.name,
      duration: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      size: file.size,
      type: file.type,
    };
  }, [validateFile, extractMetadata]);

  // Format file size for display
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    extractMetadata,
    validateFile,
    processVideoFile,
    formatFileSize,
    formatDuration,
    SUPPORTED_FORMATS,
    MAX_FILE_SIZE,
  };
}

