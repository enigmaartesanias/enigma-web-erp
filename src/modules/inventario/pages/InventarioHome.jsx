import React from 'react';
import { Link } from 'react-router-dom';
import {
    Package, ShoppingCart, Hammer, BarChart3, FileText,
    ClipboardList, Users, Database, QrCode, LayoutDashboard,
    Plus, Receipt, Tag, History, Layers
} from 'lucide-react';
import { useAlerts } from '../../../hooks/useAlerts';
import SubtleAlert from '../../../components/SubtleAlert';

export default function InventarioHome() {
    const { alertMessage, loading } = useAlerts();

    const groups = [
        {
            id: 'comercial',
            title: 'COMERCIAL',
            icon: ShoppingCart,
            order: 'order-1',
            items: [
                { label: 'Ventas', sub: 'Registrar ventas', path: '/ventas/nueva', icon: ShoppingCart, color: 'text-blue-600' },
                { label: 'Reporte Ventas', sub: 'Estadísticas ventas', path: '/ventas/reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'logistica',
            title: 'LOGÍSTICA',
            icon: ClipboardList,
            order: 'order-2',
            items: [
                { label: 'Pedidos', sub: 'Control de pedidos', path: '/admin/pedidos', icon: ClipboardList, color: 'text-amber-600' },
                { label: 'Reporte Pedidos', sub: 'Análisis y histórico', path: '/admin/reportes', icon: FileText, color: 'text-gray-400' }
            ]
        },
        {
            id: 'operaciones',
            title: 'PRODUCCIÓN',
            icon: Hammer,
            order: 'order-3',
            items: [
                { label: 'Producción', sub: 'Gestión del taller', path: '/produccion', icon: Hammer, color: 'text-emerald-600' },
                { label: 'Reporte Producción', sub: 'Métricas y costos', path: '/produccion-reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'almacen',
            title: 'ALMACÉN',
            icon: Package,
            order: 'order-last',
            items: [
                { label: 'Inventario', sub: 'Agregar productos', path: '/inventario/nuevo', icon: Package, color: 'text-slate-600' },
                { label: 'Reporte Inventario', sub: 'Stock y detalles', path: '/inventario', icon: FileText, color: 'text-gray-400' }
            ]
        },
        {
            id: 'insumos',
            title: 'MATERIALES',
            icon: Database,
            order: 'order-last',
            items: [
                { label: 'Ingreso Materiales', sub: 'Registro de materias', path: '/materiales', icon: Database, color: 'text-orange-600' },
                { label: 'Reporte Materiales', sub: 'Consumos y saldos', path: '/materiales/reporte', icon: BarChart3, color: 'text-gray-400' }
            ]
        },
        {
            id: 'finanzas',
            title: 'FINANZAS',
            icon: Receipt,
            order: 'order-last',
            items: [
                { label: 'Gastos', sub: 'Fijos y variables', path: '/gastos', icon: Receipt, color: 'text-purple-600' },
                { label: 'Cuentas por Cobrar', sub: 'Gestión de créditos', path: '/cuentas-por-cobrar', icon: FileText, color: 'text-gray-400' }
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

    const IndividualCard = ({ item }) => (
        <Link
            to={item.path}
            className="bg-white border border-gray-100 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-[0.98] group"
        >
            <div className="mb-4">
                <item.icon className={`w-8 h-8 ${item.color}`} strokeWidth={1.2} />
            </div>
            <h4 className="text-[14px] font-medium text-gray-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                {item.label}
            </h4>
            <p className="text-[11px] font-normal text-gray-400 leading-none">
                {item.sub}
            </p>
        </Link>
    );

    return (
        <div className="min-h-screen bg-neutral-50/30 pb-20 font-sans antialiased text-gray-900">
            {/* Header Zen - Centrado y Minimalista */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center text-center">
                    <Link
                        to="/admin"
                        className="text-[11px] font-medium text-gray-400 hover:text-black transition-all flex items-center gap-1.5 mb-2 group"
                    >
                        <span className="text-sm leading-none transform group-hover:-translate-x-1 transition-transform">←</span>
                        Volver al Panel Admin
                    </Link>

                    <h1 className="text-2xl sm:text-3xl font-normal text-gray-900 tracking-tight">
                        Enigma Sistema ERP
                    </h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 mt-12">
                {/* Alertas */}
                {!loading && alertMessage && (
                    <div className="mb-10 max-w-4xl mx-auto">
                        <SubtleAlert message={alertMessage} />
                    </div>
                )}

                {/* Grupos de Módulos */}
                <div className="space-y-12">
                    {groups.map((group) => (
                        <div key={group.id} className={`${group.order} space-y-4`}>
                            <h2 className="text-[11px] font-semibold text-gray-400 tracking-[0.2em] uppercase flex items-center gap-2 px-1">
                                <group.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                                {group.title}
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {group.items.map((item, idx) => (
                                    <IndividualCard key={idx} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Datos Maestros */}
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
