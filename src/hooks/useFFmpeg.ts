import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import type { TextOverlay, ExportQuality } from '@/types';

const QUALITY_SETTINGS: Record<ExportQuality, { videoBitrate: string; audioBitrate: string; crf: number }> = {
  low: { videoBitrate: '1M', audioBitrate: '96k', crf: 35 },
  medium: { videoBitrate: '2.5M', audioBitrate: '128k', crf: 28 },
  high: { videoBitrate: '5M', audioBitrate: '192k', crf: 23 },
  ultra: { videoBitrate: '10M', audioBitrate: '320k', crf: 18 },
};

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setFFmpegLoading } = useUIStore();
  const { setExportProgress, setIsExporting, setExportedVideoUrl } = useEditorStore();

  // Load FFmpeg
  const load = useCallback(async () => {
    if (ffmpegRef.current && isLoaded) return true;
    
    try {
      setIsLoading(true);
      setFFmpegLoading(true, 0);
      setError(null);

      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      // Set up progress handler
      ffmpeg.on('progress', ({ progress }) => {
        setFFmpegLoading(true, Math.round(progress * 100));
      });

      // Set up log handler for debugging
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      // Load FFmpeg with CDN URLs
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setIsLoaded(true);
      setIsLoading(false);
      setFFmpegLoading(false, 100);
      
      return true;
    } catch (err) {
      console.error('Failed to load FFmpeg:', err);
      setError(err instanceof Error ? err.message : 'Failed to load FFmpeg');
      setIsLoading(false);
      setFFmpegLoading(false, 0);
      return false;
    }
  }, [isLoaded, setFFmpegLoading]);

  // Generate FFmpeg filter string for text overlays
  const generateTextFilters = useCallback((
    overlays: TextOverlay[],
    width: number,
    height: number
  ): string => {
    if (overlays.length === 0) return '';

    const filters = overlays.map((overlay) => {
      // Calculate positions relative to output dimensions
      const x = Math.round((overlay.x / 100) * width);
      const y = Math.round((overlay.y / 100) * height);
      
      // Escape special characters in text
      const escapedText = overlay.text
        .replace(/'/g, "'\\''")
        .replace(/:/g, '\\:')
        .replace(/\\/g, '\\\\');

      // Build drawtext filter
      const fontColor = overlay.color.replace('#', '0x');
      const fontSize = Math.round(overlay.fontSize * (width / 1920)); // Scale font based on output width
      
      let filter = `drawtext=text='${escapedText}'`;
      filter += `:x=${x}:y=${y}`;
      filter += `:fontsize=${fontSize}`;
      filter += `:fontcolor=${fontColor}`;
      filter += `:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`;
      
      // Add background if set
      if (overlay.backgroundColor && overlay.backgroundColor !== 'transparent') {
        const bgColor = overlay.backgroundColor.replace('#', '0x');
        filter += `:box=1:boxcolor=${bgColor}@0.5:boxborderw=5`;
      }

      // Add timing
      filter += `:enable='between(t,${overlay.startTime},${overlay.endTime})'`;

      return filter;
    });

    return filters.join(',');
  }, []);

  // Export video with all edits applied
  const exportVideo = useCallback(async (
    inputFile: File,
    options: {
      trimStart: number;
      trimEnd: number;
      width: number;
      height: number;
      quality: ExportQuality;
      textOverlays: TextOverlay[];
      onProgress?: (progress: number) => void;
    }
  ): Promise<Blob | null> => {
    if (!ffmpegRef.current || !isLoaded) {
      const loaded = await load();
      if (!loaded) return null;
    }

    const ffmpeg = ffmpegRef.current!;
    
    try {
      setIsExporting(true);
      setExportProgress({ status: 'preparing', progress: 0, message: 'Preparing video...' });

      // Write input file to FFmpeg virtual filesystem
      const inputData = await fetchFile(inputFile);
      await ffmpeg.writeFile('input.mp4', inputData);

      setExportProgress({ status: 'processing', progress: 10, message: 'Processing video...' });

      // Build FFmpeg command
      const qualitySettings = QUALITY_SETTINGS[options.quality];
      const duration = options.trimEnd - options.trimStart;
      
      // Build filter complex
      const filters: string[] = [];
      
      // Scale/resize filter
      filters.push(`scale=${options.width}:${options.height}:force_original_aspect_ratio=decrease`);
      filters.push(`pad=${options.width}:${options.height}:(ow-iw)/2:(oh-ih)/2:black`);
      
      // Add text overlays
      const textFilters = generateTextFilters(options.textOverlays, options.width, options.height);
      if (textFilters) {
        filters.push(textFilters);
      }

      const filterComplex = filters.join(',');

      // Set up progress tracking
      ffmpeg.on('progress', ({ progress, time }) => {
        const percent = Math.min(90, 10 + (progress * 80));
        const timeRemaining = time > 0 ? Math.round((duration - time) / 1000) : undefined;
        
        setExportProgress({
          status: 'encoding',
          progress: Math.round(percent),
          message: `Encoding video... ${Math.round(progress * 100)}%`,
          estimatedTimeRemaining: timeRemaining,
        });
        
        options.onProgress?.(percent);
      });

      // Execute FFmpeg command
      await ffmpeg.exec([
        '-ss', options.trimStart.toString(),
        '-i', 'input.mp4',
        '-t', duration.toString(),
        '-vf', filterComplex,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', qualitySettings.crf.toString(),
        '-c:a', 'aac',
        '-b:a', qualitySettings.audioBitrate,
        '-movflags', '+faststart',
        '-y',
        'output.mp4',
      ]);

      setExportProgress({ status: 'encoding', progress: 95, message: 'Finalizing...' });

      // Read output file
      const outputData = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([outputData as unknown as BlobPart], { type: 'video/mp4' });

      // Create download URL
      const url = URL.createObjectURL(blob);
      setExportedVideoUrl(url);

      // Cleanup
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');

      setExportProgress({ status: 'complete', progress: 100, message: 'Export complete!' });
      setIsExporting(false);

      return blob;
    } catch (err) {
      console.error('Export failed:', err);
      setExportProgress({
        status: 'error',
        progress: 0,
        message: err instanceof Error ? err.message : 'Export failed',
      });
      setIsExporting(false);
      return null;
    }
  }, [isLoaded, load, generateTextFilters, setExportProgress, setIsExporting, setExportedVideoUrl]);

  // Get video thumbnail
  const getThumbnail = useCallback(async (
    inputFile: File,
    time: number = 0
  ): Promise<string | null> => {
    if (!ffmpegRef.current || !isLoaded) {
      const loaded = await load();
      if (!loaded) return null;
    }

    const ffmpeg = ffmpegRef.current!;

    try {
      const inputData = await fetchFile(inputFile);
      await ffmpeg.writeFile('thumb_input.mp4', inputData);

      await ffmpeg.exec([
        '-ss', time.toString(),
        '-i', 'thumb_input.mp4',
        '-vframes', '1',
        '-vf', 'scale=320:-1',
        '-f', 'image2',
        '-y',
        'thumbnail.jpg',
      ]);

      const thumbData = await ffmpeg.readFile('thumbnail.jpg');
      const blob = new Blob([thumbData as unknown as BlobPart], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      await ffmpeg.deleteFile('thumb_input.mp4');
      await ffmpeg.deleteFile('thumbnail.jpg');

      return url;
    } catch (err) {
      console.error('Thumbnail generation failed:', err);
      return null;
    }
  }, [isLoaded, load]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ffmpegRef.current) {
        // FFmpeg cleanup if needed
      }
    };
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    load,
    exportVideo,
    getThumbnail,
  };
}

