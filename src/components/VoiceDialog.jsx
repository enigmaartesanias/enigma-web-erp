// src/components/VoiceDialog.jsx
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceOrder } from '../voice/useVoiceOrder';

export default function VoiceDialog({ onConfirm }) {
    const { isListening, status, mensaje, transcriptActual, iniciar, detener } = useVoiceOrder(onConfirm);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Botón 🎤 */}
            <button
                onClick={isListening ? detener : iniciar}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                title={isListening ? 'Detener pedido por voz' : 'Iniciar pedido por voz'}
            >
                {isListening ? (
                    <MicOff className="w-8 h-8 text-white" />
                ) : (
                    <Mic className="w-8 h-8 text-white" />
                )}
            </button>

            {/* Panel minimalista */}
            {isListening && (
                <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-2xl p-4 w-80 border-2 border-blue-100">
                    {/* Status */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Escuchando...
                        </span>
                    </div>

                    {/* Mensaje del sistema */}
                    <div className="text-sm text-gray-800 font-medium mb-3 min-h-[40px]">
                        {mensaje}
                    </div>

                    {/* Transcripción actual - MÁS PROMINENTE */}
                    {transcriptActual && (
                        <div className="text-sm font-medium text-gray-800 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-xs text-blue-600 block mb-1">Escuché:</span>
                            "{transcriptActual}"
                        </div>
                    )}

                    {/* Indicador de estado */}
                    {status === 'listening' && mensaje.includes('registrado') && (
                        <div className="text-xs text-green-700 flex items-center gap-1 bg-green-50 p-2 rounded border border-green-100 mb-2">
                            <span className="animate-pulse">●</span>
                            {mensaje}
                        </div>
                    )}

                    {/* Sugerencia de comandos según contexto */}
                    {mensaje.includes('Agregar otro') && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mt-1 text-center font-medium">
                            💡 Di: "Sí" / "Agregar" o "No" / "Terminar"
                        </div>
                    )}
                    {mensaje.includes('Precio') && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mt-1 text-center font-medium">
                            💡 Di solo el número (ej: "120")
                        </div>
                    )}
                    {status === 'completed' && (
                        <div className="text-sm text-blue-600 font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Pedido completado
                        </div>
                    )}

                    {/* Botón de cancelar */}
                    <button
                        onClick={detener}
                        className="mt-3 w-full text-xs text-gray-500 hover:text-red-600 transition-colors py-2 border border-gray-200 rounded hover:border-red-300"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
}
