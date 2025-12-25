import React from 'react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const ItemVenta = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="flex items-center gap-1 py-2 px-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            {/* Col 1: Código */}
            <div className="text-xs text-gray-900 font-mono w-16 flex-shrink-0">
                {item.codigo || 'N/A'}
            </div>

            {/* Col 2: Descripción/Nombre - Expandible */}
            <div className="flex-1 min-w-0 text-xs text-gray-700 text-left truncate">
                {item.nombre?.trim() || item.nombre}
            </div>

            {/* Col 3: Cantidad con controles +/- */}
            <div className="flex items-center gap-1 bg-gray-100 rounded px-1.5 py-0.5 flex-shrink-0">
                <button
                    onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                    className="text-gray-500 hover:text-gray-700 transition"
                    title="Disminuir"
                >
                    <FaMinus size={8} />
                </button>
                <span className="text-xs font-semibold w-6 text-center">{item.cantidad}</span>
                <button
                    onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                    className="text-gray-600 hover:text-gray-800 transition"
                    title="Aumentar"
                >
                    <FaPlus size={8} />
                </button>
            </div>

            {/* Col 4: Precio (Subtotal) */}
            <div className="text-xs text-gray-700 w-16 text-right flex-shrink-0">
                S/ {(item.precio * item.cantidad).toFixed(2)}
            </div>

            {/* Col 5: Eliminar */}
            <button
                onClick={() => onRemove(item.id)}
                className="text-red-400 hover:text-red-600 transition p-1 flex-shrink-0"
                title="Eliminar"
            >
                <FaTrash size={11} />
            </button>
        </div>
    );
};

export default ItemVenta;
