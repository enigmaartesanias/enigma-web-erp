import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaQrcode, FaArrowLeft, FaBox, FaDollarSign, FaWarehouse } from 'react-icons/fa';
import QRCode from 'react-qr-code';

export default function Inventario() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showQR, setShowQR] = useState(null);

    useEffect(() => {
        loadProductos();
    }, []);

    const loadProductos = async () => {
        try {
            setLoading(true);
            const data = await productosExternosDB.getAll();
            setProductos(data);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Eliminar "${nombre}"?`)) {
            try {
                await productosExternosDB.delete(id);
                await loadProductos();
            } catch (error) {
                console.error('Error eliminando:', error);
                alert('Error al eliminar el producto');
            }
        }
    };

    const filteredProductos = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || p.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

    // Calcular estadísticas
    const stats = {
        total: productos.length,
        valorTotal: productos.reduce((sum, p) => sum + (p.stock_actual * p.precio), 0),
        stockBajo: productos.filter(p => p.stock_actual <= p.stock_minimo).length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {/* Header */}
            <div className="bg-gray-100 text-gray-900 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => navigate('/inventario-home')}
                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            <span className="font-medium">Volver al Panel</span>
                        </button>
                        <button
                            onClick={() => navigate('/inventario/nuevo')}
                            className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center hover:bg-slate-700 transition-all shadow-sm"
                        >
                            <FaPlus className="mr-1.5" size={10} />
                            Nuevo Producto
                        </button>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center text-gray-800">
                        <FaBox className="mr-3 text-blue-600" />
                        Reporte de Inventario
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Productos comerciales y stock disponible</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-blue-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Total</p>
                                <p className="text-sm sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FaWarehouse className="text-blue-500 text-lg sm:text-3xl opacity-50 hidden sm:block" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-green-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Valor Stock</p>
                                <p className="text-xs sm:text-2xl font-bold text-gray-900 break-words">S/ {stats.valorTotal.toFixed(2)}</p>
                            </div>
                            <FaDollarSign className="text-green-500 text-lg sm:text-3xl opacity-50 hidden sm:block" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-red-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Bajo Stock</p>
                                <p className="text-sm sm:text-2xl font-bold text-gray-900">{stats.stockBajo}</p>
                            </div>
                            <div className="text-red-500 text-lg sm:text-2xl opacity-50 hidden sm:block">⚠️</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando productos...</div>
                    ) : filteredProductos.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No se encontraron productos.
                            <button
                                onClick={() => navigate('/inventario/nuevo')}
                                className="text-blue-600 underline ml-1"
                            >
                                Agregar el primero
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Imagen</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                        {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th> */}
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Saldo</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Costo</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Origen</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Precio</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProductos.map((producto) => (
                                        <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                {producto.imagen_url ? (
                                                    <img
                                                        src={producto.imagen_url}
                                                        alt={producto.nombre}
                                                        className="w-10 h-10 object-cover rounded border"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-[10px]">
                                                        Sin foto
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-gray-600 text-xs">{producto.codigo_usuario}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-700 text-xs">{producto.nombre}</div>
                                            </td>
                                            {/* <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {producto.categoria || 'Sin categoría'}
                                                </span>
                                            </td> */}
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs ${producto.stock_actual <= producto.stock_minimo
                                                    ? 'text-red-600'
                                                    : 'text-green-600'
                                                    }`}>
                                                    {producto.stock_actual}
                                                </span>
                                                <span className="text-[10px] text-gray-400 ml-1">{producto.unidad}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 text-xs">
                                                S/ {Number(producto.costo).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2 py-1 text-[10px] rounded-full border ${producto.origen === 'PRODUCCION' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    producto.origen === 'COMPRA' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    {producto.origen === 'PRODUCCION' ? 'Prod.' :
                                                        producto.origen === 'COMPRA' ? 'Compra' :
                                                            'Otro'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700 text-xs">
                                                S/ {Number(producto.precio).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setShowQR(producto.codigo_usuario)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Ver QR"
                                                    >
                                                        <FaQrcode size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/inventario/editar/${producto.id}`)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <FaEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(producto.id, producto.nombre)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Modal */}
            {showQR && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowQR(null)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4 text-center">Código QR</h3>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white border-2 rounded-lg">
                                <QRCode value={showQR} size={200} />
                            </div>
                        </div>
                        <p className="text-center text-gray-600 font-mono font-semibold">{showQR}</p>
                        <button
                            onClick={() => setShowQR(null)}
                            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
