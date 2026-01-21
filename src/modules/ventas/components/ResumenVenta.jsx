import React, { useState } from 'react';
import { FaMoneyBillWave, FaShoppingCart, FaUser, FaMobileAlt, FaRegCreditCard, FaPercentage } from 'react-icons/fa';
import BuscadorProducto from './BuscadorProducto';
import ItemVenta from './ItemVenta';

const ResumenVenta = ({ totals, config, setConfig, onProcess, processing, onClienteClick, onScan, onSelect, onQRClick, cart, onUpdateItem, onRemove, formaPago, setFormaPago, onCreditoClick, onCancel, showCartList = true }) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);

    // Mapeo simple de opciones de pago para visualización ágil
    const paymentOptions = [
        { id: 'Efectivo', icon: FaMoneyBillWave, label: 'EFEC', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        { id: 'Yape', icon: FaMobileAlt, label: 'DIGIT', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }, // Representa Yape/Plin/Transf
        { id: 'CREDITO', icon: FaRegCreditCard, label: 'CRED', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    ];

    const handlePaymentSelect = (id) => {
        if (id === 'CREDITO') {
            // Solo marcamos visualmente, la lógica de botón cambiará
            setFormaPago('CREDITO');
        } else {
            setFormaPago(id);
        }
    };

    const handleMainAction = () => {
        if (formaPago === 'CREDITO') {
            onCreditoClick();
        } else {
            onProcess();
        }
    };

    return (
        <div className="bg-white h-full flex flex-col overflow-hidden font-sans">
            {/* Cabecera Fija */}
            <div className="bg-gray-900 text-white px-4 py-2.5 flex-shrink-0 flex justify-between items-center shadow-md z-10">
                <h2 className="text-[9px] md:text-[10px] font-semibold flex items-center gap-2 tracking-widest uppercase text-gray-100">
                    <FaShoppingCart className="text-gray-400" size={11} />
                    Venta Nueva
                </h2>

                {/* Cliente en Header (Visible siempre para acceso rápido) */}
                <button
                    onClick={onClienteClick}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border ${config.cliente
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                >
                    <FaUser size={10} />
                    <span className="text-[8px] md:text-[9px] font-medium max-w-[80px] truncate">
                        {config.cliente?.nombre ? config.cliente.nombre.split(' ')[0] : 'Cliente'}
                    </span>
                    {!config.cliente && <span className="text-[9px] font-bold leading-none">+</span>}
                </button>
            </div>

            {/* Buscador Móvil Fijo */}
            <div className="md:hidden px-3 py-2 bg-white border-b border-gray-100 flex-shrink-0 z-10">
                <BuscadorProducto onScan={onScan} onSelect={onSelect} onQRClick={onQRClick} />
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide">
                {/* 1. Lista de Items */}
                {/* 1. Lista de Items - Visible solo en Móvil */}
                <div className="md:hidden">
                    {showCartList && (
                        <div className="bg-white divide-y divide-gray-50 border-b border-gray-100 shadow-sm mb-2">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                    <FaShoppingCart size={28} className="mb-2 opacity-20" />
                                    <p className="text-[8px] uppercase tracking-widest font-medium">Carrito Vacío</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <ItemVenta
                                        key={item.id}
                                        item={item}
                                        onUpdateItem={onUpdateItem}
                                        onRemove={onRemove}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel de Control de Venta (Fijo al fondo) */}
            <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] p-2 md:p-3 space-y-2 z-20">
                {/* 2. Sección de Totales Compacta */}
                <div className="space-y-1">
                    {/* Subtotal & IGV Row */}
                    <div className="flex justify-between items-center text-gray-400">
                        <span className="text-[7px] uppercase tracking-wider">Subtotal</span>
                        <span className="text-[8px] font-medium">S/ {totals.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-1 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={config.impuesto}
                                onChange={(e) => setConfig({ ...config, impuesto: e.target.checked })}
                                className="w-2 h-2 rounded border-gray-300 text-gray-800 focus:ring-0"
                            />
                            <span className="text-[7px] text-gray-400 uppercase tracking-wider">IGV</span>
                        </label>
                        <span className="text-[8px] font-medium text-gray-500">S/ {totals.impuesto.toFixed(2)}</span>
                    </div>

                    {/* Descuento Toggle */}
                    <div>
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setShowDiscountInput(!showDiscountInput)}
                                className={`text-[6px] uppercase tracking-widest flex items-center gap-1 transition-colors font-semibold ${showDiscountInput ? 'text-gray-800' : 'text-red-400'}`}
                            >
                                {showDiscountInput ? '− Quitar' : '+ Descuento'}
                            </button>
                            {totals.descuento > 0 && (
                                <span className="text-[8px] text-red-500 font-medium">
                                    - S/ {totals.descuento.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {showDiscountInput && (
                            <div className="relative mt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 font-mono">S/</span>
                                <input
                                    type="number"
                                    value={config.descuento}
                                    onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-5 pr-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-bold text-gray-800 outline-none focus:border-gray-200 transition-all"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    {/* Total Display */}
                    <div className="flex justify-between items-baseline pt-0.5 border-t border-gray-50 mt-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-gray-900 font-bold">TOTAL</span>
                        <span className="text-base font-bold text-gray-900 tracking-tight">
                            S/ {totals.total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* 3. Forma de Pago - Icon Selector */}
                <div className="space-y-1">
                    <label className="block text-[6px] uppercase tracking-widest text-gray-400 text-center">
                        Forma de Pago
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {paymentOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = formaPago === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handlePaymentSelect(opt.id)}
                                    className={`flex flex-col items-center justify-center py-1 rounded-md border transition-all duration-200 ${isSelected
                                        ? `${opt.bg} ${opt.border} ring-1 ring-offset-0 ring-gray-100`
                                        : 'bg-white border-gray-50 hover:bg-gray-50 text-gray-300'
                                        }`}
                                >
                                    <Icon className={`mb-0.5 ${isSelected ? opt.color : 'text-gray-200'}`} size={8} />
                                    <span className={`text-[5px] tracking-wider ${isSelected ? 'text-gray-700 font-medium' : 'text-gray-400 font-light'}`}>
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botones de Acción Final */}
                <div className="space-y-1.5 pt-0.5">
                    <button
                        onClick={handleMainAction}
                        disabled={totals.total === 0 || processing}
                        className={`w-full py-2.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${totals.total === 0 || processing
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-900 hover:bg-black text-white'
                            }`}
                    >
                        {processing ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <span className="text-[9px] font-bold tracking-[0.15em] uppercase">
                                {formaPago === 'CREDITO' ? 'Confirmar Crédito' : 'Cobrar Venta'}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        disabled={cart.length === 0 || processing}
                        className="w-full py-2 rounded-lg text-[8px] font-bold text-white bg-red-600 hover:bg-red-700 uppercase tracking-widest transition-all transform active:scale-[0.98] disabled:opacity-0 shadow-sm shadow-red-100"
                    >
                        Cancelar Venta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumenVenta;
