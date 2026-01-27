// src/voice/DictationTextarea.jsx
import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Check, X } from 'lucide-react';

/**
 * Componente de dictado acumulativo para campos de texto largo.
 * Soluciona el problema de cortes inesperados de la Web Speech API.
 */
export default function DictationTextarea({
    value,
    onChange,
    onComplete,
    onFocus,
    placeholder = "Dicta el detalle...",
    id = "dictation-textarea",
    name = "dictation",
    required = false,
    rows = 4
}) {
    const recognitionRef = useRef(null);
    const [listening, setListening] = useState(false);
    const [interimText, setInterimText] = useState("");

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = "es-PE";
        recognition.continuous = false; // Manejamos la continuidad manualmente para evitar fallos del motor
        recognition.interimResults = true;

        recognition.onresult = (e) => {
            let currentInterim = "";
            let finalForThisResult = "";

            for (let i = e.resultIndex; i < e.results.length; ++i) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    finalForThisResult += transcript + " ";
                } else {
                    currentInterim += transcript;
                }
            }

            setInterimText(currentInterim);

            if (finalForThisResult) {
                const cleanedFinal = finalForThisResult.trim();

                // Comando de cierre por voz
                if (cleanedFinal.toLowerCase().includes("terminar detalle") ||
                    cleanedFinal.toLowerCase().includes("acabar detalle") ||
                    cleanedFinal.toLowerCase().includes("listo detalle")) {

                    // Limpiar el comando del texto final si se coló
                    const cleanText = cleanedFinal
                        .replace(/terminar detalle/gi, "")
                        .replace(/acabar detalle/gi, "")
                        .replace(/listo detalle/gi, "")
                        .trim();

                    if (cleanText) {
                        onChange(value ? `${value} ${cleanText}` : cleanText);
                    }
                    stop();
                    return;
                }

                onChange(value ? `${value} ${cleanedFinal}` : cleanedFinal);
            }
        };

        recognition.onend = () => {
            // Reinicio automático inmediato para dictado infinito/persistente
            if (listening) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Error reiniciando reconocimiento:", e);
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') setListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [listening, value, onChange]);

    const start = () => {
        if (!recognitionRef.current) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }
        setListening(true);
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Error al iniciar recognition:", e);
        }
    };

    const stop = () => {
        setListening(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setInterimText("");
        if (onComplete) onComplete();
    };

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
          ${listening
                        ? 'border-indigo-400 ring-4 ring-indigo-50 bg-indigo-50/10 animate-pulse-indigo'
                        : 'border-gray-200 focus:border-blue-400 bg-white'}`}
            />

            {/* Indicador de "Escuchando" con ondas */}
            {listening && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>
            )}

            {/* Texto interino (lo que se está escuchando en el momento) */}
            {listening && interimText && (
                <div className="absolute bottom-20 left-4 right-4 bg-indigo-600/90 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-bold opacity-70 italic mr-1 text-[10px] uppercase">Oigo:</span>
                    "{interimText}"
                </div>
            )}

            <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-2">
                    {!listening ? (
                        <button
                            type="button"
                            onClick={start}
                            className="group flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-indigo-100"
                        >
                            <Mic size={16} className="group-hover:animate-bounce" />
                            Dictar detalle
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={stop}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-red-100"
                        >
                            <MicOff size={16} />
                            Terminar dictado
                        </button>
                    )}

                    {listening && (
                        <span className="text-[10px] text-indigo-500 font-bold animate-pulse hidden sm:block">
                            Dicta libremente... Di "terminar detalle" para finalizar.
                        </span>
                    )}
                </div>

                {value && !listening && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Limpiar texto"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {listening && (
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
