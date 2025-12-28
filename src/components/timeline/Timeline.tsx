import { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Scissors } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';

export default function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'playhead' | 'trimStart' | 'trimEnd' | null>(null);

  const {
    video,
    currentTime,
    duration,
    trimStart,
    trimEnd,
    isPlaying,
    textOverlays,
    setCurrentTime,
    setTrimRange,
    setIsPlaying,
  } = useEditorStore();

  const { timelineZoom, setTimelineZoom } = useUIStore();

  // Convert time to percentage
  const timeToPercent = useCallback((time: number) => {
    if (!duration) return 0;
    return (time / duration) * 100;
  }, [duration]);

  // Convert percentage to time
  const percentToTime = useCallback((percent: number) => {
    if (!duration) return 0;
    return (percent / 100) * duration;
  }, [duration]);

  // Get position from mouse event
  const getPositionFromEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    const timeline = timelineRef.current;
    if (!timeline) return 0;

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    return percentToTime(percent);
  }, [percentToTime]);

  // Handle timeline click
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (dragType) return;
    
    const time = getPositionFromEvent(e);
    setCurrentTime(Math.max(trimStart, Math.min(trimEnd, time)));
    
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [getPositionFromEvent, trimStart, trimEnd, isPlaying, setCurrentTime, setIsPlaying, dragType]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, type: 'playhead' | 'trimStart' | 'trimEnd') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying, setIsPlaying]);

  // Handle drag move
  useEffect(() => {
    if (!isDragging || !dragType) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getPositionFromEvent(e);

      switch (dragType) {
        case 'playhead':
          setCurrentTime(Math.max(trimStart, Math.min(trimEnd, time)));
          break;
        case 'trimStart':
          const newStart = Math.max(0, Math.min(trimEnd - 0.1, time));
          setTrimRange({ start: newStart, end: trimEnd });
          if (currentTime < newStart) {
            setCurrentTime(newStart);
          }
          break;
        case 'trimEnd':
          const newEnd = Math.max(trimStart + 0.1, Math.min(duration, time));
          setTrimRange({ start: trimStart, end: newEnd });
          if (currentTime > newEnd) {
            setCurrentTime(newEnd);
          }
          break;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, trimStart, trimEnd, duration, currentTime, getPositionFromEvent, setCurrentTime, setTrimRange]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    if (!duration) return [];
    
    const interval = duration > 60 ? 10 : duration > 30 ? 5 : duration > 10 ? 2 : 1;
    const markers = [];
    
    for (let time = 0; time <= duration; time += interval) {
      markers.push({
        time,
        position: timeToPercent(time),
      });
    }
    
    return markers;
  };

  if (!video) return null;

  const timeMarkers = generateTimeMarkers();
  const trimStartPercent = timeToPercent(trimStart);
  const trimEndPercent = timeToPercent(trimEnd);
  const playheadPercent = timeToPercent(currentTime);

  return (
    <div className="h-full flex flex-col bg-editor-bg p-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Current Time */}
          <div className="font-mono text-sm text-white bg-editor-surface px-3 py-1 rounded">
            {formatTime(currentTime)}
          </div>

          {/* Trim Info */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Scissors className="w-3.5 h-3.5" />
            <span>
              {formatTime(trimStart)} - {formatTime(trimEnd)}
            </span>
            <span className="text-titan-light">
              ({formatTime(trimEnd - trimStart)})
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimelineZoom(timelineZoom - 0.25)}
            disabled={timelineZoom <= 0.5}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-editor-surface rounded transition-colors disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">
            {Math.round(timelineZoom * 100)}%
          </span>
          <button
            onClick={() => setTimelineZoom(timelineZoom + 0.25)}
            disabled={timelineZoom >= 3}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-editor-surface rounded transition-colors disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="flex-1 relative">
        {/* Time Markers */}
        <div className="h-5 relative border-b border-editor-border mb-2">
          {timeMarkers.map((marker) => (
            <div
              key={marker.time}
              className="absolute flex flex-col items-center"
              style={{ left: `${marker.position}%` }}
            >
              <span className="text-[10px] text-gray-500 -translate-x-1/2">
                {formatTime(marker.time)}
              </span>
              <div className="w-px h-2 bg-editor-border" />
            </div>
          ))}
        </div>

        {/* Main Timeline */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative h-16 timeline-track cursor-pointer overflow-hidden"
          style={{ transform: `scaleX(${timelineZoom})`, transformOrigin: 'left' }}
        >
          {/* Video Track Background */}
          <div className="absolute inset-y-2 inset-x-0 bg-editor-surface rounded" />

          {/* Trimmed Region (visible area) */}
          <div
            className="absolute inset-y-2 bg-gradient-to-r from-titan-navy to-titan-royal rounded"
            style={{
              left: `${trimStartPercent}%`,
              width: `${trimEndPercent - trimStartPercent}%`,
            }}
          >
            {/* Video Waveform Placeholder */}
            <div className="h-full flex items-center justify-center opacity-30">
              <div className="flex items-end gap-0.5 h-8">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-titan-light rounded-full"
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Excluded regions (outside trim) */}
          <div
            className="absolute inset-y-0 left-0 bg-black/50"
            style={{ width: `${trimStartPercent}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-black/50"
            style={{ width: `${100 - trimEndPercent}%` }}
          />

          {/* Text Overlay Indicators */}
          {textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="absolute h-3 bottom-1 bg-yellow-500/60 rounded-sm border border-yellow-400/50"
              style={{
                left: `${timeToPercent(overlay.startTime)}%`,
                width: `${timeToPercent(overlay.endTime) - timeToPercent(overlay.startTime)}%`,
              }}
              title={`Text: ${overlay.text}`}
            />
          ))}

          {/* Trim Start Handle */}
          <motion.div
            className="absolute inset-y-0 w-3 cursor-ew-resize z-20 group"
            style={{ left: `calc(${trimStartPercent}% - 6px)` }}
            onMouseDown={(e) => handleDragStart(e, 'trimStart')}
            whileHover={{ scale: 1.1 }}
          >
            <div className="h-full w-1 bg-titan-light mx-auto rounded-full group-hover:bg-titan-accent transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-titan-light/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Trim End Handle */}
          <motion.div
            className="absolute inset-y-0 w-3 cursor-ew-resize z-20 group"
            style={{ left: `calc(${trimEndPercent}% - 6px)` }}
            onMouseDown={(e) => handleDragStart(e, 'trimEnd')}
            whileHover={{ scale: 1.1 }}
          >
            <div className="h-full w-1 bg-titan-light mx-auto rounded-full group-hover:bg-titan-accent transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-titan-light/20 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Playhead */}
          <motion.div
            className="timeline-playhead cursor-ew-resize z-30"
            style={{ left: `${playheadPercent}%` }}
            onMouseDown={(e) => handleDragStart(e, 'playhead')}
            animate={{ x: 0 }}
          >
            {/* Playhead line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 left-1/2 -translate-x-1/2" />
            
            {/* Playhead handle */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg" />
          </motion.div>
        </div>

        {/* Instructions */}
        <div className="mt-2 text-center text-xs text-gray-500">
          Drag the handles to trim • Click to seek • Drag playhead to scrub
        </div>
      </div>
    </div>
  );
}

