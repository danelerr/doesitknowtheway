import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DrawingSettings, Point } from '../types/drawing';

interface DrawingCanvasProps {
  settings: DrawingSettings;
  onImageChange: (imageData: string) => void;
  onClearCanvas: () => void;
  onSettingsChange: (settings: Partial<DrawingSettings>) => void;
  className?: string;
}

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red  
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#A52A2A', // Brown
];

const LINE_WIDTHS = [2, 5, 10, 15];

export function DrawingCanvas({ 
  settings, 
  onImageChange, 
  onClearCanvas, 
  onSettingsChange,
  className = ''
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<Point>({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up canvas size based on container
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxWidth = Math.min(rect.width - 40, 800); // 40px for padding
      const maxHeight = Math.min(window.innerHeight * 0.6, 600);
      
      // Maintain aspect ratio
      const aspectRatio = 4 / 3;
      let width = maxWidth;
      let height = width / aspectRatio;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      setCanvasSize({ width, height });
      
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = settings.color;
        context.lineWidth = settings.lineWidth;
        
        // Set white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        
        contextRef.current = context;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [settings.color, settings.lineWidth]);

  // Update canvas settings when they change
  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;

    context.globalCompositeOperation = settings.isErasing ? 'destination-out' : 'source-over';
    context.strokeStyle = settings.isErasing ? 'rgba(255,255,255,1)' : settings.color;
    context.lineWidth = settings.lineWidth;
  }, [settings]);

  const getCoordinates = useCallback((event: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const coords = getCoordinates(event);
    setLastPosition(coords);
    setIsDrawing(true);
  }, [getCoordinates]);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();

    const context = contextRef.current;
    if (!context) return;

    const currentPosition = getCoordinates(event);
    
    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();

    setLastPosition(currentPosition);
  }, [isDrawing, lastPosition, getCoordinates]);

  const stopDrawing = useCallback((event?: React.MouseEvent | React.TouchEvent) => {
    if (event) event.preventDefault();
    setIsDrawing(false);
    
    // Notify parent component of image change
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      onImageChange(imageData);
    }
  }, [onImageChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    const imageData = canvas.toDataURL('image/png');
    onImageChange(imageData);
    onClearCanvas();
  }, [canvasSize, onImageChange, onClearCanvas]);

  return (
    <div ref={containerRef} className={`flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl shadow-lg max-w-full mx-auto ${className}`}>
      {/* Top Controls - Thickness and Eraser */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-xl shadow-sm">
        <div className="flex gap-2" role="group" aria-label="Controles de grosor">
          {LINE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => onSettingsChange({ lineWidth: width })}
              className={`flex items-center justify-center w-10 h-10 border-2 rounded-lg transition-all duration-200 hover:border-blue-500 hover:-translate-y-0.5 ${
                settings.lineWidth === width 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              aria-label={`Grosor ${width}px`}
              title={`Grosor ${width}px`}
            >
              <div 
                className="rounded-full transition-all duration-200" 
                style={{ 
                  width: `${Math.min(width, 16)}px`, 
                  height: `${Math.min(width, 16)}px`,
                  backgroundColor: settings.color,
                }} 
              />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={() => onSettingsChange({ isErasing: !settings.isErasing })}
          className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-200 hover:-translate-y-0.5 ${
            settings.isErasing 
              ? 'border-red-500 bg-red-50 text-red-600' 
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
          aria-label={settings.isErasing ? 'Desactivar borrador' : 'Activar borrador'}
          title={settings.isErasing ? 'Desactivar borrador' : 'Activar borrador'}
        >
          {settings.isErasing ? '🧽' : '✏️'}
        </button>
      </div>

      <div className="flex gap-4 w-full">
        {/* Left Controls - Colors */}
        <div className="flex flex-col gap-2 items-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Colores</h3>
          <div className="flex flex-col gap-2" role="group" aria-label="Selector de colores">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onSettingsChange({ color, isErasing: false })}
                className={`w-8 h-8 rounded-full border-3 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                  settings.color === color && !settings.isErasing
                    ? 'border-blue-500 scale-110 ring-2 ring-blue-400' 
                    : 'border-white'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
                title={`Color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border-3 border-gray-300 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl touch-none"
            style={{ cursor: settings.isErasing ? 'grab' : 'crosshair' }}
          />
        </div>
      </div>

      {/* Bottom Controls - Clear */}
      <div className="flex justify-center">
        <button
          onClick={clearCanvas}
          className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          aria-label="Limpiar canvas"
          title="Limpiar canvas"
        >
          🗑️ Limpiar
        </button>
      </div>
    </div>
  );
}
