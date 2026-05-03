// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaMoneyBillWave } from 'react-icons/fa';
import { dashboardDB } from '../utils/dashboardNeonClient';
import { deudasDB } from '../utils/deudasNeonClient';
import { gastosDB } from '../utils/gastosNeonClient';
import toast, { Toaster } from 'react-hot-toast';

// REGLA CRÍTICA DE PARSEO (Helper functions)
const parseNum = (val) => parseFloat(val) || 0;
const parseInt2 = (val) => parseInt(val) || 0;

const fixText = (str) => {
    if (!str || typeof str !== 'string') return str;
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
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (e) {
        return str;
    }
};

const fmt = (n) => `S/ ${parseNum(n).toFixed(2)}`;
const fmtK = (n) => {
  const v = parseNum(n);
  return v >= 1000 ? `S/ ${(v/1000).toFixed(1)}k` : fmt(v);
};

const KPICard = ({ label, value, sub, color, border, subColor = "text-gray-400" }) => (
  <div className={`bg-white rounded-2xl p-4 shadow-sm border-t-4 ${border} flex flex-col justify-between h-full`}>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${color}`}>{value}</p>
    </div>
    {sub && <p className={`text-xs ${subColor} mt-2 font-medium`}>{sub}</p>}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const hoy = new Date().toISOString().slice(0, 7);
  const [periodo, setPeriodo]   = useState(hoy);
  const [reporte, setReporte]   = useState(null);
  const [historial, setHistorial] = useState([]);
  const [deudasVencidas, setDeudasVencidas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [rep, hist, deuAll] = await Promise.all([
          dashboardDB.getReporteMensual(periodo),
          dashboardDB.getHistorial(6),
          deudasDB.getAll()
        ]);
        
        setReporte(rep);
        setHistorial(hist);
        
        // Filtrar deudas vencidas para el banner
        const vencidas = (deuAll || []).filter(d => d.estado_calculado === 'VENCIDO');
        setDeudasVencidas(vencidas);
      } catch (e) {
        console.error(e);
        toast.error('Error cargando datos financieros');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [periodo]);

  const r = reporte || {};
  
  // Agrupación de INGRESOS
  const vPedidos = parseNum(r.ingresos_pedidos);
  const vStock   = parseNum(r.ingresos_stock);
  const totalIngresos = parseNum(r.ingresos_total);

  // Agrupación de COSTOS DE PRODUCCIÓN
  const cMateriales   = parseNum(r.costo_materiales);
  const cManoObra     = parseNum(r.costo_mano_obra);
  const cHerramientas = parseNum(r.costo_herramientas);
  const cEmpaque      = parseNum(r.costo_empaque);
  const cEnvio        = parseNum(r.costo_envio);
  const totalProduccion = cMateriales + cManoObra + cHerramientas + cEmpaque + cEnvio;

  // MARGEN BRUTO
  const margenBruto = totalIngresos - totalProduccion;

  // Agrupación de GASTOS OPERATIVOS
  const gFijos     = parseNum(r.gastos_fijos);
  const gVariables = parseNum(r.gastos_variables); 
  const totalGastosOp = gFijos + gVariables;

  // RESULTADO NETO
  const neto = parseNum(r.resultado_neto);
  const esGanancia = neto >= 0;

  const piezasProducidas = parseInt2(r.piezas_producidas);
  const numPedidos = parseInt2(r.num_pedidos);
  const numVentas  = parseInt2(r.num_ventas);

  const periodoLabel = (p) => {
    if (!p) return '';
    const [y, m] = p.split('-');
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${meses[parseInt(m)-1]} ${y}`;
  };

  const totalDeudaVencida = deudasVencidas.reduce((acc, d) => acc + parseNum(d.monto_pendiente), 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <FaArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <FaChartLine className="text-indigo-500" /> Reporte Financiero
            </h1>
          </div>
          <input 
            type="month" 
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* SECCIÓN 1 — Banner de Deudas Vencidas */}
        {deudasVencidas.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white p-2 rounded-full animate-pulse">
                <FaExclamationTriangle size={14} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">⚠ Deudas vencidas: {fmt(totalDeudaVencida)}</p>
                <p className="text-[11px] text-red-500 font-medium">{deudasVencidas.length} pendientes por pagar</p>
              </div>
            </div>
            <Link to="/deudas" className="text-xs font-bold text-red-700 hover:underline bg-white/50 px-3 py-1.5 rounded-lg border border-red-100 transition-all active:scale-95">
              Ver y gestionar →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium animate-pulse">Cargando histórico...</p>
          </div>
        ) : (
          <>
            {/* SECCIÓN 2 — KPIs del Mes (4 cards) */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KPICard 
                label="INGRESOS TOTALES" 
                value={fmt(totalIngresos)}
                sub={`${numVentas} ventas / ${numPedidos} ped.`}
                color="text-indigo-600" 
                border="border-indigo-500" 
              />
              <KPICard 
                label="MARGEN BRUTO" 
                value={fmt(margenBruto)}
                sub="ingreso - prod"
                color="text-emerald-600" 
                border="border-emerald-400" 
              />
              <KPICard 
                label="GASTOS OPERATIVOS" 
                value={fmt(totalGastosOp)}
                sub="fijos + variables"
                color="text-rose-600" 
                border="border-rose-400" 
              />
              <KPICard 
                label="RESULTADO NETO" 
                value={fmt(neto)}
                sub={esGanancia ? 'ganancia del mes' : '⚠ pérdida del mes'}
                subColor={esGanancia ? 'text-emerald-500' : 'text-rose-500'}
                color={esGanancia ? 'text-emerald-600' : 'text-rose-600'}
                border={esGanancia ? 'border-emerald-600' : 'border-rose-600'} 
              />
            </div>

            {/* SECCIÓN 3 — Detalle del Mes (colapsable) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setIsDetailOpen(!isDetailOpen)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalle del Mes — {periodoLabel(periodo)}</span>
                {isDetailOpen ? <FaChevronUp className="text-gray-300" /> : <FaChevronDown className="text-gray-300" />}
              </button>

              {isDetailOpen && (
                <div className="p-6 space-y-1 animate-in fade-in duration-300">
                  {/* INGRESOS */}
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">── INGRESOS ──────────────────────────────────</div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">🛍 Ventas Directas (Stock)</span>
                    <span className={`font-medium text-sm ${vStock > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(vStock)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">📝 Pedidos (Personalizados)</span>
                    <span className={`font-medium text-sm ${vPedidos > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(vPedidos)}</span>
                  </div>

                  {/* DESGLOSE POR MÉTODO (Sub-detalle) */}
                  <div className="flex gap-4 mt-1 px-4 border-l-2 border-gray-100">
                    <span className="text-[11px] text-gray-400">
                      💵 Efectivo: <span className="font-semibold text-gray-500">{fmt(parseNum(r.ingresos_efectivo))}</span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      💳 Tarjeta/Digital: <span className="font-semibold text-gray-500">{fmt(parseNum(r.ingresos_digital))}</span>
                    </span>
                  </div>

                  {/* COSTOS DE PRODUCCIÓN */}
                  <div className="text-xs uppercase tracking-widest text-gray-400 mt-4 mb-2">── COSTOS DE PRODUCCIÓN ──────────────────────</div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">🔧 Materiales</span>
                    <span className={`font-medium text-sm ${cMateriales > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(cMateriales)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">👷 Mano de Obra</span>
                    <span className={`font-medium text-sm ${cManoObra > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(cManoObra)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">🪛 Herramientas</span>
                    <span className={`font-medium text-sm ${cHerramientas > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(cHerramientas)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">📦 Empaque + Envío</span>
                    <span className={`font-medium text-sm ${(cEmpaque + cEnvio) > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(cEmpaque + cEnvio)}</span>
                  </div>

                  {/* GASTOS OPERATIVOS */}
                  <div className="text-xs uppercase tracking-widest text-gray-400 mt-4 mb-2">── GASTOS OPERATIVOS ─────────────────────────</div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">🏠 Gastos Fijos</span>
                    <span className={`font-medium text-sm ${gFijos > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(gFijos)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-sm text-gray-600">📋 Gastos Variables</span>
                    <span className={`font-medium text-sm ${gVariables > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{fmt(gVariables)}</span>
                  </div>

                  {/* RESULTADO NETO */}
                  <div className="border-t-2 border-gray-100 mt-6 pt-4">
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">══ RESULTADO NETO ════════════════════════════</div>
                    <div className="flex justify-end items-center">
                      <span className={`text-xl font-bold ${esGanancia ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {fmt(neto)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 4 — Punto de Equilibrio */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">📐 Punto de Equilibrio — {periodoLabel(periodo)}</p>
              
              {gFijos === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  Sin gastos fijos registrados — punto de equilibrio no aplica
                </p>
              ) : (
                <div className="space-y-6">
                  {/* Meta 80 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] text-gray-500 font-medium">Meta a S/80</span>
                      <span className="text-[11px] font-bold text-gray-700">{piezasProducidas} de {parseInt2(r.pulseras_equilibrio_80)} pulseras</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${parseNum(r.pulseras_equilibrio_80) > 0 && piezasProducidas >= parseNum(r.pulseras_equilibrio_80) ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${parseNum(r.pulseras_equilibrio_80) > 0 ? Math.min((piezasProducidas / parseNum(r.pulseras_equilibrio_80)) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Meta 50 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] text-gray-500 font-medium">Meta a S/50</span>
                      <span className="text-[11px] font-bold text-gray-700">{piezasProducidas} de {parseInt2(r.pulseras_equilibrio_50)} pulseras</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${parseNum(r.pulseras_equilibrio_50) > 0 && piezasProducidas >= parseNum(r.pulseras_equilibrio_50) ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${parseNum(r.pulseras_equilibrio_50) > 0 ? Math.min((piezasProducidas / parseNum(r.pulseras_equilibrio_50)) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 text-center pt-2">
                    Meta semanal: <span className="font-bold text-gray-600">{Math.ceil(parseNum(r.pulseras_equilibrio_80) / 4)} pulseras / semana</span>
                  </p>
                </div>
              )}
            </div>

            {/* SECCIÓN 5 — Histórico 6 Meses (tabla) */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Historial Operativo</p>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="text-left px-4 py-3">PERÍODO</th>
                      <th className="text-right px-4 py-3">INGRESOS</th>
                      <th className="hidden md:table-cell text-right px-4 py-3">COSTOS PROD.</th>
                      <th className="text-right px-4 py-3">GAS. FIJOS</th>
                      <th className="text-right px-4 py-3">NETO</th>
                      <th className="hidden md:table-cell text-right px-4 py-3">PIEZAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historial.map(h => {
                      const hn = parseNum(h.resultado_neto);
                      const isCurrent = h.periodo === periodo;
                      const cProd = parseNum(h.costo_materiales) + parseNum(h.costo_mano_obra) + parseNum(h.costo_herramientas) + parseNum(h.costo_empaque) + parseNum(h.costo_envio);
                      
                      return (
                        <tr key={h.periodo} className={`hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-blue-50/50' : ''}`}>
                          <td className={`px-4 py-3 ${isCurrent ? 'font-bold text-indigo-600' : 'text-gray-700'}`}>
                            {periodoLabel(h.periodo)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            {fmt(h.ingresos_total)}
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 text-right text-gray-500 font-mono text-xs">
                            {fmt(cProd)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 font-mono text-xs">
                            {fmt(h.gastos_fijos)}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${hn >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {fmt(hn)}
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 text-right text-gray-400">
                            {parseInt2(h.piezas_producidas)}
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
};

export default Dashboard;
