import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import QRCode from 'react-qr-code';

/**
 * Modal de solo lectura para visualizar información del producto inventariado
 */
export default function ModalVerProducto({ isOpen, onClose, productoId }) {
    const [producto, setProducto] = useState(null);
    const [categoria, setCategoria] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && productoId) {
            loadProducto();
        }
    }, [isOpen, productoId]);

    const loadProducto = async () => {
        try {
            setLoading(true);
            const data = await productosExternosDB.getById(productoId);
            setProducto(data);

            // Cargar nombre de categoría
            if (data.categoria) {
                const tipos = await tiposProductoDB.getAll();
                const tipo = tipos.find(t => t.id === parseInt(data.categoria));
                setCategoria(tipo ? tipo.nombre : data.categoria);
            }
        } catch (error) {
            console.error('Error cargando producto:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Información del Producto
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Cargando...
                    </div>
                ) : producto ? (
                    <div className="p-6 space-y-4">
                        {/* Imagen */}
                        {producto.imagen_url && (
                            <div className="flex justify-center">
                                <img
                                    src={producto.imagen_url}
                                    alt={producto.nombre}
                                    className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                                />
                            </div>
                        )}

                        {/* Nombre */}
                        <div className="text-center">
                            <h4 className="text-xl font-semibold text-gray-900">
                                {producto.nombre}
                            </h4>
                        </div>

                        {/* Código y QR */}
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Código IQ</p>
                                <p className="text-lg font-mono font-semibold text-gray-900">
                                    {producto.codigo_usuario}
                                </p>
                            </div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                                <QRCode value={producto.codigo_usuario} size={60} />
                            </div>
                        </div>

                        {/* Categoría */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Categoría</p>
                                <p className="text-sm font-medium text-gray-900">{categoria || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Unidad</p>
                                <p className="text-sm font-medium text-gray-900">{producto.unidad || 'UND'}</p>
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Stock Actual</p>
                                <p className="text-lg font-semibold text-gray-900">{producto.stock_actual}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Stock Mínimo</p>
                                <p className="text-lg font-semibold text-gray-900">{producto.stock_minimo || '-'}</p>
                            </div>
                        </div>

                        {/* Precios */}
                        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Costo:</span>
                                <span className="text-lg font-semibold text-gray-900">
                                    S/ {parseFloat(producto.costo).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Precio Venta:</span>
                                <span className="text-lg font-semibold text-green-600">
                                    S/ {parseFloat(producto.precio).toFixed(2)}
                                </span>
                            </div>
                            {producto.precio_adicional && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Precio Oferta:</span>
                                    <span className="text-lg font-semibold text-orange-600">
                                        S/ {parseFloat(producto.precio_adicional).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Descripción */}
                        {producto.descripcion && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Descripción</p>
                                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                                    {producto.descripcion}
                                </p>
                            </div>
                        )}

                        {/* Origen */}
                        <div className="text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                📦 Origen: {producto.origen || 'COMPRA'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No se encontró el producto
                    </div>
                )}
            </div>
        </div>
    );
}
