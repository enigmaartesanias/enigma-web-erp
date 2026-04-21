import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ventasDB } from '../../../utils/ventasClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { FaArrowLeft, FaCalendar, FaChartLine, FaDollarSign, FaFileInvoice, FaFilter, FaBan, FaEye, FaExclamationTriangle, FaImage, FaMoneyBillWave } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';
import html2canvas from 'html2canvas';
import ModalRegistrarPagoSimple from '../components/ModalRegistrarPagoSimple';

export default function ReporteVentas() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState('2026-01-01');
    const [fechaFin, setFechaFin] = useState('2026-12-31');

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

    // Estado para historial de pagos
    const [historialPagos, setHistorialPagos] = useState([]);

    // Estado para pestañas
    const [activeTab, setActiveTab] = useState('VENTAS'); // 'VENTAS', 'CREDITOS', o 'ANULADAS'

    // Estado para modal de pago
    const [pagoModal, setPagoModal] = useState({
        isOpen: false,
        venta: null
    });

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
    const handleVer = async (venta) => {
        setDetalleModal({
            isOpen: true,
            venta: venta
        });

        // Cargar historial de pagos si es crédito
        if (venta.es_credito) {
            try {
                const pagos = await ventasDB.getHistorialPagos(venta.id);
                setHistorialPagos(pagos);
            } catch (error) {
                console.error('Error cargando historial de pagos:', error);
                setHistorialPagos([]);
            }
        } else {
            setHistorialPagos([]);
        }
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

    // Compartir detalle de venta como imagen
    const handleCompartir = async () => {
        try {
            const modalElement = document.getElementById('detalle-venta-modal');
            if (!modalElement) return;

            // Capturar el modal como canvas
            const canvas = await html2canvas(modalElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });

            // Convertir a blob
            canvas.toBlob(async (blob) => {
                const fileName = `venta_${detalleModal.venta?.codigo_venta}.jpg`;

                // Si el navegador soporta Web Share API
                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], fileName, { type: 'image/jpeg' });

                    if (navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: `Detalle de Venta #${detalleModal.venta?.codigo_venta}`,
                                text: `Venta #${detalleModal.venta?.codigo_venta} - Total: S/ ${detalleModal.venta?.total}`
                            });
                            toast.success('Compartido exitosamente');
                        } catch (err) {
                            if (err.name !== 'AbortError') {
                                console.error('Error al compartir:', err);
                                descargarImagen(blob, fileName);
                            }
                        }
                    } else {
                        descargarImagen(blob, fileName);
                    }
                } else {
                    // Fallback: descargar la imagen
                    descargarImagen(blob, fileName);
                }
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error('Error al generar imagen:', error);
            toast.error('Error al generar la imagen');
        }
    };

    // Función auxiliar para descargar imagen
    const descargarImagen = (blob, fileName) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Imagen descargada');
    };

    // Registrar pago a crédito
    const handleRegistrarPago = (venta) => {
        setPagoModal({
            isOpen: true,
            venta: venta
        });
    };

    const confirmarPago = async (datosPago) => {
        try {
            await ventasDB.registrarPago(
                datosPago.venta_id,
                datosPago.monto,
                datosPago.metodo_pago,
                datosPago.observaciones
            );
            toast.success('Pago registrado correctamente', { icon: '💰' });
            setPagoModal({ isOpen: false, venta: null });
            loadVentas(); // Recargar ventas
        } catch (error) {
            console.error('Error registrando pago:', error);
            toast.error('Error al registrar el pago');
        }
    };

    // Filtrar por fechas y pestaña activa
    const ventasFiltradas = ventas.filter(venta => {
        // Filtro por pestaña
        if (activeTab === 'VENTAS' && venta.estado === 'ANULADA') return false;
        if (activeTab === 'CREDITOS' && (!venta.es_credito || venta.saldo_pendiente <= 0)) return false;
        if (activeTab === 'ANULADAS' && venta.estado !== 'ANULADA') return false;

        // Filtro por fechas (Usando zona horaria Perú)
        // Convertir la fecha de venta a String YYYY-MM-DD en Perú
        const fechaVentaDate = new Date(venta.fecha_venta);
        const fechaVentaPeru = fechaVentaDate.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

        // Comparar strings de fecha (YYYY-MM-DD)
        if (fechaInicio && fechaVentaPeru < fechaInicio) return false;
        if (fechaFin && fechaVentaPeru > fechaFin) return false;
        return true;
    });

    // Calcular estadísticas + distribución de fondos
    const ventasActivas = ventasFiltradas.filter(v => v.estado !== 'ANULADA');

    // Función para obtener costo de materiales de una venta
    const getCostoMateriales = (v) => {
        const principal = Number(v.costo_material_reposicion || 0);
        if (principal > 0) return principal;
        if (v.detalles && v.detalles.length > 0) {
            return v.detalles.reduce((sum, d) => sum + (Number(d.costo_actual || d.precio_unitario * 0.4 || 0) * Number(d.cantidad || 0)), 0);
        }
        return 0;
    };

    // Función para obtener mano de obra de una venta
    const getManoDeObra = (v) => {
        if (v.detalles && v.detalles.length > 0) {
            return v.detalles.reduce((sum, d) => sum + (Number(d.mano_de_obra_actual || 0) * Number(d.cantidad || 0)), 0);
        }
        return 0;
    };

    const stats = {
        totalVentas: ventasActivas.reduce((sum, v) => sum + Number(v.total), 0),
        totalIGV: ventasActivas.reduce((sum, v) => sum + Number(v.impuesto_monto), 0),
        cantidadVentas: ventasActivas.length,
        // Fondos financieros
        fondoAlquiler: ventasActivas.reduce((sum, v) => sum + Number(v.monto_alquiler_retencion || v.total * 0.10), 0),
        fondoMateriales: ventasActivas.reduce((sum, v) => sum + getCostoMateriales(v), 0),
        fondoManoObra: ventasActivas.reduce((sum, v) => sum + getManoDeObra(v), 0),
        // Por origen
        totalStock: ventasActivas.filter(v => !v.origen_venta || v.origen_venta === 'stock').reduce((sum, v) => sum + Number(v.total), 0),
        totalPedidos: ventasActivas.filter(v => v.origen_venta === 'pedido').reduce((sum, v) => sum + Number(v.total), 0),
    };
    stats.utilidadNeta = stats.totalVentas - stats.fondoAlquiler - stats.fondoMateriales - stats.fondoManoObra;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-3">
                        <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                            <FaArrowLeft className="mr-2" size={14} />
                            <span className="font-semibold text-sm">Enigma Sistema ERP</span>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-slate-700" />
                        Reporte de Ventas
                    </h1>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Panel principal de distribución de fondos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 overflow-hidden">
                    {/* Fila 1: Ingreso Total + desglose por origen */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-baseline justify-between">
                            <p className="text-xs text-gray-500 font-medium">
                                {(fechaInicio || fechaFin) ? 'Ingreso Total (Filtrado)' : 'Ingreso Total'}
                            </p>
                            <p className="text-lg font-bold text-gray-900">S/ {stats.totalVentas.toFixed(2)}</p>
                        </div>
                        {(fechaInicio || fechaFin) && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{fechaInicio} - {fechaFin}</p>
                        )}
                        {/* Desglose por origen */}
                        <div className="flex gap-4 mt-2">
                            <span className="text-[11px] text-gray-400">
                                Stock <span className="font-semibold text-slate-600">S/ {stats.totalStock.toFixed(2)}</span>
                            </span>
                            <span className="text-[11px] text-gray-400">
                                Pedidos <span className="font-semibold text-indigo-600">S/ {stats.totalPedidos.toFixed(2)}</span>
                            </span>
                        </div>
                    </div>
                    {/* Fila 2: Distribución de fondos (4 columnas) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                        <div className="p-3 text-center border-b md:border-b-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Fondo Alquiler</p>
                            <p className="text-sm font-bold text-amber-600">S/ {stats.fondoAlquiler.toFixed(2)}</p>
                            <p className="text-[9px] text-gray-300 mt-0.5">10% del ingreso</p>
                        </div>
                        <div className="p-3 text-center border-b md:border-b-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Rep. Materiales</p>
                            <p className="text-sm font-bold text-blue-600">S/ {stats.fondoMateriales.toFixed(2)}</p>
                            <p className="text-[9px] text-gray-300 mt-0.5">costo de insumos</p>
                        </div>
                        <div className="p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Mano de Obra</p>
                            <p className="text-sm font-bold text-slate-500">S/ {stats.fondoManoObra.toFixed(2)}</p>
                            <p className="text-[9px] text-gray-300 mt-0.5">pagos orfebre</p>
                        </div>
                        <div className="p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Utilidad Neta</p>
                            <p className={`text-sm font-bold ${stats.utilidadNeta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>S/ {stats.utilidadNeta.toFixed(2)}</p>
                            <p className="text-[9px] text-gray-300 mt-0.5">ganancia taller</p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Columna 1: Campos de fecha */}
                        <div className="space-y-2">
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

                        {/* Columna 2: Botón de limpiar */}
                        <div className="flex items-center">
                            <button
                                onClick={() => { setFechaInicio(''); setFechaFin(''); }}
                                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>


                {/* Pestañas */}
                <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                    {/* Pestañas de filtro - Mejorado para mejor visibilidad */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('VENTAS')}
                            className={`flex-1 px-3 py-2.5 font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'VENTAS'
                                ? 'bg-blue-600 border-b-4 border-blue-800'
                                : 'bg-gray-100 border-b-2 border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            <span className="text-base">📊</span>
                            <span className={`text-sm uppercase tracking-wide ${activeTab === 'VENTAS' ? 'text-white' : 'text-gray-600'
                                }`}>
                                Ventas
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('CREDITOS')}
                            className={`flex-1 px-3 py-2.5 font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'CREDITOS'
                                ? 'bg-yellow-600 border-b-4 border-yellow-800'
                                : 'bg-gray-100 border-b-2 border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            <span className="text-base">💳</span>
                            <span className={`text-sm uppercase tracking-wide ${activeTab === 'CREDITOS' ? 'text-white' : 'text-gray-600'
                                }`}>
                                Créditos
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('ANULADAS')}
                            className={`flex-1 px-3 py-2.5 font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'ANULADAS'
                                ? 'bg-red-600 border-b-4 border-red-800'
                                : 'bg-gray-100 border-b-2 border-gray-200 hover:bg-gray-200'
                                }`}
                        >
                            <span className="text-base">🚫</span>
                            <span className={`text-sm uppercase tracking-wide ${activeTab === 'ANULADAS' ? 'text-white' : 'text-gray-600'
                                }`}>
                                Anuladas
                            </span>
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
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Código</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Producto</th>
                                        <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-2 py-3 text-right text-xs font-bold text-gray-600 uppercase">Total (S/)</th>
                                        <th className="px-2 py-3 text-right text-xs font-bold text-gray-600 uppercase">Rep.</th>
                                        <th className="px-2 py-3 text-right text-xs font-bold text-gray-600 uppercase">Alq.</th>
                                        <th className="hidden md:table-cell px-2 py-3 text-right text-xs font-bold text-gray-600 uppercase">Mano Obra</th>
                                        <th className="px-2 py-3 text-right text-xs font-bold text-gray-600 uppercase">Utilidad</th>
                                        {activeTab === 'CREDITOS' && (
                                            <th className="px-4 py-3 text-right text-xs font-bold text-yellow-700 uppercase bg-yellow-50">Saldo Pendiente</th>
                                        )}
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ventasFiltradas.map((venta) => (
                                        <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-2 md:px-4 py-2 md:py-3">
                                                <span className="font-mono text-xs text-gray-900">{venta.codigo_venta}</span>
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs text-gray-900">
                                                {new Date(venta.fecha_venta).toLocaleDateString('es-PE', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    timeZone: 'America/Lima'
                                                })}
                                            </td>
                                            <td className="px-2 md:px-4 py-2 md:py-3 text-xs text-gray-900">
                                                <div className="flex items-center gap-1.5">
                                                    {venta.origen_venta === 'pedido'
                                                        ? <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-50 px-1 py-0.5 rounded shrink-0">PED</span>
                                                        : <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-1 py-0.5 rounded shrink-0">STK</span>
                                                    }
                                                    <span>
                                                        {venta.detalles && venta.detalles.length > 0
                                                            ? venta.detalles.map(d => d.producto_codigo).filter(Boolean).join(', ') || '-'
                                                            : '-'
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-3 text-xs text-gray-900">{venta.cliente_nombre}</td>
                                            <td className="px-1 md:px-2 py-2 md:py-3 text-right text-xs font-semibold text-gray-900">
                                                {Number(venta.total).toFixed(1)}
                                            </td>
                                            <td className="px-1 md:px-2 py-2 md:py-3 text-right text-xs text-blue-700 font-medium font-mono">
                                                {getCostoMateriales(venta).toFixed(1)}
                                            </td>
                                            <td className="px-1 md:px-2 py-2 md:py-3 text-right text-xs text-amber-700 font-medium font-mono">
                                                {Number(venta.monto_alquiler_retencion || venta.total * 0.10).toFixed(1)}
                                            </td>
                                            <td className="hidden md:table-cell px-1 md:px-2 py-2 md:py-3 text-right text-xs text-gray-600 font-medium font-mono">
                                                {getManoDeObra(venta).toFixed(1)}
                                            </td>
                                            <td className="px-1 md:px-2 py-2 md:py-3 text-right text-xs font-bold text-emerald-600 font-mono">
                                                {(Number(venta.total) - Number(venta.monto_alquiler_retencion || venta.total * 0.10) - getCostoMateriales(venta) - getManoDeObra(venta)).toFixed(1)}
                                            </td>
                                            {activeTab === 'CREDITOS' && (
                                                <td className="px-2 md:px-4 py-2 md:py-3 text-right text-xs font-semibold text-yellow-800 bg-yellow-50 min-w-24">
                                                    S/ {Number(venta.saldo_pendiente || 0).toFixed(2)}
                                                </td>
                                            )}
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

                                                    {activeTab === 'CREDITOS' && venta.saldo_pendiente > 0 && (
                                                        <Tooltip text="Registrar pago">
                                                            <button
                                                                onClick={() => handleRegistrarPago(venta)}
                                                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                                                            >
                                                                <FaMoneyBillWave size={14} />
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
                        <div id="detalle-venta-modal" className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
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
                                            <p className="font-medium">{new Date(detalleModal.venta.fecha_venta).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Cliente:</p>
                                            <p className="font-medium">{detalleModal.venta.cliente_nombre || 'Público'}</p>
                                        </div>
                                    </div>

                                    {/* Productos vendidos */}
                                    {detalleModal.venta.detalles && detalleModal.venta.detalles.length > 0 && (
                                        <div className="border-t pt-4 mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Productos:</p>
                                            <div className="space-y-1.5">
                                                {detalleModal.venta.detalles.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs text-gray-700 py-0.5">
                                                        <div className="flex items-center">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 flex-shrink-0"></span>
                                                            <span>{item.cantidad}x {item.producto_nombre || 'Producto'}</span>
                                                        </div>
                                                        <span className="font-medium">S/ {Number(item.subtotal).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t pt-2 space-y-1 text-xs">

                                        {Number(detalleModal.venta.impuesto_monto) > 0 && (
                                            <div className="flex justify-between text-blue-600">
                                                <span>IGV:</span>
                                                <span>S/ {Number(detalleModal.venta.impuesto_monto).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {Number(detalleModal.venta.descuento_monto) > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Descuento:</span>
                                                <span>- S/ {Number(detalleModal.venta.descuento_monto).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                                            <span>Total:</span>
                                            <span>S/ {Number(detalleModal.venta.total).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Información de Crédito */}
                                    {detalleModal.venta.es_credito && (
                                        <div className={`mt-3 rounded p-2 border ${Number(detalleModal.venta.saldo_pendiente) > 0
                                            ? 'bg-yellow-50 border-yellow-200'
                                            : 'bg-green-50 border-green-200'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={`text-xs font-semibold ${Number(detalleModal.venta.saldo_pendiente) > 0
                                                    ? 'text-yellow-800'
                                                    : 'text-green-800'
                                                    }`}>
                                                    💳 Venta a Crédito
                                                </p>

                                            </div>

                                            <div className="text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Saldo Pendiente:</span>
                                                    <span className={`font-semibold ${Number(detalleModal.venta.saldo_pendiente) > 0
                                                        ? 'text-yellow-900'
                                                        : 'text-green-900'
                                                        }`}>
                                                        S/ {Number(detalleModal.venta.saldo_pendiente || 0).toFixed(2)}
                                                    </span>
                                                </div>

                                                {Number(detalleModal.venta.saldo_pendiente) === 0 && (
                                                    <p className="text-green-700 mt-1 text-center italic text-[10px]">
                                                        ✓ Crédito pagado completamente
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}


                                    {/* Historial de Pagos */}
                                    {detalleModal.venta.es_credito && historialPagos.length > 0 && (
                                        <div className="mt-3 border-t pt-2">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">📋 Historial de Pagos</p>
                                            <div className="space-y-1">
                                                {historialPagos.map((pago, idx) => (
                                                    <div key={pago.id} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded text-xs">
                                                        <div className="flex-1 text-left text-gray-600">
                                                            <span>
                                                                {new Date(pago.fecha_pago).toLocaleDateString('es-PE', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: '2-digit'
                                                                })} - {pago.metodo_pago}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-gray-900 font-semibold text-xs">S/ {Number(pago.monto).toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {detalleModal.venta.estado === 'ANULADA' && (
                                        <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                                            <p className="text-sm font-semibold text-red-800">Venta Anulada</p>
                                            {detalleModal.venta.motivo_anulacion && (
                                                <p className="text-xs text-red-700 mt-1">Motivo: {detalleModal.venta.motivo_anulacion}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={handleCompartir}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaImage size={14} />
                                            Compartir
                                        </button>
                                        <button
                                            onClick={() => setDetalleModal({ isOpen: false, venta: null })}
                                            className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de Pago */}
                <ModalRegistrarPagoSimple
                    isOpen={pagoModal.isOpen}
                    onClose={() => setPagoModal({ isOpen: false, venta: null })}
                    venta={pagoModal.venta}
                    onConfirmar={confirmarPago}
                />

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
