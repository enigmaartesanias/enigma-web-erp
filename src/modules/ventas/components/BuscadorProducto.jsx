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

            {/* Dropdown de resultados - Debajo del input */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-gray-100 rounded shadow-md border border-gray-200 overflow-hidden max-h-64 overflow-y-auto z-50">
                    {results.map(product => (
                        <div
                            key={product.id}
                            onClick={() => {
                                onSelect(product);
                                setQuery('');
                                setShowResults(false);
                            }}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-3 text-xs text-gray-600">
                                <span className="font-mono text-gray-500">{product.codigo_usuario}</span>
                                <span className="flex-1 truncate">{product.nombre}</span>
                                <span className="text-gray-700">S/ {product.precio}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuscadorProducto;
