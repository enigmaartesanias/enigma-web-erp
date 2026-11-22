import React, { useState, useEffect } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilter, FaChartLine, FaMoneyBillWave, FaExclamationCircle, FaClipboardList, FaClock, FaTools, FaCheckCircle, FaTruck, FaTrash, FaTimesCircle, FaPhone, FaImage, FaEye, FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import NotaPedido from './pedidos/NotaPedido';
import { TOLERANCIA_SALDO } from '../utils/pedidosUtils';
import { parseLocalDate } from '../utils/dateUtils';

const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    try {
        let dateStr = typeof dateString === 'string' ? dateString : dateString.toString();
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        if (!datePart.includes('-')) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        }
        const [year, month, day] = datePart.split('-');
        if (!year || !month || !day) return '';
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formateando fecha:', dateString, error);
        return '';
    }
};

// Para un pedido cerrado, la fecha que manda es la de entrega/cierre.
const getFechaEfectiva = (pedido) => {
    if (!pedido) return null;
    if (pedido.estado_pedido === 'entregado' && pedido.fecha_entrega) return pedido.fecha_entrega;
    return pedido.fecha_pedido;
};

const ReportePedidos = () => {
    const [stats, setStats] = useState({
        ventasBrutas: 0,
        ventasNetas: 0,
        cuentasPorCobrar: 0,
        cantidadPedidos: 0,
        ticketPromedio: 0
    });
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);

    // Filtros Básicos
    const [fechaInicio, setFechaInicio] = useState('2026-01-01');
    const [fechaFin, setFechaFin] = useState('2026-12-31');
    const [busqueda, setBusqueda] = useState('');

    // Filtros Avanzados (Nuevo)
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filtrosAvanzados, setFiltrosAvanzados] = useState({
        tipos: [],
        metales: []
    });

    // Opciones para los filtros avanzados
    const OPCIONES_TIPO = ['Arete', 'Pulsera', 'Collar', 'Anillo'];
    const OPCIONES_METAL = ['Cobre', 'Plata', 'Alpaca', 'Bronce'];

    // Estado para tabs
    const [activeTab, setActiveTab] = useState('Todos');

    // Estado para modal de detalles
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async (start = fechaInicio, end = fechaFin) => {
        try {
            const allPedidos = await pedidosDB.getAll();
            let data = allPedidos;

            if (start && end) {
                data = allPedidos.filter(p => {
                    const fechaEfectiva = parseLocalDate(getFechaEfectiva(p));
                    if (!fechaEfectiva) return false;

                    const year = fechaEfectiva.getFullYear();
                    const month = String(fechaEfectiva.getMonth() + 1).padStart(2, '0');
                    const day = String(fechaEfectiva.getDate()).padStart(2, '0');
                    const fechaLocal = `${year}-${month}-${day}`;
                    const enRango = fechaLocal >= start && fechaLocal <= end;

                    const esAntiguoActivo = !enRango &&
                        p.estado_pedido !== 'entregado' &&
                        fechaLocal < start &&
                        (
                            (Number(p.monto_saldo) > TOLERANCIA_SALDO) ||
                            (p.estado_produccion && p.estado_produccion !== 'terminado' && p.estado_produccion !== 'entregado')
                        );

                    return enRango || esAntiguoActivo;
                });
            }

            const pedidosActivos = data;
            setAllOrders(pedidosActivos);
            procesarDatos(pedidosActivos);

        } catch (error) {
            console.error('Error cargando reporte:', error);
        }
    };

    const resetFilters = () => {
        setFechaInicio('');
        setFechaFin('');
        setBusqueda('');
        setFiltrosAvanzados({ tipos: [], metales: [] });
        fetchReportData('', '');
    };

    const procesarDatos = (pedidos) => {
        try {
            if (!Array.isArray(pedidos)) return;

            const ventasBrutas = pedidos.reduce((acc, p) => acc + (Number(p.precio_total) || 0), 0);
            const ventasNetas = pedidos
                .filter(p => (Number(p.monto_saldo) || 0) <= TOLERANCIA_SALDO)
                .reduce((acc, p) => {
                    const total = Number(p.precio_total) || 0;
                    const envio = Number(p.envio_cobrado_al_cliente) || 0;
                    return acc + (total - envio);
                }, 0);

            const cuentasPorCobrar = pedidos.reduce((acc, p) => acc + ((Number(p.monto_saldo) > TOLERANCIA_SALDO) ? Number(p.monto_saldo) : 0), 0);
            const cantidad = pedidos.length;
            const promedio = cantidad > 0 ? ventasBrutas / cantidad : 0;

            setStats({
                ventasBrutas: ventasBrutas || 0,
                ventasNetas: ventasNetas || 0,
                cuentasPorCobrar: cuentasPorCobrar || 0,
                cantidadPedidos: cantidad,
                ticketPromedio: promedio || 0
            });
        } catch (error) {
            console.error("Error procesando datos:", error);
        }
    };

    // --- ACTUALIZACIÓN DE FILTROS BÁSICOS Y AVANZADOS ---
    useEffect(() => {
        if (!allOrders) return;

        let filtered = [...allOrders];

        // 1. Filtrar por búsqueda de texto (Cliente o Producto)
        if (busqueda.trim() !== '') {
            const term = busqueda.toLowerCase();
            filtered = filtered.filter(p => {
                const matchCliente = p.nombre_cliente?.toLowerCase().includes(term);
                const matchProducto = p.detalles_pedido && p.detalles_pedido.some(d =>
                    (d.nombre_producto && d.nombre_producto.toLowerCase().includes(term)) ||
                    (d.tipo_producto && d.tipo_producto.toLowerCase().includes(term)) ||
                    (d.metal && d.metal.toLowerCase().includes(term))
                );
                return matchCliente || matchProducto;
            });
        }

        // 2. Filtros Avanzados (Tipos y Metales)
        if (filtrosAvanzados.tipos.length > 0 || filtrosAvanzados.metales.length > 0) {
            filtered = filtered.filter(p => {
                if (!p.detalles_pedido) return false;

                // El pedido se muestra si AL MENOS UN producto coincide con los filtros elegidos
                return p.detalles_pedido.some(d => {
                    const matchTipo = filtrosAvanzados.tipos.length === 0 ||
                        filtrosAvanzados.tipos.some(t => d.tipo_producto?.toLowerCase() === t.toLowerCase());
                    const matchMetal = filtrosAvanzados.metales.length === 0 ||
                        filtrosAvanzados.metales.some(m => d.metal?.toLowerCase() === m.toLowerCase());
                    return matchTipo && matchMetal;
                });
            });
        }

        // 3. Filtrar por Tabs
        switch (activeTab) {
            case 'Pedidos':
                filtered = filtered.filter(p =>
                    p.estado_pedido !== 'entregado' &&
                    (!p.estado_produccion || p.estado_produccion === 'no_iniciado' || p.estado_produccion === 'pendiente')
                );
                break;
            case 'Producción':
                filtered = filtered.filter(p => p.estado_produccion === 'en_proceso');
                break;
            case 'Terminados':
                filtered = filtered.filter(p => p.estado_produccion === 'terminado' && p.estado_pedido !== 'entregado');
                break;
            case 'Entregados':
                filtered = filtered.filter(p => p.estado_pedido === 'entregado');
                break;
            default: // Todos
                break;
        }

        filtered.sort((a, b) => {
            const dateA = parseLocalDate(getFechaEfectiva(a))?.getTime() || 0;
            const dateB = parseLocalDate(getFechaEfectiva(b))?.getTime() || 0;
            return dateB - dateA;
        });

        setFilteredOrders(filtered);

    }, [activeTab, allOrders, busqueda, filtrosAvanzados]);

    const getFilteredData = () => filteredOrders;

    const handleVerDetalles = (pedido) => {
        setSelectedPedido(pedido);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPedido(null);
    };

    return (
        <div className="bg-gray-100 min-h-screen p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-4 sm:mb-6 pt-2 md:pt-6">
                    <Link to="/inventario-home" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <FaArrowLeft size={18} />
                    </Link>
                    <div className="ml-3">
                        <h1 className="text-lg font-bold text-gray-800">Resumen de Pedidos y Métricas</h1>
                    </div>
                </div>

                {/* KPIs Financieros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-sm border-b-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ventas Brutas</p>
                                <h3 className="text-base md:text-lg font-bold text-gray-800 mt-1">S/ {stats.ventasBrutas.toFixed(2)}</h3>
                            </div>
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <FaChartLine size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-sm border-b-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ventas Netas</p>
                                <h3 className="text-base md:text-lg font-bold text-gray-800 mt-1">S/ {stats.ventasNetas.toFixed(2)}</h3>
                            </div>
                            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                <FaMoneyBillWave size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-sm border-b-4 border-red-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Por Cobrar</p>
                                <h3 className="text-base md:text-lg font-bold text-gray-800 mt-1">S/ {stats.cuentasPorCobrar.toFixed(2)}</h3>
                            </div>
                            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                <FaExclamationCircle size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros de Fecha, Búsqueda y Avanzados */}
                <div className="w-full flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 font-medium">Del</span>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            className="border-gray-300 rounded-md text-xs py-1.5 px-2 focus:ring-blue-500 focus:border-blue-500 border"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 font-medium">Al</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            className="border-gray-300 rounded-md text-xs py-1.5 px-2 focus:ring-blue-500 focus:border-blue-500 border"
                        />
                    </div>

                    <div className="w-px h-6 bg-gray-200 hidden md:block"></div>

                    {/* BARRA DE BÚSQUEDA Y BOTÓN FILTROS AVANZADOS */}
                    <div className="flex-1 w-full relative flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por cliente o producto (Ej: Tobillera)..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowAdvancedFilters(true)}
                            className={`px-3 py-1.5 border rounded-md flex items-center transition-colors relative ${filtrosAvanzados.tipos.length > 0 || filtrosAvanzados.metales.length > 0
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Filtros Avanzados"
                        >
                            <FaSlidersH />
                            {(filtrosAvanzados.tipos.length > 0 || filtrosAvanzados.metales.length > 0) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white"></span>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => fetchReportData()}
                            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-md text-xs font-medium flex justify-center items-center transition-all shadow-sm"
                        >
                            <FaFilter className="mr-1.5" /> Filtrar Fechas
                        </button>
                        <button
                            onClick={resetFilters}
                            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-md text-xs font-medium flex justify-center items-center transition-all"
                        >
                            <FaTrash className="mr-1.5" /> Limpiar
                        </button>
                    </div>
                </div>

                <div className="mt-8 mb-4 px-2 md:px-0">
                    <h2 className="text-lg font-bold text-gray-800">Consulta de Pedidos</h2>
                </div>

                <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                    {[
                        { id: 'Todos', label: 'Todos', icon: FaClipboardList, color: 'text-gray-600' },
                        { id: 'Pedidos', label: 'Pendientes', icon: FaClock, color: 'text-gray-500' },
                        { id: 'Producción', label: 'Producción', icon: FaTools, color: 'text-purple-500' },
                        { id: 'Terminados', label: 'Terminados', icon: FaCheckCircle, color: 'text-green-500' },
                        { id: 'Entregados', label: 'Entregados', icon: FaTruck, color: 'text-yellow-500' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all relative group
                                ${activeTab === tab.id ? '' : 'hover:bg-gray-50'}
                            `}
                            title={tab.label}
                        >
                            <div className={`text-2xl transition-transform ${activeTab === tab.id ? 'transform scale-110 ' + tab.color : 'text-gray-400 grayscale group-hover:grayscale-0 group-hover:' + tab.color.replace('text-', '')}`}>
                                <tab.icon />
                            </div>
                            <span className={`text-sm font-medium hidden md:block ${activeTab === tab.id ? tab.color : 'text-gray-500 group-hover:text-gray-700'}`}>
                                {tab.label}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute -bottom-2 w-full h-1 bg-blue-600 rounded-full transition-all"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-start">
                    <h3 className="text-sm font-normal text-gray-800 uppercase tracking-wide">
                        PEDIDOS {activeTab === 'Todos' ? 'TOTALES' : activeTab === 'Pedidos' ? 'PENDIENTES' : activeTab.toUpperCase()} <span className="ml-2 text-base font-medium">{getFilteredData().length}</span>
                    </h3>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Pedido</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto(s)</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {activeTab === 'Entregados' ? 'Fecha Entrega' :
                                            activeTab === 'Producción' ? 'Fecha Inicio' :
                                                activeTab === 'Terminados' ? 'Fecha Término' : 'Fecha Pedido'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal / Total</th>
                                    {activeTab !== 'Entregados' && (
                                        <>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                                        </>
                                    )}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {getFilteredData().length > 0 ? (
                                    getFilteredData().flatMap((pedido) => {
                                        let detalles = pedido.detalles_pedido && pedido.detalles_pedido.length > 0
                                            ? pedido.detalles_pedido
                                            : [{ nombre_producto: 'Sin productos', cantidad: 0, subtotal: pedido.precio_total }];

                                        // APLICAR FILTROS AVANZADOS A NIVEL DE DETALLE PARA OCULTAR FILAS QUE NO COINCIDEN
                                        if (filtrosAvanzados.tipos.length > 0 || filtrosAvanzados.metales.length > 0) {
                                            detalles = detalles.filter(d => {
                                                const matchTipo = filtrosAvanzados.tipos.length === 0 || filtrosAvanzados.tipos.some(t => d.tipo_producto?.toLowerCase() === t.toLowerCase());
                                                const matchMetal = filtrosAvanzados.metales.length === 0 || filtrosAvanzados.metales.some(m => d.metal?.toLowerCase() === m.toLowerCase());
                                                return matchTipo && matchMetal;
                                            });
                                        }

                                        // Seguridad: Si el pedido pasó el filtro de búsqueda general, pero no tiene items visuales activos
                                        if (detalles.length === 0) return [];

                                        return detalles.map((d, idx) => {
                                            const isFirst = idx === 0;
                                            const subtotalItem = Number(d.subtotal) || (Number(d.cantidad || 1) * Number(d.precio_unitario || 0));

                                            return (
                                                <tr key={`${pedido.id_pedido}-${idx}`} className={`transition-colors ${isFirst ? 'bg-white hover:bg-gray-50 border-t-4 border-gray-100' : 'bg-gray-50/50 hover:bg-gray-100 border-t-0'}`}>

                                                    {/* ID Pedido */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-left">
                                                        {isFirst && (
                                                            <span className="text-sm text-gray-900 font-medium">
                                                                #{pedido.id_pedido.toString().padStart(3, '0')}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Cliente */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-left">
                                                        {isFirst && <div className="text-sm font-medium text-gray-900">{pedido.nombre_cliente}</div>}
                                                    </td>

                                                    {/* Producto */}
                                                    <td className="px-4 py-3 text-left">
                                                        <div className="text-sm text-gray-700 flex items-start gap-1">
                                                            {d.cantidad > 0 && <span className="font-bold text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded text-xs">{d.cantidad}x</span>}
                                                            <span className="truncate max-w-xs">{d.nombre_producto} <span className="text-[10px] text-gray-400 ml-1">({d.metal || d.tipo_producto})</span></span>
                                                        </div>
                                                    </td>

                                                    {/* Fecha */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                                                        {isFirst && (
                                                            activeTab === 'Terminados'
                                                                ? formatLocalDate(pedido.updated_at || pedido.fecha_pedido)
                                                                : formatLocalDate(getFechaEfectiva(pedido)) || '-'
                                                        )}
                                                    </td>

                                                    {/* Subtotal del Producto / Total del Pedido */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-left">
                                                        <div className="text-gray-800">S/ {subtotalItem.toFixed(2)}</div>
                                                        {isFirst && <div className="text-[10px] text-blue-600 mt-0.5 pt-0.5 inline-block font-bold">Total: S/ {Number(pedido.precio_total).toFixed(2)}</div>}
                                                    </td>

                                                    {activeTab !== 'Entregados' && (
                                                        <>
                                                            {/* Pago */}
                                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                                {isFirst && (
                                                                    Number(pedido.monto_saldo) <= TOLERANCIA_SALDO ? (
                                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">Pagado</span>
                                                                    ) : (
                                                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">Pendiente</span>
                                                                    )
                                                                )}
                                                            </td>

                                                            {/* Saldo */}
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-left">
                                                                {isFirst && (
                                                                    Number(pedido.monto_saldo) > TOLERANCIA_SALDO ? (
                                                                        <span className="text-red-500 font-medium">S/ {Number(pedido.monto_saldo).toFixed(2)}</span>
                                                                    ) : (
                                                                        <span className="text-green-500 font-medium">S/ 0.00</span>
                                                                    )
                                                                )}
                                                            </td>
                                                        </>
                                                    )}

                                                    {/* Acciones */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-left">
                                                        {isFirst && (
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleVerDetalles(pedido)}
                                                                    className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 p-1.5 rounded"
                                                                    title="Ver Detalle"
                                                                >
                                                                    <FaEye className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'Entregados' ? "6" : "8"} className="px-6 py-12 text-center text-gray-400 text-sm">
                                            No se encontraron pedidos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 px-6 py-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Mostrando {getFilteredData().length} pedidos</span>
                    </div>
                </div>
            </div>

            {/* MODAL FILTROS AVANZADOS */}
            {showAdvancedFilters && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Modal */}
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-700 text-sm">Filtros Avanzados</h3>
                            <button onClick={() => setShowAdvancedFilters(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Opciones */}
                        <div className="px-6 py-6 space-y-8">
                            {/* TIPO DE PRODUCTO */}
                            <div>
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Tipo de Producto</h4>
                                <div className="grid grid-cols-2 gap-y-3 pl-4">
                                    {OPCIONES_TIPO.map(tipo => (
                                        <label key={tipo} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                                checked={filtrosAvanzados.tipos.includes(tipo)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setFiltrosAvanzados(prev => ({ ...prev, tipos: [...prev.tipos, tipo] }));
                                                    else setFiltrosAvanzados(prev => ({ ...prev, tipos: prev.tipos.filter(t => t !== tipo) }));
                                                }}
                                            />
                                            <span className="group-hover:text-gray-900 transition-colors">{tipo}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* TIPO DE METAL */}
                            <div>
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Tipo de Metal</h4>
                                <div className="grid grid-cols-2 gap-y-3 pl-4">
                                    {OPCIONES_METAL.map(metal => (
                                        <label key={metal} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                                checked={filtrosAvanzados.metales.includes(metal)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setFiltrosAvanzados(prev => ({ ...prev, metales: [...prev.metales, metal] }));
                                                    else setFiltrosAvanzados(prev => ({ ...prev, metales: prev.metales.filter(m => m !== metal) }));
                                                }}
                                            />
                                            <span className="group-hover:text-gray-900 transition-colors">{metal}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowAdvancedFilters(false)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm active:scale-[0.98] transition-all"
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle de Pedido Reutilizando NotaPedido */}
            <NotaPedido
                isOpen={showDetailModal}
                pedido={selectedPedido}
                onClose={closeDetailModal}
            />



            <Toaster position="top-right" />
        </div>
    );
};

export default ReportePedidos;