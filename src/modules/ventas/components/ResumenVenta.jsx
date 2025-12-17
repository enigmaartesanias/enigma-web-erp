import React, { useState } from 'react';
import { FaMoneyBillWave, FaCalculator, FaPercentage } from 'react-icons/fa';

const ResumenVenta = ({ totals, config, setConfig, onProcess, processing }) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky bottom-4 md:static">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <FaCalculator className="text-indigo-400" />
                    Resumen de Venta
                </h2>
            </div>

            <div className="p-5 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totals.items} ítems)</span>
                    <span className="font-semibold">S/ {totals.subtotal.toFixed(2)}</span>
                </div>

                {/* IGV Toggle */}
                <div className="flex justify-between items-center text-gray-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.impuesto}
                            onChange={(e) => setConfig({ ...config, impuesto: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Aplicar IGV (18%)</span>
                    </label>
                    <span className="font-semibold">S/ {totals.impuesto.toFixed(2)}</span>
                </div>

                {/* Descuento */}
                <div className="border-t border-dashed border-gray-200 pt-3">
                    <div className="flex justify-between items-center text-gray-600 mb-2">
                        <button
                            onClick={() => setShowDiscountInput(!showDiscountInput)}
                            className="text-indigo-600 text-sm flex items-center gap-1 hover:underline"
                        >
                            <FaPercentage />
                            {showDiscountInput ? 'Ocultar Descuento' : 'Agregar Descuento'}
                        </button>
                        <span className="font-semibold text-red-500">- S/ {totals.descuento.toFixed(2)}</span>
                    </div>

                    {showDiscountInput && (
                        <div className="flex gap-2 mb-2 animate-fadeIn">
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={config.descuento}
                                onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                                placeholder="Monto descuento"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-100 pt-4 mt-2">
                    <div className="flex justify-between items-end">
                        <span className="text-lg font-bold text-gray-800">Total a Pagar</span>
                        <span className="text-3xl font-extrabold text-indigo-600">
                            S/ {totals.total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Datos Cliente */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2 mt-4">
                    <input
                        type="text"
                        placeholder="Nombre Cliente (Opcional)"
                        value={config.cliente}
                        onChange={(e) => setConfig({ ...config, cliente: e.target.value })}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1"
                    />
                    <div className="flex gap-2">
                        <select
                            className="bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1 w-1/3 text-gray-600"
                            value="DNI"
                            disabled
                        >
                            <option>DNI</option>
                            <option>RUC</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Documento"
                            value={config.documento}
                            onChange={(e) => setConfig({ ...config, documento: e.target.value })}
                            className="w-2/3 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1"
                        />
                    </div>
                </div>

                {/* Botón Procesar */}
                <button
                    onClick={onProcess}
                    disabled={totals.total === 0 || processing}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <FaMoneyBillWave />
                            COBRAR S/ {totals.total.toFixed(2)}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ResumenVenta;
