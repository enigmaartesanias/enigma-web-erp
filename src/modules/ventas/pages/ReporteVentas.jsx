import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ventasDB } from '../../../utils/ventasClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { FaArrowLeft, FaCalendar, FaChartLine, FaDollarSign, FaFileInvoice, FaFilter, FaBan, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';

export default function ReporteVentas() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    useEffect(() => {
        loadVentas();
    }, []);

    const loadVentas = async () => {
        try {
            setLoading(true);
            const data = await ventasDB.getAll();
            setVentas(data);
        } catch (error) {
            console.error('Error cargando ventas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar por fechas
    const ventasFiltradas = ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha_venta);
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;

        if (inicio && fechaVenta < inicio) return false;
        if (fin && fechaVenta > fin) return false;
        return true;
    });

    // Calcular estadísticas
    const stats = {
        totalVentas: ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0),
        totalIGV: ventasFiltradas.reduce((sum, v) => sum + Number(v.impuesto_monto), 0),
        cantidadVentas: ventasFiltradas.length,
        promedioVenta: ventasFiltradas.length > 0
            ? ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0) / ventasFiltradas.length
            : 0
    };

    // Preparar datos para gráfico (agrupado por día)
    const ventasPorDia = ventasFiltradas.reduce((acc, venta) => {
        const fecha = new Date(venta.fecha_venta).toISOString().split('T')[0];
        if (!acc[fecha]) {
            acc[fecha] = { fecha, total: 0, cantidad: 0 };
        }
        acc[fecha].total += Number(venta.total);
        acc[fecha].cantidad += 1;
        return acc;
    }, {});

    const chartData = Object.values(ventasPorDia)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(d => ({
            fecha: new Date(d.fecha).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' }),
            total: Number(d.total.toFixed(2)),
            cantidad: d.cantidad
        }));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center mb-3">
                        <button
                            onClick={() => navigate('/inventario-home')}
                            className="flex items-center text-gray-600 hover:text-slate-700 transition-colors text-sm"
                        >
                            <FaArrowLeft className="mr-2" size={14} />
                            Volver al Panel
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-slate-700" />
                        Reporte de Ventas
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Análisis y seguimiento de ventas realizadas</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Ventas</p>
                                <p className="text-xl font-bold text-gray-900">S/ {stats.totalVentas.toFixed(2)}</p>
                            </div>
                            <FaDollarSign className="text-slate-700 text-2xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">IGV Acumulado</p>
                                <p className="text-xl font-bold text-gray-900">S/ {stats.totalIGV.toFixed(2)}</p>
                            </div>
                            <FaFileInvoice className="text-blue-500 text-2xl opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Cantidad</p>
                                <p className="text-xl font-bold text-gray-900">{stats.cantidadVentas}</p>
                            </div>
                            <div className="text-2xl opacity-50">📊</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Promedio</p>
                                <p className="text-xl font-bold text-gray-900">S/ {stats.promedioVenta.toFixed(2)}</p>
                            </div>
                            <div className="text-2xl opacity-50">📈</div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <FaFilter className="text-gray-500" />
                        <h2 className="text-sm font-semibold text-gray-700">Filtrar por Fecha</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setFechaInicio(''); setFechaFin(''); }}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gráfico */}
                {chartData.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Evolución de Ventas</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} stroke="#666" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                                <Tooltip
                                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    formatter={(value) => `S/ ${Number(value).toFixed(2)}`}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Line type="monotone" dataKey="total" stroke="#475569" strokeWidth={2} name="Total Ventas" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Tabla */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700">Detalle de Ventas</h2>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Cargando ventas...</div>
                    ) : ventasFiltradas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No hay ventas registradas en este periodo.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">IGV</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ventasFiltradas.map((venta) => (
                                        <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-600">{venta.codigo_venta}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {new Date(venta.fecha_venta).toLocaleString('es-PE', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">{venta.cliente_nombre}</td>
                                            <td className="px-4 py-3 text-right text-xs text-gray-700">S/ {Number(venta.subtotal).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-xs text-blue-600">
                                                {Number(venta.impuesto_monto) > 0 ? `S/ ${Number(venta.impuesto_monto).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-red-500">
                                                {Number(venta.descuento_monto) > 0 ? `- S/ ${Number(venta.descuento_monto).toFixed(2)}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                                                S/ {Number(venta.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
