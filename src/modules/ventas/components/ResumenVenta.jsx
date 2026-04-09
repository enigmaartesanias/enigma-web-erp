import React, { useState } from 'react';
import { FaMoneyBillWave, FaShoppingCart, FaUser, FaMobileAlt, FaRegCreditCard, FaCalendarAlt, FaPlus, FaUniversity, FaEye, FaTimes, FaWallet } from 'react-icons/fa';
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
        { id: 'Efectivo', icon: FaMoneyBillWave, label: 'EFEC.', color: '#10b981' },
        { id: 'BilleteraMovil', icon: FaWallet, label: 'BILLETERA', color: '#7c3aed' },
        { id: 'Transferencia', icon: FaUniversity, label: 'TRANSF.', color: '#0d9488' },
        { id: 'CREDITO', icon: FaRegCreditCard, label: 'CRÉDITO', color: '#1f2937' }
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

    const displayFormaPago = formaPago;

    return (
        <div className="bg-white h-full flex flex-col overflow-hidden">

            {/* Header con Fondo Oscuro - Mejorado */}
            <div style={{ backgroundColor: '#1f2937' }} className="text-white px-4 py-3 flex-shrink-0 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xs font-bold flex items-center gap-2 uppercase">
                        <FaShoppingCart size={14} className="text-blue-400" />
                        Venta Nueva
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onPreview}
                            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            className="p-3 rounded-full hover:bg-white/20 transition-all border border-white/10"
                            title="Vista Previa"
                        >
                            <FaEye size={12} className="text-blue-300" />
                        </button>
                        <button
                            onClick={onClienteClick}
                            style={{
                                backgroundColor: config.cliente ? '#2563eb' : 'rgba(255,255,255,0.1)',
                                borderColor: config.cliente ? 'transparent' : 'rgba(255,255,255,0.2)'
                            }}
                            className="flex items-center gap-1 p-2 rounded-full transition-all border"
                        >
                            <FaUser size={12} />
                            {!config.cliente && <FaPlus size={9} />}
                        </button>
                    </div>
                </div>

                {/* Selector de Fecha MEJORADO - Más visible */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} className="rounded-lg px-3 py-2 flex items-center gap-3">
                    <FaCalendarAlt size={16} className="text-blue-400 flex-shrink-0" />
                    <input
                        type="date"
                        value={fechaVenta}
                        onChange={(e) => setFechaVenta(e.target.value)}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                        className="outline-none border-none w-full cursor-pointer"
                    />
                </div>
            </div>

            {/* Buscador Móvil */}
            <div className="md:hidden px-3 py-2 bg-white border-b border-gray-100 flex-shrink-0">
                <BuscadorProducto onScan={onScan} onSelect={onSelect} onQRClick={onQRClick} />
            </div>

            {/* Lista de Productos - Con Max Height para móviles */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="md:hidden">
                    {showCartList && (
                        <div className="bg-white divide-y divide-gray-50 border-b border-gray-100">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                                    <FaShoppingCart size={32} className="mb-2 opacity-20" />
                                    <p className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">Esperando productos...</p>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-[30vh]">
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

            {/* Panel Inferior - Resumen COMPACTO */}
            <div className="bg-white border-t border-gray-200 p-3 pb-8 md:pb-4 space-y-2 flex-shrink-0">
                
                {/* Fila Subtotal/IGV combinada */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">IGV</span>
                        <div
                            onClick={() => setConfig({ ...config, impuesto: !config.impuesto })}
                            className={`w-8 h-4 rounded-full transition-all cursor-pointer relative ${config.impuesto ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${config.impuesto ? 'left-4.5' : 'left-0.5'}`} style={{ left: config.impuesto ? '18px' : '2px' }}></div>
                        </div>
                    </div>
                    
                    <div className="flex-1 text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Neto</span>
                        <span className="text-xs font-black text-gray-700">S/ {(totals.subtotal + totals.impuesto).toFixed(2)}</span>
                    </div>
                </div>

                {/* Descuento Minimalista */}
                <div className="flex justify-between items-center text-[11px] font-bold">
                    {showDiscountInput ? (
                        <div className="flex gap-1 animate-in slide-in-from-right-2">
                            <span className="text-red-500 font-black">S/</span>
                            <input
                                type="number"
                                autoFocus
                                value={config.descuento}
                                onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                                onBlur={() => setShowDiscountInput(false)}
                                className="w-16 bg-red-50 border-b border-red-200 outline-none text-red-600 font-black text-right pr-1"
                            />
                        </div>
                    ) : (
                        <button onClick={() => setShowDiscountInput(true)} className="text-gray-900 hover:underline uppercase text-[9px] font-normal tracking-tighter">
                            + Aplicar Descuento
                        </button>
                    )}
                    {totals.descuento > 0 && <span className="text-red-600">- S/ {totals.descuento.toFixed(2)}</span>}
                </div>

                {/* TOTAL GRANDE */}
                <div className="flex justify-between items-end pt-1 border-t border-gray-50">
                    <span className="text-[10px] font-normal uppercase text-gray-400 tracking-[0.2em]">Total</span>
                    <span className="text-2xl font-black tracking-tighter text-gray-900 leading-none">S/ {totals.total.toFixed(2)}</span>
                </div>

                {/* Formas de Pago - UNIFICADO (GRID 5) */}
                <div style={{ backgroundColor: '#f0f4ff', borderColor: '#d1e0ff' }} className="rounded-xl border-2 p-2 shadow-sm">
                    <div className="grid grid-cols-4 gap-2">
                        {paymentOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = displayFormaPago === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handlePaymentSelect(opt.id)}
                                    style={{
                                        backgroundColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                        borderWidth: '2.5px',
                                        borderColor: isSelected ? opt.color : 'transparent',
                                    }}
                                    className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-lg transition-all ${isSelected ? 'shadow-lg scale-[1.08] z-10' : 'opacity-40 grayscale-[0.3]'}`}
                                >
                                    <Icon style={{ color: isSelected ? opt.color : '#94a3b8' }} size={18} />
                                    <span style={{
                                        color: isSelected ? opt.color : '#94a3b8',
                                        fontSize: '7.5px',
                                        fontWeight: '900',
                                        marginTop: '3px'
                                    }}>
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botones de Acción - DINÁMICO */}
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleMainAction}
                        disabled={totals.total === 0 || processing}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            transition: 'all 0.2s',
                            backgroundColor: (totals.total === 0 || processing) ? '#e2e8f0' : (formaPago === 'CREDITO' ? '#1f2937' : '#2563eb'),
                            color: '#ffffff',
                            cursor: (totals.total === 0 || processing) ? 'not-allowed' : 'pointer',
                            boxShadow: (totals.total === 0 || processing) ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <span>{formaPago === 'CREDITO' ? '✓ CONFIRMAR CRÉDITO' : '✓ REGISTRAR VENTA'}</span>
                        )}
                    </button>
                    
                    <button
                        onClick={onCancel}
                        className="w-14 h-14 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex-shrink-0"
                        title="Cancelar Venta"
                    >
                        <FaTimes size={10} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ResumenVenta;
