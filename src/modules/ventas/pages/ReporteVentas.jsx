import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ventasDB } from '../../../utils/ventasClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { FaArrowLeft, FaCalendar, FaChartLine, FaDollarSign, FaFileInvoice, FaFilter, FaBan, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';

export default function ReporteVentas() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    // Estados para modales de gestión
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        icon: null,
        confirmText: '',
        confirmColor: 'blue',
        onConfirm: () => { }
    });

    const [anularModal, setAnularModal] = useState({
        isOpen: false,
        venta: null,
        motivo: ''
    });

    const [detalleModal, setDetalleModal] = useState({
        isOpen: false,
        venta: null
    });

    // Estado para pestañas
    const [activeTab, setActiveTab] = useState('VENTAS'); // 'VENTAS' o 'ANULADAS'

    useEffect(() => {
        loadVentas();
    }, []);

    const loadVentas = async () => {
        try {
            setLoading(true);
            const data = await ventasDB.getAll();
            setVentas(data);
        } catch (error) {
            console.error('Error cargando ventas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ver detalle de venta
    const handleVer = (venta) => {
        setDetalleModal({
            isOpen: true,
            venta: venta
        });
    };

    // Anular venta
    const handleAnular = (venta) => {
        setAnularModal({
            isOpen: true,
            venta: venta,
            motivo: ''
        });
    };

    // Confirmar anulación
    const confirmarAnulacion = async () => {
        if (!anularModal.motivo.trim()) {
            toast.warning('Debe especificar el motivo de anulación');
            return;
        }

        try {
            // Anular venta en la BD
            await ventasDB.anular(anularModal.venta.id, {
                motivo_anulacion: anularModal.motivo,
                fecha_anulacion: new Date().toISOString(),
                estado: 'ANULADA'
            });

            // Revertir inventario (aumentar stock de productos vendidos)
            const detalles = anularModal.venta.detalles || [];
            for (const item of detalles) {
                if (item.producto_id) {
                    await productosExternosDB.ajustarStock(item.producto_id, +item.cantidad);
                }
            }

            toast.success(`Venta anulada correctamente. Stock revertido.`, { duration: 4000 });
            setAnularModal({ isOpen: false, venta: null, motivo: '' });
            loadVentas();
        } catch (error) {
            console.error('Error al anular:', error);
            toast.error('Error al anular la venta');
        }
    };

    // Filtrar por fechas y pestaña activa
    const ventasFiltradas = ventas.filter(venta => {
        // Filtro por pestaña
        if (activeTab === 'VENTAS' && venta.estado === 'ANULADA') return false;
        if (activeTab === 'ANULADAS' && venta.estado !== 'ANULADA') return false;

        // Filtro por fechas
        const fechaVenta = new Date(venta.fecha_venta);
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;

        if (inicio && fechaVenta < inicio) return false;
        if (fin && fechaVenta > fin) return false;
        return true;
    });

    // Calcular estadísticas
    const stats = {
        totalVentas: ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0),
        totalIGV: ventasFiltradas.reduce((sum, v) => sum + Number(v.impuesto_monto), 0),
        cantidadVentas: ventasFiltradas.length,
        promedioVenta: ventasFiltradas.length > 0
            ? ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0) / ventasFiltradas.length
            : 0
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-3">
                        <button
                            onClick={() => navigate('/inventario-home')}
                            className="flex items-center text-gray-600 hover:text-slate-700 transition-colors text-sm"
                        >
                            <FaArrowLeft className="mr-2" size={14} />
                            Volver al Panel
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-slate-700" />
                        Reporte de Ventas
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Análisis y seguimiento de ventas realizadas</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Ventas</p>
                                <p className="text-base font-bold text-gray-900">S/ {stats.totalVentas.toFixed(2)}</p>
                            </div>
                            <FaDollarSign className="text-slate-700 text-2xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">IGV Acumulado</p>
                                <p className="text-base font-bold text-gray-900">S/ {stats.totalIGV.toFixed(2)}</p>
                            </div>
                            <FaFileInvoice className="text-blue-500 text-2xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Cantidad</p>
                                <p className="text-base font-bold text-gray-900">{stats.cantidadVentas}</p>
                            </div>
                            <div className="text-2xl opacity-50">📊</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Promedio</p>
                                <p className="text-base font-bold text-gray-900">S/ {stats.promedioVenta.toFixed(2)}</p>
                            </div>
                            <div className="text-2xl opacity-50">📈</div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FaFilter className="text-gray-500 text-xs" />
                        <h2 className="text-xs font-semibold text-gray-700">Filtrar por Fecha</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => { setFechaInicio(''); setFechaFin(''); }}
                        className="mt-2 w-full md:w-auto px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition"
                    >
                        Limpiar Filtros
                    </button>
                </div>

                {/* Pestañas */}
                <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('VENTAS')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'VENTAS'
                                ? 'bg-slate-700 text-white border-b-2 border-slate-700'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            📊 VENTAS
                        </button>
                        <button
                            onClick={() => setActiveTab('ANULADAS')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'ANULADAS'
                                ? 'bg-slate-700 text-white border-b-2 border-slate-700'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            🚫 ANULADAS
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700">Detalle de Ventas</h2>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Cargando ventas...</div>
                    ) : ventasFiltradas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No hay ventas registradas en este periodo.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">IGV</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                        <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ventasFiltradas.map((venta) => (
                                        <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 md:px-4 py-2 md:py-3">
                                                <span className="font-mono text-xs text-gray-600">{venta.codigo_venta}</span>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs text-gray-700">
                                                {new Date(venta.fecha_venta).toLocaleDateString('es-PE', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit'
                                                })}
                                            </td>
                                            <td className="hidden md:table-cell px-4 py-3 text-xs text-gray-700">{venta.cliente_nombre}</td>
                                            <td className="hidden md:table-cell px-4 py-3 text-right text-xs text-gray-700">S/ {Number(venta.subtotal).toFixed(2)}</td>
                                            <td className="hidden md:table-cell px-4 py-3 text-right text-xs text-blue-600">
                                                {Number(venta.impuesto_monto) > 0 ? `S/ ${Number(venta.impuesto_monto).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="hidden md:table-cell px-4 py-3 text-right text-xs text-red-500">
                                                {Number(venta.descuento_monto) > 0 ? `- S/ ${Number(venta.descuento_monto).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-bold text-slate-700">
                                                S/ {Number(venta.total).toFixed(2)}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-center">
                                                {venta.estado === 'ANULADA' ? (
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200">
                                                        Anulada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                                                        Activa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3">
                                                <div className="flex justify-center gap-1 md:gap-2">
                                                    <Tooltip text="Ver detalle">
                                                        <button
                                                            onClick={() => handleVer(venta)}
                                                            className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                            <FaEye size={14} />
                                                        </button>
                                                    </Tooltip>

                                                    {activeTab === 'VENTAS' && venta.estado !== 'ANULADA' && (
                                                        <Tooltip text="Anular venta">
                                                            <button
                                                                onClick={() => handleAnular(venta)}
                                                                className="p-1.5 md:p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                            >
                                                                <FaBan size={14} />
                                                            </button>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal de Anulación */}
                {anularModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="text-center mb-4">
                                <FaBan className="text-yellow-600 text-5xl mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-gray-800">Anular Venta</h3>
                                <p className="text-sm text-gray-600 mt-2">#{anularModal.venta?.codigo_venta}</p>
                            </div>

                            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-sm text-yellow-800">Esta acción:</p>
                                <ul className="text-xs text-yellow-700 mt-2 ml-4 list-disc">
                                    <li>Marcará la venta como ANULADA</li>
                                    <li>Revertirá el stock vendido</li>
                                    <li>No se puede deshacer</li>
                                </ul>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo de anulación *
                                </label>
                                <textarea
                                    value={anularModal.motivo}
                                    onChange={(e) => setAnularModal({ ...anularModal, motivo: e.target.value })}
                                    placeholder="Ej: Devolución del cliente..."
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAnularModal({ isOpen: false, venta: null, motivo: '' })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarAnulacion}
                                    disabled={!anularModal.motivo.trim()}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white ${!anularModal.motivo.trim() ? 'bg-gray-300' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                                >
                                    Sí, anular venta
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Detalle */}
                {detalleModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">Detalle de Venta</h3>
                                    <p className="text-sm text-gray-600">#{detalleModal.venta?.codigo_venta}</p>
                                </div>
                                <button
                                    onClick={() => setDetalleModal({ isOpen: false, venta: null })}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {detalleModal.venta && (
                                <div>
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Fecha:</p>
                                            <p className="font-medium">{new Date(detalleModal.venta.fecha_venta).toLocaleString('es-PE')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Cliente:</p>
                                            <p className="font-medium">{detalleModal.venta.cliente_nombre || 'Público'}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>S/ {Number(detalleModal.venta.subtotal).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-blue-600">
                                            <span>IGV:</span>
                                            <span>S/ {Number(detalleModal.venta.impuesto_monto).toFixed(2)}</span>
                                        </div>
                                        {Number(detalleModal.venta.descuento_monto) > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Descuento:</span>
                                                <span>- S/ {Number(detalleModal.venta.descuento_monto).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>S/ {Number(detalleModal.venta.total).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {detalleModal.venta.estado === 'ANULADA' && (
                                        <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                                            <p className="text-sm font-semibold text-red-800">Venta Anulada</p>
                                            {detalleModal.venta.motivo_anulacion && (
                                                <p className="text-xs text-red-700 mt-1">Motivo: {detalleModal.venta.motivo_anulacion}</p>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setDetalleModal({ isOpen: false, venta: null })}
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
                        error: { iconTheme: { primary: '#ef4444', secondary: 'white' }, duration: 4000, style: { borderLeft: '4px solid #ef4444' } },
                        warning: { icon: '⚠️', style: { borderLeft: '4px solid #f59e0b' } }
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
