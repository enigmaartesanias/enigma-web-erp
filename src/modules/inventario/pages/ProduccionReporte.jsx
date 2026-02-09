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
    const [filtroActivo, setFiltroActivo] = useState('en_proceso');
    const [selectedItem, setSelectedItem] = useState(null); // Para modal de detalle
    const [selectedImage, setSelectedImage] = useState(null); // Para modal de imagen
    const [currentPage, setCurrentPage] = useState(1); // Paginación
    const itemsPerPage = 10; // 10 registros por página

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
        { id: 'en_proceso', label: 'En Proceso', icon: '🔨', count: statsCalculados.en_proceso, color: 'orange' },
        { id: 'terminados', label: 'Terminados', icon: '✅', count: statsCalculados.terminados, color: 'green' },
        { id: 'todos', label: 'Todos', icon: '📋', count: statsCalculados.total_registros, color: 'purple' }
    ];

    // Resetear a página 1 cuando cambia el filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [filtroActivo]);

    // Cálculo de paginación
    const totalPages = Math.ceil(produccionFiltrada.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const produccionPaginada = produccionFiltrada.slice(startIndex, endIndex);



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

                {/* Tabla Profesional - Mismo diseño Mobile y Desktop */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Título */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800 tracking-tight">
                            Detalle de Producción
                        </h3>
                    </div>

                    {/* Tabla sin scroll horizontal */}
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle">
                                        Fecha Término
                                    </th>
                                    <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle">
                                        Producción
                                    </th>
                                    <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle hidden md:table-cell">
                                        Estado
                                    </th>
                                    <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle hidden md:table-cell">
                                        Duración
                                    </th>
                                    <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle w-24">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {produccionPaginada.map((item) => {
                                    // Calcular duración
                                    const fechaInicio = new Date(item.fecha_inicio_produccion || item.created_at);
                                    const fechaFin = item.fecha_fin_produccion || item.fecha_terminado
                                        ? new Date(item.fecha_fin_produccion || item.fecha_terminado)
                                        : new Date();
                                    const duracionDias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={item.id_produccion} className="h-14 md:h-12 hover:bg-gray-50/50 transition-colors">
                                            {/* Fecha de Término */}
                                            <td className="px-3 py-3 md:py-2 align-middle">
                                                <div className="text-[13px] md:text-sm font-normal text-gray-700">
                                                    {(() => {
                                                        const dateStr = item.fecha_fin_produccion || item.fecha_terminado;
                                                        if (!dateStr) return <span className="text-gray-400 text-xs">En proceso</span>;
                                                        const date = new Date(dateStr.toString().includes('T') ? dateStr : dateStr + 'T00:00:00');
                                                        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-PE', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: '2-digit'
                                                        });
                                                    })()}
                                                </div>
                                            </td>

                                            {/* Producción */}
                                            <td className="px-3 py-3 md:py-2 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] md:text-sm font-normal text-gray-700 leading-tight">
                                                        {item.tipo_producto} – {item.metal}
                                                    </span>
                                                    {/* Estado en mobile */}
                                                    <div className="md:hidden flex items-center gap-1.5 mt-1">
                                                        {item.estado_produccion === 'terminado' ? (
                                                            <>
                                                                <span className="text-emerald-600 w-5 h-5 flex items-center justify-center">✅</span>
                                                                <span className="text-xs text-gray-500">Terminado</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-amber-500 w-5 h-5 flex items-center justify-center">⏳</span>
                                                                <span className="text-xs text-gray-500">{duracionDias}d</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Estado - Solo Desktop */}
                                            <td className="hidden md:table-cell px-3 py-2 text-center align-middle">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {item.estado_produccion === 'terminado' ? (
                                                        <>
                                                            <span className="text-emerald-600 w-4 h-4 flex items-center justify-center">✅</span>
                                                            <span className="text-xs text-gray-500">Terminado</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-amber-500 w-4 h-4 flex items-center justify-center">⏳</span>
                                                            <span className="text-xs text-gray-500">En proceso</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Duración - Solo Desktop */}
                                            <td className="hidden md:table-cell px-3 py-2 text-center align-middle">
                                                <span className="text-xs text-gray-500">
                                                    {duracionDias} {duracionDias === 1 ? 'día' : 'días'}
                                                </span>
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-3 py-3 md:py-2 text-center align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Botón de Ver Detalle */}
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                                                        title="Ver detalle"
                                                    >
                                                        <span className="text-[24px] md:text-[22px]">👁️</span>
                                                    </button>

                                                    {/* Botón de Ver Imagen - Solo si tiene imagen */}
                                                    {item.imagen_url && (
                                                        <button
                                                            onClick={() => setSelectedImage(item)}
                                                            className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                                                            title="Ver imagen"
                                                        >
                                                            <FaImage className="w-6 h-6 md:w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Mensaje si no hay registros */}
                        {produccionPaginada.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No hay registros para mostrar
                            </div>
                        )}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100">
                            {/* Desktop */}
                            <div className="hidden md:flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    Mostrando {startIndex + 1} - {Math.min(endIndex, produccionFiltrada.length)} de {produccionFiltrada.length} registros
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-xs text-gray-600 font-medium">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>

                            {/* Mobile - Solo flechas */}
                            <div className="md:hidden flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Página anterior"
                                >
                                    <span className="text-lg">←</span>
                                </button>
                                <span className="text-xs text-gray-600 font-medium">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="w-10 h-10 flex items-center justify-center text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Página siguiente"
                                >
                                    <span className="text-lg">→</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalle Mejorado */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">Detalle de Producción</h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Información */}
                        <div className="p-4 space-y-3">
                            {/* Producto */}
                            <div>
                                <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Producto</label>
                                <p className="text-sm text-gray-700">{selectedItem.nombre_producto}</p>
                            </div>

                            {/* Grid de información */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Tipo</label>
                                    <p className="text-sm text-gray-700">{selectedItem.tipo_producto}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Metal</label>
                                    <p className="text-sm text-gray-700">{selectedItem.metal}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Cantidad</label>
                                    <p className="text-sm text-gray-700">{selectedItem.cantidad} und</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Estado</label>
                                    <p className="text-sm text-gray-700">
                                        {selectedItem.estado_produccion === 'terminado' ? 'Terminado' : 'En proceso'}
                                    </p>
                                </div>
                            </div>

                            {/* Costos */}
                            <div className="border-t border-gray-100 pt-3">
                                <label className="text-xs uppercase tracking-wide text-gray-500 block mb-2">Costos</label>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Materiales:</span>
                                        <span className="text-gray-700">S/ {parseFloat(selectedItem.costo_materiales || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Mano de obra:</span>
                                        <span className="text-gray-700">S/ {parseFloat(selectedItem.mano_de_obra || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Herramientas:</span>
                                        <span className="text-gray-700">S/ {parseFloat(selectedItem.costo_herramientas || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                                        <span className="text-gray-800 font-medium">Total:</span>
                                        <span className="text-gray-900 font-semibold">S/ {parseFloat(selectedItem.costo_total_produccion || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones */}
                            {selectedItem.observaciones && (
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Observaciones</label>
                                    <p className="text-sm text-gray-700">{selectedItem.observaciones}</p>
                                </div>
                            )}

                            {/* Cliente */}
                            {selectedItem.nombre_cliente && (
                                <div>
                                    <label className="text-xs uppercase tracking-wide text-gray-500 block mb-1">Cliente</label>
                                    <p className="text-sm text-gray-700">{selectedItem.nombre_cliente}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer con acción */}
                        {selectedItem.imagen_url && (
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => {
                                        const text = `🛠️ *Reporte de Producción*\n\n*Producto:* ${selectedItem.nombre_producto}\n*Tipo:* ${selectedItem.tipo_producto} - ${selectedItem.metal}\n*Cantidad:* ${selectedItem.cantidad} und\n*Costo Total:* S/ ${parseFloat(selectedItem.costo_total_produccion || 0).toFixed(2)}\n\n🖼️ Ver imagen: ${selectedItem.imagen_url}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors"
                                >
                                    <FaWhatsapp size={16} />
                                    Compartir por WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Imagen Separado */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                                {selectedImage.nombre_producto}
                            </h3>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Imagen */}
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <img
                                src={selectedImage.imagen_url}
                                alt={selectedImage.nombre_producto}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Footer con WhatsApp */}
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    const text = `🛠️ *${selectedImage.nombre_producto}*\n\n📸 Ver imagen: ${selectedImage.imagen_url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                                <FaWhatsapp size={16} />
                                Compartir imagen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProduccionReporte;
