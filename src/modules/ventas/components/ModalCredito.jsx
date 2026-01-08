import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';

/**
 * Modal para registrar venta a crédito
 * Props: isOpen, onClose, total, cliente, detallesProductos, onConfirmar
 */
const ModalCredito = ({ isOpen, onClose, total, cliente, detallesProductos, onConfirmar }) => {
    const [aCuenta, setACuenta] = useState(0);
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [saldoDeudor, setSaldoDeudor] = useState(total);

    // Calcular saldo deudor automáticamente
    useEffect(() => {
        const adelanto = parseFloat(aCuenta) || 0;
        setSaldoDeudor(Math.max(0, total - adelanto));
    }, [aCuenta, total]);

    // Setear fecha por defecto (7 días adelante)
    useEffect(() => {
        if (isOpen && !fechaVencimiento) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + 7);
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            setFechaVencimiento(`${year}-${month}-${day}`);
        }
    }, [isOpen]);

    const handleConfirmar = () => {
        if (!fechaVencimiento) {
            alert('Por favor selecciona una fecha de vencimiento');
            return;
        }

        const adelanto = parseFloat(aCuenta) || 0;

        if (adelanto > total) {
            alert('El adelanto no puede ser mayor al total');
            return;
        }

        onConfirmar({
            a_cuenta: adelanto,
            saldo_deudor: saldoDeudor,
            fecha_vencimiento: fechaVencimiento,
            observaciones: observaciones.trim()
        });

        // Reset
        setACuenta(0);
        setObservaciones('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <FaCreditCard className="text-blue-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Venta a Crédito</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Info del cliente */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {cliente?.nombre || 'Cliente General'}
                        </p>
                        {cliente?.documento && (
                            <p className="text-xs text-gray-600">{cliente.documento}</p>
                        )}
                    </div>

                    {/* Total de la venta */}
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total de la venta</span>
                        <span className="text-lg font-bold text-gray-800">S/ {total.toFixed(2)}</span>
                    </div>

                    {/* Adelanto (A cuenta) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adelanto (A cuenta)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                            <input
                                type="number"
                                min="0"
                                max={total}
                                step="0.01"
                                value={aCuenta}
                                onChange={(e) => setACuenta(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Monto que el cliente paga ahora</p>
                    </div>

                    {/* Saldo deudor (calculado) */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-yellow-800">Saldo deudor</span>
                            <span className="text-xl font-bold text-yellow-900">
                                S/ {saldoDeudor.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">Monto que el cliente debe pagar</p>
                    </div>

                    {/* Fecha de vencimiento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaCalendarAlt className="inline mr-1" size={12} />
                            Fecha de vencimiento
                        </label>
                        <input
                            type="date"
                            value={fechaVencimiento}
                            onChange={(e) => setFechaVencimiento(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observaciones (opcional)
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Producto para evento del 15/01"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmar}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                        Confirmar Crédito
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalCredito;
