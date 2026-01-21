import React, { useState, useEffect, useMemo } from 'react';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCoins, FaChartBar, FaImage, FaTimes, FaWhatsapp, FaDownload, FaPrint } from 'react-icons/fa';

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
    const [selectedItem, setSelectedItem] = useState(null); // Para guardar todo el objeto

    // Fechas dinámicas: inicio 2025 y fin del año actual
    const currentYear = new Date().getFullYear();
    const [fechaInicio, setFechaInicio] = useState('2025-01-01');
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

    // Calcular inversión total filtrada
    const inversionTotal = useMemo(() => {
        return produccionFiltrada.reduce((sum, item) => sum + (Number(item.costo_total_produccion) || 0), 0);
    }, [produccionFiltrada]);

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
        <>
            <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                        <FaArrowLeft className="mr-2" />
                        <span className="font-medium">Volver</span>
                    </Link>
                    <h1 className="text-xl font-light text-gray-800">Reporte de Producción</h1>
                </div>

                {/* Resumen de Valorización Compacto */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-2 border-l-4 border-blue-600 flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font text-blue-600 uppercase tracking-tight mb-0.5">Valor Producido</p>
                            <p className="text-sm font-black text-gray-800">
                                <span className="text-[10px] font-normal text-gray-400 mr-0.5">S/</span>
                                {inversionTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font text-slate-500 uppercase tracking-tight mb-0.5">Total Registros</p>
                            <p className="text-sm font-black text-gray-800">
                                {produccionFiltrada.length}
                                <span className="text-[9px] font-normal text-gray-400 ml-1">Items</span>
                            </p>
                        </div>
                    </div>
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
                                setFechaInicio('2025-01-01');
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
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Foto
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {produccionFiltrada.map((item) => {
                                        const costoProduccion = item.costo_total_produccion || 0;
                                        const finDateStr = item.fecha_fin_produccion || (item.fecha_terminado ? item.fecha_terminado.toString().split('T')[0] : null);

                                        return (
                                            <tr key={item.id_produccion} className="hover:bg-gray-50">

                                                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap align-top">
                                                    {(() => {
                                                        const dateStr = item.fecha_inicio_produccion || item.fecha_produccion || item.created_at;
                                                        if (!dateStr) return '-';
                                                        const date = new Date(dateStr.toString().includes('T') ? dateStr : dateStr + 'T00:00:00');
                                                        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
                                                    })()}
                                                </td>
                                                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap align-top">
                                                    {(() => {
                                                        if (!finDateStr) return '-';
                                                        const date = new Date(finDateStr.toString().includes('T') ? finDateStr : finDateStr + 'T00:00:00');
                                                        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
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
                                                <td className="px-2 py-3 text-center align-top">
                                                    {item.imagen_url ? (
                                                        <div
                                                            onClick={() => setSelectedItem(item)}
                                                            className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200 overflow-hidden cursor-zoom-in hover:scale-110 transition-transform mx-auto shadow-sm"
                                                        >
                                                            <img src={item.imagen_url} alt="Prod" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                                                            <FaImage className="text-gray-300 text-[10px]" />
                                                        </div>
                                                    )}
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

            {/* Modal de Zoom de Imagen - Con Acciones de Compartir */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in"
                    style={{ zIndex: 100000 }}
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-[85vw] md:max-w-sm w-full border-2 border-white/20 transform transition-all scale-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-3 right-3 bg-white text-black p-2 rounded-full shadow-xl hover:bg-gray-100 transition-all border border-gray-200"
                            style={{ zIndex: 100001 }}
                        >
                            <FaTimes size={18} />
                        </button>

                        <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                            <img
                                src={selectedItem.imagen_url}
                                alt="Zoom de Producción"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="text-center mb-4">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Ficha de Producción</p>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{selectedItem.nombre_producto}</p>
                            </div>

                            {/* Botones de Acción - Solo WhatsApp Minimalista */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        const text = `🛠️ *Reporte de Producción*\n\n*Producto:* ${selectedItem.nombre_producto}\n*Fabricado el:* ${new Date(selectedItem.fecha_inicio_produccion || selectedItem.created_at).toLocaleDateString()}\n\n🖼️ Imagen: ${selectedItem.imagen_url}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md hover:scale-110"
                                    title="Compartir por WhatsApp"
                                >
                                    <FaWhatsapp size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProduccionReporte;
