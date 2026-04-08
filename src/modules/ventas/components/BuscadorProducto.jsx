import React, { useState, useEffect, useRef } from 'react';
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

            {/* Botones de Escaneo */}
            {onQRClick && (
                <div className="flex gap-1.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onQRClick}
                        className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-all shadow-sm border border-gray-700 flex items-center justify-center group"
                        title="Escanear QR"
                    >
                        <FaQrcode size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] ml-1.5 font-bold hidden lg:inline tracking-tighter">QR</span>
                    </button>

                    <button
                        type="button"
                        onClick={onQRClick}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 border border-blue-500 flex items-center justify-center group"
                        title="Activar Cámara"
                    >
                        <FaCamera size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] ml-1.5 font-bold hidden lg:inline tracking-tighter">CÁMARA</span>
                    </button>
                </div>
            )}

            {/* Dropdown de resultados - Mejorado con stock y estilos limpios */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-h-80 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resultados de búsqueda</span>
                    </div>
                    {results.map(product => {
                        const hasStock = (product.stock_actual || 0) > 0;
                        return (
                            <div
                                key={product.id}
                                onClick={() => {
                                    if (hasStock) {
                                        onSelect(product);
                                        setQuery('');
                                        setShowResults(false);
                                    }
                                }}
                                className={`px-4 py-3 border-b border-gray-50 last:border-0 transition-all flex items-center justify-between group ${
                                    hasStock 
                                    ? 'hover:bg-blue-50 cursor-pointer' 
                                    : 'bg-gray-50/50 cursor-not-allowed grayscale-[0.5] opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {product.imagen_url ? (
                                        <img 
                                            src={product.imagen_url} 
                                            alt={product.nombre} 
                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <FaBarcode size={14} />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-0.5">
                                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded w-fit transition-colors ${
                                            hasStock ? 'text-blue-600 bg-blue-50 group-hover:bg-blue-100' : 'text-gray-400 bg-gray-100'
                                        }`}>
                                            {product.codigo_usuario}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">
                                            {product.nombre}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-sm font-black leading-none ${hasStock ? 'text-gray-900' : 'text-gray-400'}`}>
                                        S/ {Number(product.precio).toFixed(2)}
                                    </span>
                                    {!hasStock && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-200 text-red-900">
                                            AGOTADO
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BuscadorProducto;
