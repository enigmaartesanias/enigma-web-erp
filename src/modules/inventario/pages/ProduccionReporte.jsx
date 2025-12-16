import React, { useState, useEffect } from 'react';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';

const ProduccionReporte = () => {
    const [produccion, setProduccion] = useState([]);
    const [stats, setStats] = useState({
        total_registros: 0,
        pendientes: 0,
        en_proceso: 0,
        terminados: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await produccionDB.getAll();
            const statsData = await produccionDB.getStats();
            setProduccion(data || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Volver</span>
                </Link>
                <h1 className="text-2xl font-light text-gray-800">📊 Reporte de Producción</h1>
            </div>

            {/* Métricas (Movidias desde Produccion.jsx) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.total_registros}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">En Proceso</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.en_proceso}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Terminados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.terminados}</p>
                </div>
            </div>

            {/* Tabla Detallada */}
            <div className="bg-white shadow-lg rounded-lg p-6 overflow-hidden">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <FaFileInvoiceDollar className="text-blue-600" />
                    Detalle de Costos y Precios
                </h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Pedido (Total)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Prod. (Sin Envío)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margen Est.</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {produccion.map((item) => {
                                const precioPedido = item.precio_venta_pedido || 0;
                                // Nota: item.precio_total suele incluir envío si no está desglosado, pero intentaremos usar el sin IGV si está disponible o el total.
                                // Idealmente v_produccion_con_precios debería tener estos campos. Si no, saldrá 0.

                                const costoProduccion = item.costo_total_produccion || 0;
                                const esPedido = item.tipo_produccion === 'PEDIDO';
                                const margen = esPedido ? (precioPedido - costoProduccion) : 0;

                                return (
                                    <tr key={item.id_produccion} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {item.fecha_produccion || new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="font-medium">{item.nombre_producto}</div>
                                            {item.nombre_cliente && (
                                                <div className="text-xs text-gray-500">Cliente: {item.nombre_cliente}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full ${item.tipo_produccion === 'PEDIDO' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {item.tipo_produccion}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                            {esPedido ? `S/ ${parseFloat(precioPedido).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                                            S/ {parseFloat(costoProduccion).toFixed(2)}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-sm font-bold ${margen > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {esPedido ? `S/ ${margen.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold capitalize ${item.estado_produccion === 'terminado' ? 'bg-green-100 text-green-800' :
                                                    item.estado_produccion === 'en_proceso' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {item.estado_produccion?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProduccionReporte;
