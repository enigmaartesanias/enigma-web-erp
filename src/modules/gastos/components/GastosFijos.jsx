import React, { useState } from 'react';
import { FaPlus, FaCheck, FaExclamationTriangle, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { gastosDB } from '../../../utils/gastosNeonClient';
import toast from 'react-hot-toast';
import { getLocalDate } from '../../../utils/dateUtils';

const GastosFijos = ({ gastos, periodo, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        categoria: 'Alquiler',
        monto: '',
        dia_vencimiento: '17', // Default
        descripcion: ''
    });

    const categories = ['Alquiler', 'Préstamo', 'Servicio', 'Suscripción', 'Personal', 'Otro'];

    // Helper: Calcular estado visual
    const getEstadoInfo = (gasto) => {
        if (gasto.estado === 'PAGADO') return { color: 'green', text: 'PAGADO', icon: FaCheck };

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const [gastoYear, gastoMonth] = gasto.periodo.split('-').map(Number);

        // Si es mes pasado y no pagado -> DANGER
        if (gastoYear < currentYear || (gastoYear === currentYear && gastoMonth < currentMonth)) {
            return { color: 'red', text: 'VENCIDO', icon: FaExclamationTriangle };
        }

        // Si es mes actual, chequear día
        const day = parseInt(gasto.fecha_vencimiento ? new Date(gasto.fecha_vencimiento).getDate() + 1 : 32); // +1 por timezone fix simple visual
        // Ajuste mejor: fecha_vencimiento viene como string YYYY-MM-DD
        const vencimientoDay = parseInt(gasto.fecha_vencimiento.split('-')[2]);
        const currentDay = today.getDate();

        if (currentDay > vencimientoDay) return { color: 'red', text: 'VENCIDO', icon: FaExclamationTriangle };
        if (currentDay === vencimientoDay) return { color: 'yellow', text: 'VENCE HOY', icon: FaExclamationTriangle };
        if (currentDay + 2 >= vencimientoDay) return { color: 'yellow', text: 'PRÓXIMO', icon: FaCalendarAlt };

        return { color: 'gray', text: 'PENDIENTE', icon: FaCalendarAlt };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Construir fecha vencimiento real basada en el periodo
            // periodo = "2026-01"
            const fechaVencimiento = `${periodo}-${String(formData.dia_vencimiento).padStart(2, '0')}`;

            await gastosDB.create({
                tipo_gasto: 'FIJO',
                categoria: formData.categoria,
                monto: parseFloat(formData.monto),
                descripcion: formData.descripcion,
                fecha_vencimiento: fechaVencimiento,
                periodo: periodo,
                estado: 'PENDIENTE'
            });
            toast.success('Compromiso registrado');
            setFormData({ ...formData, monto: '', descripcion: '' });
            setShowForm(false);
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const handlePagar = async (gasto) => {
        if (!window.confirm(`¿Confirmar pago de ${gasto.categoria} por S/ ${gasto.monto}?`)) return;
        try {
            await gastosDB.markAsPaid(gasto.id_gasto, getLocalDate());
            toast.success('Pago registrado');
            onRefresh();
        } catch (error) {
            toast.error('Error al registrar pago');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-700">Compromisos Mensuales</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <FaPlus /> Nuevo Compromiso
                </button>
            </div>

            {/* Formulario Inline */}
            {showForm && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                            <select
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                value={formData.categoria}
                                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Monto (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                placeholder="0.00"
                                value={formData.monto}
                                onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Día Vencimiento</label>
                            <select
                                className="w-full p-2 rounded border border-gray-300 text-sm"
                                value={formData.dia_vencimiento}
                                onChange={e => setFormData({ ...formData, dia_vencimiento: e.target.value })}
                            >
                                {[...Array(31)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 h-10"
                        >
                            {loading ? 'Guardando...' : 'Agendar'}
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de Tarjetas */}
            {gastos.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    No hay compromisos registrados par este mes.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gastos.map(gasto => {
                        const status = getEstadoInfo(gasto);
                        const StatusIcon = status.icon;
                        const vencimientoDia = gasto.fecha_vencimiento ? parseInt(gasto.fecha_vencimiento.split('-')[2]) : '?';

                        return (
                            <div key={gasto.id_gasto} className={`bg-white rounded-xl shadow-sm border-l-4 p-4 relative overflow-hidden transition-all hover:shadow-md
                                ${status.color === 'green' ? 'border-green-500' :
                                    status.color === 'red' ? 'border-red-500' :
                                        status.color === 'yellow' ? 'border-yellow-500' : 'border-gray-400'}
                            `}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{gasto.categoria}</h4>
                                        <p className="text-xs text-gray-500">{gasto.descripcion}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1
                                        ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                                            status.color === 'red' ? 'bg-red-100 text-red-700' :
                                                status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                        <StatusIcon size={10} /> {status.text}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Vencimiento</p>
                                        <div className="flex items-center text-gray-700 font-medium">
                                            <FaCalendarAlt className="mr-1.5 text-gray-400" size={12} />
                                            Día {vencimientoDia}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Monto</p>
                                        <p className="text-xl font-bold text-gray-900">S/ {Number(gasto.monto).toFixed(2)}</p>
                                    </div>
                                </div>

                                {gasto.estado !== 'PAGADO' && (
                                    <button
                                        onClick={() => handlePagar(gasto)}
                                        className="mt-4 w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 flex justify-center items-center gap-2 transition-colors"
                                    >
                                        <FaMoneyBillWave /> Registrar Pago
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GastosFijos;
