import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package, ShoppingCart, Hammer, BarChart3, FileText,
    ClipboardList, Users, Database, QrCode, LayoutDashboard,
    Plus, Receipt, Tag, History, Layers, RefreshCw, PenTool, ChevronDown
} from 'lucide-react';
import { FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { pedidosDB } from '../../../utils/pedidosNeonClient';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { cuentasPorCobrarDB } from '../../../utils/cuentasPorCobrarClient';

export default function InventarioHome() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ pending: 0, production: 0, porIngresar: 0, deudasPendientes: 0, deudasVencidas: 0 });
    const [pendingOrders, setPendingOrders] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPendingOpen, setIsPendingOpen] = useState(false);
    const [orderToConfirm, setOrderToConfirm] = useState(null);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        setIsRefreshing(true);
        try {
            const [pedidos, pendientesInv, resumenDeudas] = await Promise.all([
                pedidosDB.getAll(),
                produccionDB.getPendientesInventario(),
                cuentasPorCobrarDB.getResumen()
            ]);

            const pendingList = pedidos
                .filter(p =>
                    p.estado_pedido !== 'entregado' &&
                    p.estado_produccion !== 'terminado' &&
                    p.estado_produccion !== 'en_proceso' &&
                    p.estado_pedido !== 'cancelado'
                )
                .sort((a, b) => new Date(a.fecha_pedido) - new Date(b.fecha_pedido));

            setPendingOrders(pendingList);

            setCounts({
                pending: pendingList.length,
                production: pedidos.filter(p =>
                    p.estado_produccion === 'en_proceso' &&
                    p.estado_pedido !== 'entregado'
                ).length,
                porIngresar: pendientesInv.length,
                deudasPendientes: resumenDeudas.totalCuentas,
                deudasVencidas: resumenDeudas.cuentasVencidas
            });
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const groups = [
        {
            id: 'logistica',
            title: 'LOGÍSTICA',
            icon: ClipboardList,
            order: 'order-1',
            items: [
                { label: 'PEDIDOS', id: 'pedidos', sub: 'Control de pedidos', path: '/admin/pedidos', icon: ClipboardList, color: 'text-amber-600' },
                { label: 'REPORTE PEDIDOS', sub: 'Análisis y histórico', path: '/admin/reportes', icon: FileText, color: 'text-gray-400' }
            ]
        },
        {
            id: 'comercial',
            title: 'COMERCIAL',
            icon: ShoppingCart,
            order: 'order-2',
            items: [
                { label: 'VENDER', sub: 'Registrar ventas', path: '/ventas/nueva', icon: ShoppingCart, color: 'text-blue-600' },
                { label: 'REPORTE VENTAS', sub: 'Estadísticas ventas', path: '/ventas/reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'operaciones',
            title: 'PRODUCCIÓN',
            icon: Hammer,
            order: 'order-3',
            items: [
                { label: 'PRODUCCIÓN', id: 'produccion', sub: 'Gestión del taller', path: '/produccion', icon: Hammer, color: 'text-emerald-600' },
                { label: 'REPORTE PRODUCCIÓN', sub: 'Métricas y costos', path: '/produccion-reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'almacen',
            title: 'ALMACÉN',
            icon: Package,
            order: 'order-last',
            items: [
                { label: 'INVENTARIO', sub: 'Agregar productos', path: '/inventario/nuevo', icon: Package, color: 'text-slate-600' },
                { label: 'REPORTE INVENTARIO', id: 'reporte_inventario', sub: 'Stock y detalles', path: '/inventario', icon: FileText, color: 'text-gray-400' }
            ]
        },
        {
            id: 'herramientas',
            title: 'ATENCIÓN Y VENTAS VIP',
            icon: PenTool,
            order: 'order-last',
            items: [
                { label: 'COTIZADOR AUTOR', sub: 'Propuestas de Diseño', path: '/cotizador', icon: PenTool, color: 'text-indigo-600' }
            ]
        },
        {
            id: 'insumos',
            title: 'MATERIALES',
            icon: Database,
            order: 'order-last',
            items: [
                { label: 'MATERIALES', sub: 'Registro de materias', path: '/materiales', icon: Database, color: 'text-orange-600' },
                { label: 'REPORTE MATERIALES', sub: 'Consumos y saldos', path: '/materiales/reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'finanzas',
            title: 'FINANZAS',
            icon: Receipt,
            order: 'order-last',
            items: [
                { label: 'GASTOS', sub: 'Fijos y variables', path: '/gastos', icon: Receipt, color: 'text-purple-600' },
                { label: 'CUENTAS POR COBRAR', id: 'deudas', sub: 'Gestión de créditos', path: '/cuentas-por-cobrar', icon: FileText, color: 'text-gray-400' }
            ]
        }
    ];

    const maestros = [
        { title: 'Clientes', icon: Users, path: '/clientes', color: 'text-blue-500' },
        { title: 'Proveedores', icon: Users, path: '/proveedores', color: 'text-amber-500' },
        { title: 'Tipos Prod', icon: Tag, path: '/configuracion/tipos-producto', color: 'text-emerald-500' },
        { title: 'Tipos Mat', icon: Tag, path: '/config/tipos-materiales', color: 'text-orange-500' },
        { title: 'QR Etiquetas', icon: QrCode, path: '/admin/codigos-qr', color: 'text-slate-500' },
        { title: 'Carga Inicial', icon: History, path: '/stock-inicial', color: 'text-gray-500' },
    ];

    const IndividualCard = ({ item }) => {
        let statusText = null;
        let statusColor = "text-amber-600 bg-amber-50 border-amber-100";

        if (item.id === 'pedidos' && counts.pending > 0) {
            // Removido por redundancia con la sección PENDIENTE
            statusText = null;
        } else if (item.id === 'reporte_inventario' && counts.porIngresar > 0) {
            statusText = `${counts.porIngresar} POR INGRESAR`;
        } else if (item.id === 'deudas') {
            if (counts.deudasVencidas > 0) {
                statusText = `${counts.deudasVencidas} VENCIDAS`;
                statusColor = "text-red-600 bg-red-50 border-red-100";
            } else if (counts.deudasPendientes > 0) {
                statusText = `${counts.deudasPendientes} PENDIENTES`;
                statusColor = "text-blue-600 bg-blue-50 border-blue-100";
            }
        }

        return (
            <Link
                to={item.path}
                className="bg-white border border-gray-100 rounded-2xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] group relative"
            >
                <div className={`p-2 sm:p-3 rounded-xl ${item.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-10 transition-transform group-hover:scale-110 shrink-0`}>
                    <item.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${item.color}`} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden w-full space-y-1">
                    <h4 className="text-[9px] sm:text-[13px] font-medium text-gray-800 leading-none group-hover:text-blue-600 uppercase tracking-wider">
                        {item.label}
                    </h4>
                    {statusText && (
                        <div className={`px-1 py-0.5 rounded-md text-[6px] sm:text-[8px] font-medium uppercase tracking-tighter ${statusColor} border animate-pulse`}>
                            {statusText}
                        </div>
                    )}
                </div>
            </Link>
        );
    };

    const PendingOrdersList = () => {
        if (pendingOrders.length === 0) return null;

        const calculateDays = (dateStr) => {
            const today = new Date();
            const created = new Date(dateStr);
            const diffTime = Math.abs(today - created);
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        };

        const handleRowClick = (order) => {
            setOrderToConfirm(order);
        };

        const confirmProduction = () => {
            const orderId = orderToConfirm.id_pedido;
            setOrderToConfirm(null);
            setIsPendingOpen(false);
            navigate(`/produccion?pedido=${orderId}`);
        };

        return (
            <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all duration-300">
                <button
                    onClick={() => setIsPendingOpen(!isPendingOpen)}
                    className="w-full p-2.5 flex justify-between items-center bg-gray-50/30 hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3 pl-4">
                        <span className="text-[9px] font-normal text-gray-700  tracking-[0.2em]">Pedidos pendiente</span>
                        <span className="text-[9px] font-normal text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100/50">
                            {pendingOrders.length}
                        </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${isPendingOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPendingOpen && (
                    <div className="divide-y divide-gray-50 max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                        {pendingOrders.map((order) => (
                            <div
                                key={order.id_pedido}
                                onClick={() => handleRowClick(order)}
                                className="px-3 py-1.5 hover:bg-blue-50/20 active:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1 text-[8px]">
                                    <span className="text-gray-500 font-normal whitespace-nowrap">#{order.id_pedido}</span>
                                    <span className="text-gray-600 truncate font-normal">{order.nombre_cliente}</span>
                                    <span className="text-gray-400 whitespace-nowrap font-normal flex items-center gap-1">
                                        • {calculateDays(order.fecha_pedido)} d
                                    </span>
                                </div>
                                {order.monto_saldo > 0 && (
                                    <div className="text-right shrink-0 ml-3">
                                        <span className="text-[8px] font-normal text-red-400">
                                            S/ {order.monto_saldo.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Confirmación Minimalista */}
                {orderToConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/5 backdrop-blur-[2px] animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-[260px] border border-gray-50 animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center gap-3 text-center mb-5">
                                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                                    <Hammer className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[12px] text-gray-800 font-medium leading-tight">Iniciar Producción</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-normal">Pedido #{orderToConfirm.id_pedido}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setOrderToConfirm(null)}
                                    className="flex-1 py-2.5 text-[10px] font-medium text-gray-400 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={confirmProduction}
                                    className="flex-[2] py-2.5 text-[10px] font-medium text-white bg-neutral-900 rounded-xl shadow-lg shadow-neutral-200 hover:bg-black transition-all active:scale-[0.98]"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50/30 pb-20">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 sm:py-8 flex flex-col items-center text-center">
                    <div className="flex items-center gap-4 mb-1">
                        <Link to="/admin" className="text-[10px] sm:text-[11px] font-medium text-gray-400 hover:text-black">
                            ← Volver al Panel Admin
                        </Link>
                        <button onClick={fetchStatus} className={isRefreshing ? 'animate-spin text-blue-500' : 'text-gray-300'}><RefreshCw size={10} /></button>
                    </div>
                    <h1 className="text-xl sm:text-3xl font-normal text-gray-900 tracking-tight leading-none mb-1">Enigma Sistema ERP</h1>
                    <a
                        href="https://artesaniasenigma.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] sm:text-[10px] text-blue-500 hover:underline opacity-80"
                    >
                        artesaniasenigma.com
                    </a>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 mt-12">
                <div className="space-y-12">
                    {groups.map((group) => {
                        const isLogistica = group.id === 'logistica';
                        return (
                            <div
                                key={group.id}
                                className={`space-y-4 ${isLogistica ? 'bg-white p-4 -mx-4 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]' : ''}`}
                            >
                                <h2 className={`text-[11px] font-semibold text-gray-400 tracking-[0.2em] uppercase flex items-center gap-2 px-1 ${isLogistica ? 'mb-2' : ''}`}>
                                    <group.icon size={14} className={isLogistica ? 'text-amber-500' : ''} /> {group.title}
                                </h2>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {group.items.map((item, idx) => (
                                        <IndividualCard key={idx} item={item} />
                                    ))}
                                </div>
                                {isLogistica && <PendingOrdersList />}
                            </div>
                        );
                    })}
                </div>

                {/* ── SECCIÓN NUEVA: FINANZAS (DASHBOARD Y DEUDAS) ──────────────────────────── */}
                <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FaChartLine className="text-indigo-500" /> Finanzas Avanzadas
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">

                        {/* Reporte Financiero */}
                        <Link to="/dashboard"
                            className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center
                                 justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98]
                                 border-t-4 border-indigo-500">
                            <FaChartLine className="text-indigo-500 text-2xl" />
                            <span className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Dashboard</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Rentabilidad Real</span>
                        </Link>

                        {/* Deudas y Préstamos */}
                        <Link to="/deudas"
                            className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center
                                 justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98]
                                 border-t-4 border-red-500">
                            <FaMoneyBillWave className="text-red-500 text-2xl" />
                            <span className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Deudas</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Gestión Créditos</span>
                        </Link>

                        {/* Popularidad de Productos */}
                        <Link to="/ventas/popularidad"
                            className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center
                                 justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98]
                                 border-t-4 border-amber-400">
                            <span className="text-2xl">⭐</span>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wider text-center">Popularidad</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase">Producto Estrella</span>
                        </Link>

                    </div>
                </div>

                <div className="mt-28 mb-12 flex flex-col items-center text-gray-400">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">Datos Maestros</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                    {maestros.map((item, idx) => (
                        <Link key={idx} to={item.path} className="group flex flex-col items-center p-6 bg-white border border-gray-100/60 rounded-xl hover:shadow-md transition-all">
                            <item.icon className={`w-6 h-6 mb-3 ${item.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-800 uppercase tracking-widest text-center">{item.title}</span>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}