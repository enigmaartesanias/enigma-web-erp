import React, { useState, useEffect } from 'react';
import { materialesDB } from '../../../utils/materialesNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import { FaArrowLeft, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ReporteMateriales() {
    const [materiales, setMateriales] = useState([]);
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
            // Aquí idealmente filtraríamos por mes en backend, pero si no hay método, traemos todo y filtramos
            // Asumimos que hay un método getAll o similar. Si no, usamos lo que haya.
            const allData = await materialesDB.getAll();
            console.log('📊 Todos los datos:', allData);
            console.log('📅 Filtro de mes:', filtros.mes);
            const filteredByMonth = allData.filter(m => m.fecha_compra && m.fecha_compra.startsWith(filtros.mes));
            console.log('✅ Datos filtrados:', filteredByMonth);
            setMateriales(filteredByMonth);
        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = materiales.filter(m =>
        m.codigo_compra?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        m.proveedor_nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase())
    );

    const totalMes = filteredData.reduce((acc, curr) => acc + Number(curr.total), 0);

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

                {/* Lista Simple */}
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-xs">Cargando datos...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs">No hay registros para este mes.</div>
                    ) : (
                        filteredData.map(item => (
                            <div key={item.id} className="p-3 hover:bg-gray-50 flex justify-between items-center group transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-700">{item.proveedor_nombre || 'Proveedor General'}</span>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{item.codigo_compra}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(item.fecha_compra).toLocaleDateString()}
                                        {item.items_count > 0 && ` • ${item.items_count} items`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800">S/ {Number(item.total).toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
