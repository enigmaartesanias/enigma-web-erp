import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { FaArrowLeft, FaPrint, FaSearch, FaBarcode, FaCheckCircle, FaTimes, FaPlus, FaMinus, FaImage, FaCalendarDay } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import toast, { Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';

// Función auxiliar para obtener la fecha en formato YYYY-MM-DD (Zona horaria local)
const getLocalYYYYMMDD = (dateInput) => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d)) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const ReporteCodigosQR = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('TODOS');
    const [dateFilter, setDateFilter] = useState(''); // Nuevo estado para fecha
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchQuantity, setBatchQuantity] = useState(10);
    const [isPrintReady, setIsPrintReady] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const productosData = await productosExternosDB.getAll();

            // ORDEN DESCENDENTE POR FECHA (Los más nuevos primero)
            const sorted = productosData.sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                return dateB - dateA;
            });

            setProductos(sorted);
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast.error("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    const categorias = ['TODOS', ...new Set(productos
        .map(p => p.categoria || 'OTROS')
        .map(c => c.toUpperCase())
        .sort()
    )];

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Función para el botón "Nuevos de Hoy"
    const setTodayFilter = () => {
        setDateFilter(getLocalYYYYMMDD(new Date()));
    };

    const handlePrint = () => {
        if (selectedIds.length === 0) {
            toast.error("Selecciona al menos un producto");
            return;
        }
        setShowBatchModal(true);
    };

    const confirmPrint = () => {
        setShowBatchModal(false);
        setIsPrintReady(true);
        setTimeout(() => {
            window.print();
            setIsPrintReady(false);
        }, 1000);
    };

    const handleDownloadSheet = async () => {
        if (selectedIds.length === 0) return;

        try {
            setIsDownloading(true);
            const loadingToast = toast.loading("Preparando imagen A4...");

            await new Promise(resolve => setTimeout(resolve, 500));

            const element = printRef.current;
            const originalStyle = element.className;

            element.className = 'print-view-container visible-for-capture';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.querySelector('.print-view-container');
                    if (clonedElement) {
                        clonedElement.style.display = 'block';
                    }
                }
            });

            element.className = originalStyle;

            const link = document.createElement('a');
            link.download = `etiquetas-enigma-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.dismiss(loadingToast);
            toast.success("Imagen descargada exitosamente");
            setShowBatchModal(false);
        } catch (error) {
            console.error("Error al descargar hoja:", error);
            toast.error("Error al generar la imagen");
        } finally {
            setIsDownloading(false);
        }
    };

    // Lógica principal de Filtrado Múltiple
    const filteredProductos = productos.filter(p => {
        // 1. Filtro por Búsqueda
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Filtro por Categoría
        const matchesCategory = categoryFilter === 'TODOS' ||
            (p.categoria && p.categoria.toUpperCase() === categoryFilter);

        // 3. Filtro por Fecha
        let matchesDate = true;
        if (dateFilter) {
            const pDate = getLocalYYYYMMDD(p.created_at || p.createdAt);
            matchesDate = (pDate === dateFilter);
        }

        return matchesSearch && matchesCategory && matchesDate;
    });

    // Solo obtenemos la data para impresión de los seleccionados que SIGUEN visibles en el filtro actual
    // (Opcional: Si quieres que recuerde selecciones ocultas, quita esta condición)
    const selectedProductsData = productos.filter(p => selectedIds.includes(p.id));

    // Generar layout basado en filas. Cada fila lleva su referencia y máximo 4 etiquetas
    const generateRows = () => {
        let rows = [];
        selectedProductsData.forEach(prod => {
            let labelsLeft = batchQuantity;
            while (labelsLeft > 0) {
                const labelsInThisRow = Math.min(labelsLeft, 4); // Máximo 4 etiquetas por fila + 1 Referencia
                rows.push({
                    data: prod,
                    labelCount: labelsInThisRow
                });
                labelsLeft -= labelsInThisRow;
            }
        });
        return rows;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
                <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors text-gray-600"
                        title="Volver"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
                            <FaBarcode className="text-indigo-600" />
                            Catálogo de Etiquetas
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {selectedIds.length} seleccionados | Mostrando {filteredProductos.length} registros
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">

                    {/* Componente de Filtro de Fecha */}
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-full sm:w-auto shrink-0">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="py-1.5 px-3 rounded-lg text-sm text-gray-600 outline-none w-full sm:w-auto cursor-pointer"
                        />
                        <button
                            onClick={setTodayFilter}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ml-1"
                            title="Filtrar registros creados hoy"
                        >
                            <FaCalendarDay className="inline mr-1 mb-0.5" /> Hoy
                        </button>
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter('')}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Limpiar fecha"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Buscador */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none w-full bg-white shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Botón Imprimir */}
                    <button
                        onClick={handlePrint}
                        disabled={selectedIds.length === 0}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-300 disabled:shadow-none w-full sm:w-auto shrink-0"
                    >
                        <FaPrint />
                        Generar Etiquetas ({selectedIds.length})
                    </button>
                </div>
            </div>

            {/* Filtros de Categorías */}
            <div className="max-w-7xl mx-auto mb-6 print:hidden overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${categoryFilter === cat
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de Selección */}
            <div className="max-w-7xl mx-auto print:hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredProductos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                        <FaSearch size={40} className="mb-4 text-gray-300" />
                        <p className="font-medium text-lg">No se encontraron productos</p>
                        <p className="text-sm">Intenta borrar los filtros de búsqueda o fecha.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProductos.map((producto) => {
                            const isSelected = selectedIds.includes(producto.id);
                            return (
                                <div
                                    key={producto.id}
                                    onClick={() => toggleSelect(producto.id)}
                                    className={`relative border-2 rounded-2xl p-4 flex flex-col items-center text-center transition-all cursor-pointer bg-white group ${isSelected ? 'border-indigo-500 shadow-indigo-100 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-indigo-500 animate-in zoom-in">
                                            <FaCheckCircle size={20} />
                                        </div>
                                    )}

                                    <div className="w-full aspect-square mb-3 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-50 group-hover:scale-105 transition-transform">
                                        {producto.imagen_url ? (
                                            <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-gray-300 text-[10px] uppercase font-bold tracking-widest">Sin imagen</span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-gray-800 text-[11px] uppercase tracking-tight mb-2 line-clamp-2 h-10 w-full">
                                        {producto.nombre}
                                    </h3>

                                    <div className={`px-3 py-1 rounded-full border transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                        <span className="font-mono text-[10px] font-bold ring-0">
                                            {producto.codigo_usuario || 'S/N'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* VISTA DE IMPRESIÓN (Guía + Etiquetas en Fila) */}
            <div className={`print-view-container ${isDownloading ? 'visible-for-capture' : ''}`} ref={printRef}>
                <div className="print-page-wrapper">
                    {generateRows().map((row, idx) => (
                        <div key={idx} className="label-row">
                            {/* CAJA DE REFERENCIA (Inicio de fila) */}
                            <div className="reference-box">
                                <div className="ref-image-container">
                                    {row.data.imagen_url ? (
                                        <img src={row.data.imagen_url} alt="ref" className="w-full h-full object-contain" />
                                    ) : <FaImage className="text-gray-300 w-full h-full" />}
                                </div>
                                <div className="ref-text-container">
                                    <span className="ref-text-name">{row.data.nombre}</span>
                                    <span className="ref-text-code">{row.data.codigo_usuario}</span>
                                </div>
                            </div>

                            {/* ETIQUETAS DE RECORTE (40x15mm) */}
                            {Array.from({ length: row.labelCount }).map((_, i) => (
                                <div key={i} className="label-box">
                                    <div className="qr-wrapper">
                                        <QRCode
                                            value={row.data.codigo_usuario || row.data.id.toString()}
                                            size={45}
                                            level="L"
                                            style={{ width: '100%', height: '100%' }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <div className="label-info">
                                        <span className="label-url">www.artesaniasenigma.com</span>
                                        <span className="label-phone">960 282 376</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Configuración Masiva */}
            {showBatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-6 text-white relative">
                            <button onClick={() => setShowBatchModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                                <FaTimes size={20} />
                            </button>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaPrint /> Configurar Lote
                            </h3>
                            <p className="text-indigo-100 text-xs mt-1">
                                Se generarán etiquetas para {selectedIds.length} productos.
                            </p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="text-center">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                    Etiquetas por Producto
                                </label>
                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        onClick={() => setBatchQuantity(Math.max(1, batchQuantity - 1))}
                                        className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="text-4xl font-black text-gray-800 w-16">{batchQuantity}</span>
                                    <button
                                        onClick={() => setBatchQuantity(batchQuantity + 1)}
                                        className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                <p className="mt-4 text-sm text-gray-500">
                                    Total a recortar: <strong>{selectedIds.length * batchQuantity}</strong> etiquetas.
                                    <br />
                                    <span className="text-[10px] text-gray-400 italic">
                                        (Las imágenes de referencia se incluyen automáticamente)
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={confirmPrint}
                                disabled={isDownloading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:bg-gray-400"
                            >
                                <FaPrint /> Confirmar e Imprimir
                            </button>

                            <button
                                onClick={handleDownloadSheet}
                                disabled={isDownloading}
                                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                ) : <FaImage />}
                                Descargar Hoja (Imagen A4)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ESTILOS DE IMPRESIÓN Y LAYOUT */}
            <style>{`
                @media screen {
                    .print-view-container { 
                        display: none; 
                    }
                }

                .print-view-container.visible-for-capture {
                    display: block !important;
                    position: fixed;
                    left: -9999px;
                    top: 0;
                    width: 210mm;
                    background: white !important;
                    z-index: -1;
                    padding: 8mm;
                    box-sizing: border-box;
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 8mm;
                    }
                    html, body {
                        height: 100%;
                        background: white !important;
                    }
                    .print-view-container {
                        display: block !important;
                        background: white !important;
                    }
                    .print\\:hidden { 
                        display: none !important; 
                    }
                }

                /* --- ESTILOS DEL DISEÑO DE ETIQUETAS --- */
                .print-page-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 2mm; 
                    background-color: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                .label-row {
                    display: flex;
                    flex-direction: row;
                    gap: 2mm; 
                    page-break-inside: avoid;
                    align-items: center;
                }

                /* Caja de Referencia Visual */
                .reference-box {
                    width: 30mm;
                    height: 15mm;
                    display: flex;
                    align-items: center;
                    gap: 1.5mm;
                    box-sizing: border-box;
                    background-color: white !important;
                }

                .ref-image-container {
                    width: 15mm;
                    height: 15mm;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f9fafb;
                    border: 0.5px dotted #e5e7eb;
                }

                .ref-text-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    flex-grow: 1;
                    overflow: hidden;
                }

                .ref-text-name {
                    font-size: 4.5pt;
                    font-family: sans-serif;
                    font-weight: bold;
                    line-height: 1.1;
                    text-transform: uppercase;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    color: black;
                }

                .ref-text-code {
                    font-size: 5pt;
                    font-family: monospace;
                    color: #4b5563;
                    margin-top: 0.5px;
                }

                /* Caja de la Etiqueta (Para Recorte) */
                .label-box {
                    width: 40mm;
                    height: 15mm;
                    border: 0.5px solid #d1d5db; 
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    padding: 1mm;
                    gap: 1.5mm;
                    background-color: white !important;
                }

                .qr-wrapper {
                    width: 12mm;
                    height: 12mm;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .label-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    flex-grow: 1;
                    overflow: hidden;
                }

                .label-url {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 5.5pt;
                    font-weight: normal; 
                    color: black;
                    white-space: nowrap;
                    letter-spacing: 0;
                }

                .label-phone {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 6.5pt;
                    font-weight: normal; 
                    color: black;
                    white-space: nowrap;
                    margin-top: 1.5px;
                }
            `}</style>
        </div>
    );
};

export default ReporteCodigosQR;