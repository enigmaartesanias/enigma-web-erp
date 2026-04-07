import React, { useRef } from 'react';
import { FaTimes, FaDownload, FaWhatsapp } from 'react-icons/fa';
import NotaVentaTemplate from './NotaVentaTemplate';
import html2canvas from 'html2canvas';

const NotaVentaModal = ({ isOpen, onClose, ventaData }) => {
    const notaRef = useRef(null);

    if (!isOpen) return null;

    const handleDescargar = async () => {
        if (!notaRef.current) return;

        try {
            const canvas = await html2canvas(notaRef.current, {
                backgroundColor: '#ffffff',
                scale: 2, // Mayor calidad
                logging: false
            });

            // Convertir a blob
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `nota-venta-${ventaData.numeroVenta}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error('Error al generar imagen:', error);
            alert('Error al generar la imagen');
        }
    };

    const handleCompartirWhatsApp = async () => {
        if (!notaRef.current) return;

        try {
            const canvas = await html2canvas(notaRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            canvas.toBlob((blob) => {
                const file = new File([blob], `nota-venta-${ventaData.numeroVenta}.jpg`, { type: 'image/jpeg' });

                // Intentar usar Web Share API si está disponible
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'Nota de Venta',
                        text: `Nota de Venta #${ventaData.numeroVenta} - Total: S/ ${ventaData.total.toFixed(2)}`
                    }).catch(err => console.log('Error al compartir:', err));
                } else {
                    // Fallback: abrir WhatsApp Web
                    const texto = encodeURIComponent(`Nota de Venta #${ventaData.numeroVenta}\nTotal: S/ ${ventaData.total.toFixed(2)}`);
                    window.open(`https://wa.me/?text=${texto}`, '_blank');
                    alert('La imagen se ha descargado. Compártela manualmente en WhatsApp.');
                    handleDescargar();
                }
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Error al compartir');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Previsualización de Nota</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Nota de Venta */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div ref={notaRef}>
                        <NotaVentaTemplate ventaData={ventaData} />
                    </div>
                </div>

                {/* Footer Minimalista - Solo Texto */}
                <div className="p-6 border-t border-gray-50 bg-white flex justify-end items-center gap-8">
                    <button
                        onClick={handleCompartirWhatsApp}
                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 transition-all flex items-center gap-2"
                    >
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        Compartir Nota
                    </button>

                    <button
                        onClick={onClose}
                        className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotaVentaModal;
