import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ventasDB } from '../../../utils/ventasClient';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';

const METALES_CONOCIDOS = ['PLATA', 'ALPACA', 'COBRE', 'BRONCE', 'BISUTERIA', 'BISUTERÍA', 'ORO'];

const detectarMetal = (nombre = '', metalCampo = '') => {
    if (metalCampo) {
        const m = metalCampo.toUpperCase();
        const found = METALES_CONOCIDOS.find(k => m.includes(k));
        if (found) return found === 'BISUTERÍA' ? 'BISUTERIA' : found;
    }
    const n = nombre.toUpperCase();
    return METALES_CONOCIDOS.find(k => n.includes(k)) || '—';
};

export default function ReportePopularidad() {
    const currentYear = new Date().getFullYear();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(`${currentYear}-01-01`);
    const [fechaFin, setFechaFin] = useState(`${currentYear}-12-31`);

    useEffect(() => {
        ventasDB.getAll()
            .then(data => setVentas(data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Ventas activas filtradas por fecha
    const ventasActivas = useMemo(() => {
        return ventas.filter(v => {
            if (v.estado === 'ANULADA') return false;
            const fechaStr = new Date(v.fecha_venta).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
            if (fechaInicio && fechaStr < fechaInicio) return false;
            if (fechaFin && fechaStr > fechaFin) return false;
            return true;
        });
    }, [ventas, fechaInicio, fechaFin]);

    // Ranking frontend
    const rankingProductos = useMemo(() => {
        const mapa = {};
        ventasActivas.forEach(venta => {
            const detalles = venta.detalles || [];
            if (detalles.length === 0) return;
            detalles.forEach(d => {
                const nombre = (d.producto_nombre || d.producto_codigo || 'Producto').trim();
                const metal = detectarMetal(nombre, d.metal || venta.metal || '');
                const cant = Number(d.cantidad) || 1;
                const monto = Number(d.subtotal) || (Number(d.precio_unitario || 0) * cant);
                if (!mapa[nombre]) mapa[nombre] = { nombre, metal, unidades: 0, total: 0 };
                mapa[nombre].unidades += cant;
                mapa[nombre].total += monto;
            });
        });
        return Object.values(mapa)
            .sort((a, b) => b.unidades - a.unidades)
            .slice(0, 10);
    }, [ventasActivas]);

    const metalFavorito = useMemo(() => {
        const mapa = {};
        rankingProductos.forEach(r => {
            if (!r.metal || r.metal === '—') return;
            mapa[r.metal] = (mapa[r.metal] || 0) + r.unidades;
        });
        const sorted = Object.entries(mapa).sort((a, b) => b[1] - a[1]);
        return sorted[0] ? { nombre: sorted[0][0], unidades: sorted[0][1] } : null;
    }, [rankingProductos]);

    const productoEstrella = rankingProductos[0] || null;
    const maxUnidades = rankingProductos[0]?.unidades || 1;
    const totalUnidades = rankingProductos.reduce((s, r) => s + r.unidades, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/inventario-home" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
                        <FaArrowLeft size={13} />
                        <span className="text-xs">Volver</span>
                    </Link>
                    <p className="text-sm text-gray-700">Popularidad de Productos</p>
                    <div className="w-16" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* Filtros de fecha */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Desde</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-slate-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Hasta</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-slate-400 outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <button
                            onClick={() => { setFechaInicio(`${currentYear}-01-01`); setFechaFin(`${currentYear}-12-31`); }}
                            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Restablecer año actual
                        </button>
                        <span className="text-[10px] text-gray-400">{ventasActivas.length} ventas · {totalUnidades} unidades</span>
                    </div>
                </div>

                {rankingProductos.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 text-center">
                        <p className="text-sm text-gray-400">No hay datos de ventas para este periodo.</p>
                    </div>
                ) : (
                    <>
                        {/* Podio: Producto Estrella + Metal Favorito */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">⭐ Producto estrella</p>
                                {productoEstrella ? (
                                    <>
                                        <p className="text-xs text-gray-800 leading-snug" title={productoEstrella.nombre}>
                                            {productoEstrella.nombre.length > 28
                                                ? productoEstrella.nombre.slice(0, 28) + '…'
                                                : productoEstrella.nombre}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            <span className="text-slate-600">{productoEstrella.unidades} und</span>
                                            <span className="text-gray-300 mx-1">·</span>
                                            <span className="text-emerald-600">S/ {productoEstrella.total.toFixed(0)}</span>
                                        </p>
                                    </>
                                ) : <p className="text-xs text-gray-300">—</p>}
                            </div>

                            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">🏅 Metal favorito</p>
                                {metalFavorito ? (
                                    <>
                                        <p className="text-xs text-gray-800">{metalFavorito.nombre}</p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            <span className="text-slate-600">{metalFavorito.unidades} unidades</span>
                                        </p>
                                    </>
                                ) : <p className="text-xs text-gray-300">Sin datos de metal</p>}
                            </div>
                        </div>

                        {/* Tabla ranking */}
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
                                <p className="text-[11px] text-gray-500">Top {rankingProductos.length} más vendidos</p>
                                <p className="text-[10px] text-gray-300">por unidades</p>
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-3 py-2 text-left text-[10px] text-gray-300 font-normal w-6">#</th>
                                        <th className="px-2 py-2 text-left text-[10px] text-gray-300 font-normal">Producto</th>
                                        <th className="px-2 py-2 text-left text-[10px] text-gray-300 font-normal hidden sm:table-cell">Metal</th>
                                        <th className="px-2 py-2 text-right text-[10px] text-gray-300 font-normal w-14">Und.</th>
                                        <th className="px-2 py-2 text-right text-[10px] text-gray-300 font-normal w-20">Total S/</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankingProductos.map((item, idx) => (
                                        <tr key={item.nombre} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-3 py-2.5">
                                                <span className={`text-xs ${
                                                    idx === 0 ? 'text-amber-400' :
                                                    idx === 1 ? 'text-slate-400' :
                                                    idx === 2 ? 'text-orange-300' : 'text-gray-200'
                                                }`}>{idx + 1}</span>
                                            </td>
                                            <td className="px-2 py-2.5">
                                                <div>
                                                    <p className="text-xs text-gray-700 leading-tight"
                                                        style={{maxWidth:'170px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}
                                                        title={item.nombre}>
                                                        {item.nombre}
                                                    </p>
                                                    {/* barra proporcional */}
                                                    <div className="mt-1 h-0.5 bg-gray-100 rounded-full" style={{maxWidth:'140px'}}>
                                                        <div
                                                            className="h-0.5 bg-slate-200 rounded-full"
                                                            style={{ width: `${Math.round((item.unidades / maxUnidades) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2.5 hidden sm:table-cell">
                                                <span className="text-[10px] text-gray-400">{item.metal}</span>
                                            </td>
                                            <td className="px-2 py-2.5 text-right">
                                                <span className="text-xs text-slate-500">{item.unidades}</span>
                                            </td>
                                            <td className="px-2 py-2.5 text-right">
                                                <span className="text-xs text-emerald-500">{item.total.toFixed(0)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
