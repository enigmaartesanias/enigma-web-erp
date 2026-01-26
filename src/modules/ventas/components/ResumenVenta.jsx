import React, { useState } from 'react';
import { FaMoneyBillWave, FaShoppingCart, FaUser, FaMobileAlt, FaRegCreditCard, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import BuscadorProducto from './BuscadorProducto';
import ItemVenta from './ItemVenta';
import ModalPagoDigital from './ModalPagoDigital';

const ResumenVenta = ({
    totals, config, setConfig, onProcess, processing, onClienteClick,
    onScan, onSelect, onQRClick, cart, onUpdateItem, onRemove,
    formaPago, setFormaPago, onCreditoClick, onCancel, showCartList = true,
    fechaVenta, setFechaVenta
}) => {
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [showModalPagoDigital, setShowModalPagoDigital] = useState(false);

    const paymentOptions = [
        { id: 'Efectivo', icon: FaMoneyBillWave, label: 'EFEC' },
        { id: 'Digital', icon: FaMobileAlt, label: 'DIGIT' },
        { id: 'CREDITO', icon: FaRegCreditCard, label: 'CRED' }
    ];

    const handlePaymentSelect = (id) => {
        if (id === 'Digital') {
            setShowModalPagoDigital(true);
        } else if (id === 'CREDITO') {
            setFormaPago('CREDITO');
        } else {
            setFormaPago(id);
        }
    };

    const handleDigitalPaymentSelect = (metodo) => {
        setFormaPago(metodo);
    };

    const handleMainAction = () => {
        if (formaPago === 'CREDITO') {
            onCreditoClick();
        } else {
            onProcess();
        }
    };

    // Determinar correctamente el pago seleccionado
    const isDigitalPayment = ['Yape', 'Plin', 'Transferencia'].includes(formaPago);
    const displayFormaPago = isDigitalPayment ? 'Digital' : formaPago;

    return (
        <div className="bg-white h-full flex flex-col overflow-hidden">
            <ModalPagoDigital
                isOpen={showModalPagoDigital}
                onClose={() => setShowModalPagoDigital(false)}
                onSelect={handleDigitalPaymentSelect}
            />

            {/* Header con Fondo Oscuro - Mejorado */}
            <div style={{ backgroundColor: '#1f2937' }} className="text-white px-4 py-3 flex-shrink-0 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xs font-bold flex items-center gap-2 uppercase">
                        <FaShoppingCart size={14} className="text-blue-400" />
                        Venta Nueva
                    </h2>
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
            <div className="md:hidden px-3 py-2 bg-white border-b border-gray-100">
                <BuscadorProducto onScan={onScan} onSelect={onSelect} onQRClick={onQRClick} />
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="md:hidden">
                    {showCartList && (
                        <div className="bg-white divide-y divide-gray-50 border-b border-gray-100">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                                    <FaShoppingCart size={24} className="mb-2 opacity-20" />
                                    <p className="text-xs uppercase">Carrito Vacío</p>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-96">
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

            {/* Panel Inferior - Resumen y Botones */}
            <div className="bg-white border-t border-gray-200 p-4 pb-20 space-y-3" style={{ position: 'relative', zIndex: 10 }}>

                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase text-xs font-medium">Subtotal</span>
                    <span className="text-gray-700 font-bold">S/ {totals.subtotal.toFixed(2)}</span>
                </div>

                {/* IGV con Toggle Visible */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-700 font-bold uppercase text-xs">IGV</span>
                        <button
                            onClick={() => setConfig({ ...config, impuesto: !config.impuesto })}
                            style={{
                                width: '44px',
                                height: '24px',
                                backgroundColor: config.impuesto ? '#3b82f6' : '#d1d5db',
                                position: 'relative',
                                borderRadius: '12px',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: config.impuesto ? '22px' : '2px',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                transition: 'left 0.3s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                        </button>
                    </div>
                    <span className="text-gray-700 font-bold">S/ {totals.impuesto.toFixed(2)}</span>
                </div>

                {/* Descuento */}
                <div className="text-sm">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setShowDiscountInput(!showDiscountInput)}
                            className="text-xs font-bold uppercase"
                            style={{ color: '#3b82f6' }}
                        >
                            {showDiscountInput ? '− Quitar Descuento' : '+ Descuento'}
                        </button>
                        {totals.descuento > 0 && (
                            <span className="font-bold" style={{ color: '#dc2626' }}>- S/ {totals.descuento.toFixed(2)}</span>
                        )}
                    </div>
                    {showDiscountInput && (
                        <input
                            type="number"
                            value={config.descuento}
                            onChange={(e) => setConfig({ ...config, descuento: e.target.value })}
                            placeholder="0.00"
                            className="w-full mt-2 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold"
                            autoFocus
                        />
                    )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline pt-2 border-t-2 border-gray-200">
                    <span className="text-sm font-black uppercase">TOTAL</span>
                    <span className="text-2xl font-black" style={{ color: '#111827' }}>S/ {totals.total.toFixed(2)}</span>
                </div>

                {/* Formas de Pago en Tarjeta con Color */}
                <div style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }} className="rounded-xl border-2 p-3 shadow-sm">
                    <label className="block text-xs uppercase font-black text-center mb-2" style={{ color: '#1e40af' }}>
                        Forma de Pago
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {paymentOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = displayFormaPago === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handlePaymentSelect(opt.id)}
                                    style={{
                                        backgroundColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                        borderWidth: '2px',
                                        borderColor: isSelected ? '#2563eb' : '#bfdbfe',
                                        opacity: isSelected ? 1 : 0.6
                                    }}
                                    className="flex flex-col items-center justify-center py-2.5 rounded-lg transition-all"
                                >
                                    <Icon style={{ color: isSelected ? '#2563eb' : '#9ca3af' }} size={16} />
                                    <span style={{
                                        color: isSelected ? '#1e40af' : '#9ca3af',
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        marginTop: '4px'
                                    }}>
                                        {opt.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botones de Acción - TOTALMENTE VISIBLES con !important */}
                <div className="flex gap-3 items-center pt-2">
                    <button
                        onClick={handleMainAction}
                        disabled={totals.total === 0 || processing}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.2s',
                            backgroundColor: (totals.total === 0 || processing) ? '#e5e7eb' : '#1e40af',
                            color: (totals.total === 0 || processing) ? '#9ca3af' : '#ffffff',
                            cursor: (totals.total === 0 || processing) ? 'not-allowed' : 'pointer',
                            boxShadow: (totals.total === 0 || processing) ? 'none' : '0 4px 6px rgba(30,64,175,0.3)'
                        }}
                    >
                        {processing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #ffffff',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Procesando...
                            </div>
                        ) : (
                            formaPago === 'CREDITO' ? '💳 CONFIRMAR CRÉDITO' : '✓ REGISTRAR VENTA'
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={cart.length === 0 || processing}
                        style={{
                            padding: '16px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            fontSize: '20px',
                            transition: 'all 0.2s',
                            backgroundColor: (cart.length === 0 || processing) ? '#f3f4f6' : '#dc2626',
                            color: (cart.length === 0 || processing) ? '#d1d5db' : '#ffffff',
                            cursor: (cart.length === 0 || processing) ? 'not-allowed' : 'pointer',
                            boxShadow: (cart.length === 0 || processing) ? 'none' : '0 4px 6px rgba(220,38,38,0.3)',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
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
