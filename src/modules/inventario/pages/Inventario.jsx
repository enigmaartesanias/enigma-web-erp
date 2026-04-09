import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaBox, FaDollarSign, FaWarehouse, FaEye, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';

export default function Inventario() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Estado para Confirm Modal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        icon: null,
        confirmText: '',
        confirmColor: 'blue',
        onConfirm: () => { }
    });

    useEffect(() => {
        loadProductos();
    }, []);

    const loadProductos = async () => {
        try {
            setLoading(true);
            setLoading(true);
            const data = await productosExternosDB.getAllConsolidated();
            setProductos(data);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, nombre) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Producto',
            message: `¿Estás seguro de eliminar "${nombre}" del inventario?`,
            icon: <FaTrash />,
            confirmText: 'Sí, eliminar',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await productosExternosDB.delete(id);
                    toast.success('Producto eliminado del inventario');
                    await loadProductos();
                } catch (error) {
                    console.error('Error eliminando:', error);
                    toast.error('Error al eliminar producto', { duration: 4000 });
                }
            }
        });
    };

    const filteredProductos = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || p.categoria === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

    // Calcular estadísticas sobre productos consolidados
    const stats = {
        total: filteredProductos.length,
        valorTotal: filteredProductos.reduce((sum, p) => sum + (p.stock_actual * p.precio), 0),
        stockBajo: filteredProductos.filter(p => p.stock_actual <= (p.stock_minimo || 0)).length,
        ultimoIngreso: productos.length > 0 
            ? new Date(Math.max(...productos.map(p => new Date(p.fecha_registro || p.created_at).getTime()))).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })
            : '-'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {/* Header */}
            <div className="bg-gray-100 text-gray-900 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                    <div className="flex justify-between items-center mb-4">
                        <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                            <FaArrowLeft className="mr-2" />
                            <span className="font-semibold text-sm">Enigma Sistema ERP</span>
                        </Link>
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
                                <p className="text-sm sm:text-lg text-gray-900">{stats.total}</p>
                            </div>
                            <FaWarehouse className="text-blue-500 text-lg sm:text-3xl opacity-50 hidden sm:block" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-green-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Valor Stock</p>
                                <p className="text-xs sm:text-lg text-gray-900 break-words">S/ {stats.valorTotal.toFixed(2)}</p>
                            </div>
                            <FaDollarSign className="text-green-500 text-lg sm:text-3xl opacity-50 hidden sm:block" />
                        </div>
                    </div>

                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-orange-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">Último Ingreso</p>
                                <p className="text-sm sm:text-lg text-gray-900">{stats.ultimoIngreso}</p>
                            </div>
                            <FaCalendarAlt className="text-orange-500 text-lg sm:text-3xl opacity-50 hidden sm:block" />
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cód. Usuario</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Origen</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Saldo Total</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Costo Prom. (S/)</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Fecha Ingreso</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProductos.map((producto) => (
                                        <tr key={producto.codigo_usuario} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-gray-600 text-xs">{producto.codigo_usuario}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {producto.origen === 'PRODUCCION' ? (
                                                    <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">Prod. Taller</span>
                                                ) : producto.origen === 'INV_TALLER' || producto.origen === 'TALLER' ? (
                                                    <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">Inv. Taller</span>
                                                ) : producto.origen === 'INV_COMPRA' || producto.origen === 'COMPRA' ? (
                                                    <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">Inv. Compra</span>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded">{producto.origen || '-'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-700 text-xs uppercase font-medium">{producto.categoria}</div>
                                                {producto.material && (
                                                    <div className="text-[10px] text-gray-400 uppercase italic leading-tight">{producto.material}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs ${producto.stock_actual <= (producto.stock_minimo || 0)
                                                    ? 'text-red-600 font-bold'
                                                    : 'text-green-600'
                                                    }`}>
                                                    {producto.stock_actual}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600 text-xs font-medium">
                                                S/ {Number(producto.costo).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-500 text-[10px]">
                                                {producto.fecha_registro ? new Date(producto.fecha_registro).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-1">
                                                    {producto.imagen_url && (
                                                        <Tooltip text="Ver imagen del producto">
                                                            <button
                                                                onClick={() => setSelectedImage(producto)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            >
                                                                <FaEye size={16} />
                                                            </button>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip text="Editar producto">
                                                        <button
                                                            onClick={() => navigate(`/inventario/editar/${producto.id}`)}
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        >
                                                            <FaEdit size={14} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip text="Eliminar del inventario">
                                                        <button
                                                            onClick={() => handleDelete(producto.id, producto.nombre)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </Tooltip>
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

            {/* Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase">{selectedImage.categoria}</h3>
                                <p className="text-[10px] text-gray-500 font-mono">{selectedImage.codigo_usuario}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="bg-gray-100 flex items-center justify-center min-h-[300px]">
                            <img 
                                src={selectedImage.imagen_url} 
                                alt={selectedImage.nombre}
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center text-xs">
                             <span className="text-gray-600 font-medium">Stock: {selectedImage.stock_actual}</span>
                             <span className="text-blue-600 font-bold text-sm">S/ {Number(selectedImage.precio).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Toaster para notificaciones */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '14px',
                        maxWidth: '300px',
                        padding: '12px 16px',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: 'white' },
                        style: { borderLeft: '4px solid #10b981' }
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: 'white' },
                        duration: 4000,
                        style: { borderLeft: '4px solid #ef4444' }
                    }
                }}
            />

            {/* Modal de Confirmación */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                icon={confirmModal.icon}
                confirmText={confirmModal.confirmText}
                confirmColor={confirmModal.confirmColor}
            />
        </div>
    );
}
