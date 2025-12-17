import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Clipboard, Hammer, BarChart3, FileText, ClipboardList, LineChart, QrCode } from 'lucide-react';

export default function InventarioHome() {
    const pedidosReportes = [
        {
            title: 'Pedidos',
            icon: ClipboardList,
            path: '/admin/pedidos',
            description: 'Registra y controla los pedidos manuales',
            color: 'bg-purple-600'
        },
        {
            title: 'Reportes',
            icon: LineChart,
            path: '/admin/reportes',
            description: 'Visualiza estadísticas y exporta reportes en PDF',
            color: 'bg-red-600'
        }
    ];

    const produccionReporte = [
        {
            title: 'Producción',
            icon: Hammer,
            path: '/produccion',
            description: 'Gestión del taller y fabricación',
            color: 'bg-blue-500'
        },
        {
            title: 'Reporte Prod.',
            icon: BarChart3,
            path: '/produccion-reporte',
            description: 'Métricas y Costos',
            color: 'bg-blue-700'
        }
    ];

    const accionesInventario = [
        {
            title: 'Inventario',
            icon: Clipboard,
            path: '/inventario/nuevo',
            description: 'Agregar productos',
            color: 'bg-teal-600'
        },
        {
            title: 'Reporte Inv.',
            icon: BarChart3,
            path: '/inventario',
            description: 'Ver stock y detalles',
            color: 'bg-teal-500'
        },
        {
            title: 'Códigos QR',
            icon: QrCode,
            path: '/admin/codigos-qr',
            description: 'Imprimir etiquetas QR',
            color: 'bg-gray-800'
        }
    ];

    const operacionesComerciales = [
        {
            title: 'Ventas',
            icon: ShoppingCart,
            path: '/ventas',
            description: 'Registro de ventas',
            color: 'bg-green-500'
        },
        {
            title: 'Compras',
            icon: Package,
            path: '/compras',
            description: 'Gestión de compras',
            color: 'bg-orange-500'
        },
        {
            title: 'Stock Inicial',
            icon: ClipboardList,
            path: '/stock-inicial',
            description: 'Carga inicial de inventario',
            color: 'bg-indigo-500'
        }
    ];

    const ModuleCard = ({ module }) => {
        const Icon = module.icon;
        return (
            <Link
                to={module.path}
                className="block p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100 h-full flex flex-col items-center justify-center"
            >
                <div className={`w-12 h-12 ${module.color.replace('600', '50').replace('500', '50').replace('700', '50')} rounded-full flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${module.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1 leading-tight">
                    {module.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                    {module.description}
                </p>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Enigma Sistema ERP
                    </h1>
                    <Link
                        to="/admin"
                        className="inline-block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        ← Volver al Panel Admin
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
                    {/* Grupo 1: Pedidos y Reportes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                            Pedidos y Reportes
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {pedidosReportes.map((module) => (
                                <ModuleCard key={module.path} module={module} />
                            ))}
                        </div>
                    </div>

                    {/* Grupo 2: Producción y Reporte */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                            Producción y Reporte
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {produccionReporte.map((module) => (
                                <ModuleCard key={module.path} module={module} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grupo 3: Control de Inventario (NUEVO GRUPO) */}
                <div className="max-w-5xl mx-auto mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                            Control de Inventario
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4 justify-center max-w-2xl mx-auto">
                            {accionesInventario.map((module) => (
                                <ModuleCard key={module.path} module={module} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grupo 4: Operaciones Comerciales */}
                <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                        Gestión Comercial
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                        {operacionesComerciales.map((module) => (
                            <ModuleCard key={module.path} module={module} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
