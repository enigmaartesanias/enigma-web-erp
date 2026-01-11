import React, { useState, useEffect, useMemo } from 'react';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const ProduccionReporte = () => {
    const [produccion, setProduccion] = useState([]);
    const [stats, setStats] = useState({
        total_registros: 0,
        pendientes: 0,
        en_proceso: 0,
        terminados: 0
    });
    const [loading, setLoading] = useState(true);
    const [filtroActivo, setFiltroActivo] = useState('todos');

    // Fechas dinámicas: inicio y fin del año actual
    const currentYear = new Date().getFullYear();
    const [fechaInicio, setFechaInicio] = useState(`${currentYear}-01-01`);
    const [fechaFin, setFechaFin] = useState(`${currentYear}-12-31`);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await produccionDB.getAll();
            const statsData = await produccionDB.getStats();
            setProduccion(data || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };



    // Filtrar producción por fechas (con excepción de "En Proceso")
    const produccionConFiltroFecha = useMemo(() => {
        return produccion.filter(p => {
            // Siempre incluir items "en_proceso"
            if (p.estado_produccion === 'en_proceso') return true;

            // Para el resto, aplicar filtro de fechas
            const fechaProduccion = new Date(p.fecha_produccion || p.created_at);
            const fechaProduccionStr = fechaProduccion.toLocaleDateString('en-CA');

            if (fechaInicio && fechaProduccionStr < fechaInicio) return false;
            if (fechaFin && fechaProduccionStr > fechaFin) return false;

            return true;
        });
    }, [produccion, fechaInicio, fechaFin]);

    // Recalcular stats basado en producción filtrada por fecha
    const statsCalculados = useMemo(() => {
        return {
            total_registros: produccionConFiltroFecha.length,
            en_proceso: produccionConFiltroFecha.filter(p => p.estado_produccion === 'en_proceso').length,
            terminados: produccionConFiltroFecha.filter(p => p.estado_produccion === 'terminado').length
        };
    }, [produccionConFiltroFecha]);

    // Filtrar por pestaña activa
    const produccionFiltrada = useMemo(() => {
        switch (filtroActivo) {
            case 'en_proceso':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'en_proceso');
            case 'terminados':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'terminado');
            default:
                return produccionConFiltroFecha;
        }
    }, [produccionConFiltroFecha, filtroActivo]);

    // Definir pestañas con stats calculados
    const pestanas = [
        { id: 'todos', label: 'Todos', icon: '📋', count: statsCalculados.total_registros, color: 'purple' },
        { id: 'en_proceso', label: 'En Proceso', icon: '🔨', count: statsCalculados.en_proceso, color: 'orange' },
        { id: 'terminados', label: 'Terminados', icon: '✅', count: statsCalculados.terminados, color: 'green' }
    ];



    // Obtener estilos de pestaña según color
    const getTabStyles = (tabColor, isActive) => {
        const colorMap = {
            purple: {
                active: 'bg-purple-50 text-purple-700 border-b-2 border-purple-500 shadow-sm',
                badge: 'bg-purple-100 text-purple-800'
            },
            yellow: {
                active: 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-500 shadow-sm',
                badge: 'bg-yellow-100 text-yellow-800'
            },
            orange: {
                active: 'bg-orange-50 text-orange-700 border-b-2 border-orange-500 shadow-sm',
                badge: 'bg-orange-100 text-orange-800'
            },
            green: {
                active: 'bg-green-50 text-green-700 border-b-2 border-green-500 shadow-sm',
                badge: 'bg-green-100 text-green-800'
            },
            blue: {
                active: 'bg-blue-50 text-blue-700 border-b-2 border-blue-500 shadow-sm',
                badge: 'bg-blue-100 text-blue-800'
            }
        };

        return {
            button: isActive ? colorMap[tabColor].active : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
            badge: isActive ? colorMap[tabColor].badge : 'bg-gray-200 text-gray-700'
        };
    };

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Volver</span>
                </Link>
                <h1 className="text-xl font-light text-gray-800">Reporte de Producción</h1>
            </div>

            {/* Filtros de Fecha */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Del</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Al</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const currentYear = new Date().getFullYear();
                            setFechaInicio(`${currentYear}-01-01`);
                            setFechaFin(`${currentYear}-12-31`);
                        }}
                        className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors w-full md:w-auto"
                    >
                        🗑️ Borrar
                    </button>
                </div>
            </div>

            {/* Pestañas de Filtrado - Responsive */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-2 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {pestanas.map(tab => {
                        const styles = getTabStyles(tab.color, filtroActivo === tab.id);
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setFiltroActivo(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                                    md:flex-row md:min-w-[140px]
                                    flex-col min-w-[70px]
                                    ${styles.button}
                                `}
                                title={tab.label}
                            >
                                {/* Icono */}
                                <span className="text-xl md:text-base">{tab.icon}</span>

                                {/* Label: visible en desktop, oculto en móvil */}
                                <span className="hidden md:inline">{tab.label}</span>

                                {/* Contador */}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tabla Detallada */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Título del filtro activo - Solo móvil */}

                {/* Título del filtro activo - Solo móvil */}
                <div className="md:hidden px-3 py-2 bg-gray-100 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                        {pestanas.find(p => p.id === filtroActivo)?.icon} {pestanas.find(p => p.id === filtroActivo)?.label}
                    </span>
                </div>

                <h3 className="text-xs font-medium p-3 text-gray-700 border-b border-gray-200">
                    <span className="hidden md:inline">Detalle de Costos y Precios</span>
                    <span className="md:hidden">Costos y Precios</span>
                    <span className="text-xs text-gray-500 font-normal md:hidden">(S/)</span>
                </h3>

                {/* Tabla con Scroll Horizontal en Mobile */}
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Inicio Prod.
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Fin Prod.
                                    </th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">
                                        Tipo
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Costo Prod.
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {produccionFiltrada.map((item) => {
                                    const costoProduccion = item.costo_total_produccion || 0;

                                    return (
                                        <tr key={item.id_produccion} className="hover:bg-gray-50">

                                            <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap align-top">
                                                {(() => {
                                                    const date = item.fecha_inicio_produccion ? new Date(item.fecha_inicio_produccion + 'T00:00:00') : (item.fecha_produccion ? new Date(item.fecha_produccion) : new Date(item.created_at));
                                                    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
                                                })()}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap align-top">
                                                {(() => {
                                                    if (!item.fecha_fin_produccion) return '-';
                                                    const date = new Date(item.fecha_fin_produccion + 'T00:00:00');
                                                    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
                                                })()}
                                            </td>

                                            <td className="px-2 py-3 text-center align-top">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-full border ${item.tipo_produccion === 'PEDIDO'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`} title={item.tipo_produccion === 'PEDIDO' ? 'Pedido' : 'Stock'}>
                                                    {item.tipo_produccion === 'PEDIDO' ? 'P' : 'S'}
                                                </span>
                                            </td>

                                            <td className="px-3 py-3 text-sm text-gray-800 align-top">
                                                <div className="flex flex-col whitespace-normal" style={{ minWidth: '350px' }}>
                                                    <span className="font-normal text-gray-600 leading-snug">
                                                        {item.nombre_producto}
                                                    </span>
                                                    {item.nombre_cliente && (
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            Cliente: {item.nombre_cliente}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 text-right text-xs text-gray-600 font-mono align-top whitespace-nowrap">
                                                <span className="text-gray-400 mr-1">S/</span>
                                                {parseFloat(costoProduccion).toFixed(2)}
                                            </td>
                                            <td className="px-2 py-3 text-center align-top whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.estado_produccion === 'terminado' ? 'bg-green-100 text-green-800' :
                                                    item.estado_produccion === 'en_proceso' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.estado_produccion === 'terminado' ? 'Terminado' : 'En Proc.'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default ProduccionReporte;
