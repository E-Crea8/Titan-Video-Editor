import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import TextOverlayCanvas from '@/components/text-overlay/TextOverlayCanvas';

export default function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    video,
    currentTime,
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    trimStart,
    trimEnd,
    aspectRatio,
    setCurrentTime,
    setIsPlaying,
    togglePlayPause,
    setVolume,
    toggleMute,
  } = useEditorStore();

  // Sync video with state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Sync playback
    if (isPlaying) {
      videoEl.play().catch(() => setIsPlaying(false));
    } else {
      videoEl.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Update video time when currentTime changes (from timeline)
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || isPlaying) return;

    if (Math.abs(videoEl.currentTime - currentTime) > 0.1) {
      videoEl.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Sync volume and mute
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.volume = volume;
    videoEl.muted = isMuted;
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.playbackRate = playbackRate;
  }, [playbackRate]);

  // Handle time update from video
  const handleTimeUpdate = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const time = videoEl.currentTime;
    setCurrentTime(time);

    // Loop within trim range
    if (time >= trimEnd) {
      videoEl.currentTime = trimStart;
      if (!isPlaying) {
        setIsPlaying(false);
      }
    }
  }, [trimStart, trimEnd, isPlaying, setCurrentTime, setIsPlaying]);

  // Handle video end
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(trimStart);
  }, [trimStart, setIsPlaying, setCurrentTime]);

  // Seek forward/backward
  const seekRelative = useCallback((seconds: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const newTime = Math.max(trimStart, Math.min(trimEnd, videoEl.currentTime + seconds));
    videoEl.currentTime = newTime;
    setCurrentTime(newTime);
  }, [trimStart, trimEnd, setCurrentTime]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(5);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, seekRelative, toggleMute, toggleFullscreen]);

  if (!video) return null;

  // Calculate aspect ratio styles
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[9/16] max-h-full';
      case 'square':
        return 'aspect-square max-h-full';
      case 'landscape':
      default:
        return 'aspect-video max-h-full';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col items-center justify-center"
    >
      {/* Video Container */}
      <div className={`relative ${getAspectRatioClass()} w-full max-w-4xl mx-auto`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="video-container h-full w-full"
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            playsInline
          />

          {/* Text Overlay Canvas */}
          <TextOverlayCanvas />

          {/* Controls Overlay */}
          <div className="video-controls">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                {/* Skip Back */}
                <button
                  onClick={() => seekRelative(-10)}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                  title="Skip back 10s"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                {/* Skip Forward */}
                <button
                  onClick={() => seekRelative(10)}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                  title="Skip forward 10s"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Time Display */}
                <div className="text-sm text-white/80 font-mono ml-2">
                  {formatTime(currentTime)} / {formatTime(video.duration)}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {/* Volume */}
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white/80 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                  title="Fullscreen (F)"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Play button overlay (when paused) */}
          {!isPlaying && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </button>
          )}
        </motion.div>
      </div>

      {/* Aspect Ratio Indicator */}
      <div className="mt-2 text-xs text-gray-500">
        {aspectRatio === 'landscape' && '16:9 Landscape'}
        {aspectRatio === 'portrait' && '9:16 Portrait'}
        {aspectRatio === 'square' && '1:1 Square'}
        {aspectRatio === 'custom' && 'Custom'}
      </div>
    </div>
  );
}

