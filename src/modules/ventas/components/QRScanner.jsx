import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import jsQR from 'jsqr';

const QRScanner = ({ isOpen, onClose, onScan }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const streamRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Cámara trasera en móviles
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                videoRef.current.play();
                setScanning(true);
                scanQRCode();
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const scanQRCode = () => {
        if (!scanning || !videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                onScan(code.data);
                stopCamera();
                onClose();
                return;
            }
        }

        requestAnimationFrame(scanQRCode);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-fade-in backdrop-blur-sm">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-md text-white p-5 flex justify-between items-center border-b border-white/10">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Escáner de Productos</h3>
                    <p className="text-xs text-gray-400">Apunta la cámara al código QR físico</p>
                </div>
                <button
                    onClick={() => {
                        stopCamera();
                        onClose();
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-95"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover opacity-80"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay con guía de escaneo Premium */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="relative">
                        {/* El Cuadrado de Escaneo */}
                        <div className="w-72 h-72 border-2 border-white/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 border-[3px] border-blue-500 rounded-3xl animate-pulse-slow"></div>

                            {/* Esquinas Brillantes */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>

                            {/* Línea de Escaneo Láser Anidada */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-scan-line"></div>
                        </div>
                    </div>

                    <div className="mt-8 px-6 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full backdrop-blur-md">
                        <span className="text-blue-100 text-sm font-medium animate-pulse">Buscando código QR...</span>
                    </div>
                </div>

                {error && (
                    <div className="absolute bottom-10 left-6 right-6 bg-red-500/90 backdrop-blur-md text-white p-4 rounded-2xl text-center shadow-xl border border-red-400/30">
                        <p className="text-sm font-bold uppercase tracking-wider mb-1">Error de Cámara</p>
                        <p className="text-xs opacity-90">{error}</p>
                    </div>
                )}
            </div>

            {/* Bottom Panel */}
            <div className="bg-black p-8 text-center border-t border-white/5">
                <p className="text-gray-400 text-sm">Asegúrate de tener buena iluminación</p>
            </div>
        </div>
    );
};

export default QRScanner;
