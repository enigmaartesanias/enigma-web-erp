import React, { useState, useEffect } from 'react';
import { materialesDB } from '../../../utils/materialesNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import { FaArrowLeft, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ReporteMateriales() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        mes: getLocalDate().substring(0, 7), // YYYY-MM
        busqueda: ''
    });

    useEffect(() => {
        fetchData();
    }, [filtros.mes]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allItems = await materialesDB.getAllItems();
            console.log('📊 Todos los items:', allItems);

            // Convertir fecha a string ISO antes de comparar
            const filteredByMonth = allItems.filter(item => {
                if (!item.fecha_compra) return false;
                const fechaStr = item.fecha_compra instanceof Date
                    ? item.fecha_compra.toISOString().substring(0, 7)
                    : String(item.fecha_compra).substring(0, 7);
                return fechaStr === filtros.mes;
            });

            setItems(filteredByMonth);
        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (compraId) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

        try {
            await materialesDB.delete(compraId);
            // Recargar datos
            fetchData();
        } catch (error) {
            console.error('Error eliminando registro:', error);
            alert('Error al eliminar el registro');
        }
    };

    const filteredData = items.filter(item =>
        item.nombre_material?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        item.proveedor_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase())
    );

    const totalMes = filteredData.reduce((acc, curr) => acc + Number(curr.subtotal), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-600">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Minimalista */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link to="/inventario-home" className="text-gray-400 hover:text-gray-600">
                            <FaArrowLeft size={14} />
                        </Link>
                        <h1 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Reporte Materiales e Insumos</h1>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded text-xs">
                        <FaCalendarAlt className="text-gray-400" />
                        <input
                            type="month"
                            className="bg-transparent border-none p-0 text-gray-600 font-medium focus:ring-0"
                            value={filtros.mes}
                            onChange={e => setFiltros({ ...filtros, mes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Resumen */}
                <div className="p-4 bg-gray-50 flex justify-end">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-gray-400">Total Mes</p>
                        <p className="text-lg font-bold text-gray-800">S/ {totalMes.toFixed(2)}</p>
                    </div>
                </div>

                {/* Tabla con Scroll Horizontal */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                                <th className="p-3 font-semibold whitespace-nowrap">Fec.</th>
                                <th className="p-3 font-semibold whitespace-nowrap">Material</th>
                                <th className="p-3 font-semibold whitespace-nowrap">Proveedor</th>
                                <th className="p-3 font-semibold whitespace-nowrap text-right">Cant.</th>
                                <th className="p-3 font-semibold whitespace-nowrap text-right">Total</th>
                                <th className="p-3 font-semibold w-10 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-xs">Cargando datos...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-xs">No hay registros para este mes.</td>
                                </tr>
                            ) : (
                                filteredData.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(item.fecha_compra).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm font-bold text-gray-800 uppercase">{item.nombre_material}</div>
                                        </td>
                                        <td className="p-3">
                                            {item.proveedor_nombre ? (
                                                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">{item.proveedor_nombre}</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-xs text-gray-600 text-right whitespace-nowrap">
                                            <span className="font-medium">{Number(item.cantidad).toFixed(2)}</span> {item.unidad}
                                        </td>
                                        <td className="p-3 text-sm font-bold text-gray-800 text-right whitespace-nowrap">
                                            S/ {Number(item.subtotal).toFixed(2)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleDelete(item.compra_id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-full p-1.5"
                                                title="Eliminar registro"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
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
}
