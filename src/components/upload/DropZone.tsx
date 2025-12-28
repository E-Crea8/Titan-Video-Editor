import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, AlertCircle, FileVideo, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { useVideoMetadata } from '@/hooks/useVideoMetadata';
import toast from 'react-hot-toast';

export default function DropZone() {
  const { setVideo } = useEditorStore();
  const { setVideoLoading, isVideoLoading } = useUIStore();
  const { processVideoFile, formatFileSize, MAX_FILE_SIZE } = useVideoMetadata();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setVideoLoading(true);

    try {
      const videoFile = await processVideoFile(file);
      setVideo(videoFile);
      toast.success(`Loaded: ${file.name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load video';
      setError(message);
      toast.error(message);
    } finally {
      setVideoLoading(false);
    }
  }, [processVideoFile, setVideo, setVideoLoading]);

  const onDropRejected = useCallback((rejections: Array<{ file: File; errors: readonly { message: string }[] }>) => {
    const rejection = rejections[0];
    if (rejection) {
      const errorMessages = rejection.errors.map(e => e.message).join(', ');
      setError(errorMessages);
      toast.error(errorMessages);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogg'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isVideoLoading,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`
          dropzone relative group
          ${isDragActive && !isDragReject ? 'active border-titan-steel bg-titan-navy/30' : ''}
          ${isDragReject ? 'border-red-500 bg-red-500/10' : ''}
          ${isVideoLoading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {isVideoLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-titan-navy/50 flex items-center justify-center mb-4">
                  <Loader2 className="w-10 h-10 text-titan-light animate-spin" />
                </div>
                <p className="text-lg text-white font-medium">Processing video...</p>
                <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
              </motion.div>
            ) : isDragReject ? (
              <motion.div
                key="reject"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-lg text-red-400 font-medium">Invalid file type</p>
                <p className="text-sm text-gray-400 mt-1">Please use a supported video format</p>
              </motion.div>
            ) : isDragActive ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl bg-titan-steel/30 flex items-center justify-center mb-4"
                >
                  <Film className="w-10 h-10 text-titan-light" />
                </motion.div>
                <p className="text-lg text-white font-medium">Drop your video here</p>
                <p className="text-sm text-titan-light mt-1">Release to upload</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-titan-royal/30 to-titan-steel/30 flex items-center justify-center mb-4 group-hover:from-titan-royal/40 group-hover:to-titan-steel/40 transition-colors">
                  <Upload className="w-10 h-10 text-titan-light" />
                </div>
                <p className="text-lg text-white font-medium mb-1">
                  Drop your video here, or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supports MP4, WebM, MOV, AVI, MKV
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && !isDragActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative Border */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isDragActive 
              ? '0 0 0 2px rgba(74, 110, 181, 0.5), 0 0 30px rgba(74, 110, 181, 0.2)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* File Limits Info */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FileVideo className="w-4 h-4" />
          <span>Max {formatFileSize(MAX_FILE_SIZE)}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-600" />
        <span>MP4, WebM, MOV, AVI, MKV</span>
      </div>
    </motion.div>
  );
}

