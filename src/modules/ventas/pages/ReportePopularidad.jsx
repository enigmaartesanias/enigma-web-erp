import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ventasDB } from '../../../utils/ventasClient';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function ReportePopularidad() {
    const currentYear = new Date().getFullYear();
    const [rankingProductos, setRankingProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(`${currentYear}-01-01`);
    const [fechaFin, setFechaFin] = useState(`${currentYear}-12-31`);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        ventasDB.getPopularidadRanking(fechaInicio, fechaFin)
            .then(data => {
                if (isMounted) setRankingProductos(data || []);
            })
            .catch(console.error)
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [fechaInicio, fechaFin]);

    const stats = useMemo(() => {
        const totalUnidades = rankingProductos.reduce((s, r) => s + r.total_unidades, 0);
        const totalVentasSoles = rankingProductos.reduce((s, r) => s + Number(r.total_dinero || 0), 0);
        const totalRecaudadoSoles = rankingProductos.reduce((s, r) => s + Number(r.total_recaudado || 0), 0);
        const productoEstrella = rankingProductos[0] || null;

        const mapaMetales = {};
        rankingProductos.forEach(r => {
            const metal = (r.metal || '').toUpperCase();
            if (!metal || metal === '—' || metal === 'SIN METAL' || metal === 'VARIOS') return;
            mapaMetales[metal] = (mapaMetales[metal] || 0) + r.total_unidades;
        });
        const metalSorted = Object.entries(mapaMetales).sort((a, b) => b[1] - a[1]);
        const metalFavorito = metalSorted[0] ? { nombre: metalSorted[0][0], unidades: metalSorted[0][1] } : null;

        return { totalUnidades, totalVentasSoles, totalRecaudadoSoles, productoEstrella, metalFavorito };
    }, [rankingProductos]);

    const maxUnidades = rankingProductos[0]?.total_unidades || 1;

    if (loading && rankingProductos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            {/* Encabezado minimalista */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/inventario-home" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
                        <FaArrowLeft size={12} />
                        <span className="text-xs font-medium">Volver</span>
                    </Link>
                    <p className="text-sm text-gray-800 font-semibold tracking-tight">Rendimiento de Productos</p>
                    <div className="w-16 flex justify-end">
                        {loading && <FaSpinner className="animate-spin text-blue-400" size={14} />}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">

                {/* Panel de Control (Filtros y Resumen global) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                        {/* Fechas */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="flex-1 sm:w-36">
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Desde</label>
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={e => setFechaInicio(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                            <div className="flex-1 sm:w-36">
                                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Hasta</label>
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={e => setFechaFin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Stats rápidas y botón reset */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t border-gray-50 sm:border-t-0 pt-4 sm:pt-0">
                            <button
                                onClick={() => { setFechaInicio(`${currentYear}-01-01`); setFechaFin(`${currentYear}-12-31`); }}
                                className="text-[10px] text-blue-500 hover:text-blue-700 font-bold uppercase tracking-wider transition-colors"
                            >
                                Año Actual
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Unidades</p>
                                    <p className="text-sm font-semibold text-gray-800">{stats.totalUnidades}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-100"></div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-0.5">Recaudado</p>
                                    <p className="text-sm font-bold text-emerald-600">S/ {stats.totalRecaudadoSoles.toFixed(0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {rankingProductos.length === 0 && !loading ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                        <p className="text-sm text-gray-400">No hay movimientos en las fechas seleccionadas.</p>
                    </div>
                ) : (
                    <>
                        {/* Tarjetas de Logros (Estrella / Metal) */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-gradient-to-br from-amber-50/50 to-white border border-amber-100/60 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <span className="text-sm">⭐</span>
                                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Estrella</p>
                                </div>
                                {stats.productoEstrella ? (
                                    <>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate mb-1.5" title={stats.productoEstrella.nombre}>
                                            {stats.productoEstrella.nombre}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                                                {stats.productoEstrella.total_unidades} und
                                            </span>
                                            <span className="text-[11px] text-emerald-600 font-medium">S/ {stats.productoEstrella.total_dinero.toFixed(0)}</span>
                                        </div>
                                    </>
                                ) : <p className="text-xs text-gray-400">—</p>}
                            </div>

                            <div className="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/60 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <span className="text-sm">🏅</span>
                                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Metal Favorito</p>
                                </div>
                                {stats.metalFavorito ? (
                                    <>
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate uppercase mb-1.5">
                                            {stats.metalFavorito.nombre}
                                        </p>
                                        <span className="text-[10px] bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-md font-medium">
                                            {stats.metalFavorito.unidades} piezas vendidas
                                        </span>
                                    </>
                                ) : <p className="text-xs text-gray-400">—</p>}
                            </div>
                        </div>

                        {/* Tabla de Ranking Minimalista */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between">
                                <p className="text-xs text-gray-800 font-semibold tracking-tight">Detalle por Producto</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-10 text-center">#</th>
                                            <th className="px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider min-w-[140px]">Producto</th>
                                            <th className="px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-14 text-center">Cant.</th>
                                            <th className="px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-16 text-right">Valor</th>
                                            <th className="px-3 py-2.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider w-20 text-right">Recaudado</th>
                                            <th className="px-4 py-2.5 text-[10px] font-semibold text-red-500 uppercase tracking-wider w-16 text-right">Deuda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rankingProductos.map((item, idx) => {
                                            const recaudado = Number(item.total_recaudado || 0);
                                            const pendiente = Number(item.total_dinero || 0) - recaudado;

                                            return (
                                                <tr key={`${item.nombre}-${item.metal}`} className="hover:bg-slate-50/50 transition-colors group">
                                                    {/* Posición */}
                                                    <td className="px-4 py-3 text-center align-middle">
                                                        <span className={`text-[11px] font-bold ${idx === 0 ? 'text-amber-500' :
                                                            idx === 1 ? 'text-slate-400' :
                                                                idx === 2 ? 'text-orange-400' : 'text-gray-300'
                                                            }`}>{idx + 1}</span>
                                                    </td>

                                                    {/* Producto y Metal */}
                                                    <td className="px-3 py-3 align-middle">
                                                        <div className="max-w-[180px] sm:max-w-xs">
                                                            <p className="text-xs text-gray-800 font-medium truncate" title={item.nombre}>
                                                                {item.nombre}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] text-gray-400 font-semibold uppercase">{item.metal}</span>
                                                                {/* Indicadores sutiles de origen */}
                                                                <div className="flex gap-1">
                                                                    {item.und_stock > 0 && <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded" title="Unidades de Stock">S:{item.und_stock}</span>}
                                                                    {item.und_pedido > 0 && <span className="text-[8px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded" title="Unidades a Pedido">P:{item.und_pedido}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Cantidad Total */}
                                                    <td className="px-3 py-3 text-center align-middle">
                                                        <span className="text-xs text-gray-700 font-medium">{item.total_unidades}</span>
                                                    </td>

                                                    {/* Valor Comercial */}
                                                    <td className="px-3 py-3 text-right align-middle">
                                                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                                                            {item.total_dinero.toFixed(0)}
                                                        </span>
                                                    </td>

                                                    {/* Recaudado real */}
                                                    <td className="px-3 py-3 text-right align-middle">
                                                        <span className="text-[11px] text-emerald-600 font-semibold whitespace-nowrap">
                                                            {recaudado.toFixed(0)}
                                                        </span>
                                                    </td>

                                                    {/* Deuda / Pendiente */}
                                                    <td className="px-4 py-3 text-right align-middle">
                                                        <span className={`text-[10px] font-medium whitespace-nowrap ${pendiente > 0 ? 'text-red-500 bg-red-50 px-1.5 py-0.5 rounded' : 'text-gray-300'}`}>
                                                            {pendiente > 0 ? pendiente.toFixed(0) : '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}