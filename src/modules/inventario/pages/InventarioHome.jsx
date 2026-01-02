import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Hammer, BarChart3, FileText, ClipboardList, Users, Database, QrCode, Settings, Tag } from 'lucide-react';
import { useAlerts } from '../../../hooks/useAlerts';
import SubtleAlert from '../../../components/SubtleAlert';



export default function InventarioHome() {
    const { alertMessage, loading } = useAlerts();

    // 1. OPERACIÓN DIARIA - Lo más usado
    const operacionDiaria = [
        {
            title: 'Ventas',
            icon: ShoppingCart,
            path: '/ventas/nueva',
            description: 'Registrar ventas'
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
            title: 'Materiales/Insumos',
            icon: Package,
            path: '/materiales',
            description: 'Registro de materias primas',
            color: 'amber'
        },
        {
            title: 'Compras',
            icon: ShoppingCart,
            path: '/compras/nuevo',
            description: 'Productos para venta'
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
            description: 'Estadísticas ventas'
        },
        {
            title: 'Cuentas por Cobrar',
            icon: FileText,
            path: '/cuentas-por-cobrar',
            description: 'Gestión de créditos'
        },
        {
            title: 'Reporte Compras',
            icon: BarChart3,
            path: '/compras/reporte',
            description: 'Historial compras'
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
            description: 'Análisis pedidos'
        }
    ];

    // 4. CONFIGURACIÓN - Datos maestros
    const configuracion = [
        {
            title: 'Clientes',
            icon: Users,
            path: '/clientes',
            description: 'Gestión clientes'
        },
        {
            title: 'Proveedores',
            icon: Users,
            path: '/proveedores',
            description: 'Gestión proveedores'
        },
        {
            title: 'Tipos de Producto',
            icon: Tag,
            path: '/configuracion/tipos-producto',
            description: 'Categorías productos'
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
                className="group block p-4 sm:p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-1 active:scale-95"
            >
                <div className="flex flex-col items-center text-center gap-1.5">
                    <Icon className="w-6 h-6 text-gray-700 group-hover:text-slate-700 transition-colors" strokeWidth={1.5} />
                    <h3 className="text-sm font-semibold text-gray-900">
                        {module.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {module.description}
                    </p>
                </div>
            </Link>
        );
    };

    const Section = ({ title, subtitle, icon: Icon, modules, gridCols = "grid-cols-1 sm:grid-cols-2", bgClass = "" }) => (
        <div className={`mb-6 sm:mb-8 ${bgClass} ${bgClass ? 'p-4 sm:p-5 rounded-xl' : ''}`}>
            <div className="mb-4 px-1">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
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

                {/* Alerta sutil minimalista */}
                {!loading && <SubtleAlert message={alertMessage} />}

                {/* Secciones */}
                <Section
                    title="Operación Diaria"
                    icon={ShoppingCart}
                    modules={operacionDiaria}
                    gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-2"
                />

                <Section
                    title="Producción"
                    icon={Hammer}
                    modules={produccion}
                    gridCols="grid-cols-1 sm:grid-cols-2"
                />

                <Section
                    title="Reportes"
                    subtitle="Consulta y análisis (solo lectura)"
                    icon={BarChart3}
                    modules={reportes}
                    gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-2"
                    bgClass="bg-gray-50"
                />

                <Section
                    title="Configuración"
                    icon={Settings}
                    modules={configuracion}
                    gridCols="grid-cols-1 sm:grid-cols-3"
                />
            </div>
        </div>
    );
}
