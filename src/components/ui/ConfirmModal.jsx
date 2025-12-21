import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Modal de confirmación elegante y reutilizable
 * @param {boolean} isOpen - Estado de apertura del modal
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onConfirm - Función a ejecutar al confirmar
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje descriptivo
 * @param {ReactNode} icon - Icono a mostrar (opcional)
 * @param {string} confirmText - Texto del botón confirmar (default: "Confirmar")
 * @param {string} cancelText - Texto del botón cancelar (default: "Cancelar")
 * @param {string} confirmColor - Color del botón: 'red' | 'green' | 'blue' | 'yellow' (default: 'blue')
 * @param {boolean} isDangerous - Si es una acción peligrosa (default: false)
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    icon,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmColor = 'blue',
    isDangerous = false
}) => {
    if (!isOpen) return null;

    // Colores según tipo de acción
    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    };

    const iconColorClasses = {
        red: 'text-red-600',
        green: 'text-green-600',
        blue: 'text-blue-600',
        yellow: 'text-yellow-600'
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Cerrar con ESC
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header con icono y close */}
                <div className="relative p-6 pb-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Cerrar"
                    >
                        <FaTimes size={20} />
                    </button>

                    {/* Icono */}
                    {icon && (
                        <div className={`flex justify-center mb-4 ${iconColorClasses[confirmColor]}`}>
                            <div className="text-5xl">
                                {icon}
                            </div>
                        </div>
                    )}

                    {/* Título */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                        {title}
                    </h3>

                    {/* Mensaje */}
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer con botones */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${colorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
