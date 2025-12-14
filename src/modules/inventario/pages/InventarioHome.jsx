import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Clipboard, Hammer, BarChart3, FileText, ClipboardList, LineChart } from 'lucide-react';

export default function InventarioHome() {
    const salesModules = [
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

    const productionModules = [
        {
            title: 'Producción',
            icon: Hammer,
            path: '/produccion',
            description: 'Gestión del taller y fabricación',
            color: 'bg-blue-500'
        },
        {
            title: 'Ventas',
            icon: ShoppingCart,
            path: '/ventas',
            description: 'Registro de ventas',
            color: 'bg-green-500'
        },
        {
            title: 'Catálogo',
            icon: FileText,
            path: '/catalogo-inventario',
            description: 'Productos del catálogo',
            color: 'bg-purple-500'
        },
        {
            title: 'Compras',
            icon: Package,
            path: '/compras',
            description: 'Gestión de compras',
            color: 'bg-orange-500'
        },
        {
            title: 'Inventario',
            icon: BarChart3,
            path: '/inventario',
            description: 'Control de stock',
            color: 'bg-teal-500'
        },
        {
            title: 'Stock Inicial',
            icon: Clipboard,
            path: '/stock-inicial',
            description: 'Carga inicial de inventario',
            color: 'bg-indigo-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Enigma Sistema ERP
                    </h1>
                    <p className="text-lg text-gray-600">
                        Gestión integral del taller de artesanías
                    </p>
                    <Link
                        to="/admin"
                        className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                    >
                        ← Volver al Panel Admin
                    </Link>
                </div>

                {/* Sección: Ventas y Análisis */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        Ventas y Análisis
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {salesModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <Link
                                    key={module.path}
                                    to={module.path}
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4"
                                    style={{ borderLeftColor: module.color.replace('bg-', '') }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${module.color} p-3 rounded-lg text-white`}>
                                            <Icon size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {module.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Divisor visual */}
                <div className="border-t-2 border-gray-200 my-8 max-w-4xl mx-auto"></div>

                {/* Sección: Gestión de Producción e Inventario */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        Gestión de Producción e Inventario
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productionModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <Link
                                    key={module.path}
                                    to={module.path}
                                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4"
                                    style={{ borderLeftColor: module.color.replace('bg-', '') }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${module.color} p-3 rounded-lg text-white`}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {module.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
