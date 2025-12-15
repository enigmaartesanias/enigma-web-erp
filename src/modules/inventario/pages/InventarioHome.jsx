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
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6 text-center">
                        Ventas y Análisis
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                        {salesModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <Link
                                    key={module.path}
                                    to={module.path}
                                    className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 ${module.color.replace('600', '50')} rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                                        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${module.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <h3 className="text-base md:text-xl font-medium text-gray-800 mb-1">
                                        {module.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        {module.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Divisor visual */}
                <div className="border-t-2 border-gray-200 my-8 max-w-4xl mx-auto"></div>

                {/* Sección: Gestión de Producción e Inventario */}
                <div>
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6 text-center">
                        Gestión de Producción e Inventario
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                        {productionModules.map((module) => {
                            const Icon = module.icon;
                            return (
                                <Link
                                    key={module.path}
                                    to={module.path}
                                    className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
                                >
                                    <div className={`w-12 h-12 md:w-16 md:h-16 ${module.color.replace('500', '50')} rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                                        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${module.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <h3 className="text-base md:text-xl font-medium text-gray-800 mb-1">
                                        {module.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        {module.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
