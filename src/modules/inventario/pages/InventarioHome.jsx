import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Hammer, BarChart3, FileText, ClipboardList, Users, Database, QrCode } from 'lucide-react';

export default function InventarioHome() {
    // 1. OPERACIÓN DIARIA - Lo más usado
    const operacionDiaria = [
        {
            title: 'Ventas',
            icon: ShoppingCart,
            path: '/ventas/nueva',
            description: 'Registro de ventas'
        },
        {
            title: 'Pedidos',
            icon: ClipboardList,
            path: '/admin/pedidos',
            description: 'Control de pedidos'
        },
        {
            title: 'Inventario',
            icon: Package,
            path: '/inventario/nuevo',
            description: 'Agregar productos'
        },
        {
            title: 'Compras',
            icon: Package,
            path: '/compras/nuevo',
            description: 'Registrar compras'
        }
    ];

    // 2. PRODUCCIÓN - Taller
    const produccion = [
        {
            title: 'Producción',
            icon: Hammer,
            path: '/produccion',
            description: 'Gestión del taller'
        },
        {
            title: 'Reporte Producción',
            icon: BarChart3,
            path: '/produccion-reporte',
            description: 'Métricas y costos'
        }
    ];

    // 3. REPORTES - Análisis
    const reportes = [
        {
            title: 'Reporte Ventas',
            icon: BarChart3,
            path: '/ventas/reporte',
            description: 'Estadísticas de ventas'
        },
        {
            title: 'Reporte Compras',
            icon: BarChart3,
            path: '/compras/reporte',
            description: 'Historial de compras'
        },
        {
            title: 'Reporte Inventario',
            icon: BarChart3,
            path: '/inventario',
            description: 'Stock y detalles'
        },
        {
            title: 'Reporte Pedidos',
            icon: BarChart3,
            path: '/admin/reportes',
            description: 'Análisis de pedidos'
        }
    ];

    // 4. CONFIGURACIÓN - Datos maestros
    const configuracion = [
        {
            title: 'Clientes',
            icon: Users,
            path: '/clientes',
            description: 'Gestión de clientes'
        },
        {
            title: 'Stock Inicial',
            icon: Database,
            path: '/stock-inicial',
            description: 'Carga inicial'
        },
        {
            title: 'Códigos QR',
            icon: QrCode,
            path: '/admin/codigos-qr',
            description: 'Imprimir etiquetas'
        }
    ];

    const ModuleCard = ({ module }) => {
        const Icon = module.icon;
        return (
            <Link
                to={module.path}
                className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-1 active:scale-95"
            >
                <div className="flex flex-col items-center text-center gap-2">
                    <Icon className="w-8 h-8 text-gray-700 group-hover:text-slate-700 transition-colors" strokeWidth={1.5} />
                    <h3 className="text-base font-semibold text-gray-900">
                        {module.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                        {module.description}
                    </p>
                </div>
            </Link>
        );
    };

    const Section = ({ title, modules, gridCols = "grid-cols-1 sm:grid-cols-2" }) => (
        <div className="mb-6 sm:mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">
                {title}
            </h2>
            <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
                {modules.map((module) => (
                    <ModuleCard key={module.path} module={module} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Enigma Sistema ERP
                    </h1>
                    <Link
                        to="/admin"
                        className="inline-block text-sm text-gray-600 hover:text-slate-700 transition-colors"
                    >
                        ← Volver al Panel Admin
                    </Link>
                </div>

                {/* Secciones */}
                <Section
                    title="Operación Diaria"
                    modules={operacionDiaria}
                    gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-2"
                />

                <Section
                    title="Producción"
                    modules={produccion}
                    gridCols="grid-cols-1 sm:grid-cols-2"
                />

                <Section
                    title="Reportes"
                    modules={reportes}
                    gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-2"
                />

                <Section
                    title="Configuración"
                    modules={configuracion}
                    gridCols="grid-cols-1 sm:grid-cols-3"
                />
            </div>
        </div>
    );
}
