// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaChartLine } from 'react-icons/fa';
import { dashboardDB } from '../utils/dashboardNeonClient';
import { deudasDB } from '../utils/deudasNeonClient';
import toast, { Toaster } from 'react-hot-toast';

const fmt = (n) => `S/ ${parseFloat(n || 0).toFixed(2)}`;
const fmtK = (n) => {
  const v = parseFloat(n || 0);
  return v >= 1000 ? `S/ ${(v/1000).toFixed(1)}k` : fmt(v);
};

const KPICard = ({ emoji, label, value, sub, color, border }) => (
  <div className={`bg-white rounded-2xl p-4 shadow-sm border-t-4 ${border}`}>
    <div className="flex items-start justify-between mb-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <span className="text-lg">{emoji}</span>
    </div>
    <p className={`text-xl md:text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const hoy = new Date().toISOString().slice(0, 7);
  const [periodo, setPeriodo]   = useState(hoy);
  const [reporte, setReporte]   = useState(null);
  const [historial, setHistorial] = useState([]);
  const [deudas, setDeudas]     = useState({ total: 0, vencidas: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [rep, hist, deu] = await Promise.all([
          dashboardDB.getReporteMensual(periodo),
          dashboardDB.getHistorial(6),
          dashboardDB.getTotalDeudas()
        ]);
        setReporte(rep);
        setHistorial(hist);
        setDeudas(deu);
      } catch (e) {
        toast.error('Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [periodo]);

  const r = reporte || {};
  const ingresos    = parseFloat(r.ingresos_total || 0);
  const costos      = parseFloat(r.costo_materiales || 0)
                    + parseFloat(r.costo_herramientas || 0)
                    + parseFloat(r.costo_empaque || 0)
                    + parseFloat(r.costo_envio || 0)
                    + 64.58;
  const fijos       = parseFloat(r.gastos_fijos || 0);
  const variables   = parseFloat(r.gastos_variables || 0);
  const neto        = ingresos - costos - fijos - variables;
  const netoPoz     = neto >= 0;
  const pulseras80  = parseInt(r.pulseras_equilibrio_80 || 0);
  const periodoLabel = (p) => {
    const [y, m] = p.split('-');
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${meses[parseInt(m)-1]} ${y}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/inventario-home" className="text-gray-600 bg-gray-100 p-2 rounded-full hover:bg-gray-200">
            <FaArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-indigo-600" /> Reporte Financiero
            </h1>
          </div>
        </div>
        <input type="month" value={periodo}
          onChange={e => setPeriodo(e.target.value)}
          className="p-2 rounded-xl border border-gray-200 text-sm font-bold
                     text-gray-700 focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto">

        {/* Alerta deudas */}
        {deudas.total > 0 && (
          <Link to="/gastos"
            className={`block bg-red-50 border border-red-200 rounded-2xl p-4
              ${deudas.vencidas > 0 ? 'animate-pulse' : ''}`}>
            <p className="text-sm font-bold text-red-700">
              ⚠️ Deudas pendientes: {fmt(deudas.total)}
            </p>
            <p className="text-xs text-red-400 mt-1">
              {deudas.vencidas > 0
                ? `${deudas.vencidas} vencida(s) — toca para gestionar`
                : 'Toca para ver detalle'}
            </p>
          </Link>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KPICard emoji="💰" label="Ingresos" value={fmtK(ingresos)}
                sub={`${r.num_pedidos || 0} pedidos`}
                color="text-green-600" border="border-green-500" />
              <KPICard emoji="🔨" label="Costos" value={fmtK(costos)}
                sub="materiales + operación"
                color="text-orange-500" border="border-orange-400" />
              <KPICard emoji="🏪" label="Gastos Fijos" value={fmtK(fijos)}
                sub="alquiler + servicios"
                color="text-red-500" border="border-red-400" />
              <KPICard emoji="📊" label="Resultado Neto" value={fmtK(neto)}
                sub={netoPoz ? 'ganancia del mes' : '⚠️ pérdida del mes'}
                color={netoPoz ? 'text-green-600' : 'text-red-600'}
                border={netoPoz ? 'border-green-500' : 'border-red-500'} />
            </div>

            {/* Desglose */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                Detalle del Mes — {periodoLabel(periodo)}
              </p>
              {[
                { label: '🌐 Ventas Internet', val: r.ventas_internet, color: 'text-green-600' },
                { label: '🏪 Ventas Tienda/WA', val: r.ventas_tienda, color: 'text-green-600' },
                null,
                { label: '🔩 Materiales', val: -(r.costo_materiales||0), color: 'text-red-500' },
                { label: '🔧 Herramientas', val: -(r.costo_herramientas||0), color: 'text-red-500' },
                { label: '📦 Empaque + Envío', val: -((parseFloat(r.costo_empaque||0)+parseFloat(r.costo_envio||0))), color: 'text-red-500' },
                { label: '⚡ Gas + Luz + Abrasivos', val: -64.58, color: 'text-gray-400', small: true },
                null,
                { label: '🏠 Gastos Fijos', val: -(r.gastos_fijos||0), color: 'text-red-500' },
                { label: '📋 Gastos Variables', val: -(r.gastos_variables||0), color: 'text-red-500' },
              ].map((item, i) => item === null ? (
                <div key={i} className="border-t border-gray-100 my-2" />
              ) : (
                <div key={i} className={`flex justify-between items-center py-1.5
                  ${item.small ? 'opacity-60' : ''}`}>
                  <span className={`text-sm ${item.small ? 'text-xs' : ''} text-gray-600`}>
                    {item.label}
                  </span>
                  <span className={`font-semibold text-sm ${item.color}`}>
                    {parseFloat(item.val||0) >= 0 ? '' : ''}{fmt(Math.abs(item.val||0))}
                  </span>
                </div>
              ))}
              <div className="border-t-2 border-gray-200 mt-3 pt-3 flex justify-between items-center">
                <span className="font-bold text-base text-gray-800">RESULTADO NETO</span>
                <span className={`font-bold text-xl ${netoPoz ? 'text-green-600' : 'text-red-600'}`}>
                  {fmt(neto)}
                </span>
              </div>
            </div>

            {/* Punto de equilibrio */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-blue-700 mb-2">📈 Punto de Equilibrio</p>
              {netoPoz ? (
                <p className="text-sm text-green-700 font-semibold">
                  ✅ Ya superaste el punto de equilibrio este mes
                </p>
              ) : (
                <>
                  <p className="text-sm text-blue-700">
                    Necesitas vender al menos{' '}
                    <span className="font-bold text-2xl text-blue-900">{pulseras80}</span>
                    {' '}pulseras de cobre a S/80 para cubrir gastos fijos.
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Meta semanal: {Math.ceil(pulseras80 / 4)} pulseras/semana
                  </p>
                </>
              )}
            </div>

            {/* Historial */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                Últimos 6 Meses
              </p>
              <div className="space-y-2 md:hidden">
                {historial.map(h => {
                  const hn = parseFloat(h.resultado_neto || 0);
                  return (
                    <div key={h.periodo}
                      className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-700">{periodoLabel(h.periodo)}</p>
                        <p className="text-xs text-gray-400">
                          Ingresos: {fmt(h.ingresos_total)} · {h.piezas_producidas} piezas
                        </p>
                      </div>
                      <span className={`font-bold text-base ${hn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {fmt(hn)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Tabla desktop */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      {['Período','Ingresos','Costos','Gastos Fijos','Neto','Piezas'].map(h => (
                        <th key={h} className="text-right first:text-left px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map(h => {
                      const hn = parseFloat(h.resultado_neto || 0);
                      return (
                        <tr key={h.periodo} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{periodoLabel(h.periodo)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{fmt(h.ingresos_total)}</td>
                          <td className="px-4 py-3 text-right text-orange-500">
                            {fmt(parseFloat(h.costo_materiales||0)+parseFloat(h.costo_herramientas||0))}
                          </td>
                          <td className="px-4 py-3 text-right text-red-500">{fmt(h.gastos_fijos)}</td>
                          <td className={`px-4 py-3 text-right font-bold ${hn>=0?'text-green-600':'text-red-600'}`}>
                            {fmt(hn)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{h.piezas_producidas}</td>
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
