import React from 'react';
import { FaTrash, FaMinus, FaPlus, FaTag } from 'react-icons/fa';

const ItemVenta = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-3 transition-all hover:shadow-md">
            {/* Imagen */}
            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FaTag />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-sm truncate pr-2">{item.nombre}</h3>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-red-400 hover:text-red-600 transition p-1"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {item.codigo || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">{item.categoria}</span>
                </div>

                <div className="flex justify-between items-end mt-2">
                    {/* Controles Cantidad */}
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                            className="p-1 px-2 text-gray-500 hover:bg-gray-200 rounded-l-lg transition"
                        >
                            <FaMinus size={10} />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">{item.cantidad}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                            className="p-1 px-2 text-indigo-600 hover:bg-indigo-50 rounded-r-lg transition"
                        >
                            <FaPlus size={10} />
                        </button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                        <div className="text-xs text-gray-400">Unit: S/ {item.precio.toFixed(2)}</div>
                        <div className="font-bold text-indigo-700">S/ {(item.precio * item.cantidad).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemVenta;
