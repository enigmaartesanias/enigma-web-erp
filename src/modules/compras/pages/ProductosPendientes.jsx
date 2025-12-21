import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosPendientesDB } from '../../../utils/productosPendientesClient';
import { FaArrowLeft, FaPlus, FaCheck, FaEye, FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function ProductosPendientes() {
    const navigate = useNavigate();
    const [pendientes, setPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('TODOS'); // TODOS, PENDIENTE, CREADO

    useEffect(() => {
        loadPendientes();
    }, []);

    const loadPendientes = async () => {
        try {
            setLoading(true);
            const data = await productosPendientesDB.getAll();
            setPendientes(data);
        } catch (error) {
            console.error('Error cargando pendientes:', error);
            toast.error('Error al cargar productos pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleCrearProducto = (pendiente) => {
        // Guardar datos en localStorage para pre-llenar el formulario
        localStorage.setItem('producto_pendiente', JSON.stringify({
            id: pendiente.id,
            nombre: pendiente.nombre_producto,
            costo: pendiente.costo_compra,
            stock_inicial: pendiente.cantidad_comprada,
            proveedor_id: pendiente.proveedor_id
        }));

        // Redirigir a crear producto
        navigate(`/inventario/nuevo?from=pendiente&id=${pendiente.id}`);
    };

    const handleVerProducto = (pendiente) => {
        if (pendiente.producto_creado_id) {
            navigate(`/inventario/editar/${pendiente.producto_creado_id}`);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Eliminar este producto pendiente?')) return;

        try {
            await productosPendientesDB.delete(id);
            toast.success('Producto pendiente eliminado');
            loadPendientes();
        } catch (error) {
            console.error('Error eliminando pendiente:', error);
            toast.error('Error al eliminar');
        }
    };

    const filteredPendientes = pendientes.filter(p => {
        if (filter === 'TODOS') return true;
        return p.estado === filter;
    });

    const countPendientes = pendientes.filter(p => p.estado === 'PENDIENTE').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-800">Productos Pendientes</h1>
                        <p className="text-xs text-gray-500">Crear productos comprados</p>
                    </div>
                </div>
                {countPendientes > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        {countPendientes} pendiente{countPendientes !== 1 ? 's' : ''}
                    </span>
                )}
            </header>

            {/* Filtros */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex gap-2">
                    {['TODOS', 'PENDIENTE', 'CREADO'].map(estado => (
                        <button
                            key={estado}
                            onClick={() => setFilter(estado)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === estado
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {estado === 'TODOS' ? 'Todos' : estado === 'PENDIENTE' ? 'Pendientes' : 'Creados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Cargando...</div>
                ) : filteredPendientes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            {filter === 'TODOS'
                                ? 'No hay productos pendientes'
                                : `No hay productos ${filter.toLowerCase()}s`}
                        </div>
                        <button
                            onClick={() => navigate('/compras/nuevo')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            → Ir a Compras
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Producto</th>
                                    <th className="px-4 py-3 text-center font-semibold">Cantidad</th>
                                    <th className="px-4 py-3 text-right font-semibold">Costo</th>
                                    <th className="px-4 py-3 text-left font-semibold">Fecha Compra</th>
                                    <th className="px-4 py-3 text-center font-semibold">Estado</th>
                                    <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredPendientes.map(pendiente => (
                                    <tr key={pendiente.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{pendiente.nombre_producto}</div>
                                            {pendiente.proveedor_nombre && (
                                                <div className="text-xs text-gray-500">
                                                    Proveedor: {pendiente.proveedor_nombre}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600">
                                            {pendiente.cantidad_comprada}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">
                                            ${parseFloat(pendiente.costo_compra).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(pendiente.fecha_compra).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {pendiente.estado === 'PENDIENTE' ? (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                                    🟡 Pendiente
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                    ✅ Creado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {pendiente.estado === 'PENDIENTE' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleCrearProducto(pendiente)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium flex items-center gap-1"
                                                            title="Crear Producto"
                                                        >
                                                            <FaPlus size={10} />
                                                            Crear
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminar(pendiente.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleVerProducto(pendiente)}
                                                        className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-xs font-medium flex items-center gap-1"
                                                        title="Ver Producto"
                                                    >
                                                        <FaEye size={10} />
                                                        Ver
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Resumen */}
                {!loading && filteredPendientes.length > 0 && (
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Mostrando {filteredPendientes.length} producto{filteredPendientes.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: '14px' }
                }}
            />
        </div>
    );
}
