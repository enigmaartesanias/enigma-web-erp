import React, { useState } from 'react';
import { FaPlus, FaTrash, FaShoppingBag, FaCar, FaUtensils, FaTools, FaQuestionCircle } from 'react-icons/fa';
import { gastosDB } from '../../../utils/gastosNeonClient';
import toast from 'react-hot-toast';
import { getLocalDate } from '../../../utils/dateUtils';

const GastosVariables = ({ gastos, periodo, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        categoria: 'Movilidad',
        monto: '',
        descripcion: ''
    });

    const commonCategories = [
        { name: 'Movilidad', icon: FaCar },
        { name: 'Bolsas/Empaques', icon: FaShoppingBag },
        { name: 'Refrigerio', icon: FaUtensils },
        { name: 'Insumos', icon: FaTools },
        { name: 'Otros', icon: FaQuestionCircle }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await gastosDB.create({
                tipo_gasto: 'VARIABLE',
                categoria: formData.categoria,
                monto: parseFloat(formData.monto),
                descripcion: formData.descripcion || 'Gasto operativo',
                periodo: periodo,
                fecha_pago: getLocalDate(), // Variables se pagan al momento
                estado: 'PAGADO',
                fecha_vencimiento: getLocalDate() // Referencial para orden
            });
            toast.success('Gasto registrado');
            setFormData({ ...formData, monto: '', descripcion: '' });
            onRefresh();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este registro?')) return;
        try {
            await gastosDB.delete(id);
            toast.success('Eliminado');
            onRefresh();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const totalVariables = gastos.reduce((acc, g) => acc + Number(g.monto), 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Formulario Rápido */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="p-1 bg-purple-100 rounded text-purple-600"><FaPlus size={14} /></span>
                        Registrar Salida
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">Categoría</label>
                            <div className="grid grid-cols-3 gap-2">
                                {commonCategories.map(cat => {
                                    const Icon = cat.icon;
                                    const isSelected = formData.categoria === cat.name;
                                    return (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, categoria: cat.name })}
                                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all
                                                ${isSelected
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}
                                            `}
                                        >
                                            <Icon className="mb-1" size={14} />
                                            {cat.name.split('/')[0]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Monto (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-lg font-mono placeholder:text-gray-300"
                                placeholder="0.00"
                                value={formData.monto}
                                onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Nota (Opcional)</label>
                            <input
                                type="text"
                                className="w-full p-2.5 rounded-lg border border-gray-300 text-sm"
                                placeholder="Ej: Pasaje centro, bolsas 100u..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm"
                        >
                            {loading ? 'Registrando...' : 'Registrar Gasto'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Columna Derecha: Historial */}
            <div className="lg:col-span-2 space-y-4">
                {/* Resumen */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">Total Gastado este Mes</p>
                        <p className="text-sm text-purple-600">Gastos operativos y variables</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-800">S/ {totalVariables.toFixed(2)}</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-24">Fecha</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Detalle</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-600">Monto</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-16">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {gastos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                                        No hay gastos variables registrados.
                                    </td>
                                </tr>
                            ) : (
                                gastos.map(g => (
                                    <tr key={g.id_gasto} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {g.fecha_pago ? new Date(g.fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{g.categoria}</div>
                                            {g.descripcion && <div className="text-xs text-gray-500">{g.descripcion}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                                            S/ {Number(g.monto).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDelete(g.id_gasto)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                title="Eliminar"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GastosVariables;
