import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaBarcode, FaSpinner, FaCamera, FaQrcode } from 'react-icons/fa';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';

const BuscadorProducto = ({ onScan, onSelect, onQRClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewImg, setPreviewImg] = useState(null); // { url }
    const searchRef = useRef(null);
    const previewTimeoutRef = useRef(null);
    const longPressRef = useRef(null);

    // Cerrar resultados al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Limpiar preview al soltar en cualquier lugar (seguridad)
    useEffect(() => {
        const clearPreview = () => {
            setPreviewImg(null);
            if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
            if (longPressRef.current) clearTimeout(longPressRef.current);
        };
        window.addEventListener('mouseup', clearPreview);
        window.addEventListener('touchend', clearPreview);
        window.addEventListener('touchcancel', clearPreview);
        return () => {
            window.removeEventListener('mouseup', clearPreview);
            window.removeEventListener('touchend', clearPreview);
            window.removeEventListener('touchcancel', clearPreview);
        };
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Intentar escaneo exacto primero
        const found = await onScan(query);
        if (found) {
            setQuery('');
            setShowResults(false);
        } else {
            // Si no es un código exacto, buscar por nombre
            searchByText(query);
        }
    };

    const searchByText = async (text) => {
        setLoading(true);
        try {
            const allProducts = await productosExternosDB.getAllConsolidated();
            const filtered = allProducts.filter(p =>
                p.nombre.toLowerCase().includes(text.toLowerCase()) ||
                (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(text.toLowerCase()))
            );
            setResults(filtered.slice(0, 5)); // Top 5
            setShowResults(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 2) {
            searchByText(val); // Búsqueda en vivo
        } else {
            setResults([]);
            setShowResults(false);
        }
    };

    // --- Preview de imagen al mantener presionado (long press para móvil) ---
    const startPreview = useCallback((url, e) => {
        if (!url) return;
        // En touch, usar long press (300ms) para evitar conflictos con scroll
        if (e.type === 'touchstart') {
            e.stopPropagation();
            longPressRef.current = setTimeout(() => {
                setPreviewImg({ url });
            }, 300);
        } else {
            // Mouse: preview inmediato
            e.preventDefault();
            e.stopPropagation();
            setPreviewImg({ url });
        }
    }, []);

    const stopPreview = useCallback((e) => {
        if (e) {
            e.stopPropagation();
        }
        if (longPressRef.current) {
            clearTimeout(longPressRef.current);
            longPressRef.current = null;
        }
        setPreviewImg(null);
    }, []);

    return (
        <div className="relative w-full z-20 flex gap-2" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative flex-1">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Código o nombre..."
                    className="w-full pl-8 pr-16 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all outline-none"
                    autoFocus
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {loading ? <FaSpinner className="animate-spin text-gray-500" /> : <FaBarcode size={14} />}
                </div>
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2 text-xs"
                    >
                        ✕
                    </button>
                )}
                <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-600 text-white p-1.5 rounded-md hover:bg-gray-700 transition"
                >
                    <FaSearch size={11} />
                </button>
            </form>

            {onQRClick && (
                <div className="flex-shrink-0">
                    <button
                        type="button"
                        onClick={onQRClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 border border-blue-500 flex items-center justify-center group gap-2 active:scale-95"
                        title="Activar Escáner de Productos"
                    >
                        <FaCamera size={18} className="group-hover:scale-110 transition-transform text-white/90" />
                        <span className="text-[10px] font-black tracking-tighter uppercase">Escáner</span>
                    </button>
                </div>
            )}

            {/* Dropdown de resultados */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto z-50" style={{ animation: 'fadeSlideIn 0.15s ease-out' }}>
                    <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resultados de búsqueda</span>
                    </div>
                    {results.map(product => {
                        const hasStock = (product.stock_actual || 0) > 0;
                        return (
                            <div
                                key={product.id}
                                onClick={() => {
                                    if (hasStock && !previewImg) {
                                        onSelect(product);
                                        setQuery('');
                                        setShowResults(false);
                                    }
                                }}
                                className={`px-3 py-2.5 border-b border-gray-50 last:border-0 transition-all flex items-center justify-between group ${
                                    hasStock 
                                    ? 'hover:bg-blue-50 cursor-pointer active:bg-blue-100' 
                                    : 'bg-gray-50/50 cursor-not-allowed grayscale-[0.5] opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {product.imagen_url ? (
                                        <img 
                                            src={product.imagen_url} 
                                            alt={product.nombre} 
                                            className="w-9 h-9 rounded-lg object-cover border border-gray-100 shadow-sm select-none flex-shrink-0"
                                            draggable={false}
                                            onMouseDown={(e) => startPreview(product.imagen_url, e)}
                                            onMouseUp={stopPreview}
                                            onTouchStart={(e) => startPreview(product.imagen_url, e)}
                                            onTouchEnd={stopPreview}
                                            onTouchCancel={stopPreview}
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 flex-shrink-0">
                                            <FaBarcode size={12} />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded w-fit transition-colors ${
                                            hasStock ? 'text-blue-600 bg-blue-50 group-hover:bg-blue-100' : 'text-gray-400 bg-gray-100'
                                        }`}>
                                            {product.codigo_usuario}
                                        </span>
                                        <span className="text-xs text-gray-700 truncate max-w-[160px] sm:max-w-[250px]">
                                            {product.nombre}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                                    <span className={`text-sm font-medium leading-none ${hasStock ? 'text-gray-700' : 'text-gray-400'}`}>
                                        S/ {Math.round(Number(product.precio))}
                                    </span>
                                    {!hasStock && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-200 text-red-900">
                                            AGOTADO
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Overlay de previsualización de imagen (press & hold) - Renderizado como portal */}
            {previewImg && createPortal(
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    style={{ zIndex: 99999, touchAction: 'none' }}
                    onMouseUp={stopPreview}
                    onTouchEnd={stopPreview}
                    onTouchCancel={stopPreview}
                    onClick={stopPreview}
                >
                    <div style={{ animation: 'previewZoomIn 0.15s ease-out' }}>
                        <img 
                            src={previewImg.url} 
                            alt="Preview" 
                            className="w-44 h-44 rounded-2xl object-cover border-4 border-white shadow-2xl"
                            draggable={false}
                            style={{ touchAction: 'none', pointerEvents: 'none' }}
                        />
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes previewZoomIn {
                    from { opacity: 0; transform: scale(0.75); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default BuscadorProducto;

