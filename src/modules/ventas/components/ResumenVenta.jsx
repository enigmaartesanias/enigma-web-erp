import React, { useState } from 'react';
import { FaMoneyBillWave, FaShoppingCart, FaUser, FaRegCreditCard, FaCalendarAlt, FaPlus, FaEye, FaTimes, FaWallet } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi'; // Cleaner icon for empty state
import BuscadorProducto from './BuscadorProducto';
import ItemVenta from './ItemVenta';

const ResumenVenta = ({
    totals, config, setConfig, onProcess, processing, onClienteClick,
    onScan, onSelect, onQRClick, cart, onUpdateItem, onRemove,
    formaPago, setFormaPago, onCreditoClick, onCancel, showCartList = true,
    fechaVenta, setFechaVenta, onPreview
}) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    const paymentOptions = [
        { id: 'Efectivo', icon: FaMoneyBillWave, label: 'EFECTIVO' },
        { id: 'BilleteraMovil', icon: FaWallet, label: 'BILLETERA' },
        { id: 'CREDITO', icon: FaRegCreditCard, label: 'CRÉDITO' }
    ];

    const handlePaymentSelect = (id) => {
        setFormaPago(id);
    };

    const handleMainAction = () => {
        if (formaPago === 'CREDITO') {
            onCreditoClick();
        } else {
            onProcess();
        }
    };

    const isCartEmpty = cart.length === 0;

    return (
        <div className="bg-gray-50 h-full flex flex-col overflow-hidden text-gray-800 font-sans">

            {/* Header POS Elegante */}
            <div className="bg-gray-900 border-b border-gray-800 px-5 py-4 flex-shrink-0 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xs font-semibold text-white flex items-center gap-2 uppercase tracking-widest">
                        <FaShoppingCart size={14} className="text-gray-400" />
                        Punto de Venta
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onPreview}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Vista Previa"
                        >
                            <FaEye size={14} />
                        </button>
                        <button
                            onClick={onClienteClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-[11px] font-semibold tracking-wider uppercase border ${config.cliente ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                        >
                            <FaUser size={10} />
                            <span>{config.cliente ? (config.cliente.nombre || config.cliente).toString().split(' ')[0] : 'AÑADIR CLIENTE'}</span>
                            {!config.cliente && <FaPlus size={8} />}
                        </button>
                    </div>
                </div>

                {/* Selector de Fecha Estilizado */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 flex items-center gap-3">
                    <FaCalendarAlt size={12} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="date"
                        value={fechaVenta}
                        onChange={(e) => setFechaVenta(e.target.value)}
                        className="bg-transparent border-none outline-none w-full cursor-pointer text-gray-200 text-xs font-medium uppercase tracking-widest [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Buscador Móvil */}
            <div className="md:hidden px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                <BuscadorProducto onScan={onScan} onSelect={onSelect} onQRClick={onQRClick} />
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto bg-gray-100">
                <div className="md:hidden h-full">
                    {showCartList && (
                        <div className="bg-gray-100 h-full">
                            {isCartEmpty ? (
                                <div className="flex flex-col items-center justify-center py-16 h-full text-gray-400">
                                    <FiShoppingCart strokeWidth={1} size={42} className="mb-4 opacity-50 text-gray-300" />
                                    <p className="text-xs uppercase font-medium tracking-[0.2em] italic text-gray-400">Carrito vacío</p>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-[35vh] divide-y divide-gray-100">
                                    {cart.map(item => (
                                        <ItemVenta
                                            key={item.id}
                                            item={item}
                                            onUpdateItem={onUpdateItem}
                                            onRemove={onRemove}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Inferior - Resumen Premium */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 md:p-5 pb-6 md:pb-4 flex-shrink-0 rounded-t-3xl md:rounded-none shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                
                <div className="space-y-2 mb-3">
                    {/* Fila Subtotal/IGV */}
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.impuesto} 
                                    onChange={() => setConfig({ ...config, impuesto: !config.impuesto })}
                                    className="peer w-4 h-4 text-gray-900 rounded-sm border-gray-300 focus:ring-gray-900 transition-all cursor-pointer"
                                />
                            </div>
                            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest group-hover:text-gray-700 transition-colors">Aplica IGV</span>
                        </label>
                        
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Neto</span>
                            <span className="text-sm font-medium text-gray-800">S/ {(totals.subtotal + totals.impuesto).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Fila Descuento */}
                    <div className="flex justify-between items-center">
                        {showDiscountInput ? (
                            <div className="flex gap-2 items-center animate-in fade-in slide-in-from-left-4 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                                <span className="text-gray-500 font-medium text-xs">S/</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={config.descuento}
                                    onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                                    onBlur={() => setShowDiscountInput(false)}
                                    className="w-20 bg-transparent outline-none text-gray-900 font-semibold text-sm text-right"
                                    placeholder="0.00"
                                />
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowDiscountInput(true)} 
                                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <span className="text-lg leading-none mb-0.5">+</span> Descuento
                            </button>
                        )}
                        {totals.descuento > 0 && <span className="text-gray-600 font-medium text-sm">- S/ {totals.descuento.toFixed(2)}</span>}
                    </div>
                </div>

                {/* TOTAL GRANDE ELEGANTE */}
                <div className="flex justify-between items-end py-2.5 border-t border-gray-100 mb-3">
                    <span className="text-xs font-semibold uppercase text-gray-500 tracking-[0.15em] mb-1">Total a Pagar</span>
                    <span className="text-3xl font-light tracking-tight text-gray-900">
                        <span className="text-lg font-medium text-gray-400 mr-1">S/</span>
                        {totals.total.toFixed(2)}
                    </span>
                </div>

                {/* Formas de Pago */}
                <div className="mb-4">
                    <span className="block text-[9px] font-semibold uppercase text-gray-400 tracking-widest mb-2">Método de Pago</span>
                    <div className="grid grid-cols-3 gap-2">
                        {paymentOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = formaPago === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handlePaymentSelect(opt.id)}
                                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all duration-300 border ${isSelected ? 'bg-gray-900 border-gray-900 shadow-lg shadow-gray-900/20 transform scale-[1.02]' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-500'}`}
                                >
                                    <Icon className={isSelected ? 'text-blue-400' : 'text-gray-400'} size={18} />
                                    <span className={`text-[8.5px] font-bold mt-1.5 tracking-widest ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2.5 items-center">
                    <button
                        onClick={handleMainAction}
                        disabled={isCartEmpty || processing}
                        className={`flex-1 py-3 px-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center ${isCartEmpty || processing ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-transparent' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-[0.98]'}`}
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span>{formaPago === 'CREDITO' ? 'Confirmar Crédito' : 'Registrar Venta'}</span>
                        )}
                    </button>
                    
                    <button
                        onClick={onCancel}
                        disabled={isCartEmpty && !config.cliente && totals.descuento === 0}
                        className="w-[48px] h-[48px] flex flex-col items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all flex-shrink-0 border border-transparent disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title="Limpiar"
                    >
                        <FaTimes size={14} className="mb-0.5" />
                        <span className="text-[7px] font-semibold uppercase tracking-widest">Limpiar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumenVenta;
