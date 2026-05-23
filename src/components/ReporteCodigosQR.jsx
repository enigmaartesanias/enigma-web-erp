import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { FaArrowLeft, FaPrint, FaSearch, FaBarcode, FaCheckCircle, FaTimes, FaPlus, FaMinus, FaCalendarDay } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import toast, { Toaster } from 'react-hot-toast';
import html2canvas from 'html2canvas';

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
    const [dateFilter, setDateFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [printQuantities, setPrintQuantities] = useState({});
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [isPrintReady, setIsPrintReady] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = useRef(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await productosExternosDB.getAllConsolidated();
            const sorted = data.sort((a, b) => {
                const dateA = new Date(a.created_at || 0);
                const dateB = new Date(b.created_at || 0);
                return dateB - dateA;
            });
            setProductos(sorted);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const categorias = ['TODOS', ...new Set(
        productos.map(p => p.categoria || 'OTROS').map(c => c.toUpperCase()).sort()
    )];

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            setPrintQuantities(prevQ => ({ ...prevQ, [id]: 10 }));
            return [...prev, id];
        });
    };

    const updateQuantity = (id, change) => {
        setPrintQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + change)
        }));
    };

    const setTodayFilter = () => setDateFilter(getLocalYYYYMMDD(new Date()));

    const handlePrint = () => {
        if (selectedIds.length === 0) { toast.error('Selecciona al menos un producto'); return; }
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
            const loadingToast = toast.loading('Preparando imagen A4...');
            await new Promise(resolve => setTimeout(resolve, 500));
            const element = printRef.current;
            const originalClass = element.className;
            element.className = 'print-view-container visible-for-capture';
            const canvas = await html2canvas(element, {
                scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('.print-view-container');
                    if (el) el.style.display = 'block';
                }
            });
            element.className = originalClass;
            const link = document.createElement('a');
            link.download = `etiquetas-enigma-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.dismiss(loadingToast);
            toast.success('Imagen descargada exitosamente');
            setShowBatchModal(false);
        } catch (error) {
            console.error(error);
            toast.error('Error al generar la imagen');
        } finally {
            setIsDownloading(false);
        }
    };

    const filteredProductos = productos.filter(p => {
        const matchesSearch =
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'TODOS' ||
            (p.categoria && p.categoria.toUpperCase() === categoryFilter);
        let matchesDate = true;
        if (dateFilter) {
            const pDate = getLocalYYYYMMDD(p.created_at);
            matchesDate = pDate === dateFilter;
        }
        return matchesSearch && matchesCategory && matchesDate;
    });

    const selectedProductsData = productos.filter(p => selectedIds.includes(p.id));

    const generateRows = () => {
        let rows = [];
        selectedProductsData.forEach(prod => {
            let labelsLeft = printQuantities[prod.id] || 10;
            while (labelsLeft > 0) {
                const labelsInThisRow = Math.min(labelsLeft, 4);
                rows.push({ data: prod, labelCount: labelsInThisRow });
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
                    <button onClick={() => navigate('/inventario-home')} className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors text-gray-600">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
                            <FaBarcode className="text-indigo-600" /> Catálogo de Etiquetas
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {selectedIds.length} seleccionados · {filteredProductos.length} productos con stock
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-full sm:w-auto shrink-0">
                        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                            className="py-1.5 px-3 rounded-lg text-sm text-gray-600 outline-none w-full sm:w-auto cursor-pointer" />
                        <button onClick={setTodayFilter}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ml-1">
                            <FaCalendarDay className="inline mr-1 mb-0.5" /> Hoy
                        </button>
                        {dateFilter && (
                            <button onClick={() => setDateFilter('')} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <div className="relative w-full sm:w-64 shrink-0">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none w-full bg-white shadow-sm" />
                    </div>

                    <button onClick={handlePrint} disabled={selectedIds.length === 0}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-300 disabled:shadow-none w-full sm:w-auto shrink-0">
                        <FaPrint /> Generar Etiquetas ({selectedIds.length})
                    </button>
                </div>
            </div>

            {/* Filtros Categoría */}
            <div className="max-w-7xl mx-auto mb-6 print:hidden overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                    {categorias.map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${categoryFilter === cat
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm'}`}>
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
                        <p className="text-sm">Intenta borrar los filtros.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProductos.map((producto) => {
                            const isSelected = selectedIds.includes(producto.id);
                            return (
                                <div key={producto.id} onClick={() => toggleSelect(producto.id)}
                                    className={`relative border-2 rounded-2xl p-4 flex flex-col items-center text-center transition-all cursor-pointer bg-white group ${isSelected ? 'border-indigo-500 shadow-indigo-100 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-indigo-500 animate-in zoom-in z-10">
                                            <FaCheckCircle size={20} />
                                        </div>
                                    )}
                                    <div className="w-full flex flex-col items-center justify-center min-h-[120px] p-2 gap-2">
                                        <QRCode value={producto.codigo_usuario || String(producto.id)} size={56} level="L" />
                                        <span className="font-bold text-gray-700 text-xs text-center line-clamp-2 leading-tight">
                                            {producto.nombre}
                                        </span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full border transition-colors ${isSelected ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                        <span className="font-mono text-[10px] font-bold">{producto.codigo_usuario || 'S/N'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* VISTA DE IMPRESIÓN */}
            <div className={`print-view-container ${isDownloading ? 'visible-for-capture' : ''}`} ref={printRef}>
                <div className="print-page-wrapper">
                    {generateRows().map((row, idx) => (
                        <div key={idx} className="label-row">

                            {/* ZONA DE REFERENCIA — nombre + código */}
                            <div className="reference-box">
                                <div className="ref-text-container-full">
                                    <span className="ref-text-name">{row.data.nombre}</span>
                                    <span className="ref-text-code">{row.data.codigo_usuario}</span>
                                </div>
                            </div>

                            {/* ETIQUETAS DE RECORTE (Horizontal: QR izquierda, Textos derecha) */}
                            {Array.from({ length: row.labelCount }).map((_, i) => (
                                <div key={i} className="label-box">
                                    {/* Lado Izquierdo: QR Code */}
                                    <div className="label-qr-section">
                                        <QRCode
                                            value={row.data.codigo_usuario || String(row.data.id)}
                                            size={42}
                                            level="L"
                                            style={{ width: '100%', height: '100%' }}
                                            viewBox="0 0 256 256"
                                        />
                                    </div>

                                    {/* Lado Derecho: Información de Marca e Iniciales */}
                                    <div className="label-text-section">
                                        <div className="label-brand">ENIGMA</div>
                                        <div className="label-code">{row.data.codigo_usuario}</div>
                                        <div className="label-sub">
                                            {row.data.categoria ? row.data.categoria.toUpperCase() : 'ARTESANÍA'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Configuración */}
            {showBatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-indigo-600 p-6 text-white relative">
                            <button onClick={() => setShowBatchModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                                <FaTimes size={20} />
                            </button>
                            <h3 className="text-xl font-bold flex items-center gap-2"><FaPrint /> Configurar Lote</h3>
                            <p className="text-indigo-100 text-xs mt-1">{selectedIds.length} productos seleccionados.</p>
                        </div>

                        <div className="p-4 sm:p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Cantidades a Imprimir</label>
                                <div className="max-h-[30vh] overflow-y-auto space-y-3 pr-2">
                                    {selectedProductsData.map(prod => (
                                        <div key={prod.id} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                            <div className="flex flex-col items-start min-w-0 pr-2">
                                                <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">{prod.codigo_usuario}</span>
                                                <span className="text-xs text-gray-600 font-medium truncate w-32 sm:w-40 text-left">{prod.nombre}</span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <button onClick={() => updateQuantity(prod.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                                                    <FaMinus size={10} />
                                                </button>
                                                <span className="text-lg font-black text-gray-800 w-8 text-center">{printQuantities[prod.id] || 10}</span>
                                                <button onClick={() => updateQuantity(prod.id, 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100">
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-sm text-gray-500 border-t pt-4 text-center">
                                    Total: <strong>{selectedProductsData.reduce((acc, p) => acc + (printQuantities[p.id] || 10), 0)}</strong> etiquetas
                                </p>
                            </div>

                            <button onClick={confirmPrint} disabled={isDownloading}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:bg-gray-400">
                                <FaPrint /> Confirmar e Imprimir
                            </button>

                            <button onClick={handleDownloadSheet} disabled={isDownloading}
                                className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {isDownloading
                                    ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                    : <FaPrint />}
                                Descargar Hoja (Imagen A4)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media screen {
                    .print-view-container { display: none; }
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
                    @page { size: A4; margin: 8mm; }
                    html, body { height: 100%; background: white !important; }
                    .print-view-container { display: block !important; background: white !important; }
                    .print\\:hidden { display: none !important; }
                }

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

                /* Zona de referencia lateral izquierda */
                .reference-box {
                    width: 30mm;
                    height: 15mm;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    padding: 1mm 2mm;
                    background-color: white !important;
                }

                .ref-text-container-full {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 100%;
                    gap: 1px;
                }

                .ref-text-name {
                    font-size: 5pt;
                    font-family: sans-serif;
                    font-weight: bold;
                    text-transform: uppercase;
                    line-height: 1.2;
                    color: black;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .ref-text-code {
                    font-size: 5pt;
                    font-family: monospace;
                    color: #4b5563;
                    letter-spacing: 0.02em;
                }

                /* Etiqueta de recorte 38x15mm Reestructurada */
                .label-box {
                    width: 38mm;
                    height: 15mm;
                    border: 0.5px solid #d1d5db;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: row; /* Cambio a horizontal */
                    align-items: center;
                    justify-content: flex-start;
                    padding: 1mm 1.5mm;
                    gap: 2.5mm; /* Espacio entre QR y sección de textos */
                    background-color: white !important;
                    overflow: hidden;
                }

                /* Sección de QR a la izquierda */
                .label-qr-section {
                    width: 11mm;
                    height: 11mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                /* Sección de texto a la derecha */
                .label-text-section {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 11.5mm; /* Alineado con la altura interna del QR */
                    flex-grow: 1;
                    min-width: 0; /* Previene desbordamiento en textos largos */
                    text-align: left;
                }

                .label-brand {
                    font-size: 5.5pt;
                    font-family: Georgia, serif;
                    font-weight: bold;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #111827;
                    line-height: 1;
                }

                .label-code {
                    font-size: 5pt;
                    font-family: monospace;
                    font-weight: bold;
                    color: #1f2937;
                    letter-spacing: 0.01em;
                    line-height: 1.1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .label-sub {
                    font-size: 3.5pt;
                    font-family: sans-serif;
                    font-weight: 600;
                    color: #6b7280;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    line-height: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
        </div>
    );
};

export default ReporteCodigosQR;