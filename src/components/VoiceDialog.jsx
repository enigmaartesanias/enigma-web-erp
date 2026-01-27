// src/components/VoiceDialog.jsx
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceOrder } from '../voice/useVoiceOrder';

export default function VoiceDialog({ onConfirm, onPartialUpdate, formData, productoActual, focusedField }) {
    const { isListening, status, mensaje, transcriptActual, iniciar, detener, currentData } = useVoiceOrder(onConfirm);
    const lastDataSent = React.useRef("");

    const handleStart = () => {
        iniciar(formData, productoActual, focusedField);
    };

    React.useEffect(() => {
        if (onPartialUpdate && currentData) {
            const currentStr = JSON.stringify(currentData);
            if (lastDataSent.current !== currentStr) {
                onPartialUpdate(currentData);
                lastDataSent.current = currentStr;
            }
        }
    }, [currentData, onPartialUpdate]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Botón 🎤 */}
            <button
                onClick={isListening ? detener : handleStart}
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
            {status !== 'idle' && (
                <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-2xl p-4 w-80 border-2 border-blue-100">
                    {/* Status */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            {status === 'listening' ? (
                                <>
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Escuchando...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                        Procesando...
                                    </span>
                                </>
                            )}
                        </div>
                        <span className="text-[8px] text-gray-400 font-medium">📱 Pantalla activa</span>
                    </div>

                    {/* Mensaje del sistema (Pregunta actual) */}
                    <div className="text-sm text-gray-700 font-medium mb-4 min-h-[40px] text-center px-2">
                        {mensaje}
                        {(mensaje.includes('Detalles') || mensaje.includes('Dirección')) && (
                            <div className="text-[10px] text-purple-600 mt-1 font-bold animate-pulse">
                                ✨ MODO DICTADO ACTIVO (45s)
                            </div>
                        )}
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
                    {status === 'completed_phase_1' && ( // Nota: Ajustado por si se usa este status, aunque ahora es un mensaje de voz
                        <div className="text-sm text-green-600 font-semibold flex items-center gap-2 bg-green-50 p-2 rounded border border-green-100 mb-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Datos personales ingresados
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

                    {/* Comando de cierre rápido */}
                    <div className="mt-4 text-[9px] text-gray-400 text-center italic border-t pt-2">
                        Tip: Di "Listo", "Terminé" o "Fin" para cerrar
                    </div>

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
