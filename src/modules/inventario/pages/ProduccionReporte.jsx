import React, { useState, useEffect, useMemo } from 'react';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaImage, FaTimes, FaWhatsapp, FaCamera, FaSpinner, FaEdit } from 'react-icons/fa';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressAndResizeImage } from '../../../utils/imageOptimizer';
import toast, { Toaster } from 'react-hot-toast';

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
    const [filtros, setFiltros] = useState({
        productos: [],
        metales: [],
        destinos: []
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Para modal de detalle
    const [selectedImage, setSelectedImage] = useState(null); // Para modal de imagen
    const [currentPage, setCurrentPage] = useState(1); // Paginación
    const itemsPerPage = 10; // 10 registros por página

    // Fechas dinámicas: inicio 2025 y fin del año actual
    const currentYear = new Date().getFullYear();
    const [fechaInicio, setFechaInicio] = useState('2025-01-01');
    const [fechaFin, setFechaFin] = useState(`${currentYear}-12-31`);

    // Estados para subida de fotos en reporte
    const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
    const [itemForPhoto, setItemForPhoto] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

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

    // Filtrar por pestaña activa (estado)
    const produccionPorEstado = useMemo(() => {
        switch (filtroActivo) {
            case 'en_proceso':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'en_proceso');
            case 'terminados':
                return produccionConFiltroFecha.filter(p => p.estado_produccion === 'terminado');
            default:
                return produccionConFiltroFecha;
        }
    }, [produccionConFiltroFecha, filtroActivo]);

    // Filtrar por producto, metal y destino (múltiple)
    const produccionFiltrada = useMemo(() => {
        return produccionPorEstado.filter(p => {
            const matchesProducto = filtros.productos.length === 0 || filtros.productos.includes(p.tipo_producto);
            const matchesMetal = filtros.metales.length === 0 || filtros.metales.includes(p.metal);
            const matchesDestino = filtros.destinos.length === 0 || filtros.destinos.includes(p.tipo_produccion);
            return matchesProducto && matchesMetal && matchesDestino;
        });
    }, [produccionPorEstado, filtros]);

    // Totales resumidos (opcional, para visualización general)
    const totalesResumen = useMemo(() => {
        const suma = arr => arr.reduce((s, i) => s + (Number(i.costo_total_produccion) || 0), 0);
        return {
            todos:   { count: produccionPorEstado.length, valor: suma(produccionPorEstado) }
        };
    }, [produccionPorEstado]);

    // Inversión total del conjunto filtrado actualmente
    const inversionTotal = useMemo(() => {
        return produccionFiltrada.reduce((sum, item) => sum + (Number(item.costo_total_produccion) || 0), 0);
    }, [produccionFiltrada]);

    // Definir pestañas con stats calculados
    const pestanas = [
        { id: 'en_proceso', label: 'En Proceso', icon: '🔨', count: statsCalculados.en_proceso, color: 'orange' },
        { id: 'terminados', label: 'Terminados', icon: '✅', count: statsCalculados.terminados, color: 'green' },
        { id: 'todos', label: 'Todos', icon: '📋', count: statsCalculados.total_registros, color: 'purple' }
    ];

    // Resetear a página 1 cuando cambia cualquier filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [filtroActivo, filtros]);

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

    const handlePhotoUpload = async (file) => {
        if (!itemForPhoto || !file) return;

        setUploadingImage(true);
        try {
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 0.5,
                maxWidth: 1024,
                quality: 0.8
            });

            const fileExtension = optimizedFile.name?.split('.').pop() || 'jpg';
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const fileName = `produccion/${uniqueId}.${fileExtension}`;

            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, optimizedFile);
            const downloadURL = await getDownloadURL(storageRef);

            // Actualizar registro en DB
            await produccionDB.update(itemForPhoto.id_produccion, {
                ...itemForPhoto,
                imagen_url: downloadURL
            });

            toast.success('Foto actualizada correctamente');
            setShowPhotoUploadModal(false);
            setItemForPhoto(null);
            fetchData(); // Recargar datos

        } catch (error) {
            console.error('Error subiendo foto:', error);
            toast.error('Error al subir foto: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
                <p className="text-gray-600 font-medium tracking-tight">Cargando reporte...</p>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                        <FaArrowLeft className="mr-2" />
                        <span className="font-medium">Volver</span>
                    </Link>
                    <h1 className="text-xl font-light text-gray-800">Reporte de Producción</h1>
                </div>

                {/* Resumen de Valorización */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-blue-600">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mb-0.5">Valor Producido</p>
                        <p className="text-lg font-black text-gray-800">
                            <span className="text-xs font-normal text-gray-400 mr-0.5">S/</span>
                            {inversionTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-slate-700">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-0.5">Total Registros</p>
                        <p className="text-lg font-black text-gray-800">
                            {produccionFiltrada.length}
                            <span className="text-xs font-normal text-gray-400 ml-1">Items</span>
                        </p>
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
                                setFechaInicio('2025-01-01');
                                setFechaFin(`${currentYear}-12-31`);
                            }}
                            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors w-full md:w-auto"
                        >
                            🗑️ Borrar
                        </button>
                    </div>
                </div>

                {/* Pestañas de Filtrado */}
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
                                >
                                    <span className="text-xl md:text-base">{tab.icon}</span>
                                    <span className="hidden md:inline">{tab.label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botón de Filtro Avanzado */}
                <div className="mb-4 flex justify-end">
                    <button 
                        onClick={() => setShowAdvancedFilters(true)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all border
                            ${(filtros.productos.length > 0 || filtros.metales.length > 0 || filtros.destinos.length > 0)
                                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                        `}
                    >
                        <span>🔍</span>
                        <span>Filtro Avanzado</span>
                        {(filtros.productos.length > 0 || filtros.metales.length > 0 || filtros.destinos.length > 0) && (
                            <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] ml-1">
                                {filtros.productos.length + filtros.metales.length + filtros.destinos.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800 tracking-tight">Detalle de Producción</h3>
                    </div>
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle w-20">Cód.</th>
                                    <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle">Fecha Término</th>
                                    <th className="px-3 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle">Producción</th>
                                    <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle hidden md:table-cell">Estado</th>
                                    <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle hidden md:table-cell">Destino</th>
                                    <th className="px-3 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wide align-middle w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {produccionPaginada.map((item) => (
                                    <tr key={item.id_produccion} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 py-3 md:py-2 align-middle">
                                            <span className="text-xs font-normal text-gray-500">
                                                {item.codigo_correlativo}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 md:py-2 align-middle">
                                            <div className="text-[13px] md:text-sm font-normal text-gray-700">
                                                {(() => {
                                                    const dateStr = item.fecha_fin_produccion || item.fecha_terminado;
                                                    if (!dateStr) return <span className="text-gray-400 text-xs">En proceso</span>;
                                                    const date = new Date(dateStr.toString().includes('T') ? dateStr : dateStr + 'T00:00:00');
                                                    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' });
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 md:py-2 align-middle">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[13px] md:text-sm font-normal text-gray-700 leading-tight">
                                                        {item.tipo_producto} – {item.metal}
                                                    </span>
                                                    {item.imagen_url && <FaCamera className="text-blue-400 opacity-60 flex-shrink-0" size={10} />}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-3 py-2 text-center align-middle">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.estado_produccion === 'terminado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {item.estado_produccion === 'terminado' ? 'Terminado' : 'En proceso'}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-3 py-2 text-center align-middle">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.tipo_produccion === 'PEDIDO' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                {item.tipo_produccion === 'PEDIDO' ? '📦 Pedido' : '🏪 Stock'}
                                            </span>
                                        </td>
                                        <td className="py-2 text-center align-middle w-24">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button onClick={() => setSelectedItem(item)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100" title="Ver detalle">
                                                    <span className="text-[18px]">👁️</span>
                                                </button>

                                                {item.imagen_url ? (
                                                    <>
                                                        <button
                                                            onClick={() => setSelectedImage(item)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 shadow-sm transition-all"
                                                            title="Ver foto"
                                                        >
                                                            <FaImage size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setItemForPhoto(item); setShowPhotoUploadModal(true); }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 bg-white border border-gray-200 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                                                            title="Editar foto"
                                                        >
                                                            <FaCamera size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => { setItemForPhoto(item); setShowPhotoUploadModal(true); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 bg-gray-50 border border-gray-100 hover:bg-gray-100 shadow-sm transition-all"
                                                        title="Subir foto"
                                                    >
                                                        <FaCamera size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {produccionFiltrada.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">No hay registros para mostrar</div>
                        )}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                Mostrando {startIndex + 1} - {Math.min(endIndex, produccionFiltrada.length)} de {produccionFiltrada.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded disabled:opacity-30"
                                >
                                    Anterior
                                </button>
                                <span className="text-xs text-gray-600">Pág {currentPage} de {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded disabled:opacity-30"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-800">Detalle</h3>
                            <button onClick={() => setSelectedItem(null)}><FaTimes size={16} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase text-gray-400 block font-bold tracking-wider">Código</label>
                                    <p className="text-sm font-bold text-blue-600">{selectedItem.codigo_correlativo}</p>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] uppercase text-gray-400 block font-bold tracking-wider">Producto</label>
                                    <p className="text-sm font-medium text-gray-800">{selectedItem.nombre_producto}</p>
                                </div>
                                {selectedItem.pedido_id && (
                                    <div className="col-span-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                        <label className="text-[10px] uppercase text-blue-600 block font-black tracking-wider">Cliente / Pedido</label>
                                        <p className="text-sm font-bold text-blue-800">
                                            #{selectedItem.pedido_id} — {selectedItem.nombre_cliente}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-[10px] uppercase text-gray-400 block">Tipo</label><p className="text-xs">{selectedItem.tipo_producto}</p></div>
                                <div><label className="text-[10px] uppercase text-gray-400 block">Metal</label><p className="text-xs">{selectedItem.metal}</p></div>
                                <div><label className="text-[10px] uppercase text-gray-400 block">Cantidad</label><p className="text-xs">{selectedItem.cantidad} und</p></div>
                                <div><label className="text-[10px] uppercase text-gray-400 block">Costo Total</label><p className="text-xs font-bold text-blue-600">S/ {parseFloat(selectedItem.costo_total_produccion || 0).toFixed(2)}</p></div>
                            </div>
                            {selectedItem.observaciones && (
                                <div><label className="text-[10px] uppercase text-gray-400 block">Observaciones</label><p className="text-xs italic text-gray-600">{selectedItem.observaciones}</p></div>
                            )}
                        </div>
                        {selectedItem.imagen_url && (
                             <div className="p-4 bg-gray-50 border-t">
                                <button
                                    onClick={() => {
                                        const text = `🛠️ *Reporte:* ${selectedItem.nombre_producto}\n🖼️ ${selectedItem.imagen_url}`;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded text-xs"
                                >
                                    <FaWhatsapp /> Compartir
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            )}

            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedImage(null)}>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <div className="px-4 py-2 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-xs font-bold truncate pr-4">{selectedImage.nombre_producto}</h3>
                            <button onClick={() => setSelectedImage(null)}><FaTimes size={16} /></button>
                        </div>
                        <img src={selectedImage.imagen_url} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain bg-gray-100" />
                        <div className="p-3 flex gap-2">
                             <button
                                onClick={() => {
                                    const text = `🛠️ *${selectedImage.nombre_producto}*\n📸 ${selectedImage.imagen_url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded text-xs"
                            >
                                <FaWhatsapp /> WhatsApp
                            </button>
                            <button
                                onClick={() => { setItemForPhoto(selectedImage); setSelectedImage(null); setShowPhotoUploadModal(true); }}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded text-xs"
                            >
                                <FaEdit /> Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPhotoUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <FaCamera /> {itemForPhoto?.imagen_url ? 'Actualizar Foto' : 'Subir Foto'}
                                </h3>
                                <p className="text-xs text-blue-100 mt-1 truncate max-w-[250px]">
                                    {itemForPhoto?.nombre_producto || 'Producto'}
                                </p>
                            </div>
                            <button onClick={() => setShowPhotoUploadModal(false)} className="text-white/80 hover:text-white"><FaTimes size={20} /></button>
                        </div>

                        <div className="p-6">
                            <div
                                className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl h-48 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 transition-colors group relative"
                                onClick={() => !uploadingImage && document.getElementById('report-photo-input').click()}
                            >
                                <input
                                    id="report-photo-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { if (e.target.files[0]) handlePhotoUpload(e.target.files[0]); }}
                                    disabled={uploadingImage}
                                />
                                {uploadingImage ? (
                                    <div className="animate-pulse flex flex-col items-center justify-center w-full h-full bg-white/80 absolute inset-0 z-10">
                                        <FaSpinner className="animate-spin text-blue-500 text-3xl mb-2" />
                                        <span className="text-blue-600 font-bold text-sm">Subiendo...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <FaCamera size={24} />
                                        </div>
                                        <span className="text-gray-600 font-medium text-sm">Haz clic para subir</span>
                                        <span className="text-gray-400 text-[10px] mt-1">JPG, PNG • Máx 5MB</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setShowPhotoUploadModal(false)}
                                className="w-full mt-6 bg-gray-100 text-gray-500 font-bold py-3 rounded-lg text-xs uppercase tracking-wide"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Filtro Avanzado */}
            {showAdvancedFilters && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setShowAdvancedFilters(false)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-sm font-normal text-gray-800">Filtros Avanzados</h3>
                            <button onClick={() => setShowAdvancedFilters(false)} className="text-gray-400 hover:text-gray-600"><FaTimes size={14} /></button>
                        </div>
                        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Bloque 1: Producto */}
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-gray-400 mb-3 block">Tipo de Producto</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Arete', 'Pulsera', 'Collar', 'Anillo'].map(item => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={filtros.productos.includes(item)}
                                                onChange={(e) => {
                                                    const newArr = e.target.checked 
                                                        ? [...filtros.productos, item] 
                                                        : filtros.productos.filter(i => i !== item);
                                                    setFiltros({ ...filtros, productos: newArr });
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Bloque 2: Metal */}
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-gray-400 mb-3 block">Tipo de Metal</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Cobre', 'Plata', 'Alpaca', 'Bronce'].map(item => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={filtros.metales.includes(item)}
                                                onChange={(e) => {
                                                    const newArr = e.target.checked 
                                                        ? [...filtros.metales, item] 
                                                        : filtros.metales.filter(i => i !== item);
                                                    setFiltros({ ...filtros, metales: newArr });
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Bloque 3: Origen */}
                            <div>
                                <label className="text-[11px] uppercase tracking-wider text-gray-400 mb-3 block">Origen / Destino</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'STOCK', label: 'Stock' },
                                        { id: 'PEDIDO', label: 'Pedido' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={filtros.destinos.includes(item.id)}
                                                onChange={(e) => {
                                                    const newArr = e.target.checked 
                                                        ? [...filtros.destinos, item.id] 
                                                        : filtros.destinos.filter(i => i !== item.id);
                                                    setFiltros({ ...filtros, destinos: newArr });
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex gap-2">
                            <button 
                                onClick={() => setFiltros({ productos: [], metales: [], destinos: [] })}
                                className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                Limpiar todo
                            </button>
                            <button 
                                onClick={() => setShowAdvancedFilters(false)}
                                className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors shadow-sm"
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProduccionReporte;
