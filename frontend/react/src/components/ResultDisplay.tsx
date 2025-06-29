interface ResultDisplayProps {
  result: string | null;
  isLoading: boolean;
  onSendDrawing: () => void;
}

export function ResultDisplay({ 
  result, 
  isLoading, 
  onSendDrawing 
}: ResultDisplayProps) {
  return (
    <div className="p-5 bg-gray-50 rounded-lg min-h-[200px] flex flex-col gap-4">
      <div>
        <button
          onClick={onSendDrawing}
          disabled={isLoading}
          className={`
            px-6 py-3 text-white border-none rounded-md text-base font-bold w-full
            transition-all duration-200
            ${isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 cursor-pointer'
            }
          `}
        >
          {isLoading ? '🤔 Analizando...' : '🎯 ¿Qué es mi dibujo?'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-md border border-gray-300 min-h-[120px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="m-0 text-gray-500 text-sm">
              Enviando al backend...
            </p>
          </div>
        ) : result ? (
          <div className="text-center">
            <h3 className="m-0 mb-3 text-green-600 text-lg font-semibold">
              🎉 Resultado:
            </h3>
            <p className="m-0 text-base text-gray-800 font-bold">
              {result}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="m-0 mb-3 text-base">
              🎨 Dibuja algo y descubre qué es
            </p>
            <p className="m-0 text-sm">
              Haz clic en el botón de arriba para enviar tu dibujo al backend
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
