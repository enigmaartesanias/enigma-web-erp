import React, { useState, useEffect } from 'react';
import { materialesDB } from '../../../utils/materialesNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import { FaArrowLeft, FaCalendarAlt, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';
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
        if (!window.confirm('⚠️ ¿Estás seguro de eliminar este registro?\n\nEsto eliminará la compra completa (factura) de la base de datos.')) return;

        try {
            await materialesDB.delete(compraId);
            fetchData();
        } catch (error) {
            console.error('Error eliminando registro:', error);
            alert('Error al eliminar el registro');
        }
    };

    const filteredData = items.filter(item =>
        item.nombre_material?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        item.proveedor_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        item.codigo_compra?.toLowerCase().includes(filtros.busqueda.toLowerCase())
    );

    // Suma de Gasto
    const totalGastoMes = filteredData.reduce((acc, curr) => acc + Number(curr.subtotal), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-600">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header Claro: Es un historial de gastos */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Link to="/inventario-home" className="text-gray-400 hover:text-gray-800 bg-white p-2 rounded-full shadow-sm border border-gray-200">
                            <FaArrowLeft size={14} />
                        </Link>
                        <div>
                            <h1 className="text-base font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                <FaFileInvoiceDollar className="text-slate-500" /> Historial de Compras
                            </h1>
                            <p className="text-xs text-slate-500 font-medium">Facturas y gastos en materias primas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-sm w-full md:w-auto">
                        <FaCalendarAlt className="text-blue-500" />
                        <input
                            type="month"
                            className="bg-transparent border-none p-0 text-gray-700 font-bold focus:ring-0 text-sm w-full"
                            value={filtros.mes}
                            onChange={e => setFiltros({ ...filtros, mes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Dashboard Resumen */}
                <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-50">
                    <div className="relative w-full md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar material o proveedor..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-gray-50"
                        />
                    </div>

                    <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 text-right w-full md:w-auto flex justify-between md:flex-col items-center md:items-end">
                        <p className="text-[10px] uppercase font-black text-red-400 tracking-widest">Gasto Total del Mes</p>
                        <p className="text-xl font-black text-red-600">S/ {totalGastoMes.toFixed(2)}</p>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] text-gray-400 uppercase tracking-wider">
                                <th className="p-4 font-bold whitespace-nowrap">Fecha / Ref</th>
                                <th className="p-4 font-bold whitespace-nowrap">Material</th>
                                <th className="p-4 font-bold whitespace-nowrap text-right">Precio Unid.</th>
                                <th className="p-4 font-bold whitespace-nowrap text-right">Cant. Comprada</th>
                                <th className="p-4 font-bold whitespace-nowrap text-right text-red-400">Gasto Total</th>
                                <th className="p-4 font-bold w-10 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">Cargando facturas...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 text-sm italic">No se registraron compras en este mes.</td>
                                </tr>
                            ) : (
                                filteredData.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-xs font-bold text-slate-700">
                                                {new Date(item.fecha_compra).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] font-mono text-gray-400 mt-0.5">{item.codigo_compra}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-black text-gray-800 uppercase">{item.nombre_material}</div>
                                            <div className="text-[10px] text-gray-500 font-medium mt-0.5">{item.proveedor_nombre || 'Proveedor no registrado'}</div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 font-medium text-right whitespace-nowrap">
                                            S/ {Number(item.costo_unitario).toFixed(4)} <span className="text-[9px]">/ {item.unidad}</span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-700 text-right whitespace-nowrap">
                                            {Number(item.cantidad).toFixed(2)} <span className="text-[10px] text-gray-400 font-medium">{item.unidad}</span>
                                        </td>
                                        <td className="p-4 text-sm font-black text-red-600 text-right whitespace-nowrap">
                                            S/ {Number(item.subtotal).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleDelete(item.compra_id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg p-2"
                                                title="Eliminar factura"
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