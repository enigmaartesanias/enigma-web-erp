// src/components/pedidos/CerrarPedidoModal.jsx
import React, { useEffect, useState } from 'react';
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaBoxOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { METODOS_PAGO, TOLERANCIA_SALDO, calcularSaldo, cerrarPedido } from '../../utils/pedidosUtils';
import { ventasDB } from '../../utils/ventasClient';
import { getLocalDate, toDateInputValue } from '../../utils/dateUtils';

const CerrarPedidoModal = ({
    isOpen,
    pedidos = [],
    fechaInicial = '',
    metodoInicial = 'Efectivo',
    onClose,
    onSuccess
}) => {
    const [filas, setFilas] = useState([]);
    const [metodo, setMetodo] = useState('Efectivo');
    const [fechaComun, setFechaComun] = useState('');
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [resultados, setResultados] = useState(null);

    useEffect(() => {
        if (!isOpen || pedidos.length === 0) return;

        let cancelado = false;
        const construir = async () => {
            setCargando(true);
            setResultados(null);
            setMetodo(metodoInicial || 'Efectivo');
            setFechaComun(fechaInicial || getLocalDate());

            const rows = await Promise.all(pedidos.map(async (p) => {
                const total = Number(p.precio_total) || 0;
                const pagado = Number(p.monto_a_cuenta) || 0;
                const saldoCalculado = calcularSaldo(total, pagado);
                const saldoMostrado = Number(p.monto_saldo) || 0;
                const pagosSum = (p.pagos || []).reduce((acc, x) => acc + (Number(x.monto) || 0), 0);

                let ventaExiste = null;
                try {
                    ventaExiste = await ventasDB.existeVentaPedido(p.id_pedido);
                } catch {
                    ventaExiste = null;
                }

                let accion = 'cerrar';
                const discrepancia = Math.abs(saldoMostrado - saldoCalculado) > TOLERANCIA_SALDO;
                if (discrepancia) accion = 'revisar';
                else if (saldoMostrado > TOLERANCIA_SALDO) accion = 'cobrar';

                return {
                    pedido: p,
                    total,
                    pagado,
                    saldoCalculado,
                    saldoMostrado,
                    pagosSum,
                    ventaExiste,
                    accion,
                    forzado: false,
                    discrepancia,
                    fecha: toDateInputValue(p.fecha_pedido) || getLocalDate(),
                    avisoPagos: Math.abs(pagosSum - pagado) > TOLERANCIA_SALDO
                };
            }));

            if (!cancelado) {
                setFilas(rows);
                setCargando(false);
            }
        };

        construir();
        return () => { cancelado = true; };
    }, [isOpen, pedidos, fechaInicial, metodoInicial]);

    if (!isOpen) return null;

    const aCerrar = filas.filter(f => f.accion !== 'revisar');
    const enRevision = filas.filter(f => f.accion === 'revisar');
    const montoCobro = (f) => (f.forzado ? f.saldoCalculado : f.saldoMostrado);
    const totalCobrar = aCerrar
        .filter(f => f.accion === 'cobrar')
        .reduce((acc, f) => acc + montoCobro(f), 0);

    const handleFechaFila = (id, value) => {
        setFilas(prev => prev.map(f => (f.pedido.id_pedido === id ? { ...f, fecha: value } : f)));
    };

    const handleAplicarFechaTodos = () => {
        if (!fechaComun) return;
        setFilas(prev => prev.map(f => ({ ...f, fecha: fechaComun })));
    };

    const handleForzar = (id) => {
        setFilas(prev => prev.map(f => {
            if (f.pedido.id_pedido !== id) return f;
            const forzado = !f.forzado;
            return {
                ...f,
                forzado,
                accion: forzado
                    ? (f.saldoCalculado > TOLERANCIA_SALDO ? 'cobrar' : 'cerrar')
                    : 'revisar'
            };
        }));
    };

    const handleConfirmar = async () => {
        if (aCerrar.length === 0) {
            toast.error('No hay pedidos para cerrar. Revisa los marcados en rojo.');
            return;
        }

        setGuardando(true);
        const res = [];

        for (const fila of aCerrar) {
            try {
                const pedidoNormalizado = {
                    ...fila.pedido,
                    monto_a_cuenta: fila.pagado,
                    monto_saldo: fila.saldoMostrado
                };
                const resultado = await cerrarPedido(pedidoNormalizado, {
                    fecha: fila.fecha || getLocalDate(),
                    metodo
                });
                res.push({
                    id: fila.pedido.id_pedido,
                    cliente: fila.pedido.nombre_cliente,
                    ok: true,
                    pago: resultado.pago ? Number(resultado.pago.monto) : null,
                    venta: resultado.ventaRegistrada,
                    aviso: resultado.ventaError
                });
            } catch (error) {
                res.push({
                    id: fila.pedido.id_pedido,
                    cliente: fila.pedido.nombre_cliente,
                    ok: false,
                    mensaje: error.message
                });
            }
        }

        setResultados(res);
        setGuardando(false);
        if (onSuccess) onSuccess();
    };

    const okCount = resultados ? resultados.filter(r => r.ok).length : 0;
    const errorCount = resultados ? resultados.filter(r => !r.ok).length : 0;
    const avisos = resultados ? resultados.filter(r => r.ok && r.aviso) : [];

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm overflow-y-auto h-full w-full z-[150] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
                {/* Cabecera */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center gap-2 bg-gray-50/80">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                            <FaBoxOpen size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Cierre histórico</h3>
                            <p className="text-[11px] text-gray-400">
                                {filas.length} pedido{filas.length === 1 ? '' : 's'} · no modifica producción
                            </p>
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

                {/* Resultados */}
                {resultados ? (
                    <div className="p-3 sm:p-5 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Cerrados</p>
                                <p className="text-xl font-black text-emerald-700">{okCount}</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-bold text-red-500 uppercase">Con error</p>
                                <p className="text-xl font-black text-red-600">{errorCount}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-bold text-amber-600 uppercase">En revisar</p>
                                <p className="text-xl font-black text-amber-700">{enRevision.length}</p>
                            </div>
                        </div>

                        {avisos.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                                <p className="font-bold mb-1 flex items-center gap-1">
                                    <FaExclamationTriangle size={12} /> Pedidos cerrados con aviso de venta
                                </p>
                                {avisos.map(a => (
                                    <p key={a.id}>#{String(a.id).padStart(4, '0')} {a.cliente}: {a.aviso}</p>
                                ))}
                            </div>
                        )}

                        {errorCount > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 space-y-1">
                                {resultados.filter(r => !r.ok).map(r => (
                                    <p key={r.id}>#{String(r.id).padStart(4, '0')} {r.cliente}: {r.mensaje}</p>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="h-11 px-6 w-full sm:w-auto bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : cargando ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-3 text-gray-500">
                        <FaSpinner className="animate-spin" size={24} />
                        <p className="text-sm">Verificando pagos y ventas...</p>
                    </div>
                ) : (
                    <>
                        {/* Controles */}
                        <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Fecha para todos
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={fechaComun}
                                            onChange={(e) => setFechaComun(e.target.value)}
                                            className="flex-1 min-w-0 h-11 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs font-medium text-gray-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAplicarFechaTodos}
                                            className="h-11 px-4 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg hover:bg-gray-200 shrink-0"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                        Método de pago
                                    </label>
                                    <select
                                        value={metodo}
                                        onChange={(e) => setMetodo(e.target.value)}
                                        className="w-full h-11 bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs font-bold text-gray-800"
                                    >
                                        {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                                <p className="text-[11px] text-gray-500">
                                    {aCerrar.length} a cerrar · {enRevision.length} en revisar
                                </p>
                                <p className="text-sm font-black text-blue-700">
                                    A cobrar: S/ {totalCobrar.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Tabla (escritorio) */}
                        <div className="hidden md:block overflow-auto flex-1">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Pedido</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-600 uppercase">Total</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-600 uppercase">Pagado</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-600 uppercase">Saldo</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-600 uppercase">Pagos</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase">Venta</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase">Fecha cierre</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-600 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filas.map(fila => (
                                        <tr key={fila.pedido.id_pedido} className={fila.accion === 'revisar' ? 'bg-red-50/60' : 'hover:bg-gray-50'}>
                                            <td className="px-3 py-2 whitespace-nowrap font-mono font-bold text-gray-700">
                                                #{String(fila.pedido.id_pedido).padStart(4, '0')}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-800 font-medium">
                                                {fila.pedido.nombre_cliente}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-gray-700">
                                                S/ {fila.total.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-gray-700">
                                                S/ {fila.pagado.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right font-bold text-red-600">
                                                S/ {fila.saldoMostrado.toFixed(2)}
                                                {fila.discrepancia && (
                                                    <span className="block text-[10px] font-semibold text-amber-600">
                                                        real: S/ {fila.saldoCalculado.toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-gray-500">
                                                <span className={fila.avisoPagos ? 'text-amber-600 font-bold' : ''}>
                                                    S/ {fila.pagosSum.toFixed(2)}
                                                </span>
                                                {fila.avisoPagos && (
                                                    <span title="Los pagos registrados no coinciden con el monto a cuenta" className="ml-1 text-amber-500">
                                                        <FaExclamationTriangle size={10} />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-center">
                                                {fila.ventaExiste === true ? (
                                                    <span className="text-emerald-600 font-bold">Sí</span>
                                                ) : fila.ventaExiste === false ? (
                                                    <span className="text-blue-600 font-medium">No (se crea)</span>
                                                ) : (
                                                    <span className="text-gray-400">?</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-center">
                                                <input
                                                    type="date"
                                                    value={fila.fecha}
                                                    onChange={(e) => handleFechaFila(fila.pedido.id_pedido, e.target.value)}
                                                    disabled={fila.accion === 'revisar' || guardando}
                                                    className="h-8 bg-white border border-gray-200 rounded-md px-1.5 text-[11px] text-gray-700 disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-center">
                                                {fila.accion === 'cerrar' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                                                        <FaCheckCircle size={9} /> Cerrar
                                                    </span>
                                                )}
                                                {fila.accion === 'cobrar' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                                                        Cobrar S/ {montoCobro(fila).toFixed(2)}
                                                    </span>
                                                )}
                                                {fila.accion === 'revisar' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                                                        <FaExclamationTriangle size={9} /> Revisar
                                                    </span>
                                                )}
                                                {fila.discrepancia && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleForzar(fila.pedido.id_pedido)}
                                                        disabled={guardando}
                                                        className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500 underline hover:text-gray-800 disabled:opacity-50"
                                                    >
                                                        {fila.forzado ? 'Deshacer' : 'Forzar'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tarjetas (móvil) */}
                        <div className="md:hidden flex-1 overflow-y-auto divide-y divide-gray-100">
                            {filas.map(fila => (
                                <div key={fila.pedido.id_pedido} className={`p-3 space-y-2 ${fila.accion === 'revisar' ? 'bg-red-50/60' : ''}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-mono font-bold text-gray-400">#{String(fila.pedido.id_pedido).padStart(4, '0')}</p>
                                            <p className="text-sm font-semibold text-gray-800 truncate">{fila.pedido.nombre_cliente}</p>
                                        </div>
                                        <div className="shrink-0">
                                            {fila.accion === 'cerrar' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                                                    <FaCheckCircle size={9} /> Cerrar
                                                </span>
                                            )}
                                            {fila.accion === 'cobrar' && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                                                    Cobrar S/ {montoCobro(fila).toFixed(2)}
                                                </span>
                                            )}
                                            {fila.accion === 'revisar' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                                                    <FaExclamationTriangle size={9} /> Revisar
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase">Total</span>
                                            <span className="font-semibold text-gray-700">S/ {fila.total.toFixed(2)}</span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase">Pagado</span>
                                            <span className="font-semibold text-gray-700">S/ {fila.pagado.toFixed(2)}</span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase">Saldo</span>
                                            <span className="font-bold text-red-600">S/ {fila.saldoMostrado.toFixed(2)}</span>
                                            {fila.discrepancia && (
                                                <span className="block text-[9px] font-semibold text-amber-600">
                                                    real: S/ {fila.saldoCalculado.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase">Pagos</span>
                                            <span className={`font-semibold ${fila.avisoPagos ? 'text-amber-600' : 'text-gray-700'}`}>
                                                S/ {fila.pagosSum.toFixed(2)}
                                            </span>
                                            {fila.avisoPagos && <FaExclamationTriangle size={9} className="inline ml-1 text-amber-500" />}
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Fecha cierre</label>
                                            <input
                                                type="date"
                                                value={fila.fecha}
                                                onChange={(e) => handleFechaFila(fila.pedido.id_pedido, e.target.value)}
                                                disabled={fila.accion === 'revisar' || guardando}
                                                className="w-full h-10 bg-white border border-gray-200 rounded-lg px-2 text-xs text-gray-700 disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="text-right pb-2 shrink-0">
                                            {fila.ventaExiste === true ? (
                                                <span className="text-[10px] font-bold text-emerald-600">Venta: Sí</span>
                                            ) : fila.ventaExiste === false ? (
                                                <span className="text-[10px] font-medium text-blue-600">Venta: se crea</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400">Venta: ?</span>
                                            )}
                                        </div>
                                    </div>

                                    {fila.discrepancia && (
                                        <button
                                            type="button"
                                            onClick={() => handleForzar(fila.pedido.id_pedido)}
                                            disabled={guardando}
                                            className="w-full h-9 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            {fila.forzado ? 'Deshacer forzar' : 'Forzar cierre con saldo real'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pie */}
                        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <p className="text-[11px] text-gray-500 flex-1">
                                Los pedidos en <span className="font-bold text-red-600">Revisar</span> no se cerrarán.
                                La fecha define el mes de la venta y de la entrega.
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={guardando}
                                    className="h-11 px-5 w-full sm:w-auto bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmar}
                                    disabled={guardando || aCerrar.length === 0}
                                    className="h-11 px-6 w-full sm:w-auto bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {guardando ? (
                                        <>
                                            <FaSpinner className="animate-spin" size={14} />
                                            Cerrando...
                                        </>
                                    ) : (
                                        `Cerrar ${aCerrar.length} pedido${aCerrar.length === 1 ? '' : 's'}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CerrarPedidoModal;
