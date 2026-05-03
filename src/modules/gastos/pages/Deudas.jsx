import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaMoneyBillWave, FaTrash, FaEdit, FaWallet, FaChartPie, FaHistory } from 'react-icons/fa';
import { deudasDB } from '../../../utils/deudasNeonClient';
import toast, { Toaster } from 'react-hot-toast';
import { getLocalDate } from '../../../utils/dateUtils';

// ─── Corrector de mojibake (latin1 mal interpretado como UTF-8) ───────────────
const fixText = (str) => {
    if (!str || typeof str !== 'string') return str;
    
    // Si no contiene caracteres de mojibake comunes, retornamos directo
    if (!str.includes('Ã') && !str.includes('â') && !str.includes('©') && !str.includes('€')) {
        return str;
    }

    // Mapeo de caracteres CP1252 comunes en mojibake que están fuera de ISO-8859-1
    const map = {
        0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 
        0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 
        0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 
        0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 
        0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 
        0x017E: 0x9E, 0x0178: 0x9F
    };

    try {
        const bytes = new Uint8Array(str.split('').map(c => {
            const code = c.charCodeAt(0);
            return map[code] || (code < 256 ? code : 63);
        }));
        const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        return decoded;
    } catch (e) {
        // Fallback manual ultra-específico si falla el decodificador
        return str
            .replace(/â€“/g, '–')
            .replace(/â€”/g, '—')
            .replace(/â€/g, '"')
            .replace(/Ã¡/g, 'á')
            .replace(/Ã©/g, 'é')
            .replace(/Ã/g, 'í')
            .replace(/Ã³/g, 'ó')
            .replace(/Ãº/g, 'ú')
            .replace(/Ã±/g, 'ñ');
    }
};
// ─────────────────────────────────────────────────────────────────────────────

const Deudas = () => {
    const [deudas, setDeudas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const [historialPagos, setHistorialPagos] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [formData, setFormData] = useState({
        acreedor: '',
        tipo: 'PRÉSTAMO',
        monto_total: '',
        fecha_vencimiento: '',
        notas: ''
    });

    const fetchDeudas = async () => {
        setLoading(true);
        try {
            const data = await deudasDB.getAll();
            // Corregimos la codificación de toda la data al entrar
            const fixedData = (data || []).map(d => {
                // Limpieza agresiva de patrones comunes
                const clean = (txt) => {
                    if (!txt || typeof txt !== 'string') return txt;
                    let t = fixText(txt);
                    // Refuerzo manual por si fixText falló en alguna secuencia
                    return t.replace(/â€“/g, '–')
                            .replace(/â€”/g, '—')
                            .replace(/â€/g, '"')
                            .replace(/Ã¡/g, 'á')
                            .replace(/Ã©/g, 'é')
                            .replace(/Ã/g, 'í')
                            .replace(/Ã³/g, 'ó')
                            .replace(/Ãº/g, 'ú')
                            .replace(/Ã±/g, 'ñ');
                };

                return {
                    ...d,
                    acreedor: clean(d.acreedor),
                    tipo: clean(d.tipo),
                    notas: clean(d.notas)
                };
            });
            setDeudas(fixedData);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar deudas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeudas();
    }, []);

    const totalDeuda = deudas.reduce((sum, d) => sum + Number(d.monto_total || 0), 0);
    const totalPagado = deudas.reduce((sum, d) => sum + Number(d.monto_pagado || 0), 0);
    const totalPendiente = deudas.reduce((sum, d) => sum + Number(d.monto_pendiente || 0), 0);
    const progresoGlobal = totalDeuda > 0 ? (totalPagado / totalDeuda) * 100 : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                acreedor: formData.acreedor,
                tipo: formData.tipo,
                monto_total: parseFloat(formData.monto_total),
                fecha_vencimiento: formData.fecha_vencimiento || null,
                notas: formData.notas
            };

            if (editingId) {
                await deudasDB.update(editingId, payload);
                toast.success('Deuda actualizada correctamente');
            } else {
                await deudasDB.create(payload);
                toast.success('Deuda registrada');
            }

            resetForm();
            fetchDeudas();
        } catch (error) {
            console.error(error);
            toast.error('Error al procesar la deuda');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (deuda) => {
        setFormData({
            acreedor: deuda.acreedor, // Ya vienen fijos de fetchDeudas
            tipo: deuda.tipo,
            monto_total: deuda.monto_total,
            fecha_vencimiento: deuda.fecha_vencimiento ? String(deuda.fecha_vencimiento).substring(0, 10) : '',
            notas: deuda.notas || ''
        });
        setEditingId(deuda.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ acreedor: '', tipo: 'PRÉSTAMO', monto_total: '', fecha_vencimiento: '', notas: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handlePagar = async (deuda) => {
        const montoStr = window.prompt(`¿Monto a abonar hoy? \n\nTotal pendiente: S/ ${Number(deuda.monto_pendiente).toFixed(2)}\nIngresa la cantidad (ej: 50, 100):`);

        if (!montoStr) return;
        const monto = parseFloat(montoStr);

        if (isNaN(monto) || monto <= 0) return toast.error('Monto inválido');
        if (monto > deuda.monto_pendiente) return toast.error('El monto ingresado es mayor a la deuda pendiente');

        try {
            await deudasDB.registrarPago(deuda.id, {
                monto,
                fecha_pago: getLocalDate(),
                metodo_pago: 'Efectivo',
                nota: 'Abono parcial'
            });
            toast.success(`S/ ${monto.toFixed(2)} abonados exitosamente`);
            fetchDeudas();
            if (expandedHistoryId === deuda.id) {
                toggleHistorial(deuda.id, true);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar pago');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta deuda? Se perderá el historial de pagos de la misma.')) return;
        try {
            await deudasDB.delete(id);
            toast.success('Deuda eliminada');
            fetchDeudas();
        } catch (err) {
            toast.error('Error al eliminar');
        }
    };

    const toggleHistorial = async (deudaId, forceReload = false) => {
        if (expandedHistoryId === deudaId && !forceReload) {
            setExpandedHistoryId(null);
            return;
        }

        setExpandedHistoryId(deudaId);
        setLoadingHistory(true);
        try {
            const pagos = await deudasDB.getPagos(deudaId);
            setHistorialPagos(pagos);
        } catch (error) {
            toast.error("Error al cargar historial");
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-3 md:p-6 font-sans pb-20">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Link to="/inventario-home" className="text-gray-500 hover:text-gray-800 transition-colors">
                            <FaArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-base md:text-2xl font-bold text-gray-800 tracking-tight">Deudas y Préstamos</h1>
                            <p className="text-[10px] md:text-xs text-gray-500">Gestión de créditos y amortizaciones a largo plazo</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (showForm && !editingId) {
                                setShowForm(false);
                            } else {
                                resetForm();
                                setShowForm(true);
                            }
                        }}
                        className={`${showForm && !editingId ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm flex items-center gap-2 transition-colors shadow-sm`}
                    >
                        {showForm && !editingId ? 'Cancelar' : <><FaPlus /> Registrar Nueva Deuda</>}
                    </button>
                </div>

                {/* ── KPIs: en móvil fila compacta, en desktop 3 columnas ── */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4">
                    {/* Deuda total */}
                    <div className="bg-white rounded-xl p-2.5 md:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-1 md:gap-4">
                        <div className="p-2 md:p-3 bg-red-50 text-red-600 rounded-lg hidden md:flex"><FaChartPie size={20} /></div>
                        <div className="text-center md:text-left">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-tight">Total Hist.</p>
                            <p className="text-sm md:text-xl font-bold text-gray-800">S/ {totalDeuda.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Total abonado */}
                    <div className="bg-white rounded-xl p-2.5 md:p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-1 md:gap-4">
                        <div className="p-2 md:p-3 bg-green-50 text-green-600 rounded-lg hidden md:flex"><FaCheck size={20} /></div>
                        <div className="w-full text-center md:text-left">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-tight">Abonado</p>
                            <div className="flex justify-center md:justify-between items-end gap-1">
                                <p className="text-sm md:text-xl font-bold text-gray-800">S/ {totalPagado.toFixed(2)}</p>
                                <span className="text-[9px] md:text-xs font-semibold text-green-500">{progresoGlobal.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${progresoGlobal}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Saldo pendiente */}
                    <div className="bg-white rounded-xl p-2.5 md:p-4 shadow-sm border-l-4 border-l-orange-500 flex flex-col md:flex-row items-center gap-1 md:gap-4">
                        <div className="p-2 md:p-3 bg-orange-50 text-orange-600 rounded-lg hidden md:flex"><FaWallet size={20} /></div>
                        <div className="text-center md:text-left">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold text-orange-400 tracking-wider leading-tight">Pendiente</p>
                            <p className="text-sm md:text-2xl font-bold text-orange-600">S/ {totalPendiente.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Formulario ── */}
                {showForm && (
                    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-lg animate-fadeIn relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 rounded-t-xl"></div>
                        <h3 className="text-xs md:text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                            {editingId ? '✏️ Editando Deuda' : '📝 Registrar Nuevo Compromiso'}
                        </h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Acreedor / Entidad / Persona</label>
                                <input type="text" className="w-full p-2 md:p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ej: Banco BCP, Juan Pérez..." value={formData.acreedor} onChange={e => setFormData({ ...formData, acreedor: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de Crédito</label>
                                <select className="w-full p-2 md:p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                                    <option value="PRÉSTAMO">Préstamo</option>
                                    <option value="TARJETA">Tarjeta de Crédito</option>
                                    <option value="PROVEEDOR">Proveedor</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Monto Total Original (S/)</label>
                                <input type="number" step="0.01" className="w-full p-2 md:p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="0.00" value={formData.monto_total} onChange={e => setFormData({ ...formData, monto_total: e.target.value })} required disabled={!!editingId} title={editingId ? "No puedes cambiar el monto inicial. Si hay error, elimina y crea de nuevo." : ""} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Vencimiento Final</label>
                                <input type="date" className="w-full p-2 md:p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 outline-none" value={formData.fecha_vencimiento} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })} />
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Notas / Recordatorios (Opcional)</label>
                                <input type="text" className="w-full p-2 md:p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ej: Negociar cuota mensual, etc." value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} />
                            </div>
                            <button type="submit" disabled={loading} className="bg-red-600 text-white px-4 py-2 md:py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 w-full shadow-sm">
                                {editingId ? 'Guardar Cambios' : 'Registrar'}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Grid de Deudas ── */}
                {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
                ) : deudas.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                        <FaWallet className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="font-semibold text-sm">No tienes deudas activas registradas.</p>
                        <p className="text-xs mt-1">¡Tus finanzas están sanas!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                        {deudas.map(deuda => {
                            const isPagado = deuda.estado_calculado === 'AL_DIA' || Number(deuda.monto_pendiente) <= 0;
                            const isVencido = deuda.estado_calculado === 'VENCIDO';
                            const colorClass = isPagado ? 'border-green-500' : isVencido ? 'border-red-500' : 'border-orange-400';
                            const tieneAbonos = Number(deuda.monto_pagado) > 0;

                            return (
                                <div key={deuda.id} className={`bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-l-[4px] p-3 md:p-5 relative transition-all flex flex-col justify-between ${colorClass}`}>

                                    {/* Botones editar/eliminar */}
                                    <div className="absolute top-3 right-3 flex gap-1.5">
                                        <button onClick={() => handleEditClick(deuda)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar deuda">
                                            <FaEdit size={12} />
                                        </button>
                                        <button onClick={() => handleDelete(deuda.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar deuda">
                                            <FaTrash size={12} />
                                        </button>
                                    </div>

                                    {/* Cabecera de la tarjeta */}
                                    <div>
                                        <div className="flex flex-col items-start mb-2 pr-14">
                                            <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mb-1.5
                                                ${isPagado ? 'bg-green-100 text-green-700' :
                                                    isVencido ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-orange-100 text-orange-700'}
                                            `}>
                                                {isPagado ? <FaCheck size={9} /> : isVencido ? <FaExclamationTriangle size={9} /> : <FaCalendarAlt size={9} />}
                                                {isPagado ? 'PAGADO' : isVencido ? 'VENCIDO' : 'PENDIENTE'}
                                            </span>
                                            {/* fixText aplicado al acreedor */}
                                            <h4 className="font-black text-gray-800 text-sm md:text-lg leading-tight uppercase truncate w-full">
                                                {deuda.acreedor}
                                            </h4>
                                            <p className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">{deuda.tipo}</p>
                                        </div>
                                        {deuda.notas && (
                                            <p className="text-[10px] md:text-[11px] text-gray-500 italic bg-gray-50 p-1.5 md:p-2 rounded-md border border-gray-100 line-clamp-2">
                                                "{deuda.notas}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Progreso y saldo */}
                                    <div className="mt-3 md:mt-5">
                                        <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1">
                                            <span>S/ {Number(deuda.monto_pagado).toFixed(2)} de S/ {Number(deuda.monto_total).toFixed(2)}</span>
                                            <span className={isPagado ? 'text-green-600 font-bold' : ''}>{Math.round((deuda.monto_pagado / deuda.monto_total) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-3">
                                            <div className={`h-1.5 rounded-full ${isPagado ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min((deuda.monto_pagado / deuda.monto_total) * 100, 100)}%` }}></div>
                                        </div>

                                        <div className="flex justify-between items-end p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div>
                                                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider font-bold">Saldo Restante</p>
                                                <p className={`text-base md:text-xl font-black ${isPagado ? 'text-green-600' : 'text-red-600'}`}>
                                                    S/ {Number(deuda.monto_pendiente).toFixed(2)}
                                                </p>
                                            </div>
                                            {deuda.fecha_vencimiento && !isPagado && (
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider font-bold">Límite</p>
                                                    <p className="text-[10px] md:text-xs font-semibold text-gray-700">
                                                        {typeof deuda.fecha_vencimiento === 'string'
                                                            ? deuda.fecha_vencimiento.substring(0, 10)
                                                            : new Date(deuda.fecha_vencimiento).toISOString().substring(0, 10)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Historial de abonos */}
                                        {tieneAbonos && (
                                            <div className="mt-2.5">
                                                <button
                                                    onClick={() => toggleHistorial(deuda.id)}
                                                    className="text-[10px] md:text-[11px] font-semibold text-blue-600 flex items-center gap-1 hover:underline"
                                                >
                                                    <FaHistory size={10} /> {expandedHistoryId === deuda.id ? 'Ocultar abonos' : 'Ver historial de abonos'}
                                                </button>

                                                {expandedHistoryId === deuda.id && (
                                                    <div className="mt-1.5 bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 text-xs animate-fadeIn max-h-28 overflow-y-auto custom-scrollbar">
                                                        {loadingHistory ? (
                                                            <p className="text-center text-gray-400 text-[10px]">Cargando...</p>
                                                        ) : historialPagos.length === 0 ? (
                                                            <p className="text-center text-gray-400 text-[10px]">Sin abonos registrados</p>
                                                        ) : (
                                                            <ul className="space-y-1">
                                                                {historialPagos.map((pago, idx) => (
                                                                    <li key={idx} className="flex justify-between items-center border-b border-blue-100/50 pb-1 last:border-0 last:pb-0">
                                                                        <span className="text-gray-500 text-[10px]">
                                                                            {new Date(pago.fecha_pago).toLocaleDateString()}
                                                                        </span>
                                                                        <span className="font-bold text-green-600 text-[10px]">
                                                                            + S/ {Number(pago.monto).toFixed(2)}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!isPagado && (
                                            <button
                                                onClick={() => handlePagar(deuda)}
                                                className="mt-3 w-full py-2 md:py-2.5 bg-white text-red-600 border-2 border-red-100 rounded-lg text-xs md:text-sm font-bold hover:bg-red-50 flex justify-center items-center gap-2 transition-all active:scale-95"
                                            >
                                                <FaMoneyBillWave /> Registrar Abono
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deudas;
