import React, { useState, useEffect } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { ventasDB } from '../utils/ventasClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilter, FaChartLine, FaMoneyBillWave, FaExclamationCircle, FaClipboardList, FaClock, FaTools, FaCheckCircle, FaTruck, FaTrash, FaTimesCircle, FaPhone, FaImage, FaEye } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Toaster, toast } from 'react-hot-toast';

const getLocalDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

// Helper date formatter
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

const ReportePedidos = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        ventasBrutas: 0,
        ventasNetas: 0,
        cuentasPorCobrar: 0,
        cantidadPedidos: 0,
        ticketPromedio: 0
    });
    const [topProductos, setTopProductos] = useState([]);
    const [topClientes, setTopClientes] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // Store all fetched orders
    const [filteredOrders, setFilteredOrders] = useState([]); // Store currently filtered orders for table

    // Filtros - Por defecto mostrar Año 2026
    const [fechaInicio, setFechaInicio] = useState('2026-01-01');
    const [fechaFin, setFechaFin] = useState('2026-12-31');

    // Estado para tabs
    const [activeTab, setActiveTab] = useState('Todos');

    // Estado para modal de detalles
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);

    // Estado para Modal de Pago
    const [showPayModal, setShowPayModal] = useState(false);
    const [payPedido, setPayPedido] = useState(null);
    const [payData, setPayData] = useState({
        monto: '',
        fecha: '',
        metodo: 'Efectivo'
    });

    useEffect(() => {
        if (stats.ventasBrutas === 0 && loading === false) {
            // Initial load triggers fetch via other useEffect, but filteredData might need sync
        }
    }, [stats]);

    useEffect(() => {
        fetchReportData();
    }, []); // Removed date dependencies for manual filtering

    const fetchReportData = async (start = fechaInicio, end = fechaFin) => {
        setLoading(true);
        try {
            // Obtener todos los pedidos con detalles desde Neon DB
            const allPedidos = await pedidosDB.getAll();
            console.log('📊 Total pedidos en Neon:', allPedidos.length);

            // Filtrar por rango de fechas solo si hay fechas válidas
            let data = allPedidos;

            if (start && end) {
                console.log('📅 Filtrando por rango:', { start, end });
                data = allPedidos.filter(p => {
                    if (!p.fecha_pedido) return false;

                    // Usar fecha local Y UTC para comparación, cubriendo cualquier desviación horaria
                    const d = new Date(p.fecha_pedido);

                    // Local
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const fechaLocal = `${year}-${month}-${day}`;

                    // UTC
                    const fechaUTC = d.toISOString().split('T')[0];

                    // Si CUALQUIERA de las dos fechas cae en el rango, lo incluimos
                    const enRango = (fechaLocal >= start && fechaLocal <= end) || (fechaUTC >= start && fechaUTC <= end);

                    // Lógica Híbrida 2026: Incluir pedidos antiguos si están "activos"
                    // Activo = Con saldo pendiente O en producción (no terminado/entregado)
                    const esAntiguoActivo = !enRango &&
                        fechaLocal < start &&
                        (
                            (Number(p.monto_saldo) > 0) ||
                            (p.estado_produccion && p.estado_produccion !== 'terminado' && p.estado_produccion !== 'entregado')
                        );

                    return enRango || esAntiguoActivo;
                });
            }

            console.log('✅ Pedidos filtrados:', data.length);

            // En este sistema 'cancelado' (true) significa PAGADO, no ANULADO.
            // Por lo tanto, debemos incluir TODOS los pedidos.
            const pedidosActivos = data;
            setAllOrders(pedidosActivos); // Guardar para filtrado local
            procesarDatos(pedidosActivos);

        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFechaInicio('');
        setFechaFin('');
        fetchReportData('', ''); // Pass empty strings to force fetch all
    };

    const procesarDatos = (pedidos) => {
        try {
            if (!Array.isArray(pedidos)) return;

            // 1. Métricas Financieras
            const ventasBrutas = pedidos.reduce((acc, p) => acc + (Number(p.precio_total) || 0), 0);

            // Ventas Netas = Pedidos cancelados (pagados 100%) SIN INCLUIR envío
            const ventasNetas = pedidos
                .filter(p => (p.monto_saldo || 0) <= 0.1)
                .reduce((acc, p) => {
                    const total = Number(p.precio_total) || 0;
                    const envio = Number(p.envio_cobrado_al_cliente) || 0;
                    return acc + (total - envio);
                }, 0);

            const cuentasPorCobrar = pedidos.reduce((acc, p) => acc + ((p.monto_saldo > 0) ? Number(p.monto_saldo) : 0), 0);

            const cantidad = pedidos.length;
            const promedio = cantidad > 0 ? ventasBrutas / cantidad : 0;

            setStats({
                ventasBrutas: ventasBrutas || 0,
                ventasNetas: ventasNetas || 0,
                cuentasPorCobrar: cuentasPorCobrar || 0,
                cantidadPedidos: cantidad,
                ticketPromedio: promedio || 0
            });

            // 2. Ranking Productos
            const productoMap = {};
            pedidos.forEach(p => {
                if (Array.isArray(p.detalles_pedido)) {
                    p.detalles_pedido.forEach(d => {
                        const nombre = d.nombre_producto || 'Desconocido';
                        if (!productoMap[nombre]) {
                            productoMap[nombre] = { nombre: nombre, cantidad: 0, ventas: 0 };
                        }
                        productoMap[nombre].cantidad += (Number(d.cantidad) || 0);
                        productoMap[nombre].ventas += (Number(d.subtotal) || (Number(d.cantidad) * Number(d.precio_unitario)) || 0);
                    });
                }
            });
            const rankingProductos = Object.values(productoMap)
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);
            setTopProductos(rankingProductos);

            // 3. Ranking Clientes
            const clienteMap = {};
            pedidos.forEach(p => {
                const nombreCliente = p.nombre_cliente || 'Cliente Anónimo';
                if (!clienteMap[nombreCliente]) {
                    clienteMap[nombreCliente] = { nombre: nombreCliente, pedidos: 0, total: 0 };
                }
                clienteMap[nombreCliente].pedidos += 1;
                clienteMap[nombreCliente].total += (Number(p.precio_total) || 0);
            });
            const rankingClientes = Object.values(clienteMap)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            setTopClientes(rankingClientes);
        } catch (error) {
            console.error("Error procesando datos:", error);
        }
    };

    // Actualizar datos filtrados cuando cambie activeTab o allOrders
    useEffect(() => {
        if (!allOrders) return;

        let filtered = [...allOrders];

        switch (activeTab) {
            case 'Pedidos':
                // Pedidos nuevos: no entregados, y produccion en status inicial o no iniciado
                filtered = allOrders.filter(p =>
                    p.estado_pedido !== 'entregado' &&
                    (!p.estado_produccion || p.estado_produccion === 'no_iniciado' || p.estado_produccion === 'pendiente')
                );
                break;
            case 'Producción':
                filtered = allOrders.filter(p => p.estado_produccion === 'en_proceso');
                break;
            case 'Terminados':
                filtered = allOrders.filter(p => p.estado_produccion === 'terminado' && p.estado_pedido !== 'entregado');
                break;
            case 'Entregados':
                filtered = allOrders.filter(p => p.estado_pedido === 'entregado');
                break;
            default: // Todos
                filtered = allOrders;
                break;
        }

        // Sorting: Recientes primero
        filtered.sort((a, b) => {
            const dateA = activeTab === 'Entregados' ? new Date(a.fecha_entrega || a.fecha_pedido) : new Date(a.fecha_pedido);
            const dateB = activeTab === 'Entregados' ? new Date(b.fecha_entrega || b.fecha_pedido) : new Date(b.fecha_pedido);
            return dateB - dateA;
        });

        setFilteredOrders(filtered);

    }, [activeTab, allOrders]);

    const getFilteredData = () => filteredOrders;

    const generarPDF = () => {
        const doc = new jsPDF();
        const azul = [41, 128, 185];
        const gris = [100, 100, 100];

        // Header
        doc.setFontSize(22);
        doc.setTextColor(...azul);
        doc.text('Reporte Gerencial de Ventas', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(...gris);
        doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 105, 28, { align: 'center' });

        // 1. Resumen Ejecutivo
        doc.setFontSize(14);
        doc.setTextColor(0);
        // 1. Resumen Ejecutivo
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('1. Resumen Ejecutivo', 14, 40);
        autoTable(doc, {
            startY: 45,
            head: [['Ventas Brutas', 'Cobrado (Neto)', 'Por Cobrar', 'Tickets']],
            body: [[
                `S/ ${stats.ventasBrutas.toFixed(2)}`,
                `S/ ${stats.ventasNetas.toFixed(2)}`,
                `S/ ${stats.cuentasPorCobrar.toFixed(2)}`,
                stats.cantidadPedidos
            ]],
            theme: 'striped',
            headStyles: { fillColor: azul }
        });

        // 2. Top Productos
        doc.text('2. Productos Más Vendidos', 14, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Producto', 'Unidades Vendidas', 'Ingresos Generados']],
            body: topProductos.map(p => [p.nombre, p.cantidad, `S/ ${p.ventas.toFixed(2)}`]),
            theme: 'grid',
            headStyles: { fillColor: [39, 174, 96] } // Verde
        });

        // 3. Top Clientes
        doc.text('3. Mejores Clientes', 14, doc.lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Cliente', 'Pedidos', 'Total Comprado']],
            body: topClientes.map(c => [c.nombre, c.pedidos, `S/ ${c.total.toFixed(2)}`]),
            theme: 'grid',
            headStyles: { fillColor: [142, 68, 173] } // Morado
        });

        doc.save(`Reporte_Gerencial_${fechaInicio}.pdf`);
        doc.save(`Reporte_Gerencial_${fechaInicio}.pdf`);
    };

    const handleVerDetalles = (pedido) => {
        setSelectedPedido(pedido);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedPedido(null);
    };

    // ========================================
    // PAYMENT HANDLERS (Duplicados de Pedidos.jsx)
    // ========================================
    const handleOpenPayModal = (pedido) => {
        setPayPedido(pedido);
        setPayData({
            monto: pedido.monto_saldo > 0 ? pedido.monto_saldo : '',
            fecha: getLocalDate(),
            metodo: 'Efectivo'
        });
        setShowPayModal(true);
    };

    const handleClosePayModal = () => {
        setShowPayModal(false);
        setPayPedido(null);
    };

    const handleQuickPay = async () => {
        if (!payPedido || !payData.monto) return;

        try {
            const montoPago = parseFloat(payData.monto);
            const nuevoAcuenta = (Number(payPedido.monto_a_cuenta) || 0) + montoPago;
            const nuevoSaldo = Number(payPedido.precio_total) - nuevoAcuenta;
            const cancelado = nuevoSaldo <= 0.05;

            // Actualizar pedido
            await pedidosDB.update(payPedido.id_pedido, {
                ...payPedido,
                monto_a_cuenta: nuevoAcuenta,
                monto_saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo,
                cancelado: cancelado
            });

            // Registrar pago
            await pedidosDB.createPago({
                id_pedido: payPedido.id_pedido,
                monto: montoPago,
                fecha_pago: payData.fecha,
                metodo_pago: payData.metodo,
                referencia: 'Pago desde Reporte'
            });

            // ── Si se canceló el saldo → registrar en Ventas (con anti-duplicado) ──
            if (cancelado) {
                const codigoPed = `PED-${String(payPedido.id_pedido).padStart(4, '0')}`;
                const ventasExistentes = await ventasDB.getAll();
                const yaRegistrado = ventasExistentes.some(v =>
                    v.detalles && v.detalles.some(d => d.producto_codigo === codigoPed)
                );
                if (!yaRegistrado) {
                    await ventasDB.createVentaPedido({
                        pedidoId: payPedido.id_pedido,
                        clienteNombre: payPedido.nombre_cliente,
                        total: payPedido.precio_total,
                        formaPago: payData.metodo || payPedido.forma_pago,
                        costo_materiales: 0,
                        observaciones: `Cobro pedido #${payPedido.id_pedido}`,
                        fecha_venta: new Date().toISOString()
                    });
                    toast.success('Ingreso registrado en Reporte de Ventas ✅');
                }
            }

            toast.success('Pago registrado correctamente');
            handleClosePayModal();
            fetchReportData();

        } catch (error) {
            console.error('Error al registrar pago:', error);
            toast.error('Error al registrar pago');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Nav */}
                {/* Header Nav */}
                <div className="flex items-center mb-6 pt-2 md:pt-6">
                    <Link to="/inventario-home" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <FaArrowLeft size={18} />
                    </Link>
                    <div className="ml-3">
                        <h1 className="text-lg font-bold text-gray-800">Resumen de Pedidos y Métricas</h1>
                    </div>
                </div>

                {/* 1. KPIs Financieros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> {/* Reduced gap */}
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

                {/* Filtros de Fecha */}
                <div className="w-full flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-white p-3 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center space-x-1 w-full sm:w-auto">
                        <span className="text-xs text-gray-500 font-medium">Del</span>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            className="flex-1 sm:flex-none border-gray-300 rounded-md text-xs py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-1 w-full sm:w-auto">
                        <span className="text-xs text-gray-500 font-medium">Al</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={e => setFechaFin(e.target.value)}
                            className="flex-1 sm:flex-none border-gray-300 rounded-md text-xs py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => fetchReportData()}
                            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs font-medium flex justify-center items-center transition-all"
                        >
                            <FaFilter className="mr-1.5" /> Filtrar
                        </button>
                        <button
                            onClick={resetFilters}
                            className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium flex justify-center items-center transition-all"
                        >
                            <FaTrash className="mr-1.5" /> Borrar
                        </button>
                    </div>
                </div>

                {/* Title Section */}
                <div className="mt-8 mb-4 px-2 md:px-0">
                    <h2 className="text-lg font-bold text-gray-800">Consulta de Pedidos</h2>
                </div>

                {/* Tabs de Navegación */}
                {/* Tabs de Navegación */}
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
                            {/* Active Indicator */}
                            {activeTab === tab.id && (
                                <div className="absolute -bottom-2 w-full h-1 bg-blue-600 rounded-full transition-all"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Dynamic List Header */}
                <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex justify-start">
                    <h3 className="text-sm font-normal text-gray-800 uppercase tracking-wide">
                        PEDIDOS {activeTab === 'Todos' ? 'TOTALES' : activeTab === 'Pedidos' ? 'PENDIENTES' : activeTab.toUpperCase()} <span className="ml-2 text-base font-medium">{getFilteredData().length}</span>
                    </h3>
                </div>

                {/* Tabla de Reporte */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Pedido</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto(s)</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {activeTab === 'Entregados' ? 'Fecha Entrega' :
                                            activeTab === 'Producción' ? 'Fecha Inicio' :
                                                activeTab === 'Terminados' ? 'Fecha Término' : 'Fecha Pedido'}
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    {activeTab !== 'Entregados' && (
                                        <>
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                                        </>
                                    )}
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {getFilteredData().length > 0 ? (
                                    getFilteredData().map((pedido) => (
                                        <tr key={pedido.id_pedido} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-2 whitespace-nowrap text-left">
                                                <span className="text-sm text-gray-900">
                                                    #{pedido.id_pedido.toString().padStart(3, '0')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-left">
                                                <div className="text-sm text-gray-900">{pedido.nombre_cliente}</div>
                                            </td>
                                            <td className="px-4 py-2 text-left">
                                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                                    {pedido.detalles_pedido && pedido.detalles_pedido.length > 0
                                                        ? pedido.detalles_pedido.map(d => `${d.cantidad} ${d.nombre_producto}`).join(', ')
                                                        : 'Sin productos'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-left">
                                                {/* Fecha Clave Logic */}
                                                {activeTab === 'Entregados' && pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-PE') :
                                                    activeTab === 'Entregados' ? '-' :
                                                        activeTab === 'Terminados' ? (pedido.updated_at ? new Date(pedido.updated_at).toLocaleDateString('es-PE') : '-') : // Approx for Terminado
                                                            new Date(pedido.fecha_pedido).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-left text-gray-900">
                                                S/ {Number(pedido.precio_total).toFixed(2)}
                                            </td>
                                            {activeTab !== 'Entregados' && (
                                                <>
                                                    {/* PAGO */}
                                                    <td className="px-4 py-2 whitespace-nowrap text-center">
                                                        {Number(pedido.monto_saldo) <= 0.05 ? (
                                                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">Pagado</span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">Pendiente</span>
                                                        )}
                                                    </td>
                                                    {/* SALDO */}
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-left">
                                                        {Number(pedido.monto_saldo) > 0 ? (
                                                            <span className="text-red-500">S/ {Number(pedido.monto_saldo).toFixed(2)}</span>
                                                        ) : (
                                                            <span className="text-green-500">S/ 0.00</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-4 py-2 whitespace-nowrap text-left">
                                                <div className="flex items-center space-x-2">
                                                    {Number(pedido.monto_saldo) > 0.1 && activeTab !== 'Producción' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenPayModal(pedido);
                                                            }}
                                                            className="text-green-600 hover:text-green-800 transition-colors"
                                                            title="Registrar Pago"
                                                        >
                                                            <FaMoneyBillWave className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleVerDetalles(pedido)}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        title="Ver Detalle"
                                                    >
                                                        <FaEye className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'Entregados' ? "6" : "8"} className="px-6 py-12 text-center text-gray-400 text-sm">
                                            No se encontraron pedidos en esta categoría.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Simple Placeholder) */}
                    <div className="bg-gray-50 px-6 py-6 mt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Mostrando {getFilteredData().length} registros</span>
                        <div className="flex space-x-1">
                            <button className="px-3 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600 disabled:opacity-50">Anterior</button>
                            <button className="px-3 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600">Siguiente</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle de Pedido (Replicado de Pedidos.jsx) */}
            {showDetailModal && selectedPedido && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start md:items-center justify-center p-4 pt-24 md:pt-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-bold text-gray-800">Detalle del Pedido #{selectedPedido.id_pedido}</h3>
                            <button onClick={closeDetailModal} className="text-gray-600 hover:text-gray-800">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        {/* Content (Printable Area) */}
                        <div className="p-8 overflow-y-auto bg-white" id="printable-area-report">
                            <div className="text-center mb-6 border-b pb-4">
                                <p className="text-sm text-gray-500 mb-1">Enigma artesanías y accesorios</p>
                                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-900">Nota de Pedido</h1>
                                <p className="text-sm text-gray-500 mt-1">{formatLocalDate(selectedPedido.fecha_pedido)}</p>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                <div className="text-left">
                                    <h4 className="font-bold text-gray-700 mb-1">Cliente</h4>
                                    <p className="text-gray-900">{selectedPedido.nombre_cliente}</p>
                                    <div className="flex items-center text-gray-600 mt-1">
                                        <FaPhone className="mr-1" size={12} />
                                        <span>{selectedPedido.telefono}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {selectedPedido.requiere_envio && (
                                        <>
                                            <h4 className="font-bold text-gray-700 mb-1">Envío</h4>
                                            <p className="text-gray-900">{selectedPedido.direccion_entrega}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 text-left">
                                <h4 className="font-bold text-gray-700 text-xs mb-2 uppercase tracking-wider text-teal-600 text-left">Productos</h4>
                                <div className="space-y-3">
                                    {selectedPedido.detalles_pedido && selectedPedido.detalles_pedido.map((d, index) => (
                                        <div key={index} className="pl-0 text-left">
                                            <div className="text-[7px] font-normal text-teal-800 flex items-center mb-0.5 text-left">
                                                <span className="mr-1">•</span>
                                                {d.tipo_producto || 'Producto'} - {d.metal || 'Metal'}
                                                {d.cantidad > 1 && <span className="text-gray-600 ml-1">(x{d.cantidad})</span>}
                                            </div>
                                            <div className="text-[7px] text-gray-800 font-normal pl-2 leading-tight text-left">
                                                {d.nombre_producto}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 mt-4 pt-2">
                                <div className="w-full max-w-[200px] ml-auto text-[10px]">
                                    {/* Totals Section */}
                                    {selectedPedido.incluye_igv && (
                                        <>
                                            <div className="flex justify-between text-gray-600 mb-1">
                                                <span>IGV (18%):</span>
                                                <span>S/ {Number(selectedPedido.monto_igv).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-800 font-semibold">
                                                <span>Total Venta:</span>
                                                <span>S/ {(Number(selectedPedido.precio_total_sin_igv) + Number(selectedPedido.monto_igv)).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Costo de Envío (Azul) */}
                                    {selectedPedido.envio_cobrado_al_cliente > 0 && (
                                        <div className="flex justify-between text-blue-600 font-medium mt-1">
                                            <span>Costo de Envío:</span>
                                            <span>S/ {Number(selectedPedido.envio_cobrado_al_cliente).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between font-bold text-sm border-t pt-1 mt-1">
                                        <span>
                                            {selectedPedido.envio_cobrado_al_cliente > 0
                                                ? "TOTAL A PAGAR + ENV.:"
                                                : (selectedPedido.incluye_igv ? "TOTAL:" : "TOTAL A PAGAR:")}
                                        </span>
                                        <span>S/ {Number(selectedPedido.precio_total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Espaciador Vertical */}
                            <div className="py-2"></div>

                            {/* Sección 2: Estado de Cuenta */}
                            <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">Estado de Cuenta</h4>

                            {/* Tabla de Adelantos */}
                            <div className="mb-2">
                                <div className="flex justify-between font-bold text-xs text-gray-600 border-b pb-1 mb-1">
                                    <span>Adelantos (Pagos a Cuenta)</span>
                                    <span>Método</span>
                                    <span>Monto</span>
                                </div>
                                {selectedPedido.pagos && selectedPedido.pagos.length > 0 ? (
                                    selectedPedido.pagos.sort((a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago)).map((pago, idx) => (
                                        <div key={idx} className="flex justify-between text-xs py-1">
                                            <span>{formatLocalDate(pago.fecha_pago)}</span>
                                            <span>{pago.metodo_pago}</span>
                                            <span>S/ {Number(pago.monto).toFixed(2)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-center text-gray-400 italic">No hay pagos registrados</div>
                                )}
                            </div>

                            <div className="flex justify-between font-bold text-red-600 border-t pt-1 mt-1 text-sm">
                                <span>SALDO PENDIENTE:</span>
                                <span>S/ {Number(selectedPedido.monto_saldo) > 0.1 ? Number(selectedPedido.monto_saldo).toFixed(2) : '0.00'}</span>
                            </div>


                            <div className="mt-8 pt-4 border-t text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Aclaración Importante</p>
                                <p className="text-xs text-gray-500 leading-snug">Esta Nota de Pedido no tiene validez como comprobante de pago.</p>
                                <p className="text-xs text-gray-600 font-semibold mt-0.5">¡Gracias por tu pedido!</p>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end items-center">
                            {/* Botones de Acción (Derecha) */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={async () => {
                                        const element = document.getElementById('printable-area-report');
                                        const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });

                                        canvas.toBlob(async (blob) => {
                                            const file = new File([blob], `pedido_${selectedPedido.id_pedido}.jpg`, { type: 'image/jpeg' });

                                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                try {
                                                    await navigator.share({
                                                        files: [file],
                                                        title: `Pedido #${selectedPedido.id_pedido}`,
                                                        text: `Nota de Pedido para ${selectedPedido.nombre_cliente}`
                                                    });
                                                } catch (_) {
                                                    // Fallback: descargar directamente
                                                    const link = document.createElement('a');
                                                    link.download = `pedido_${selectedPedido.id_pedido}.jpg`;
                                                    link.href = canvas.toDataURL('image/jpeg', 0.9);
                                                    link.click();
                                                }
                                            } else {
                                                // Dispositivo no soporta share con archivos, descargar
                                                const link = document.createElement('a');
                                                link.download = `pedido_${selectedPedido.id_pedido}.jpg`;
                                                link.href = canvas.toDataURL('image/jpeg', 0.9);
                                                link.click();
                                            }
                                        }, 'image/jpeg', 0.9);
                                    }}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center transition-colors"
                                    title="Compartir Imagen del Pedido"
                                >
                                    <FaImage className="h-5 w-5" />
                                </button>
                                <button onClick={closeDetailModal} className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div >
                </div >
            )}

            {/* Modal de Pago Rápido (Duplicado) */}
            {
                showPayModal && payPedido && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                                <h3 className="text-lg font-bold text-gray-800">Registrar Pago / Adelanto</h3>
                                <button onClick={handleClosePayModal} className="text-gray-600 hover:text-gray-800">
                                    <FaTimesCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="mb-4 text-sm text-gray-600">
                                    Cliente: <span className="font-bold">{payPedido.nombre_cliente}</span><br />
                                    Saldo Pendiente: <span className="font-bold text-red-600">S/ {Number(payPedido.monto_saldo).toFixed(2)}</span>
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Monto a Pagar</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={payData.monto}
                                            onChange={(e) => setPayData({ ...payData, monto: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                        <input
                                            type="date"
                                            value={payData.fecha}
                                            onChange={(e) => setPayData({ ...payData, fecha: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                                        <select
                                            value={payData.metodo}
                                            onChange={(e) => setPayData({ ...payData, metodo: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        >
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Yape">Yape</option>
                                            <option value="Plin">Plin</option>
                                            <option value="Transferencia">Transferencia</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                                <button onClick={handleClosePayModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                    Cancelar
                                </button>
                                <button onClick={handleQuickPay} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                    Confirmar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <Toaster position="top-right" />
        </div>
    );
};

export default ReportePedidos;
