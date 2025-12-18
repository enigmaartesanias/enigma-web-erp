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

                {/* Footer con botones */}
                <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                    <button
                        onClick={handleDescargar}
                        className="w-full bg-green-700 text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-green-800 transition flex justify-center items-center gap-2"
                    >
                        <FaDownload size={18} />
                        <span>Descargar JPG</span>
                    </button>
                    <button
                        onClick={handleCompartirWhatsApp}
                        className="w-full bg-green-500 text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-green-600 transition flex justify-center items-center gap-2"
                    >
                        <FaWhatsapp size={20} />
                        <span>Compartir por WhatsApp</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-300 text-gray-700 py-3.5 rounded-lg font-semibold text-base hover:bg-gray-400 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotaVentaModal;
