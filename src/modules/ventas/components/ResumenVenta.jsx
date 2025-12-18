import React, { useState } from 'react';
import { FaMoneyBillWave, FaCalculator, FaPercentage, FaShoppingCart, FaFileInvoice } from 'react-icons/fa';
import BuscadorProducto from './BuscadorProducto';
import ItemVenta from './ItemVenta';

const ResumenVenta = ({ totals, config, setConfig, onProcess, processing, onClienteClick, onScan, onSelect, onQRClick, cart, onUpdateQuantity, onRemove, formaPago, setFormaPago, onEmitirNota }) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    return (
        <div className="bg-white h-full flex flex-col">
            {/* Header */}
            <div className="bg-gray-700 text-white px-4 py-2 flex-shrink-0">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FaCalculator className="text-gray-300" size={14} />
                    Resumen
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Buscador - Solo visible en móvil */}
                <div className="md:hidden">
                    <BuscadorProducto
                        onScan={onScan}
                        onSelect={onSelect}
                        onQRClick={onQRClick}
                    />
                </div>

                {/* Carrito - Solo visible en móvil, debajo del buscador */}
                <div className="md:hidden space-y-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <FaShoppingCart size={48} className="mb-3 text-gray-300" />
                            <p className="text-sm font-medium">Carrito Vacío</p>
                            <p className="text-xs">Escanea un código o busca un producto</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <ItemVenta
                                key={item.id}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemove={onRemove}
                            />
                        ))
                    )}
                </div>

                {/* Contenedor principal con más margen lateral */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2.5 max-w-md mx-auto">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="text-sm">Subtotal ({totals.items})</span>
                        <span className="font-semibold text-sm">S/ {totals.subtotal.toFixed(2)}</span>
                    </div>

                    {/* IGV Toggle */}
                    <div className="flex justify-between items-center text-gray-700">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.impuesto}
                                onChange={(e) => setConfig({ ...config, impuesto: e.target.checked })}
                                className="rounded text-gray-600 focus:ring-gray-400 w-3 h-3"
                            />
                            <span className="text-sm">IGV (18%)</span>
                        </label>
                        <span className="font-semibold text-sm">S/ {totals.impuesto.toFixed(2)}</span>
                    </div>

                    {/* Descuento */}
                    <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between items-center text-gray-700 mb-1">
                            <button
                                onClick={() => setShowDiscountInput(!showDiscountInput)}
                                className="text-gray-700 text-sm flex items-center gap-1 hover:text-gray-900"
                            >
                                <FaPercentage size={10} />
                                {showDiscountInput ? 'Ocultar' : 'Descuento'}
                            </button>
                            <span className="font-semibold text-red-600 text-sm">- S/ {totals.descuento.toFixed(2)}</span>
                        </div>

                        {showDiscountInput && (
                            <div className="mt-1">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={config.descuento}
                                    onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                                    placeholder="Monto"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-300 pt-2.5 pb-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-800">Total</span>
                            <span className="text-lg font-bold text-gray-900">
                                S/ {totals.total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Forma de Pago - NUEVO */}
                    <div className="border-t border-gray-200 pt-2.5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Forma de Pago
                        </label>
                        <select
                            value={formaPago}
                            onChange={(e) => setFormaPago(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white"
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Yape">Yape</option>
                            <option value="Plin">Plin</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>

                {/* Botones COBRAR y EMITIR NOTA - Lado a lado */}
                <div className="flex gap-2 max-w-md mx-auto">
                    <button
                        onClick={onProcess}
                        disabled={totals.total === 0 || processing}
                        className="flex-1 bg-gray-600 text-white py-2.5 rounded-lg font-semibold text-sm shadow hover:bg-gray-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span className="text-xs">Procesando...</span>
                            </>
                        ) : (
                            <>
                                <FaMoneyBillWave size={14} />
                                <span>COBRAR</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onEmitirNota}
                        disabled={cart.length === 0}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm shadow hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        <FaFileInvoice size={14} />
                        <span>NOTA</span>
                    </button>
                </div>

                {/* Cliente - Debajo de los botones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 text-sm font-semibold">Cliente</span>
                        <button
                            onClick={onClienteClick}
                            className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-bold text-lg"
                            title="Seleccionar cliente"
                        >
                            +
                        </button>
                    </div>

                    {config.cliente ? (
                        <div className="text-sm">
                            <div className="font-medium text-gray-900">{config.cliente.nombre}</div>
                            <div className="text-gray-600 text-xs mt-0.5">📞 {config.cliente.telefono}</div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm italic">Sin cliente</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumenVenta;
