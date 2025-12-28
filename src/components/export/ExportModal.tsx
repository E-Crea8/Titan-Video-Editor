import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileVideo,
  Clock,
  HardDrive,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { useVideoMetadata } from '@/hooks/useVideoMetadata';
import toast from 'react-hot-toast';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const {
    video,
    trimStart,
    trimEnd,
    textOverlays,
    exportSettings,
    exportProgress,
    isExporting,
    exportedVideoUrl,
    resetExport,
  } = useEditorStore();

  const { exportVideo, isLoaded: ffmpegLoaded, load: loadFFmpeg, isLoading: ffmpegLoading } = useFFmpeg();
  const { formatFileSize, formatDuration } = useVideoMetadata();
  
  const [estimatedSize, setEstimatedSize] = useState<string>('Calculating...');

  // Calculate estimated file size
  useEffect(() => {
    if (!video) return;

    const duration = trimEnd - trimStart;
    const bitrateMap = {
      low: 1000000, // 1 Mbps
      medium: 2500000, // 2.5 Mbps
      high: 5000000, // 5 Mbps
      ultra: 10000000, // 10 Mbps
    };
    
    const bitrate = bitrateMap[exportSettings.quality];
    const estimatedBytes = (bitrate * duration) / 8;
    setEstimatedSize(formatFileSize(estimatedBytes));
  }, [video, trimStart, trimEnd, exportSettings.quality, formatFileSize]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!video?.file) {
      toast.error('No video to export');
      return;
    }

    // Load FFmpeg if not loaded
    if (!ffmpegLoaded) {
      const loaded = await loadFFmpeg();
      if (!loaded) {
        toast.error('Failed to load video processor');
        return;
      }
    }

    try {
      const blob = await exportVideo(video.file, {
        trimStart,
        trimEnd,
        width: exportSettings.width,
        height: exportSettings.height,
        quality: exportSettings.quality,
        textOverlays: textOverlays.filter(
          (o) => o.startTime < trimEnd && o.endTime > trimStart
        ),
      });

      if (blob) {
        toast.success('Video exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  }, [video, ffmpegLoaded, loadFFmpeg, exportVideo, trimStart, trimEnd, exportSettings, textOverlays]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!exportedVideoUrl || !video) return;

    const a = document.createElement('a');
    a.href = exportedVideoUrl;
    a.download = `${video.name.replace(/\.[^/.]+$/, '')}_edited.${exportSettings.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Download started!');
  }, [exportedVideoUrl, video, exportSettings.format]);

  // Handle close
  const handleClose = useCallback(() => {
    if (isExporting) {
      const confirm = window.confirm('Export in progress. Are you sure you want to cancel?');
      if (!confirm) return;
    }
    resetExport();
    onClose();
  }, [isExporting, resetExport, onClose]);

  if (!video) return null;

  const duration = trimEnd - trimStart;
  const isComplete = exportProgress.status === 'complete';
  const isError = exportProgress.status === 'error';
  const showProgress = isExporting || isComplete || isError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="card w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-editor-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-titan-light" />
            Export Video
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-editor-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showProgress ? (
            // Pre-export view
            <div className="space-y-6">
              {/* Video Preview Thumbnail */}
              <div className="aspect-video bg-editor-surface rounded-lg overflow-hidden relative">
                <video
                  src={video.url}
                  className="w-full h-full object-contain"
                  muted
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-white">
                  <span>{video.name}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Export Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-editor-surface rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <FileVideo className="w-4 h-4" />
                    <span className="text-xs">Resolution</span>
                  </div>
                  <div className="text-white font-medium">
                    {exportSettings.width} × {exportSettings.height}
                  </div>
                </div>

                <div className="p-3 bg-editor-surface rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <div className="text-white font-medium">
                    {formatDuration(duration)}
                  </div>
                </div>

                <div className="p-3 bg-editor-surface rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-xs">Est. Size</span>
                  </div>
                  <div className="text-white font-medium">
                    ~{estimatedSize}
                  </div>
                </div>

                <div className="p-3 bg-editor-surface rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <span className="text-xs">Format</span>
                  </div>
                  <div className="text-white font-medium uppercase">
                    {exportSettings.format} • {exportSettings.quality}
                  </div>
                </div>
              </div>

              {/* Overlays Info */}
              {textOverlays.length > 0 && (
                <div className="p-3 bg-titan-navy/30 border border-titan-steel/30 rounded-lg">
                  <div className="text-sm text-titan-light">
                    {textOverlays.length} text overlay{textOverlays.length > 1 ? 's' : ''} will be rendered
                  </div>
                </div>
              )}

              {/* Warning about processing time */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ⚡ Video processing happens in your browser. Export time depends on video length and your device's performance.
                </p>
              </div>

              {/* FFmpeg Loading */}
              {ffmpegLoading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading video processor...</span>
                </div>
              )}
            </div>
          ) : (
            // Progress view
            <div className="space-y-6">
              {/* Status Icon */}
              <div className="flex justify-center">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                ) : isError ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center"
                  >
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </motion.div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-titan-navy/50 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-titan-light animate-spin" />
                  </div>
                )}
              </div>

              {/* Status Text */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-1">
                  {isComplete && 'Export Complete!'}
                  {isError && 'Export Failed'}
                  {!isComplete && !isError && exportProgress.message}
                </h3>
                {exportProgress.estimatedTimeRemaining && !isComplete && !isError && (
                  <p className="text-sm text-gray-400">
                    ~{exportProgress.estimatedTimeRemaining}s remaining
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {!isComplete && !isError && (
                <div className="space-y-2">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    {Math.round(exportProgress.progress)}%
                  </div>
                </div>
              )}

              {/* Error Message */}
              {isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">
                    {exportProgress.message || 'An error occurred during export.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-editor-border flex gap-3">
          {!showProgress ? (
            <>
              <button onClick={handleClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={ffmpegLoading}
                className="btn-primary flex-1"
              >
                {ffmpegLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Start Export
                  </>
                )}
              </button>
            </>
          ) : isComplete ? (
            <>
              <button onClick={handleClose} className="btn-secondary flex-1">
                Close
              </button>
              <button onClick={handleDownload} className="btn-success flex-1">
                <Download className="w-4 h-4" />
                Download Video
              </button>
            </>
          ) : isError ? (
            <>
              <button onClick={handleClose} className="btn-secondary flex-1">
                Close
              </button>
              <button
                onClick={() => {
                  resetExport();
                  handleExport();
                }}
                className="btn-primary flex-1"
              >
                Try Again
              </button>
            </>
          ) : (
            <button onClick={handleClose} className="btn-secondary flex-1">
              Cancel Export
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

