import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaCalendarAlt, FaChartLine, FaShoppingBag, FaMoneyBillWave } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportePedidos = () => {
    const [loading, setLoading] = useState(false);
    const [pedidos, setPedidos] = useState([]);
    const [stats, setStats] = useState({ totalVentas: 0, cantidadPedidos: 0, ticketPromedio: 0 });

    // Filtros
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [fechaInicio, setFechaInicio] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(today.toISOString().split('T')[0]);
    const [estadoFiltro, setEstadoFiltro] = useState('todos'); // todos, pagados (no cancelados), pendientes

    useEffect(() => {
        fetchReportData();
    }, [fechaInicio, fechaFin, estadoFiltro]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('pedidos')
                .select(`
                    id_pedido,
                    fecha_pedido,
                    nombre_cliente,
                    precio_total,
                    cancelado,
                    monto_pagado,
                    monto_saldo
                `)
                .gte('fecha_pedido', fechaInicio)
                .lte('fecha_pedido', fechaFin)
                .order('fecha_pedido', { ascending: false });

            // Aplicar filtros de estado
            // Nota: En tu lógica actual, 'cancelado' true significa anulado/cancelado.
            // Si quieres ver "Ventas Reales", filtrarías cancelado = false.
            if (estadoFiltro === 'validos') {
                query = query.eq('cancelado', false);
            } else if (estadoFiltro === 'cancelados') {
                query = query.eq('cancelado', true);
            }

            const { data, error } = await query;

            if (error) throw error;

            setPedidos(data || []);
            calcularEstadisticas(data || []);

        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const calcularEstadisticas = (data) => {
        // Filtrar solo los válidos para las sumas, a menos que el filtro sea explícito de cancelados
        const pedidosValidos = estadoFiltro === 'cancelados' ? data : data.filter(p => !p.cancelado);

        const total = pedidosValidos.reduce((acc, curr) => acc + curr.precio_total, 0);
        const cantidad = pedidosValidos.length;
        const promedio = cantidad > 0 ? total / cantidad : 0;

        setStats({
            totalVentas: total,
            cantidadPedidos: cantidad,
            ticketPromedio: promedio
        });
    };

    const generarPDF = () => {
        const doc = new jsPDF();

        // Encabezado
        doc.setFontSize(18);
        doc.text('Reporte de Pedidos - Enigma Artesanías', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 14, 30);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 36);

        // Resumen
        doc.autoTable({
            startY: 45,
            head: [['Ventas Totales', 'Nro. Pedidos', 'Ticket Promedio']],
            body: [[
                `S/ ${stats.totalVentas.toFixed(2)}`,
                stats.cantidadPedidos,
                `S/ ${stats.ticketPromedio.toFixed(2)}`
            ]],
            theme: 'plain',
            styles: { fontSize: 12, halign: 'center' }
        });

        // Tabla Detallada
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Fecha', 'Pedido #', 'Cliente', 'Estado', 'Total']],
            body: pedidos.map(p => [
                new Date(p.fecha_pedido).toLocaleDateString(),
                p.id_pedido,
                p.nombre_cliente,
                p.cancelado ? 'CANCELADO' : (p.monto_saldo <= 0.1 ? 'Pagado' : 'Pendiente'),
                `S/ ${p.precio_total.toFixed(2)}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 9 }
        });

        doc.save(`reporte_ventas_${fechaInicio}_${fechaFin}.pdf`);
    };

    // Datos para gráfico (agrupar por fecha)
    const chartData = pedidos.reduce((acc, curr) => {
        if (!curr.cancelado) {
            const fecha = new Date(curr.fecha_pedido).toLocaleDateString().slice(0, 5); // dd/mm
            const existing = acc.find(item => item.fecha === fecha);
            if (existing) {
                existing.ventas += curr.precio_total;
            } else {
                acc.push({ fecha, ventas: curr.precio_total });
            }
        }
        return acc;
    }, []).reverse();

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                            <FaArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Ventas</h1>
                    </div>
                    <button
                        onClick={generarPDF}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center transition-colors shadow-sm"
                    >
                        <FaFilePdf className="mr-2" /> Exportar PDF
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
                        <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="todos">Todos los Pedidos</option>
                            <option value="validos">Solo Ventas Válidas</option>
                            <option value="cancelados">Solo Cancelados</option>
                        </select>
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() - 7);
                                setFechaInicio(d.toISOString().split('T')[0]);
                                setFechaFin(new Date().toISOString().split('T')[0]);
                            }}
                            className="text-xs text-blue-600 hover:underline px-2"
                        >
                            Últimos 7 días
                        </button>
                        <button
                            onClick={() => {
                                const d = new Date();
                                const first = new Date(d.getFullYear(), d.getMonth(), 1);
                                setFechaInicio(first.toISOString().split('T')[0]);
                                setFechaFin(new Date().toISOString().split('T')[0]);
                            }}
                            className="text-xs text-blue-600 hover:underline px-2"
                        >
                            Este Mes
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase">Ventas Totales</p>
                                <p className="text-2xl font-bold text-gray-800">S/ {stats.totalVentas.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaMoneyBillWave className="text-blue-600 h-6 w-6" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase">Pedidos</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.cantidadPedidos}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <FaShoppingBag className="text-green-600 h-6 w-6" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium uppercase">Ticket Promedio</p>
                                <p className="text-2xl font-bold text-gray-800">S/ {stats.ticketPromedio.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FaChartLine className="text-purple-600 h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráfico y Tabla */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gráfico */}
                    <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-3">
                        <h3 className="font-bold text-gray-700 mb-4">Evolución de Ventas</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fecha" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Ventas']} />
                                    <Line type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tabla Detallada */}
                    <div className="bg-white rounded-lg shadow-sm lg:col-span-3 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700">Detalle de Pedidos</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Pedido #</th>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3 text-center">Estado</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {pedidos.length > 0 ? (
                                        pedidos.map((pedido) => (
                                            <tr key={pedido.id_pedido} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-mono text-gray-500">#{pedido.id_pedido}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{pedido.nombre_cliente}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {pedido.cancelado ? (
                                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                            Cancelado
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pedido.monto_saldo <= 0.1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {pedido.monto_saldo <= 0.1 ? 'Pagado' : 'Saldo Pendiente'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    S/ {pedido.precio_total.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                                No se encontraron resultados para este período.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportePedidos;
