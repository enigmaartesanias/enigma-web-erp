import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

export default function SubtleAlert({ message }) {
    const [visible, setVisible] = useState(true);

    if (!visible || !message) return null;

    // Determinar si es alerta de atrasados o pendientes
    const esAtrasado = message.includes('vencida');
    const colorClass = esAtrasado
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-orange-50 border-orange-200 text-orange-800';
    const iconColor = esAtrasado ? 'text-red-500' : 'text-orange-500';
    const buttonColor = esAtrasado
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-orange-600 hover:bg-orange-700';

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className={`relative max-w-md w-full rounded-lg border-2 shadow-2xl p-6 ${colorClass} animate-scaleIn`}>
                {/* Botón cerrar */}
                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-3 right-3 p-1 rounded hover:bg-black/10 transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icono y mensaje */}
                <div className="flex items-start gap-4 mb-6">
                    <div className={`flex-shrink-0 ${iconColor}`}>
                        <AlertCircle className="w-8 h-8" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">
                            {esAtrasado ? 'Pedidos Vencidos' : 'Pedidos Pendientes'}
                        </h3>
                        <p className="text-sm font-medium">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                    <Link
                        to="/admin/pedidos"
                        className={`flex-1 ${buttonColor} text-white px-4 py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-md`}
                        onClick={() => setVisible(false)}
                    >
                        Ver Pedidos
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => setVisible(false)}
                        className="px-4 py-2.5 bg-white/80 hover:bg-white text-gray-700 rounded font-medium text-sm transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
