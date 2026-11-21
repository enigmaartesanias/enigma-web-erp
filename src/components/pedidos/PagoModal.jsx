// src/components/pedidos/PagoModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimesCircle, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { METODOS_PAGO, TOLERANCIA_SALDO, calcularSaldo, registrarPago } from '../../utils/pedidosUtils';
import { getLocalDate } from '../../utils/dateUtils';

const PagoModal = ({ isOpen, pedido, onClose, onSuccess }) => {
    const [monto, setMonto] = useState('');
    const [metodo, setMetodo] = useState('Efectivo');
    const [guardando, setGuardando] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (pedido) {
            const saldo = (pedido.monto_saldo !== undefined && pedido.monto_saldo !== null)
                ? Number(pedido.monto_saldo)
                : calcularSaldo(pedido.precio_total, pedido.monto_a_cuenta);
            setMonto(saldo > 0 ? saldo.toFixed(2) : '');
            setMetodo('Efectivo');
            setErrorMsg('');
        }
    }, [pedido]);

    if (!isOpen || !pedido) return null;

    const saldoActual = (pedido.monto_saldo !== undefined && pedido.monto_saldo !== null)
        ? Number(pedido.monto_saldo)
        : calcularSaldo(pedido.precio_total, pedido.monto_a_cuenta);

    const handleMontoChange = (e) => {
        const val = e.target.value;
        setMonto(val);
        const valNum = parseFloat(val);
        if (valNum <= 0) {
            setErrorMsg('El monto debe ser mayor a 0');
        } else if (valNum > (saldoActual + TOLERANCIA_SALDO)) {
            setErrorMsg(`El monto no puede superar el saldo (S/ ${saldoActual.toFixed(2)})`);
        } else {
            setErrorMsg('');
        }
    };

    const handleConfirmarPago = async (e) => {
        e.preventDefault();
        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            toast.error('Ingrese un monto válido mayor a 0');
            return;
        }

        if (montoNum > (saldoActual + TOLERANCIA_SALDO)) {
            toast.error(`El monto no puede superar el saldo pendiente (S/ ${saldoActual.toFixed(2)})`);
            return;
        }

        setGuardando(true);
        try {
            const fechaHoy = getLocalDate();
            const resultado = await registrarPago(pedido, {
                monto: montoNum,
                metodo,
                fecha_pago: fechaHoy
            });

            toast.success(resultado.cancelado ? '¡Pedido totalmente cancelado!' : 'Pago registrado con éxito');

            if (onSuccess) {
                onSuccess(resultado);
            }
            onClose();
        } catch (error) {
            console.error('Error al registrar pago:', error);
            toast.error(error.message || 'Error al procesar el pago');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Cabecera */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <FaMoneyBillWave size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Cobrar Saldo / Abono</h3>
                            <p className="text-[11px] text-gray-400">Pedido #{String(pedido.id_pedido).padStart(4, '0')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={guardando}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                        <FaTimesCircle size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleConfirmarPago} className="p-6 space-y-4">
                    {/* Info Cliente & Saldo */}
                    <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/60 flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cliente</span>
                            <span className="text-sm font-semibold text-gray-800">{pedido.nombre_cliente}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Saldo Actual</span>
                            <span className="text-base font-black text-red-600">S/ {saldoActual.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Campo Monto */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Monto a Cobrar (S/)</label>
                            <button
                                type="button"
                                onClick={() => {
                                    setMonto(saldoActual.toFixed(2));
                                    setErrorMsg('');
                                }}
                                className="text-[10px] font-semibold text-blue-600 hover:underline"
                            >
                                Saldo total
                            </button>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={(saldoActual + TOLERANCIA_SALDO).toFixed(2)}
                                value={monto}
                                onChange={handleMontoChange}
                                disabled={guardando}
                                required
                                className="w-full h-11 pl-8 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        {errorMsg && (
                            <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
                        )}
                    </div>

                    {/* Selector Método de Pago */}
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Método de Pago</label>
                        <div className="grid grid-cols-3 gap-2">
                            {METODOS_PAGO.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMetodo(m)}
                                    disabled={guardando}
                                    className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all ${
                                        metodo === m
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                    } disabled:opacity-50`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="pt-2 flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={guardando}
                            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando || !monto || parseFloat(monto) <= 0 || parseFloat(monto) > (saldoActual + TOLERANCIA_SALDO)}
                            className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {guardando ? (
                                <>
                                    <FaSpinner className="animate-spin" size={14} />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <span>Confirmar Pago</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PagoModal;
