import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaCamera, FaSync } from 'react-icons/fa';
import jsQR from 'jsqr';

const QRScanner = ({ isOpen, onClose, onScan }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState('');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const streamRef = useRef(null);
    const isScanningRef = useRef(false);
    const requestRef = useRef(null);

    useEffect(() => {
        let timeoutId;
        if (isOpen) {
            setError('');
            setIsCameraReady(false);
            isScanningRef.current = true;
            // Pequeño delay para asegurar que el modal y el elemento video estén en el DOM
            timeoutId = setTimeout(() => {
                startCamera();
            }, 100);
        } else {
            isScanningRef.current = false;
            stopCamera();
        }

        return () => {
            isScanningRef.current = false;
            if (timeoutId) clearTimeout(timeoutId);
            stopCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            // 1. Validar soporte básico y HTTPS
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const isNotSecure = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost';
                if (isNotSecure) {
                    setError('Acceso denegado: La cámara requiere una conexión segura (HTTPS).');
                } else {
                    setError('Tu navegador no parece soportar el acceso a la cámara.');
                }
                return;
            }

            // Detener cualquier stream previo
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            // 2. Intentar obtener el stream con parámetros balanceados
            const constraints = {
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            console.log("Solicitando acceso a la cámara...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("Stream obtenido con éxito");
            
            if (videoRef.current) {
                // Asignar el stream
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                
                // Forzar carga y reproducción
                videoRef.current.setAttribute('playsinline', 'true'); // redundante pero seguro
                
                try {
                    // Esperar explícitamente a que el video esté listo
                    await new Promise((resolve) => {
                        if (videoRef.current.readyState >= 2) {
                            resolve();
                        } else {
                            videoRef.current.onloadeddata = resolve;
                        }
                    });

                    await videoRef.current.play();
                    console.log("Video reproduciendo");
                    setIsCameraReady(true);
                    scanQRCode();
                } catch (playErr) {
                    console.error("Error al reproducir video:", playErr);
                    // Si falla el auto-play, dar un mensaje amigable
                    setError("No se pudo iniciar el video automáticamente. Toca la pantalla para intentar.");
                }
            }
        } catch (err) {
            console.error('Error detallado al acceder a la cámara:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Permiso denegado. Por favor, permite el acceso a la cámara en los ajustes de tu navegador o del celular.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No se encontró ninguna cámara trasera compatible.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('La cámara está siendo usada por otra aplicación.');
            } else {
                setError(`Error de cámara: ${err.message || 'Error desconocido'}`);
            }
        }
    };

    const stopCamera = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            // Limpiar eventos para evitar fugas de memoria
            videoRef.current.onloadeddata = null;
            videoRef.current.onloadedmetadata = null;
        }
        
        setIsCameraReady(false);
    };

    const scanQRCode = () => {
        if (!isScanningRef.current || !videoRef.current || !canvasRef.current || !streamRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Evitar procesar si el video no tiene dimensiones aún
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            requestRef.current = requestAnimationFrame(scanQRCode);
            return;
        }

        const context = canvas.getContext('2d', { willReadFrequently: true });

        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
            console.log('Código QR detectado exitosamente');
            onScan(code.data);
            isScanningRef.current = false;
            stopCamera();
            onClose();
            return;
        }

        requestRef.current = requestAnimationFrame(scanQRCode);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-fade-in backdrop-blur-sm">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-md text-white p-5 flex justify-between items-center border-b border-white/10">
                <div>
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <FaCamera className="text-blue-400" />
                        Escáner de Productos
                    </h3>
                    <p className="text-xs text-gray-400">Apunta al código QR con la cámara trasera</p>
                </div>
                <button
                    onClick={() => {
                        isScanningRef.current = false;
                        stopCamera();
                        onClose();
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-95"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* Camera View */}
            <div 
                className="flex-1 flex items-center justify-center relative overflow-hidden bg-black cursor-pointer"
                onClick={() => {
                    if (!isCameraReady && !error && videoRef.current) {
                        videoRef.current.play()
                            .then(() => {
                                setIsCameraReady(true);
                                scanQRCode();
                            })
                            .catch(e => console.error("Manual play error:", e));
                    }
                }}
            >
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay con guía de escaneo Premium */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="relative">
                        {/* El Cuadrado de Escaneo */}
                        <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-white/20 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                            <div className="absolute inset-0 border-[3px] border-blue-500/50 rounded-3xl animate-pulse"></div>

                            {/* Esquinas Brillantes */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-3xl"></div>
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-3xl"></div>

                            {/* Línea de Escaneo Láser */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,1)] animate-scan-line"></div>
                        </div>
                    </div>

                    <div className="mt-10 px-6 py-2 bg-blue-600/30 border border-blue-500/40 rounded-full backdrop-blur-xl">
                        <span className="text-blue-100 text-sm font-semibold tracking-wide animate-pulse">
                            BUSCANDO CÓDIGO QR...
                        </span>
                    </div>
                </div>

                {/* Loading state */}
                {!isCameraReady && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4">
                        <div className="w-12 h-12 border-4 border-blue-400/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-blue-400 font-medium animate-pulse">Iniciando cámara...</p>
                    </div>
                )}

                {/* Error View */}
                {error && (
                    <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm z-50">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <FaTimes size={40} className="text-red-500" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Error de Cámara</h4>
                        <p className="text-gray-400 mb-8 max-w-xs">{error}</p>
                        <button
                            onClick={startCamera}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-900/40"
                        >
                            <FaSync /> Reintentar
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Panel */}
            <div className="bg-black/80 backdrop-blur-md p-6 text-center border-t border-white/5">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                    SISTEMA DE ESCANEO ENIGMA v2.0
                </p>
                <p className="text-gray-400 text-[10px] mt-1">
                    Asegúrate de tener buena iluminación y enfocar bien el código
                </p>
            </div>
        </div>
    );
};

export default QRScanner;

