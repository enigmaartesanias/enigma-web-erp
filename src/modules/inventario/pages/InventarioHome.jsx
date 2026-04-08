import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, ShoppingCart, Hammer, BarChart3, FileText,
    ClipboardList, Users, Database, QrCode, LayoutDashboard,
    Plus, Receipt, Tag, History, Layers, RefreshCw
} from 'lucide-react';
import { pedidosDB } from '../../../utils/pedidosNeonClient';

export default function InventarioHome() {
    const [counts, setCounts] = useState({ pending: 0, production: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchStatus();
        // Actualización automática cada 30 segundos
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        setIsRefreshing(true);
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
        } catch (error) {
            console.error('Error fetching status for dashboard:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const groups = [
        {
            id: 'comercial',
            title: 'COMERCIAL',
            icon: ShoppingCart,
            order: 'order-1',
            items: [
                { label: 'VENDER', sub: 'Registrar ventas', path: '/ventas/nueva', icon: ShoppingCart, color: 'text-blue-600' },
                { label: 'VER VENTAS', sub: 'Estadísticas ventas', path: '/ventas/reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'logistica',
            title: 'LOGÍSTICA',
            icon: ClipboardList,
            order: 'order-2',
            items: [
                { label: 'PEDIDOS', id: 'pedidos', sub: 'Control de pedidos', path: '/admin/pedidos', icon: ClipboardList, color: 'text-amber-600' },
                { label: 'HISTORIAL PEDIDOS', sub: 'Análisis y histórico', path: '/admin/reportes', icon: FileText, color: 'text-gray-400' }
            ]
        },
        {
            id: 'operaciones',
            title: 'PRODUCCIÓN',
            icon: Hammer,
            order: 'order-3',
            items: [
                { label: 'PRODUCCIÓN', id: 'produccion', sub: 'Gestión del taller', path: '/produccion', icon: Hammer, color: 'text-emerald-600' },
                { label: 'HISTORIAL PRODUCCIÓN', sub: 'Métricas y costos', path: '/produccion-reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'almacen',
            title: 'ALMACÉN',
            icon: Package,
            order: 'order-last',
            items: [
                { label: 'INVENTARIO', sub: 'Agregar productos', path: '/inventario/nuevo', icon: Package, color: 'text-slate-600' },
                { label: 'REPORTE INVENTARIO', sub: 'Stock y detalles', path: '/inventario', icon: FileText, color: 'text-gray-400' }
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
                { label: 'CUENTAS POR COBRAR', sub: 'Gestión de créditos', path: '/cuentas-por-cobrar', icon: FileText, color: 'text-gray-400' }
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
        let statusColor = "";

        if (item.id === 'pedidos' && counts.pending > 0) {
            statusText = `${counts.pending} pendientes`;
            statusColor = "text-amber-600 bg-amber-50 border-amber-100";
        } else if (item.id === 'produccion' && counts.production > 0) {
            statusText = `${counts.production} en proceso`;
            statusColor = "text-blue-600 bg-blue-50 border-blue-100";
        }

        return (
            <Link
                to={item.path}
                className="bg-white border border-gray-100 rounded-2xl p-2.5 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] group relative min-h-[90px] sm:min-h-0"
            >
                <div className={`p-2 sm:p-3 rounded-xl ${item.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-10 transition-transform group-hover:scale-110 shrink-0`}>
                    <item.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${item.color}`} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden w-full space-y-1">
                    <h4 className="text-[9px] sm:text-[13px] font-medium text-gray-800 leading-none sm:leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-wider whitespace-normal line-clamp-2">
                        {item.label}
                    </h4>
                    {statusText && (
                        <div className={`px-1 py-0.5 rounded-md text-[6px] sm:text-[8px] font-medium uppercase tracking-tighter ${statusColor} border border-opacity-50 animate-pulse whitespace-nowrap`}>
                            {statusText}
                        </div>
                    )}
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50/30 pb-20 font-sans antialiased text-gray-900">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center text-center">
                    <div className="flex items-center gap-4 mb-2">
                        <Link
                            to="/admin"
                            className="text-[11px] font-medium text-gray-400 hover:text-black transition-all flex items-center gap-1.5 group"
                        >
                            <span className="text-sm leading-none transform group-hover:-translate-x-1 transition-transform">←</span>
                            Volver al Panel Admin
                        </Link>
                        <button 
                            onClick={fetchStatus}
                            className={`p-1 text-gray-300 hover:text-blue-500 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Actualizar estados"
                        >
                            <RefreshCw size={12} />
                        </button>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 tracking-tight">
                        Enigma Sistema ERP
                    </h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 mt-12">
                <div className="space-y-12">
                    {groups.map((group) => (
                        <div key={group.id} className={`${group.order} space-y-4`}>
                            <h2 className="text-[11px] font-semibold text-gray-400 tracking-[0.2em] uppercase flex items-center gap-2 px-1">
                                <group.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                                {group.title}
                            </h2>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {group.items.map((item, idx) => (
                                    <IndividualCard key={idx} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>


                <div className="mt-28 mb-12 flex flex-col items-center">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>
                    <span className="text-[11px] font-black text-gray-400 tracking-[0.5em] uppercase">Datos Maestros</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5">
                    {maestros.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.path}
                            className="group flex flex-col items-center p-6 bg-white border border-gray-100/60 hover:border-gray-300 hover:shadow-md transition-all rounded-xl active:scale-95"
                        >
                            <item.icon className={`w-6 h-6 mb-3 ${item.color} opacity-60 group-hover:opacity-100 transition-opacity`} strokeWidth={1.5} />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-800 uppercase tracking-widest text-center leading-tight">
                                {item.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </main>

            <footer className="max-w-6xl mx-auto px-6 mt-32 text-center pb-10">
                <div className="flex items-center justify-center gap-5 mb-6">
                    <div className="h-[1px] w-10 bg-gray-200"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600/20"></div>
                    <div className="h-[1px] w-10 bg-gray-200"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-300 tracking-[0.8em] uppercase">
                    E N I G M A · G E S T I O N
                </span>
            </footer>
        </div>
    );
}
