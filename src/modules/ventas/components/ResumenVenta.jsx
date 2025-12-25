import React, { useState } from 'react';
import { FaMoneyBillWave, FaCalculator, FaPercentage, FaShoppingCart } from 'react-icons/fa';
import BuscadorProducto from './BuscadorProducto';
import ItemVenta from './ItemVenta';

const ResumenVenta = ({ totals, config, setConfig, onProcess, processing, onClienteClick, onScan, onSelect, onQRClick, cart, onUpdateQuantity, onRemove, formaPago, setFormaPago }) => {
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

            {/* Buscador - Solo visible en móvil - FIJO */}
            <div className="md:hidden px-4 pt-3 pb-2 bg-white border-b border-gray-200 flex-shrink-0">
                <BuscadorProducto
                    onScan={onScan}
                    onSelect={onSelect}
                    onQRClick={onQRClick}
                />
            </div>

            {/* Encabezados - Solo visible en móvil cuando hay productos */}
            {cart.length > 0 && (
                <div className="md:hidden flex items-center gap-1 px-3 py-2 mt-2 bg-gray-100 border-b border-gray-200 flex-shrink-0">
                    <div className="text-xs text-gray-600 font-semibold w-16 flex-shrink-0">Código</div>
                    <div className="flex-1 text-xs text-gray-600 font-semibold text-left">Detalle</div>
                    <div className="text-xs text-gray-600 font-semibold w-16 text-center flex-shrink-0">Cant.</div>
                    <div className="text-xs text-gray-600 font-semibold w-16 text-right flex-shrink-0">Total</div>
                    <div className="w-7 flex-shrink-0"></div>
                </div>
            )}

            {/* Carrito - Solo visible en móvil - SCROLLABLE con altura fija */}
            <div
                className="md:hidden flex-1 overflow-y-auto overflow-x-hidden"
                style={{
                    maxHeight: 'calc(100vh - 450px)',
                    minHeight: '150px',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y'
                }}
            >
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <FaShoppingCart size={40} className="mb-2 text-gray-300" />
                        <p className="text-sm font-medium">Carrito Vacío</p>
                        <p className="text-xs">Escanea o busca productos</p>
                    </div>
                ) : (
                    <div className="bg-white">
                        {cart.map(item => (
                            <ItemVenta
                                key={item.id}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer: Totales + Acciones - FIJO (Sticky) */}
            <div className="flex-shrink-0 px-3 py-2 bg-white border-t-2 border-gray-300">
                {/* Contenedor de totales más compacto */}
                <div className="bg-gray-50 rounded p-2 space-y-1.5 max-w-md mx-auto">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="text-xs">Subtotal ({totals.items})</span>
                        <span className="font-semibold text-xs">S/ {totals.subtotal.toFixed(2)}</span>
                    </div>

                    {/* IGV Toggle */}
                    <div className="flex justify-between items-center text-gray-700">
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.impuesto}
                                onChange={(e) => setConfig({ ...config, impuesto: e.target.checked })}
                                className="rounded text-gray-600 focus:ring-gray-400 w-3 h-3"
                            />
                            <span className="text-xs">IGV (18%)</span>
                        </label>
                        <span className="font-semibold text-xs">S/ {totals.impuesto.toFixed(2)}</span>
                    </div>

                    {/* Descuento */}
                    <div className="border-t border-gray-200 pt-1.5">
                        <div className="flex justify-between items-center text-gray-700 mb-1">
                            <button
                                onClick={() => setShowDiscountInput(!showDiscountInput)}
                                className="text-gray-700 text-xs flex items-center gap-1 hover:text-gray-900"
                            >
                                <FaPercentage size={9} />
                                {showDiscountInput ? 'Ocultar' : 'Descuento'}
                            </button>
                            <span className="font-semibold text-red-600 text-xs">- S/ {totals.descuento.toFixed(2)}</span>
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
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-gray-400 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-300 pt-1.5 pb-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-800">Total</span>
                            <span className="text-base font-bold text-gray-900">
                                S/ {totals.total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Forma de Pago - NUEVO */}
                    <div className="border-t border-gray-200 pt-1.5">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Forma de Pago
                        </label>
                        <select
                            value={formaPago}
                            onChange={(e) => setFormaPago(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white"
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Yape">Yape</option>
                            <option value="Plin">Plin</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>

                {/* Botón COBRAR */}
                <div className="max-w-md mx-auto mt-2">
                    <button
                        onClick={onProcess}
                        disabled={totals.total === 0 || processing}
                        className="w-full bg-gray-600 text-white py-2 rounded font-semibold text-xs shadow hover:bg-gray-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span className="text-xs">Procesando...</span>
                            </>
                        ) : (
                            <>
                                <FaMoneyBillWave size={12} />
                                <span>COBRAR</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Cliente - Debajo de los botones */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2 max-w-md mx-auto mt-2">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-gray-700 text-xs font-semibold">Cliente</span>
                        <div className="flex gap-1.5">
                            {config.cliente && (
                                <button
                                    onClick={() => setConfig({ ...config, cliente: null })}
                                    className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition font-bold text-sm"
                                    title="Remover cliente"
                                >
                                    −
                                </button>
                            )}
                            <button
                                onClick={onClienteClick}
                                className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-bold text-sm"
                                title="Seleccionar cliente"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {config.cliente ? (
                        <div className="text-xs">
                            <div className="font-medium text-gray-900">{config.cliente.nombre}</div>
                            <div className="text-gray-600 text-[10px] mt-0.5">{config.cliente.telefono}</div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-xs italic">Sin cliente</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumenVenta;
