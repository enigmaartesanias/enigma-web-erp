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
    const [fechaInicio, setFechaInicio] = useState('2026-01-01');
    const [fechaFin, setFechaFin] = useState('2026-12-31');

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
            pendientes: produccionConFiltroFecha.filter(p => p.estado_produccion === 'pendiente').length,
            en_proceso: produccionConFiltroFecha.filter(p => p.estado_produccion === 'en_proceso').length,
            terminados: produccionConFiltroFecha.filter(p => p.estado_produccion === 'terminado').length
        };
    }, [produccionConFiltroFecha]);

    // Filtrar por pestaña activa
    const produccionFiltrada = useMemo(() => {
        switch (filtroActivo) {
            case 'pendientes':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'pendiente');
            case 'en_proceso':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'en_proceso');
            case 'terminados':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'terminado');
            case 'por_ingresar':
                return produccionConFiltroFecha.filter(p =>
                    p.estado_produccion === 'terminado' &&
                    p.tipo_produccion === 'STOCK' &&
                    !p.transferido_inventario
                );
            default:
                return produccionConFiltroFecha;
        }
    }, [produccionConFiltroFecha, filtroActivo]);

    // Calcular contador para "Por Ingresar a Stock" basado en filtro de fecha
    const porIngresarCount = useMemo(() => {
        return produccionConFiltroFecha.filter(p =>
            p.estado_produccion === 'terminado' &&
            p.tipo_produccion === 'STOCK' &&
            !p.transferido_inventario
        ).length;
    }, [produccionConFiltroFecha]);

    // Definir pestañas con stats calculados
    const pestanas = [
        { id: 'todos', label: 'Todos', icon: '📋', count: statsCalculados.total_registros, color: 'purple' },
        { id: 'pendientes', label: 'Pendientes', icon: '⏳', count: statsCalculados.pendientes, color: 'yellow' },
        { id: 'en_proceso', label: 'En Proceso', icon: '🔨', count: statsCalculados.en_proceso, color: 'orange' },
        { id: 'terminados', label: 'Terminados', icon: '✅', count: statsCalculados.terminados, color: 'green' },
        { id: 'por_ingresar', label: 'Por Ingresar a Stock', icon: '📦', count: porIngresarCount, color: 'blue' }
    ];

    // Determinar si mostrar columna según filtro activo
    const mostrarColumna = (columna) => {
        // Siempre ocultar margen
        if (columna === 'margen_est') {
            return false;
        }

        if (filtroActivo === 'por_ingresar') {
            const columnasOcultas = ['tipo', 'precio_pedido', 'estado'];
            return !columnasOcultas.includes(columna);
        }
        return true;
    };

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
                            setFechaInicio('2026-01-01');
                            setFechaFin('2026-12-31');
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

                <div className="overflow-auto max-h-[500px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    <span className="hidden md:inline">Fecha</span>
                                    <span className="md:hidden">Fec.</span>
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">Producto</th>
                                {mostrarColumna('tipo') && (
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                )}
                                {mostrarColumna('precio_pedido') && (
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase" title="Precio del Pedido">
                                        <span className="hidden md:inline">Precio Pedido</span>
                                        <span className="md:hidden">Pedido</span>
                                    </th>
                                )}
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase" title="Costo de Producción">
                                    <span className="hidden md:inline">Costo Prod.</span>
                                    <span className="md:hidden">Costo</span>
                                </th>
                                {mostrarColumna('margen_est') && (
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase" title="Margen Estimado">
                                        <span className="hidden md:inline">Margen Est.</span>
                                        <span className="md:hidden">Margen</span>
                                    </th>
                                )}
                                {mostrarColumna('estado') && (
                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                )}

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {produccionFiltrada.map((item) => {
                                const precioPedido = item.precio_venta_pedido || 0;
                                // Nota: item.precio_total suele incluir envío si no está desglosado, pero intentaremos usar el sin IGV si está disponible o el total.
                                // Idealmente v_produccion_con_precios debería tener estos campos. Si no, saldrá 0.

                                const costoProduccion = item.costo_total_produccion || 0;
                                const esPedido = item.tipo_produccion === 'PEDIDO';
                                const margen = esPedido ? (precioPedido - costoProduccion) : 0;

                                // Determinar si puede transferirse a inventario
                                const puedeTransferir = item.estado_produccion === 'terminado' &&
                                    item.tipo_produccion === 'STOCK' &&
                                    !item.transferido_inventario;

                                return (
                                    <tr key={item.id_produccion} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-xs text-gray-500">
                                            {(() => {
                                                const date = item.fecha_produccion ? new Date(item.fecha_produccion) : new Date(item.created_at);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const year = String(date.getFullYear()).slice(-2);
                                                return `${day}/${month}/${year}`;
                                            })()}
                                        </td>
                                        <td className="px-3 py-2 text-xs font-mono text-purple-700 font-semibold">
                                            {item.codigo_producto || '-'}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                            <div className="line-clamp-3">{item.nombre_producto}</div>
                                            {item.nombre_cliente && (
                                                <div className="text-xs text-gray-500 hidden md:block">
                                                    Cliente: {item.nombre_cliente}
                                                </div>
                                            )}
                                        </td>
                                        {mostrarColumna('tipo') && (
                                            <td className="px-3 py-2 text-center">
                                                <span className={`px-2 py-1 text-xs rounded-full ${item.tipo_produccion === 'PEDIDO' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {item.tipo_produccion}
                                                </span>
                                            </td>
                                        )}
                                        {mostrarColumna('precio_pedido') && (
                                            <td className="px-3 py-2 text-right text-xs text-gray-600">
                                                {esPedido ? (
                                                    <>
                                                        <span className="hidden md:inline">S/ </span>
                                                        {parseFloat(precioPedido).toFixed(2)}
                                                    </>
                                                ) : '-'}
                                            </td>
                                        )}
                                        <td className="px-3 py-2 text-right text-xs text-gray-600">
                                            <span className="hidden md:inline">S/ </span>
                                            {parseFloat(costoProduccion).toFixed(2)}
                                        </td>
                                        {mostrarColumna('margen_est') && (
                                            <td className="px-3 py-2 text-right text-xs text-gray-600">
                                                {esPedido ? (
                                                    <>
                                                        <span className="hidden md:inline">S/ </span>
                                                        {margen.toFixed(2)}
                                                    </>
                                                ) : '-'}
                                            </td>
                                        )}
                                        {mostrarColumna('estado') && (
                                            <td className="px-2 py-1 text-center">
                                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${item.estado_produccion === 'terminado' ? 'bg-green-100 text-green-800' :
                                                    item.estado_produccion === 'en_proceso' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.estado_produccion?.replace('_', ' ')}
                                                </span>
                                            </td>
                                        )}

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default ProduccionReporte;
