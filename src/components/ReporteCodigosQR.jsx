import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { FaArrowLeft, FaPrint, FaSearch, FaBarcode, FaCheckCircle, FaTimes, FaPlus, FaMinus, FaImage } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import toast, { Toaster } from 'react-hot-toast';

const ReporteCodigosQR = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('TODOS');
    const [selectedIds, setSelectedIds] = useState([]); // IDs de productos seleccionados
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchQuantity, setBatchQuantity] = useState(10); // Cantidad por defecto
    const [isPrintReady, setIsPrintReady] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const productosData = await productosExternosDB.getAll();
            const sorted = productosData.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setProductos(sorted);
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast.error("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    // Obtener categorías únicas
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
        // Delay para que el render se actualice y los SVGs se generen
        setTimeout(() => {
            window.print();
            setIsPrintReady(false);
        }, 1000);
    };

    const filteredProductos = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = categoryFilter === 'TODOS' || 
            (p.categoria && p.categoria.toUpperCase() === categoryFilter);

        return matchesSearch && matchesCategory;
    });

    const selectedProductsData = productos.filter(p => selectedIds.includes(p.id));

    // Generar la lista plana de etiquetas para el grid de impresión
    const generateLabels = () => {
        let labels = [];
        selectedProductsData.forEach(prod => {
            // 1. Etiqueta de Referencia (Imagen + Nombre)
            labels.push({ type: 'reference', data: prod });
            // 2. N Etiquetas de QR
            for (let i = 0; i < batchQuantity; i++) {
                labels.push({ type: 'qr', data: prod });
            }
        });
        return labels;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Toaster position="top-right" />
            
            {/* Header - OCULTO AL IMPRIMIR */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <div className="flex items-center gap-4 w-full md:w-auto">
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
                            {selectedIds.length} productos seleccionados para impresión
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 bg-white shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button
                        onClick={handlePrint}
                        disabled={selectedIds.length === 0}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                    >
                        <FaPrint />
                        Generar Etiquetas ({selectedIds.length})
                    </button>
                </div>
            </div>

            {/* Filtro de Categorías - OCULTO AL IMPRIMIR */}
            <div className="max-w-7xl mx-auto mb-6 print:hidden overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
                                categoryFilter === cat 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 shadow-sm'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Listado de Productos - OCULTO AL IMPRIMIR */}
            <div className="max-w-7xl mx-auto print:hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

            {/* VISTA DE IMPRESIÓN - Renderizado fijo para evitar perdida de estado */}
            <div className="print-view-container">
                <div className="label-grid">
                    {generateLabels().map((label, idx) => (
                        <div key={idx} className={`label-box ${label.type === 'reference' ? 'reference-box' : ''}`}>
                            {label.type === 'reference' ? (
                                <div className="flex flex-col items-center justify-center h-full p-2">
                                    <div className="w-16 h-16 mb-1">
                                        {label.data.imagen_url ? (
                                            <img src={label.data.imagen_url} alt="ref" className="w-full h-full object-contain" />
                                        ) : <FaImage size={24} className="text-gray-300" />}
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-center leading-tight mb-1">
                                        {label.data.nombre}
                                    </span>
                                    <span className="text-[10px] font-mono font-black border-2 border-black px-1">
                                        {label.data.codigo_usuario}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="qr-container">
                                        <QRCode 
                                            value={label.data.codigo_usuario || label.data.id.toString()} 
                                            size={90} 
                                            level="L"
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <span className="text-[9px] font-mono mt-1 font-bold">
                                        {label.data.codigo_usuario}
                                    </span>
                                </div>
                            )}
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
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Etiquetas por Producto</label>
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
                                    Total de etiquetas: <strong>{selectedIds.length * (batchQuantity + 1)}</strong>
                                    <br />
                                    <span className="text-[10px] text-gray-400 italic">(Incluye 1 etiqueta de referencia por producto)</span>
                                </p>
                            </div>

                            <button
                                onClick={confirmPrint}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                            >
                                <FaPrint /> Confirmar e Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media screen {
                    .print-view-container { 
                        display: none; 
                    }
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        height: 100%;
                        background: white !important;
                    }
                    .print-view-container {
                        display: block !important;
                        background: white !important;
                        padding: 10mm;
                    }
                    .print\\:hidden { 
                        display: none !important; 
                    }
                    
                    .label-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 3.5cm);
                        gap: 2mm;
                        justify-content: center;
                        background-color: white !important;
                    }

                    .label-box {
                        width: 3.5cm;
                        height: 3.5cm;
                        border: 0.5px dashed #000;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        page-break-inside: avoid;
                        background-color: white !important;
                        color: black !important;
                    }

                    .reference-box {
                        background-color: #f0f0f0 !important;
                        border: 1px solid #000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .qr-container {
                        width: 2.8cm;
                        height: 2.8cm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: white !important;
                    }

                    svg {
                        max-width: 100%;
                        max-height: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReporteCodigosQR;
