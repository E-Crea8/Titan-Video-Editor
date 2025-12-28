import { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import type { TextOverlay } from '@/types';

export default function TextOverlayCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [_resizing, setResizing] = useState<{ id: string; corner: string } | null>(null);
  const [hoveredOverlay, setHoveredOverlay] = useState<TextOverlay | null>(null);

  const {
    textOverlays,
    selectedOverlayId,
    currentTime,
    selectTextOverlay,
    updateTextOverlay,
  } = useEditorStore();

  const { isCanvasEditing, setCanvasEditing } = useUIStore();

  // Auto-enable editing when overlays exist
  useEffect(() => {
    if (textOverlays.length > 0 && !isCanvasEditing) {
      setCanvasEditing(true);
    }
  }, [textOverlays.length, isCanvasEditing, setCanvasEditing]);

  // Get visible overlays based on current time
  const getVisibleOverlays = useCallback(() => {
    return textOverlays.filter(
      (overlay) => currentTime >= overlay.startTime && currentTime <= overlay.endTime
    );
  }, [textOverlays, currentTime]);

  // Draw overlays on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each visible overlay
    const visibleOverlays = getVisibleOverlays();
    
    visibleOverlays.forEach((overlay) => {
      const x = (overlay.x / 100) * canvas.width;
      const y = (overlay.y / 100) * canvas.height;
      const isSelected = overlay.id === selectedOverlayId;

      // Apply opacity
      ctx.globalAlpha = overlay.opacity;

      // Draw background if set
      if (overlay.backgroundColor && overlay.backgroundColor !== 'transparent') {
        ctx.fillStyle = overlay.backgroundColor;
        const metrics = ctx.measureText(overlay.text);
        const textWidth = overlay.width || metrics.width + 20;
        const textHeight = overlay.height || overlay.fontSize * 1.5;
        ctx.fillRect(x - 10, y - overlay.fontSize, textWidth, textHeight);
      }

      // Set text styles
      ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = overlay.textAlign;
      ctx.textBaseline = 'top';

      // Draw text
      const textX = overlay.textAlign === 'center' 
        ? x + (overlay.width || 0) / 2 
        : overlay.textAlign === 'right' 
          ? x + (overlay.width || 0) 
          : x;
      
      ctx.fillText(overlay.text, textX, y);

      // Draw selection box
      if (isSelected && isCanvasEditing) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#4a6eb5';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const metrics = ctx.measureText(overlay.text);
        const boxWidth = overlay.width || metrics.width + 20;
        const boxHeight = overlay.height || overlay.fontSize * 1.5;
        
        ctx.strokeRect(x - 10, y - 5, boxWidth, boxHeight);

        // Draw resize handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#4a6eb5';
        const handleSize = 8;
        
        // Corners
        const corners = [
          { x: x - 10 - handleSize/2, y: y - 5 - handleSize/2 },
          { x: x - 10 + boxWidth - handleSize/2, y: y - 5 - handleSize/2 },
          { x: x - 10 - handleSize/2, y: y - 5 + boxHeight - handleSize/2 },
          { x: x - 10 + boxWidth - handleSize/2, y: y - 5 + boxHeight - handleSize/2 },
        ];
        
        corners.forEach((corner) => {
          ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
        });
      }

      ctx.globalAlpha = 1;
    });
  }, [getVisibleOverlays, selectedOverlayId, isCanvasEditing]);

  // Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // Get overlay at position
  const getOverlayAtPosition = useCallback((clientX: number, clientY: number): TextOverlay | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const visibleOverlays = getVisibleOverlays();
    
    // Check in reverse order (top-most first)
    for (let i = visibleOverlays.length - 1; i >= 0; i--) {
      const overlay = visibleOverlays[i];
      const overlayX = (overlay.x / 100) * canvas.width;
      const overlayY = (overlay.y / 100) * canvas.height;
      const width = overlay.width || 200;
      const height = overlay.height || overlay.fontSize * 1.5;

      if (
        x >= overlayX - 10 &&
        x <= overlayX + width + 10 &&
        y >= overlayY - 5 &&
        y <= overlayY + height + 5
      ) {
        return overlay;
      }
    }

    return null;
  }, [getVisibleOverlays]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isCanvasEditing) {
      setCanvasEditing(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const overlay = getOverlayAtPosition(e.clientX, e.clientY);
    
    if (overlay) {
      selectTextOverlay(overlay.id);
      
      const overlayX = (overlay.x / 100) * canvas.width;
      const overlayY = (overlay.y / 100) * canvas.height;
      
      setDragging({
        id: overlay.id,
        offsetX: x - overlayX,
        offsetY: y - overlayY,
      });
    } else {
      selectTextOverlay(null);
    }
  }, [isCanvasEditing, setCanvasEditing, getOverlayAtPosition, selectTextOverlay]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for hover even when not dragging
    if (!dragging) {
      const overlay = getOverlayAtPosition(e.clientX, e.clientY);
      setHoveredOverlay(overlay);
      canvas.style.cursor = overlay ? 'move' : 'default';
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top - dragging.offsetY;

    // Convert to percentage
    const xPercent = Math.max(0, Math.min(90, (x / canvas.width) * 100));
    const yPercent = Math.max(0, Math.min(90, (y / canvas.height) * 100));

    updateTextOverlay(dragging.id, { x: xPercent, y: yPercent });
  }, [dragging, updateTextOverlay]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setResizing(null);
  }, []);

  // Handle double click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const overlay = getOverlayAtPosition(e.clientX, e.clientY);
    if (overlay) {
      const newText = window.prompt('Edit text:', overlay.text);
      if (newText !== null) {
        updateTextOverlay(overlay.id, { text: newText });
      }
    }
  }, [getOverlayAtPosition, updateTextOverlay]);

  // Handle keyboard for selected overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedOverlayId || !isCanvasEditing) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const step = e.shiftKey ? 10 : 1;
      const overlay = textOverlays.find((o) => o.id === selectedOverlayId);
      if (!overlay) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          updateTextOverlay(selectedOverlayId, { x: Math.max(0, overlay.x - step) });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateTextOverlay(selectedOverlayId, { x: Math.min(90, overlay.x + step) });
          break;
        case 'ArrowUp':
          e.preventDefault();
          updateTextOverlay(selectedOverlayId, { y: Math.max(0, overlay.y - step) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateTextOverlay(selectedOverlayId, { y: Math.min(90, overlay.y + step) });
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          // Handled in parent component
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOverlayId, isCanvasEditing, textOverlays, updateTextOverlay]);

  return (
    <div
      ref={containerRef}
      className={`canvas-container ${isCanvasEditing ? 'editing' : ''}`}
      onClick={() => !isCanvasEditing && setCanvasEditing(true)}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredOverlay(null);
        }}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Hover tooltip */}
      {hoveredOverlay && !dragging && (
        <div 
          className="absolute z-50 px-3 py-2 bg-gray-900/95 rounded-lg shadow-xl border border-gray-700 text-xs text-white whitespace-nowrap pointer-events-none"
          style={{
            left: `${hoveredOverlay.x}%`,
            top: `${Math.max(0, hoveredOverlay.y - 10)}%`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="font-medium text-titan-light mb-1">"{hoveredOverlay.text}"</div>
          <div className="text-gray-400 space-y-0.5">
            <div>📍 Drag to move • Double-click to edit</div>
            <div>🔤 Font: {hoveredOverlay.fontFamily}</div>
            <div>📐 Size: {hoveredOverlay.fontSize}px</div>
          </div>
        </div>
      )}
      
      {/* Edit mode indicator */}
      {isCanvasEditing && textOverlays.length > 0 && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-titan-navy/80 rounded text-xs text-titan-light">
          ✓ Text layers active - Drag to move, double-click to edit
        </div>
      )}
    </div>
  );
}

