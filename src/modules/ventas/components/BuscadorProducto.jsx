import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBarcode, FaSpinner } from 'react-icons/fa';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';

const BuscadorProducto = ({ onScan, onSelect }) => {
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
            const allProducts = await productosExternosDB.getAll();
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
        <div className="relative w-full z-20" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Escanear código o buscar..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all outline-none"
                    autoFocus
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {loading ? <FaSpinner className="animate-spin text-slate-500" /> : <FaBarcode size={16} />}
                </div>
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 px-2"
                    >
                        ✕
                    </button>
                )}
                <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-700 text-white p-1.5 rounded-md hover:bg-slate-800 transition"
                >
                    <FaSearch size={12} />
                </button>
            </form>

            {/* Dropdown de resultados */}
            {showResults && results.length > 0 && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
                    {results.map(product => (
                        <div
                            key={product.id}
                            onClick={() => {
                                onSelect(product);
                                setQuery('');
                                setShowResults(false);
                            }}
                            className="p-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 overflow-hidden border border-gray-200">
                                {product.imagen_url ? (
                                    <img src={product.imagen_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 text-sm truncate">{product.nombre}</div>
                                <div className="text-xs text-gray-500 flex gap-2 items-center">
                                    <span className="font-mono bg-gray-100 px-1 rounded text-[10px]">{product.codigo_usuario}</span>
                                    <span>Stock: {product.stock_actual}</span>
                                </div>
                            </div>
                            <div className="text-slate-700 font-bold text-sm">S/ {product.precio}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuscadorProducto;
