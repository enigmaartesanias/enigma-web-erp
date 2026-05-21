import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaBarcode, FaSpinner, FaCamera, FaQrcode } from 'react-icons/fa';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';

const BuscadorProducto = ({ onScan, onSelect, onQRClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

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
                (p.stock_actual > 0) &&
                (p.nombre.toLowerCase().includes(text.toLowerCase()) ||
                (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(text.toLowerCase())))
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
                                    onSelect(product);
                                    setQuery('');
                                    setShowResults(false);
                                }}
                                className="px-3 py-2.5 border-b border-gray-50 last:border-0 transition-all flex items-center justify-between group hover:bg-blue-50 cursor-pointer active:bg-blue-100"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded w-fit transition-colors text-blue-600 bg-blue-50 group-hover:bg-blue-100">
                                            {product.codigo_usuario}
                                        </span>
                                        <span className="text-xs text-gray-700 truncate max-w-[160px] sm:max-w-[250px]">
                                            {product.nombre}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                                    <span className="text-sm font-medium leading-none text-gray-700">
                                        S/ {Math.round(Number(product.precio))}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BuscadorProducto;

