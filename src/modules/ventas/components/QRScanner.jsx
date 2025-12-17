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
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">Escanear Código QR</h3>
                <button
                    onClick={() => {
                        stopCamera();
                        onClose();
                    }}
                    className="p-2 hover:bg-gray-800 rounded-full transition"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 flex items-center justify-center relative">
                <video
                    ref={videoRef}
                    className="max-w-full max-h-full"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay con guía de escaneo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-4 border-indigo-500 rounded-lg shadow-lg"></div>
                </div>

                {error && (
                    <div className="absolute bottom-8 left-4 right-4 bg-red-500 text-white p-4 rounded-lg text-center">
                        {error}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-gray-900 text-white p-4 text-center">
                <p className="text-sm">Coloca el código QR dentro del marco</p>
            </div>
        </div>
    );
};

export default QRScanner;
