import { useState, useCallback } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ResultDisplay } from './components/ResultDisplay';
import type { DrawingSettings } from './types/drawing';
import { API_CONFIG } from './config/api';
import './App.css';

export function App() {
  const [settings, setSettings] = useState<DrawingSettings>({
    color: '#000000',
    lineWidth: 5,
    tool: { name: 'Pincel Normal', cursor: 'crosshair' },
    isErasing: false
  });

  const [currentImage, setCurrentImage] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingsChange = useCallback((newSettings: Partial<DrawingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleImageChange = useCallback((imageData: string) => {
    setCurrentImage(imageData);
  }, []);

  const handleClearCanvas = useCallback(() => {
    setResult(null);
  }, []);

  const sendDrawingToBackend = useCallback(async () => {
    if (!currentImage) {
      alert('Por favor, dibuja algo primero');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Convert base64 to blob
      const response = await fetch(currentImage);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'drawing.png');

      // Send to backend
      const backendResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.guessDraw}`, {
        method: 'POST',
        body: formData,
      });

      if (!backendResponse.ok) {
        throw new Error(`Error: ${backendResponse.status}`);
      }

      const data = await backendResponse.json();
      setResult(data.description || 'Resultado no disponible');
    } catch (error) {
      console.error('Error enviando al backend:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentImage]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      <header className="text-center py-5 px-4 bg-white/10 backdrop-blur-sm text-white border-b border-white/20">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 text-shadow-lg">
          🎨 Drawing Guesser
        </h1>
        <p className="text-sm md:text-base opacity-90 font-light">
          Dibuja algo y deja que la IA adivine qué es
        </p>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-5 md:gap-8 p-5 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex-1 md:flex-[2] flex justify-center items-center">
          <DrawingCanvas
            settings={settings}
            onImageChange={handleImageChange}
            onClearCanvas={handleClearCanvas}
            onSettingsChange={handleSettingsChange}
            className="animate-fade-in"
          />
        </div>

        <div className="w-full md:w-80 lg:w-96">
          <ResultDisplay
            result={result}
            isLoading={isLoading}
            onSendDrawing={sendDrawingToBackend}
          />
        </div>
      </main>

      <footer className="text-center py-4 px-4 bg-white/10 backdrop-blur-sm text-white border-t border-white/20">
        <p className="text-xs opacity-80">
          Proyecto BWA - Frontend con React + Vite
        </p>
      </footer>
    </div>
  );
}

export default App
