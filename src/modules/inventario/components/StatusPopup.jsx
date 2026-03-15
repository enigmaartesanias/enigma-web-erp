import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Hammer, ClipboardList } from 'lucide-react';
import { pedidosDB } from '../../../utils/pedidosNeonClient';

export default function StatusPopup() {
    const [visible, setVisible] = useState(false);
    const [counts, setCounts] = useState({ pending: 0, production: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const pedidos = await pedidosDB.getAll();

            const pendingCount = pedidos.filter(p =>
                p.estado_pedido !== 'entregado' &&
                p.estado_produccion !== 'terminado' &&
                p.estado_produccion !== 'en_proceso' &&
                p.estado_pedido !== 'cancelado'
            ).length;

            const productionCount = pedidos.filter(p =>
                p.estado_produccion === 'en_proceso' &&
                p.estado_pedido !== 'entregado'
            ).length;

            setCounts({ pending: pendingCount, production: productionCount });

            // Mostrar solo si hay algo pendiente y NO ha sido visto en esta sesión
            const yaVisto = sessionStorage.getItem('resumen_operativo_visto') === 'true';
            
            if (!yaVisto && (pendingCount > 0 || productionCount > 0)) {
                // Pequeño delay para una entrada más elegante
                setTimeout(() => setVisible(true), 800);
            }
        } catch (error) {
            console.error('Error fetching status for popup:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setVisible(false);
        sessionStorage.setItem('resumen_operativo_visto', 'true');
    };

    if (!visible || loading) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[100] animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-sm overflow-hidden animate-scaleIn border border-gray-100/50">
                {/* Header Zen */}
                <div className="bg-white px-6 py-5 flex justify-between items-center border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <h3 className="text-gray-900 text-[11px] font-black uppercase tracking-[0.3em]">Resumen Operativo</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-300 hover:text-gray-600 transition-colors bg-gray-50 p-1.5 rounded-full"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-3">
                    {/* Sección Pedidos Pendientes */}
                    {counts.pending > 0 && (
                        <Link
                            to="/admin/pedidos"
                            onClick={handleClose}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-sm transition-transform group-hover:scale-110">
                                <ClipboardList size={20} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="text-gray-800 font-bold text-sm">Pendientes</h4>
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">{counts.pending}</span>
                                </div>
                                <p className="text-gray-400 text-[11px] leading-tight font-normal">Órdenes esperando inicio de fabricación.</p>
                            </div>
                        </Link>
                    )}

                    {/* Sección En Producción */}
                    {counts.production > 0 && (
                        <Link
                            to="/produccion"
                            onClick={handleClose}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-sm transition-transform group-hover:scale-110">
                                <Hammer size={20} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="text-gray-800 font-bold text-sm">En Proceso</h4>
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">{counts.production}</span>
                                </div>
                                <p className="text-gray-400 text-[11px] leading-tight font-normal">Órdenes actualmente en el taller.</p>
                            </div>
                        </Link>
                    )}

                    <div className="pt-3">
                        <button
                            onClick={handleClose}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                        >
                            Confirmar lectura
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
