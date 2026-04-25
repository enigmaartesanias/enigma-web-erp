import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaMoneyBillWave, FaTrash } from 'react-icons/fa';
import { deudasDB } from '../../../utils/deudasNeonClient';
import toast from 'react-hot-toast';
import { getLocalDate } from '../../../utils/dateUtils';

const DeudasPanel = () => {
    const [deudas, setDeudas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        acreedor: '',
        tipo: 'PRÉSTAMO', // 'PRÉSTAMO', 'TARJETA', 'OTRO'
        monto_total: '',
        fecha_vencimiento: '',
        notas: ''
    });

    const fetchDeudas = async () => {
        setLoading(true);
        try {
            const data = await deudasDB.getAll();
            setDeudas(data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await deudasDB.create({
                acreedor: formData.acreedor,
                tipo: formData.tipo,
                monto_total: parseFloat(formData.monto_total),
                fecha_vencimiento: formData.fecha_vencimiento || null,
                notas: formData.notas
            });
            toast.success('Deuda registrada');
            setFormData({ acreedor: '', tipo: 'PRÉSTAMO', monto_total: '', fecha_vencimiento: '', notas: '' });
            setShowForm(false);
            fetchDeudas();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar deuda');
        } finally {
            setLoading(false);
        }
    };

    const handlePagar = async (deuda) => {
        const montoStr = window.prompt(`¿Monto a pagar? (Total pendiente: S/ ${deuda.monto_pendiente})`);
        if (!montoStr) return;
        const monto = parseFloat(montoStr);
        if (isNaN(monto) || monto <= 0) return toast.error('Monto inválido');
        if (monto > deuda.monto_pendiente) return toast.error('Monto mayor al pendiente');

        try {
            await deudasDB.registrarPago(deuda.id, {
                monto,
                fecha_pago: getLocalDate(),
                metodo_pago: 'Efectivo',
                nota: 'Pago de cuota'
            });
            toast.success('Pago registrado exitosamente');
            fetchDeudas();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar pago');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta deuda? Esta acción no se puede deshacer.')) return;
        try {
            await deudasDB.delete(id);
            toast.success('Deuda eliminada');
            fetchDeudas();
        } catch (err) {
            toast.error('Error al eliminar');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-700">Deudas y Préstamos</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-700 transition-colors"
                >
                    <FaPlus /> Registrar Deuda
                </button>
            </div>

            {showForm && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-fadeIn">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Acreedor / Entidad</label>
                            <input
                                type="text"
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                placeholder="Ej: Banco BCP"
                                value={formData.acreedor}
                                onChange={e => setFormData({ ...formData, acreedor: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                            <select
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                value={formData.tipo}
                                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                            >
                                <option value="PRÉSTAMO">Préstamo</option>
                                <option value="TARJETA">Tarjeta de Crédito</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Monto Total (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                placeholder="0.00"
                                value={formData.monto_total}
                                onChange={e => setFormData({ ...formData, monto_total: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Vencimiento</label>
                            <input
                                type="date"
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                value={formData.fecha_vencimiento}
                                onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 h-10 w-full"
                        >
                            Guardar
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
            ) : deudas.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    No tienes deudas activas registradas.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deudas.map(deuda => {
                        const isPagado = deuda.estado_calculado === 'AL_DIA';
                        const isVencido = deuda.estado_calculado === 'VENCIDO';
                        const colorClass = isPagado ? 'border-green-500' : isVencido ? 'border-red-500' : 'border-orange-400';

                        return (
                            <div key={deuda.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-4 relative overflow-hidden transition-all flex flex-col justify-between ${colorClass}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-2 group">
                                        <div>
                                            <h4 className="font-bold text-gray-800 uppercase flex items-center gap-1">
                                                {deuda.tipo}
                                                <button onClick={() => handleDelete(deuda.id)} className="text-gray-300 hover:text-red-500 hidden group-hover:inline ml-2"><FaTrash size={12} /></button>
                                            </h4>
                                            <p className="text-sm text-gray-600">{deuda.acreedor}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1
                                            ${isPagado ? 'bg-green-100 text-green-700' :
                                              isVencido ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                                        `}>
                                            {isPagado ? <FaCheck size={10} /> : isVencido ? <FaExclamationTriangle size={10} /> : <FaCalendarAlt size={10} />}
                                            {deuda.estado_calculado}
                                        </span>
                                    </div>
                                    {deuda.notas && <p className="text-xs text-gray-500 mt-1 italic">{deuda.notas}</p>}
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progreso (S/ {deuda.monto_pagado} / S/ {deuda.monto_total})</span>
                                        <span>{Math.round((deuda.monto_pagado / deuda.monto_total) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-1.5 rounded-full ${isPagado ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min((deuda.monto_pagado / deuda.monto_total) * 100, 100)}%` }}></div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pendiente</p>
                                            <p className="text-lg font-bold text-red-600">S/ {deuda.monto_pendiente}</p>
                                        </div>
                                        {deuda.fecha_vencimiento && (
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Vencimiento</p>
                                                <p className="text-xs font-medium text-gray-700">
                                                    {typeof deuda.fecha_vencimiento === 'string' 
                                                        ? deuda.fecha_vencimiento.substring(0, 10) 
                                                        : new Date(deuda.fecha_vencimiento).toISOString().substring(0, 10)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {!isPagado && (
                                        <button
                                            onClick={() => handlePagar(deuda)}
                                            className="mt-4 w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 flex justify-center items-center gap-2 transition-colors"
                                        >
                                            <FaMoneyBillWave /> Abonar Pago
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DeudasPanel;
