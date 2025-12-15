import React, { useState, useEffect } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaChartLine, FaMoneyBillWave, FaUserTie, FaBoxOpen, FaExclamationCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportePedidos = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        ventasBrutas: 0,
        ventasNetas: 0,
        cuentasPorCobrar: 0,
        cantidadPedidos: 0,
        ticketPromedio: 0
    });
    const [topProductos, setTopProductos] = useState([]);
    const [topClientes, setTopClientes] = useState([]);
    const [chartData, setChartData] = useState([]);

    // Filtros - Por defecto mostrar TODOS los pedidos
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    useEffect(() => {
        fetchReportData();
    }, [fechaInicio, fechaFin]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Obtener todos los pedidos con detalles desde Neon DB
            const allPedidos = await pedidosDB.getAll();
            console.log('📊 Total pedidos en Neon:', allPedidos.length);
            console.log('📅 Rango de fechas:', { fechaInicio, fechaFin });

            // Mostrar fechas de los primeros pedidos para depuración
            if (allPedidos.length > 0) {
                console.log('🗓️ Fechas de pedidos en DB:', allPedidos.slice(0, 3).map(p => ({
                    id: p.id_pedido,
                    fecha: p.fecha_pedido,
                    cliente: p.nombre_cliente
                })));
            }

            // Filtrar por rango de fechas solo si hay fechas válidas
            let data = allPedidos;

            if (fechaInicio && fechaFin) {
                data = allPedidos.filter(p => {
                    if (!p.fecha_pedido) return false;
                    const fechaPedido = p.fecha_pedido;
                    const enRango = fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
                    return enRango;
                });
            }

            console.log('✅ Pedidos filtrados por fecha:', data.length);
            console.log('📋 Muestra de pedidos:', data.slice(0, 2));

            // En este sistema 'cancelado' (true) significa PAGADO, no ANULADO.
            // Por lo tanto, debemos incluir TODOS los pedidos.
            const pedidosActivos = data;
            procesarDatos(pedidosActivos);

        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const procesarDatos = (pedidos) => {
        try {
            if (!Array.isArray(pedidos)) return;

            // 1. Métricas Financieras
            const ventasBrutas = pedidos.reduce((acc, p) => acc + (Number(p.precio_total) || 0), 0);

            // Ventas Netas = Pedidos cancelados (pagados 100%) SIN INCLUIR envío
            const ventasNetas = pedidos
                .filter(p => (p.monto_saldo || 0) <= 0.1)
                .reduce((acc, p) => {
                    const total = Number(p.precio_total) || 0;
                    const envio = Number(p.envio_cobrado_al_cliente) || 0;
                    return acc + (total - envio);
                }, 0);

            const cuentasPorCobrar = pedidos.reduce((acc, p) => acc + ((p.monto_saldo > 0) ? Number(p.monto_saldo) : 0), 0);

            const cantidad = pedidos.length;
            const promedio = cantidad > 0 ? ventasBrutas / cantidad : 0;

            setStats({
                ventasBrutas: ventasBrutas || 0,
                ventasNetas: ventasNetas || 0,
                cuentasPorCobrar: cuentasPorCobrar || 0,
                cantidadPedidos: cantidad,
                ticketPromedio: promedio || 0
            });

            // 2. Ranking Productos
            const productoMap = {};
            pedidos.forEach(p => {
                if (Array.isArray(p.detalles_pedido)) {
                    p.detalles_pedido.forEach(d => {
                        const nombre = d.nombre_producto || 'Desconocido';
                        if (!productoMap[nombre]) {
                            productoMap[nombre] = { nombre: nombre, cantidad: 0, ventas: 0 };
                        }
                        productoMap[nombre].cantidad += (Number(d.cantidad) || 0);
                        productoMap[nombre].ventas += (Number(d.subtotal) || (Number(d.cantidad) * Number(d.precio_unitario)) || 0);
                    });
                }
            });
            const rankingProductos = Object.values(productoMap)
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 5);
            setTopProductos(rankingProductos);

            // 3. Ranking Clientes
            const clienteMap = {};
            pedidos.forEach(p => {
                const nombreCliente = p.nombre_cliente || 'Cliente Anónimo';
                if (!clienteMap[nombreCliente]) {
                    clienteMap[nombreCliente] = { nombre: nombreCliente, pedidos: 0, total: 0 };
                }
                clienteMap[nombreCliente].pedidos += 1;
                clienteMap[nombreCliente].total += (Number(p.precio_total) || 0);
            });
            const rankingClientes = Object.values(clienteMap)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
            setTopClientes(rankingClientes);

            // 4. Gráfico Diario
            const dailyMap = {};
            pedidos.forEach(p => {
                if (p.fecha_pedido) {
                    try {
                        // Use slice(0, 5) of ISO string or locale string consistently
                        // let's use ISO date part "YYYY-MM-DD" then simpler format
                        const dateObj = new Date(p.fecha_pedido + 'T00:00:00'); // Ensure it treats as local date if just "YYYY-MM-DD"
                        const fecha = dateObj.toLocaleDateString(); // "dd/mm/yyyy" depending on locale

                        if (!dailyMap[fecha]) dailyMap[fecha] = 0;
                        dailyMap[fecha] += (Number(p.precio_total) || 0);
                    } catch (e) {
                        console.warn("Fecha inválida:", p.fecha_pedido);
                    }
                }
            });
            const chart = Object.keys(dailyMap).map(fecha => ({ fecha, ventas: dailyMap[fecha] }));
            setChartData(chart);
        } catch (error) {
            console.error("Error procesando datos:", error);
        }
    };

    const generarPDF = () => {
        const doc = new jsPDF();
        const azul = [41, 128, 185];
        const gris = [100, 100, 100];

        // Header
        doc.setFontSize(22);
        doc.setTextColor(...azul);
        doc.text('Reporte Gerencial de Ventas', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(...gris);
        doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 105, 28, { align: 'center' });

        // 1. Resumen Ejecutivo
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('1. Resumen Ejecutivo', 14, 40);
        doc.autoTable({
            startY: 45,
            head: [['Ventas Brutas', 'Cobrado (Neto)', 'Por Cobrar', 'Tickets']],
            body: [[
                `S/ ${stats.ventasBrutas.toFixed(2)}`,
                `S/ ${stats.ventasNetas.toFixed(2)}`,
                `S/ ${stats.cuentasPorCobrar.toFixed(2)}`,
                stats.cantidadPedidos
            ]],
            theme: 'striped',
            headStyles: { fillColor: azul }
        });

        // 2. Top Productos
        doc.text('2. Productos Más Vendidos', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Producto', 'Unidades Vendidas', 'Ingresos Generados']],
            body: topProductos.map(p => [p.nombre, p.cantidad, `S/ ${p.ventas.toFixed(2)}`]),
            theme: 'grid',
            headStyles: { fillColor: [39, 174, 96] } // Verde
        });

        // 3. Top Clientes
        doc.text('3. Mejores Clientes', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Cliente', 'Pedidos', 'Total Comprado']],
            body: topClientes.map(c => [c.nombre, c.pedidos, `S/ ${c.total.toFixed(2)}`]),
            theme: 'grid',
            headStyles: { fillColor: [142, 68, 173] } // Morado
        });

        doc.save(`Reporte_Gerencial_${fechaInicio}.pdf`);
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Nav */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-24 md:pt-6 space-y-4 md:space-y-0"> {/* Adjusted padding and responsive layout */}
                    <div className="flex items-center space-x-3">
                        <Link to="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
                            <FaArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">Dashboard de Reportes</h1>
                            <p className="text-xs text-gray-500">Métricas clave y rendimiento comercial</p>
                        </div>
                    </div>

                    {/* Filtros de Fecha */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-white p-2 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-1 w-full sm:w-auto">
                            <span className="text-xs text-gray-500 font-medium">Del</span>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                className="flex-1 sm:flex-none border-gray-300 rounded-md text-xs py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center space-x-1 w-full sm:w-auto">
                            <span className="text-xs text-gray-500 font-medium">Al</span>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                className="flex-1 sm:flex-none border-gray-300 rounded-md text-xs py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={generarPDF}
                            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-xs font-medium flex justify-center items-center transition-all"
                        >
                            <FaFilePdf className="mr-1.5" /> Descargar
                        </button>
                    </div>
                </div>

                {/* 1. KPIs Financieros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"> {/* Reduced gap */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ventas Brutas</p>
                                <h3 className="text-xl font-bold text-gray-800 mt-1">S/ {stats.ventasBrutas.toFixed(2)}</h3> {/* Smaller text */}
                            </div>
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <FaChartLine size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Total generado</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ventas Netas</p>
                                <h3 className="text-xl font-bold text-gray-800 mt-1">S/ {stats.ventasNetas.toFixed(2)}</h3>
                            </div>
                            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                <FaMoneyBillWave size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Pagado al 100%</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-red-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Por Cobrar</p>
                                <h3 className="text-xl font-bold text-gray-800 mt-1">S/ {stats.cuentasPorCobrar.toFixed(2)}</h3>
                            </div>
                            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                <FaExclamationCircle size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Saldos pendientes</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ticket Promedio</p>
                                <h3 className="text-xl font-bold text-gray-800 mt-1">S/ {stats.ticketPromedio.toFixed(2)}</h3>
                            </div>
                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                                <FaUserTie size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{stats.cantidadPedidos} pedidos</p>
                    </div>
                </div>

                {/* 2. Gráficos y Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Top Productos */}
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center">
                            <FaBoxOpen className="mr-2 text-blue-500" />
                            Top 5 Productos
                        </h3>
                        <div className="space-y-3">
                            {topProductos.map((prod, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center justify-start text-left"> {/* Justification left */}
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 mr-2">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-800">{prod.nombre}</p>
                                            <p className="text-[10px] text-gray-500">{prod.cantidad} unid.</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">S/ {prod.ventas.toFixed(2)}</span> {/* Unbolded amount */}
                                </div>
                            ))}
                            {topProductos.length === 0 && <p className="text-xs text-gray-400 italic">No hay datos.</p>}
                        </div>
                    </div>

                    {/* Top Clientes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center">
                            <FaUserTie className="mr-2 text-purple-500" />
                            Top 5 Mejores Clientes
                        </h3>
                        <div className="space-y-4">
                            {topClientes.map((cliente, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{cliente.nombre}</p>
                                        <p className="text-xs text-gray-500">{cliente.pedidos} pedidos realizados</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-purple-700">S/ {cliente.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                            {topClientes.length === 0 && <p className="text-sm text-gray-400 italic">No hay datos suficientes.</p>}
                        </div>
                    </div>
                </div>

                {/* Gráfico Visual */}
                <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Tendencia de Ventas (Diario)</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="fecha"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10} // Push labels down
                                    tick={{ fontSize: 10, fill: '#6b7280' }} // Smaller font for dates
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `S/${value}`}
                                    tick={{ fontSize: 10, fill: '#6b7280' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Ventas']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ventas"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportePedidos;
