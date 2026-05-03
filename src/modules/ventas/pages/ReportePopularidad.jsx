import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ventasDB } from '../../../utils/ventasClient';
import { FaArrowLeft, FaSpinner, FaChartBar, FaStar, FaMedal, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';

const MetalRow = ({ detail, totalTypeUnits }) => {
    const pct = totalTypeUnits > 0 ? Math.round((detail.unidades / totalTypeUnits) * 100) : 0;
    return (
        <div className="flex items-center justify-between py-2 border-t border-slate-50 first:border-t-0">
            <div className="flex-1">
                <p className="text-[11px] font-semibold text-slate-700 capitalize">{detail.metal}</p>
                <div className="flex gap-2 text-[9px] text-slate-400 font-medium">
                    {detail.und_pedido > 0 && <span>P: {detail.und_pedido}</span>}
                    {detail.und_stock > 0 && <span>S: {detail.und_stock}</span>}
                </div>
            </div>
            <div className="text-right">
                <p className="text-[11px] font-bold text-slate-800">{detail.unidades} <span className="text-[9px] font-normal opacity-50">und</span></p>
                <p className="text-[9px] text-slate-400 font-medium">{pct}% del tipo</p>
            </div>
        </div>
    );
};

const TypeGroupCard = ({ type, totalOverallUnits, isExpanded, onToggle }) => {
    const pctOverall = totalOverallUnits > 0 ? Math.round((type.unidades / totalOverallUnits) * 100) : 0;
    const margen = type.ingreso > 0 ? Math.round((type.ganancia / type.ingreso) * 100) : null;
    const margenColor = margen >= 60 ? 'text-emerald-600' : margen >= 30 ? 'text-slate-600' : 'text-rose-500';

    return (
        <div className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-slate-300 shadow-md' : 'border-slate-100 shadow-sm'}`}>
            {/* Cabecera del Tipo (Nivel 1) */}
            <div 
                onClick={onToggle}
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 rounded-2xl transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate">{type.tipo_producto}</h3>
                        {isExpanded ? <FaChevronUp size={10} className="text-slate-300" /> : <FaChevronDown size={10} className="text-slate-300" />}
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-slate-400" style={{ width: `${pctOverall}%` }} />
                    </div>
                </div>
                
                <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 leading-none">{type.unidades} <span className="text-[10px] font-normal text-slate-400 uppercase">und</span></p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-medium">S/ {type.ingreso.toLocaleString('es-PE', { maximumFractionDigits: 0 })}</span>
                        {margen !== null && <span className={`text-[10px] font-bold ${margenColor}`}>{margen}%</span>}
                    </div>
                </div>
            </div>

            {/* Desglose por Metales (Nivel 2) */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/30 rounded-b-2xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Desglose por Metal</p>
                    <div className="space-y-1">
                        {type.detalles.map(d => (
                            <MetalRow key={d.metal} detail={d} totalTypeUnits={type.unidades} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ReportePopularidad() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const [dataOriginal, setDataOriginal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState(`${currentYear}-01-01`);
    const [fechaFin, setFechaFin] = useState(`${currentYear}-12-31`);
    
    const [expandedTypes, setExpandedTypes] = useState({});
    const [filterTipo, setFilterTipo] = useState('');
    const [filterMetal, setFilterMetal] = useState('');

    const toggleType = (tipo) => {
        setExpandedTypes(prev => ({ ...prev, [tipo]: !prev[tipo] }));
    };

    const resetYear = () => {
        setFechaInicio(`${currentYear}-01-01`);
        setFechaFin(`${currentYear}-12-31`);
    };

    useEffect(() => {
        let isMounted = true;
        const cargarData = async () => {
            setLoading(true);
            try {
                const data = await ventasDB.getPopularidadRanking(fechaInicio, fechaFin);
                if (isMounted) setDataOriginal(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        cargarData();
        return () => { isMounted = false; };
    }, [fechaInicio, fechaFin]);

    // Lógica de filtrado en cascada
    const { filteredData, tiposDisponibles, metalesDisponibles } = useMemo(() => {
        let filtered = [...dataOriginal];

        // 1. Obtener tipos únicos
        const tipos = dataOriginal.map(d => d.tipo_producto);

        // 2. Filtrar por tipo seleccionado
        if (filterTipo) {
            filtered = filtered.filter(d => d.tipo_producto === filterTipo);
        }

        // 3. Obtener metales disponibles para el tipo actual (o todos si no hay tipo)
        const metales = new Set();
        filtered.forEach(d => d.detalles.forEach(m => metales.add(m.metal)));

        // 4. Filtrar por metal seleccionado (dentro de los detalles)
        if (filterMetal) {
            filtered = filtered.map(d => ({
                ...d,
                detalles: d.detalles.filter(m => m.metal === filterMetal)
            })).filter(d => d.detalles.length > 0);
        }

        return { 
            filteredData: filtered, 
            tiposDisponibles: Array.from(new Set(tipos)),
            metalesDisponibles: Array.from(metales)
        };
    }, [dataOriginal, filterTipo, filterMetal]);

    const stats = useMemo(() => {
        const totalUnidades = filteredData.reduce((s, r) => s + r.unidades, 0);
        const totalIngreso = filteredData.reduce((s, r) => s + r.ingreso, 0);
        const productoEstrella = filteredData[0] || null;

        const mapaMetales = {};
        filteredData.forEach(r => {
            r.detalles.forEach(m => {
                mapaMetales[m.metal] = (mapaMetales[m.metal] || 0) + m.unidades;
            });
        });
        const metalSorted = Object.entries(mapaMetales).sort((a, b) => b[1] - a[1]);
        const metalFavorito = metalSorted[0] ? { nombre: metalSorted[0][0], unidades: metalSorted[0][1] } : null;

        return { totalUnidades, totalIngreso, productoEstrella, metalFavorito };
    }, [filteredData]);

    if (loading && dataOriginal.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <FaSpinner className="animate-spin text-slate-300 text-2xl mb-4" />
                <p className="text-slate-400 font-medium text-xs tracking-widest uppercase">Analizando registros...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFB] pb-24">
            {/* Header Sticky */}
            <div className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <FaArrowLeft size={14} />
                        </button>
                        <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            RENDIMIENTO <span className="text-[10px] text-slate-400 font-normal">| FASE 2</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                
                {/* Panel de Control y Filtros */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                            <div className="shrink-0">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Desde</label>
                                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                                    className="p-1.5 bg-slate-50 rounded-lg border-transparent text-[11px] font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 transition-all" />
                            </div>
                            <div className="shrink-0">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Hasta</label>
                                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                                    className="p-1.5 bg-slate-50 rounded-lg border-transparent text-[11px] font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 transition-all" />
                            </div>
                            <button onClick={resetYear} className="self-end text-[9px] text-blue-500 font-bold uppercase tracking-widest pb-2 px-1 hover:text-blue-700">
                                Año actual
                            </button>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Unidades</p>
                                <p className="text-base font-bold text-slate-900">{stats.totalUnidades}</p>
                            </div>
                            <div className="w-px h-6 bg-slate-100"></div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Ingreso Pedidos</p>
                                <p className="text-base font-bold text-emerald-600">S/ {stats.totalIngreso.toLocaleString('es-PE', { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filtros Inteligentes (Cascada) */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                        <div className="flex-1 min-w-[140px]">
                            <div className="relative">
                                <select 
                                    value={filterTipo} 
                                    onChange={e => { setFilterTipo(e.target.value); setFilterMetal(''); }}
                                    className="w-full appearance-none bg-slate-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-slate-100 outline-none"
                                >
                                    <option value="">TODOS LOS TIPOS</option>
                                    {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <FaChevronDown size={8} className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <div className="relative">
                                <select 
                                    value={filterMetal} 
                                    onChange={e => setFilterMetal(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-slate-100 outline-none"
                                >
                                    <option value="">TODOS LOS METALES</option>
                                    {metalesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <FaChevronDown size={8} className="absolute right-3 top-3.5 text-slate-300 pointer-events-none" />
                            </div>
                        </div>
                        {(filterTipo || filterMetal) && (
                            <button onClick={() => { setFilterTipo(''); setFilterMetal(''); }} className="text-[9px] font-bold text-rose-500 uppercase px-2">Limpiar</button>
                        )}
                    </div>
                </div>

                {/* Cards Estrella y Metal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <FaStar className="text-amber-400" size={10} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Líder de Ventas</span>
                        </div>
                        {stats.productoEstrella ? (
                            <div>
                                <h3 className="text-base font-bold text-slate-800 leading-tight mb-1">{stats.productoEstrella.tipo_producto}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stats.productoEstrella.detalles[0]?.metal}</span>
                                    <span className="text-[10px] font-black bg-slate-50 px-2 py-0.5 rounded text-slate-700">{stats.totalUnidades > 0 ? Math.round((stats.productoEstrella.unidades/stats.totalUnidades)*100) : 0}% cuota</span>
                                </div>
                            </div>
                        ) : <p className="text-slate-300 italic text-xs">Sin datos</p>}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <FaMedal className="text-indigo-400" size={10} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Metal Predominante</span>
                        </div>
                        {stats.metalFavorito ? (
                            <div>
                                <h3 className="text-base font-bold text-slate-800 leading-tight mb-1">{stats.metalFavorito.nombre}</h3>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stats.metalFavorito.unidades} piezas vendidas</p>
                            </div>
                        ) : <p className="text-slate-300 italic text-xs">Sin datos</p>}
                    </div>
                </div>

                {/* Ranking Jerárquico */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ranking por Categoría</h2>
                        <span className="text-[9px] font-medium text-slate-300 italic">Clic para ver detalles por metal</span>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                            <p className="text-slate-300 text-xs italic font-medium">No hay registros que coincidan con los filtros</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredData.map(type => (
                                <TypeGroupCard 
                                    key={type.tipo_producto} 
                                    type={type} 
                                    totalOverallUnits={stats.totalUnidades}
                                    isExpanded={!!expandedTypes[type.tipo_producto]}
                                    onToggle={() => toggleType(type.tipo_producto)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}