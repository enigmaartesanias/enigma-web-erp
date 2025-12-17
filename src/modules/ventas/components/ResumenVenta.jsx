import React, { useState } from 'react';
import { FaMoneyBillWave, FaCalculator, FaPercentage } from 'react-icons/fa';

const ResumenVenta = ({ totals, config, setConfig, onProcess, processing, onClienteClick }) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    return (
        <div className="bg-white h-full flex flex-col">
            {/* Header */}
            <div className="bg-gray-700 text-white px-3 py-2 flex-shrink-0">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FaCalculator className="text-gray-300" size={14} />
                    Resumen
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totals.items})</span>
                    <span className="font-medium">S/ {totals.subtotal.toFixed(2)}</span>
                </div>

                {/* IGV Toggle */}
                <div className="flex justify-between items-center text-gray-600">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.impuesto}
                            onChange={(e) => setConfig({ ...config, impuesto: e.target.checked })}
                            className="rounded text-gray-600 focus:ring-gray-400 w-3 h-3"
                        />
                        <span className="text-xs">IGV (18%)</span>
                    </label>
                    <span className="font-medium">S/ {totals.impuesto.toFixed(2)}</span>
                </div>

                {/* Descuento */}
                <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center text-gray-600 mb-1">
                        <button
                            onClick={() => setShowDiscountInput(!showDiscountInput)}
                            className="text-gray-600 text-xs flex items-center gap-1 hover:text-gray-800"
                        >
                            <FaPercentage size={10} />
                            {showDiscountInput ? 'Ocultar' : 'Descuento'}
                        </button>
                        <span className="font-medium text-red-600 text-xs">- S/ {totals.descuento.toFixed(2)}</span>
                    </div>

                    {showDiscountInput && (
                        <div className="flex gap-2 mb-1">
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={config.descuento}
                                onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                                placeholder="Monto"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-gray-400 outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-300 pt-2 mt-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-700">Total</span>
                        <span className="text-base font-bold text-gray-800">
                            S/ {totals.total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Cliente (opcional) */}
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1.5 mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 text-xs font-medium">Cliente</span>
                        <button
                            onClick={onClienteClick}
                            className="text-gray-600 hover:text-gray-800 text-lg font-bold leading-none"
                            title="Seleccionar cliente"
                        >
                            +
                        </button>
                    </div>

                    {config.cliente ? (
                        <div className="text-xs">
                            <div className="font-medium text-gray-800">{config.cliente.nombre}</div>
                            <div className="text-gray-500">📞 {config.cliente.telefono}</div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-xs italic">Sin cliente</div>
                    )}
                </div>

            </div>

            {/* Botón Procesar - Fijo en la parte inferior */}
            <div className="p-3 border-t border-gray-200 flex-shrink-0">
                <button
                    onClick={onProcess}
                    disabled={totals.total === 0 || processing}
                    className="w-full bg-gray-600 text-white py-2.5 rounded-lg font-semibold text-sm shadow hover:bg-gray-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-xs">Procesando...</span>
                        </>
                    ) : (
                        <>
                            <FaMoneyBillWave size={14} />
                            <span>COBRAR S/ {totals.total.toFixed(2)}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ResumenVenta;
