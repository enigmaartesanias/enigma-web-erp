import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEye, FaFilter, FaEdit, FaTrash } from 'react-icons/fa';
import { comprasItemsDB } from '../../../utils/comprasItemsClient';
import ModalInventariar from '../../../components/ModalInventariar';
import ModalEditarItem from '../../../components/ModalEditarItem';
import ModalVerProducto from '../../../components/ModalVerProducto';
import toast, { Toaster } from 'react-hot-toast';

export default function ReporteCompras() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todos'); // todos, pendientes, inventariados

    // Modal Inventariar
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Modal Ver Producto
    const [showVerModal, setShowVerModal] = useState(false);
    const [selectedProductoId, setSelectedProductoId] = useState(null);

    // Modal Editar
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEditItem, setSelectedEditItem] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    useEffect(() => {
        aplicarFiltro();
    }, [filtro, items]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await comprasItemsDB.getAll();
            setItems(data);
        } catch (error) {
            console.error('Error cargando items:', error);
            toast.error('Error al cargar items de compras');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltro = () => {
        let filtered = [...items];

        if (filtro === 'pendientes') {
            filtered = items.filter(item => !item.inventariado);
        } else if (filtro === 'inventariados') {
            filtered = items.filter(item => item.inventariado);
        }

        setFilteredItems(filtered);
    };

    const handleInventariar = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleVerProducto = (item) => {
        if (item.producto_externo_id) {
            setSelectedProductoId(item.producto_externo_id);
            setShowVerModal(true);
        } else {
            toast.error('No se encontró el producto en inventario');
        }
    };

    const handleInventariado = () => {
        loadItems(); // Recargar items
        toast.success('Item inventariado exitosamente');
    };

    const handleEdit = (item) => {
        setSelectedEditItem(item);
        setShowEditModal(true);
    };

    const handleItemUpdated = () => {
        loadItems(); // Recargar items
        toast.success('Item actualizado exitosamente');
    };

    const handleDelete = async (item) => {
        if (!confirm(`¿Estás seguro de eliminar el item "${item.nombre_item}"?`)) {
            return;
        }

        try {
            await comprasItemsDB.delete(item.id);
            toast.success('Item eliminado exitosamente');
            loadItems();
        } catch (error) {
            console.error('Error eliminando item:', error);
            toast.error('Error al eliminar el item');
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        const date = new Date(fecha);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    const formatMonto = (monto) => {
        return `S/ ${parseFloat(monto || 0).toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto">
                {/* Header Compacto */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => navigate('/inventario')}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <FaArrowLeft size={18} />
                        </button>
                        <h1 className="text-xl text-gray-900">
                            📊 Reporte de Compras
                        </h1>
                    </div>

                    {/* Filtro debajo del título */}
                    <div className="flex items-center gap-2 ml-11">
                        <FaFilter className="text-gray-500" size={14} />
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="todos">Todos los Items</option>
                            <option value="pendientes">⏳ Pendientes</option>
                            <option value="inventariados">✅ Inventariados</option>
                        </select>
                    </div>
                </div>

                {/* Estadísticas en 3 columnas responsive */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-lg shadow p-3">
                        <div className="text-xs text-gray-600 mb-1">Total Items</div>
                        <div className="text-xl font-bold text-gray-900">{items.length}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg shadow p-3">
                        <div className="text-xs text-orange-600 mb-1">Pendientes</div>
                        <div className="text-xl font-bold text-orange-700">
                            {items.filter(i => !i.inventariado).length}
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow p-3">
                        <div className="text-xs text-green-600 mb-1">Inventariados</div>
                        <div className="text-xl font-bold text-green-700">
                            {items.filter(i => i.inventariado).length}
                        </div>
                    </div>
                </div>

                {/* Tabla GRID */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Cargando items...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No hay items para mostrar
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Proveedor
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Cant.
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Subtotal
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {formatFecha(item.fecha_compra)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {item.proveedor_nombre || 'Sin proveedor'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {item.nombre_item}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center text-gray-900">
                                                {item.cantidad}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                                {formatMonto(item.subtotal)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.inventariado ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✅ OK
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        ⏳ Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {item.inventariado ? (
                                                    <button
                                                        onClick={() => handleVerProducto(item)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Ver producto en inventario"
                                                    >
                                                        <FaEye size={14} /> Ver
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleInventariar(item)}
                                                            className="px-2 py-1.5 text-xs text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                                                            title="Inventariar"
                                                        >
                                                            <FaPlus size={12} className="inline mr-1" /> Invent.
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Editar item"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Eliminar item"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Resumen */}
                {filteredItems.length > 0 && (
                    <div className="mt-4 bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Mostrando {filteredItems.length} de {items.length} items
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                Total: {formatMonto(filteredItems.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0))}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Inventariado */}
            <ModalInventariar
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                item={selectedItem}
                onInventariado={handleInventariado}
            />

            {/* Modal de Edición */}
            <ModalEditarItem
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                item={selectedEditItem}
                onItemUpdated={handleItemUpdated}
            />

            {/* Modal Ver Producto */}
            <ModalVerProducto
                isOpen={showVerModal}
                onClose={() => setShowVerModal(false)}
                productoId={selectedProductoId}
            />
        </div>
    );
}
