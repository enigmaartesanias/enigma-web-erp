// src/voice/DictationTextarea.jsx
import React from "react";
import { X } from 'lucide-react';

/**
 * Componente de visualización para campos de texto con dictado.
 * El dictado real lo maneja el VoiceDialog global.
 */
export default function DictationTextarea({
    value,
    onChange,
    onFocus,
    isListening = false,
    interimText = "",
    placeholder = "Dicta el detalle...",
    id = "dictation-textarea",
    name = "dictation",
    required = false,
    rows = 4
}) {
    return (
        <div className="relative group w-full">
            <textarea
                id={id}
                name={name}
                rows={rows}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                placeholder={placeholder}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 outline-none pr-12
          ${isListening
                        ? 'border-indigo-400 ring-4 ring-indigo-50 bg-indigo-50/10 animate-pulse-indigo'
                        : 'border-gray-200 focus:border-blue-400 bg-white'}`}
            />

            {/* Indicador de "Escuchando" con ondas */}
            {isListening && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] text-indigo-500 font-bold animate-pulse hidden sm:block">
                        Dictado persistente activo
                    </span>
                </div>
            )}

            {/* Texto interino (lo que se está escuchando en el momento) */}
            {isListening && interimText && (
                <div className="absolute bottom-4 left-4 right-12 bg-indigo-600/90 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 z-10">
                    <span className="font-bold opacity-70 italic mr-1 text-[10px] uppercase">Oigo:</span>
                    "{interimText}"
                </div>
            )}

            {value && !isListening && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute bottom-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    title="Limpiar texto"
                >
                    <X size={16} />
                </button>
            )}

            {isListening && (
                <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-progress-indefinite"></div>
                </div>
            )}

            <style jsx>{`
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); width: 30%; }
          100% { transform: translateX(333%); width: 30%; }
        }
        @keyframes pulse-indigo {
          0%, 100% { border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { border-color: rgba(99, 102, 241, 1); box-shadow: 0 0 0 8px rgba(99, 102, 241, 0.1); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s linear infinite;
        }
        .animate-pulse-indigo {
          animation: pulse-indigo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </div>
    );
}
