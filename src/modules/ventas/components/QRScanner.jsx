import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
        let mountTimeout;
        if (isOpen) {
            setError('');
            setIsCameraReady(false);
            isScanningRef.current = true;
            // Un pequeño retraso para asegurar que React haya montado el Ref en el DOM
            mountTimeout = setTimeout(() => {
                startCamera();
            }, 150);
        } else {
            isScanningRef.current = false;
            stopCamera();
        }

        return () => {
            isScanningRef.current = false;
            if (mountTimeout) clearTimeout(mountTimeout);
            stopCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const isNotSecure = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost';
                if (isNotSecure) {
                    setError('Acceso denegado: La cámara requiere una conexión segura (HTTPS).');
                } else {
                    setError('Tu navegador no soporta el acceso a la cámara.');
                }
                return;
            }

            if (!videoRef.current) return;

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            let stream = null;
            const constraintOptions = [
                { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
                { video: { facingMode: 'environment' } },
                { video: true }
            ];

            let lastError = null;
            for (const constraints of constraintOptions) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                    if (stream) break;
                } catch (e) {
                    lastError = e;
                }
            }

            if (!stream) {
                throw lastError || new Error("No se pudo acceder a ninguna cámara.");
            }
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraReady(true);
                
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play()
                            .then(() => scanQRCode())
                            .catch(e => {
                                console.warn("Auto-play blocked:", e);
                                scanQRCode();
                            });
                    }
                };
            }

        } catch (err) {
            console.error('Error final de cámara:', err);
            handleCameraError(err);
        }
    };

    const handleCameraError = (err) => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Permiso denegado. Revisa los ajustes de Cámara en Chrome.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError('No se detectó cámara.');
        } else {
            setError(`Error: ${err.message || 'No se pudo abrir la cámara'}`);
        }
    };

    const stopCamera = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsCameraReady(false);
    };

    const scanQRCode = () => {
        if (!isScanningRef.current || !videoRef.current || !canvasRef.current || !streamRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        
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
            onScan(code.data);
            isScanningRef.current = false;
            stopCamera();
            onClose();
            return;
        }

        requestRef.current = requestAnimationFrame(scanQRCode);
    };

    if (!isOpen) return null;

    return createPortal(
        <div 
            id="qr-scanner-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000000',
                zIndex: 2147483647,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                height: '100%'
            }}
        >
            {/* Header */}
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                color: 'white',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaCamera color="#60a5fa" size={20} />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Escáner Enigma</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Apunta al código QR</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        isScanningRef.current = false;
                        stopCamera();
                        onClose();
                    }}
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '9999px',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <FaTimes size={18} />
                </button>
            </div>

            {/* Camera View Container */}
            <div 
                style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: 'black' }}
                onClick={() => {
                    if (videoRef.current) videoRef.current.play().catch(() => {});
                }}
            >
                <video
                    ref={videoRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    playsInline
                    muted
                    autoPlay
                />
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {!error && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '260px',
                                height: '260px',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '32px', height: '32px', borderTop: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderRadius: '16px 0 0 0' }}></div>
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '32px', height: '32px', borderTop: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderRadius: '0 16px 0 0' }}></div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '32px', borderBottom: '4px solid #3b82f6', borderLeft: '4px solid #3b82f6', borderRadius: '0 0 0 16px' }}></div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderBottom: '4px solid #3b82f6', borderRight: '4px solid #3b82f6', borderRadius: '0 0 16px 0' }}></div>
                                
                                <div className="animate-scan-line" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', backgroundColor: 'rgba(59, 130, 246, 0.5)', boxShadow: '0 0 15px #3b82f6' }}></div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '32px',
                            padding: '8px 20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '9999px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <p style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em', margin: 0 }}>
                                BUSCANDO PRODUCTO...
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#111827',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px',
                        textAlign: 'center',
                        zIndex: 20
                    }}>
                        <FaTimes color="#ef4444" size={40} style={{ marginBottom: '16px' }} />
                        <h4 style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>Error de Cámara</h4>
                        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
                        <button
                            onClick={startCamera}
                            style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <FaSync style={{ marginRight: '8px' }} /> Reintentar
                        </button>
                    </div>
                )}
            </div>

            <div style={{ backgroundColor: 'black', padding: '16px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', zIndex: 10 }}>
                <p style={{ color: '#6b7280', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                    Enigma POS v2.3
                </p>
            </div>
        </div>,
        document.body
    );
};

export default QRScanner;
