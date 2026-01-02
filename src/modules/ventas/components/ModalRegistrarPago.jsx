import React, { useState } from 'react';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';

/**
 * Modal para registrar un pago/abono a una cuenta por cobrar
 * Props: isOpen, onClose, cuenta, onConfirmar
 */
const ModalRegistrarPago = ({ isOpen, onClose, cuenta, onConfirmar }) => {
    const [montoPago, setMontoPago] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [observaciones, setObservaciones] = useState('');

    if (!isOpen || !cuenta) return null;

    const montoFloat = parseFloat(montoPago) || 0;
    const nuevoSaldo = Math.max(0, cuenta.saldo_deudor - montoFloat);

    const handleConfirmar = () => {
        if (montoFloat <= 0) {
            alert('El monto debe ser mayor a cero');
            return;
        }

        if (montoFloat > cuenta.saldo_deudor) {
            alert('El monto no puede ser mayor al saldo deudor');
            return;
        }

        onConfirmar({
            cuenta_id: cuenta.id,
            monto: montoFloat,
            metodo_pago: metodoPago,
            observaciones: observaciones.trim()
        });

        // Reset
        setMontoPago('');
        setObservaciones('');
        setMetodoPago('Efectivo');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-600" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">Registrar Pago</h3>
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
                    {/* Info de la cuenta */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Código</span>
                            <span className="text-xs font-semibold text-gray-800">{cuenta.codigo_cuenta}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Cliente</span>
                            <span className="text-xs font-semibold text-gray-800">{cuenta.cliente_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-xs text-gray-700">S/ {cuenta.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-gray-500">A cuenta</span>
                            <span className="text-xs text-green-700">S/ {cuenta.a_cuenta.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Saldo actual */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-yellow-800">Saldo actual</span>
                            <span className="text-xl font-bold text-yellow-900">
                                S/ {cuenta.saldo_deudor.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Monto a pagar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto a pagar
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                            <input
                                type="number"
                                min="0"
                                max={cuenta.saldo_deudor}
                                step="0.01"
                                value={montoPago}
                                onChange={(e) => setMontoPago(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Nuevo saldo (calculado) */}
                    {montoFloat > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-green-800">Nuevo saldo</span>
                                <span className="text-xl font-bold text-green-900">
                                    S/ {nuevoSaldo.toFixed(2)}
                                </span>
                            </div>
                            {nuevoSaldo === 0 && (
                                <p className="text-xs text-green-700 mt-1">✓ La cuenta quedará cancelada</p>
                            )}
                        </div>
                    )}

                    {/* Método de pago */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Método de pago
                        </label>
                        <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Yape">Yape</option>
                            <option value="Plin">Plin</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Ej: Pago parcial 2 de 3"
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
                        disabled={montoFloat <= 0}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Registrar Pago
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalRegistrarPago;
