import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comprasDB } from '../../../utils/comprasClient';
import { FaArrowLeft, FaChartLine, FaFilter, FaEye, FaTrash, FaTools, FaBox } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';

export default function ReporteCompras() {
    const navigate = useNavigate();
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [stats, setStats] = useState({
        total_compras: 0,
        total_materiales: 0,
        total_productos: 0,
        total_general: 0
    });

    // Modal de confirmación
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        icon: null,
        confirmText: '',
        confirmColor: 'blue',
        onConfirm: () => { }
    });

    // Modal de detalle
    const [detalleModal, setDetalleModal] = useState({
        isOpen: false,
        compra: null
    });

    useEffect(() => {
        loadCompras();
        loadStats();
    }, []);

    const loadCompras = async () => {
        try {
            setLoading(true);
            const data = await comprasDB.getWithProducts();
            setCompras(data);
        } catch (error) {
            console.error('Error cargando compras:', error);
            toast.error('Error al cargar compras');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await comprasDB.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    // Filtrar compras
    const comprasFiltradas = compras.filter(compra => {
        // Filtro por tipo
        if (filtroTipo !== 'TODOS' && compra.tipo_compra !== filtroTipo) {
            return false;
        }

        // Filtro por fechas
        const fechaCompra = new Date(compra.fecha_compra);
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;

        if (inicio && fechaCompra < inicio) return false;
        if (fin && fechaCompra > fin) return false;

        return true;
    });

    const handleVer = (compra) => {
        setDetalleModal({
            isOpen: true,
            compra: compra
        });
    };

    const handleEliminar = (compra) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Compra',
            message: `¿Estás seguro de eliminar la compra "${compra.codigo_compra}"?\n\nEsta acción no se puede deshacer.`,
            icon: <FaTrash />,
            confirmText: 'Sí, eliminar',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await comprasDB.delete(compra.id);
                    toast.success('Compra eliminada correctamente');
                    loadCompras();
                    loadStats();
                } catch (error) {
                    console.error('Error:', error);
                    toast.error('Error al eliminar compra');
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="flex items-center text-gray-600 hover:text-slate-700 transition-colors text-sm mb-3"
                    >
                        <FaArrowLeft className="mr-2" size={14} />
                        Volver al Panel
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-slate-700" />
                        Reporte de Compras
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Historial de materiales y productos adquiridos</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-slate-700">
                        <p className="text-xs text-gray-500 font-medium">Total Compras</p>
                        <p className="text-xl font-bold text-gray-900">{stats.total_compras || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
                        <p className="text-xs text-gray-500 font-medium">Materiales</p>
                        <p className="text-xl font-bold text-gray-900">S/ {Number(stats.total_materiales || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <p className="text-xs text-gray-500 font-medium">Productos</p>
                        <p className="text-xl font-bold text-gray-900">S/ {Number(stats.total_productos || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <p className="text-xs text-gray-500 font-medium">Total General</p>
                        <p className="text-xl font-bold text-gray-900">S/ {Number(stats.total_general || 0).toFixed(2)}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <FaFilter className="text-gray-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Filtros</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Tipo</label>
                            <select
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            >
                                <option value="TODOS">Todos</option>
                                <option value="MATERIAL">Materiales</option>
                                <option value="PRODUCTO">Productos</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setFiltroTipo('TODOS'); setFechaInicio(''); setFechaFin(''); }}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Compras Registradas ({comprasFiltradas.length})
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Cargando compras...</div>
                    ) : comprasFiltradas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No hay compras registradas.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Costo Unit.</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {comprasFiltradas.map((compra) => (
                                        <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-600">{compra.codigo_compra}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {new Date(compra.fecha_compra).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="px-4 py-3">
                                                {compra.tipo_compra === 'MATERIAL' ? (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                                        <FaTools className="mr-1" size={10} />
                                                        Material
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                                        <FaBox className="mr-1" size={10} />
                                                        Producto
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {compra.proveedor || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700 max-w-xs truncate">
                                                {compra.descripcion}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-gray-700">
                                                {Number(compra.cantidad).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-gray-700">
                                                S/ {Number(compra.costo_unitario).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                                                S/ {Number(compra.total).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <Tooltip text="Ver detalle">
                                                        <button
                                                            onClick={() => handleVer(compra)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Eliminar compra">
                                                        <button
                                                            onClick={() => handleEliminar(compra)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal de Detalle */}
                {detalleModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">Detalle de Compra</h3>
                                    <p className="text-sm text-gray-600">#{detalleModal.compra?.codigo_compra}</p>
                                </div>
                                <button
                                    onClick={() => setDetalleModal({ isOpen: false, compra: null })}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {detalleModal.compra && (
                                <div>
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Fecha:</p>
                                            <p className="font-medium">{new Date(detalleModal.compra.fecha_compra).toLocaleDateString('es-PE')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Tipo:</p>
                                            <p className="font-medium">{detalleModal.compra.tipo_compra}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Proveedor:</p>
                                            <p className="font-medium">{detalleModal.compra.proveedor || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Cantidad:</p>
                                            <p className="font-medium">{Number(detalleModal.compra.cantidad).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-500 text-sm">Descripción:</p>
                                        <p className="font-medium">{detalleModal.compra.descripcion}</p>
                                    </div>

                                    {detalleModal.compra.observaciones && (
                                        <div className="mb-4">
                                            <p className="text-gray-500 text-sm">Observaciones:</p>
                                            <p className="text-sm">{detalleModal.compra.observaciones}</p>
                                        </div>
                                    )}

                                    {detalleModal.compra.producto_nombre && (
                                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                                            <p className="text-sm font-semibold text-blue-800">Producto en Inventario</p>
                                            <p className="text-xs text-blue-700 mt-1">
                                                {detalleModal.compra.producto_nombre} ({detalleModal.compra.producto_codigo})
                                            </p>
                                        </div>
                                    )}

                                    <div className="border-t pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Costo Unitario:</span>
                                            <span>S/ {Number(detalleModal.compra.costo_unitario).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>S/ {Number(detalleModal.compra.total).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setDetalleModal({ isOpen: false, compra: null })}
                                        className="w-full mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Toaster */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: { fontSize: '14px', maxWidth: '300px', padding: '12px 16px' },
                        success: { iconTheme: { primary: '#10b981', secondary: 'white' }, style: { borderLeft: '4px solid #10b981' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: 'white' }, duration: 4000, style: { borderLeft: '4px solid #ef4444' } }
                    }}
                />

                {/* ConfirmModal */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    icon={confirmModal.icon}
                    confirmText={confirmModal.confirmText}
                    confirmColor={confirmModal.confirmColor}
                />
            </div>
        </div>
    );
}
