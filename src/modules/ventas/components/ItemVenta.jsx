import React, { useState, useEffect } from 'react';
import { FaTrash, FaMinus, FaPlus, FaExchangeAlt } from 'react-icons/fa';

const ItemVenta = ({ item, onUpdateItem, onRemove }) => {
    // Estado local para manejar el input del subtotal de la fila
    const [localSubtotal, setLocalSubtotal] = useState((item.precio_venta * item.cantidad).toFixed(2));

    // Sincronizar estado local cuando cambian los valores del item
    useEffect(() => {
        setLocalSubtotal((item.precio_venta * item.cantidad).toFixed(2));
    }, [item.precio_venta, item.cantidad]);

    const handleSubtotalChange = (val) => {
        const value = parseFloat(val) || 0;
        setLocalSubtotal(val);
        // Si la cantidad es > 0, actualizamos el precio unitario
        if (item.cantidad > 0) {
            onUpdateItem(item.id, { precio_venta: value / item.cantidad });
        }
    };

    const handleTogglePrice = () => {
        if (!item.precio_alternativo) return;
        const nuevoPrecio = item.precio_venta === item.precio_base
            ? item.precio_alternativo
            : item.precio_base;
        onUpdateItem(item.id, { precio_venta: nuevoPrecio });
    };

    return (
        <div className="flex items-center gap-3 py-2 px-3 border-b border-gray-50 hover:bg-gray-50 transition-all">
            {/* 1. Detalle: Nombre y Código */}
            <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-[12px] text-gray-700 truncate leading-tight">
                    {item.nombre}
                </span>
                <span className="text-[8px] text-gray-400 font-mono tracking-tighter">
                    {item.codigo}
                </span>
            </div>

            {/* 2. Cantidad Compacta */}
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-md p-0.5 flex-shrink-0">
                <button
                    onClick={() => onUpdateItem(item.id, { cantidad: item.cantidad - 1 })}
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                >
                    <FaMinus size={6} />
                </button>
                <span className="text-[10px] w-5 text-center text-gray-600">{item.cantidad}</span>
                <button
                    onClick={() => onUpdateItem(item.id, { cantidad: item.cantidad + 1 })}
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-800 transition"
                >
                    <FaPlus size={6} />
                </button>
            </div>

            {/* 3. Subtotal Editable de Fila */}
            <div className="relative flex items-center flex-shrink-0 group">
                <input
                    type="number"
                    value={localSubtotal}
                    onChange={(e) => handleSubtotalChange(e.target.value)}
                    className="w-16 px-1 py-1 bg-transparent border-b border-transparent focus:border-blue-300 focus:bg-white rounded text-[12px] text-gray-700 outline-none transition-all text-right"
                    title="Editar total"
                />
                {item.precio_alternativo && (
                    <button
                        onClick={handleTogglePrice}
                        className="absolute -left-5 opacity-0 group-hover:opacity-100 p-1 text-blue-400 hover:bg-blue-50 rounded transition-all"
                    >
                        <FaExchangeAlt size={8} />
                    </button>
                )}
            </div>

            {/* 4. Eliminar */}
            <button
                onClick={() => onRemove(item.id)}
                className="w-6 h-6 flex items-center justify-center text-red-200 hover:text-red-400 transition-all flex-shrink-0"
            >
                <FaTrash size={11} />
            </button>
        </div>
    );
};

export default ItemVenta;
