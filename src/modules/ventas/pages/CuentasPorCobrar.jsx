import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cuentasPorCobrarDB } from '../../../utils/cuentasPorCobrarClient';
import ModalRegistrarPago from '../components/ModalRegistrarPago';
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import { format, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';

const CuentasPorCobrar = () => {
    const navigate = useNavigate();
    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('TODOS'); // TODOS, PENDIENTE, CANCELADO
    const [filtroVencidas, setFiltroVencidas] = useState(false);
    const [resumen, setResumen] = useState({ totalPendiente: 0, totalCuentas: 0, cuentasVencidas: 0 });

    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
    const [showModalPago, setShowModalPago] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cuentasData, resumenData] = await Promise.all([
                cuentasPorCobrarDB.getAll(),
                cuentasPorCobrarDB.getResumen()
            ]);
            setCuentas(cuentasData);
            setResumen(resumenData);
        } catch (error) {
            console.error('Error cargando cuentas:', error);
            toast.error('Error al cargar cuentas por cobrar');
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarPago = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setShowModalPago(true);
    };

    const handleConfirmarPago = async (datosPago) => {
        try {
            await cuentasPorCobrarDB.registrarPago(
                datosPago.cuenta_id,
                datosPago.monto,
                datosPago.metodo_pago,
                datosPago.observaciones
            );
            toast.success('Pago registrado correctamente', { icon: '✅' });
            loadData();
        } catch (error) {
            console.error('Error registrando pago:', error);
            toast.error('Error al registrar el pago');
        }
    };

    // Filtrar cuentas
    const cuentasFiltradas = cuentas.filter(cuenta => {
        if (filtroEstado !== 'TODOS' && cuenta.estado !== filtroEstado) return false;
        if (filtroVencidas) {
            const fechaVencimiento = new Date(cuenta.fecha_vencimiento);
            if (!isPast(fechaVencimiento) || cuenta.estado === 'CANCELADO') return false;
        }
        return true;
    });

    const esVencida = (cuenta) => {
        if (cuenta.estado === 'CANCELADO') return false;
        const fechaVencimiento = new Date(cuenta.fecha_vencimiento);
        return isPast(fechaVencimiento);
    };

    const diasParaVencer = (cuenta) => {
        if (cuenta.estado === 'CANCELADO') return null;
        const fechaVencimiento = new Date(cuenta.fecha_vencimiento);
        return differenceInDays(fechaVencimiento, new Date());
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster />

            {/* Modal Registrar Pago */}
            <ModalRegistrarPago
                isOpen={showModalPago}
                onClose={() => setShowModalPago(false)}
                cuenta={cuentaSeleccionada}
                onConfirmar={handleConfirmarPago}
            />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/inventario-home')}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <FaArrowLeft size={18} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaCreditCard className="text-blue-600" />
                                Cuentas por Cobrar
                            </h1>
                            <p className="text-xs text-gray-500">Gestión de créditos y pagos</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Total Pendiente</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            S/ {resumen.totalPendiente.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Cuentas Activas</p>
                        <p className="text-2xl font-bold text-blue-600">{resumen.totalCuentas}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Cuentas Vencidas</p>
                        <p className="text-2xl font-bold text-red-600">{resumen.cuentasVencidas}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Estado:</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="TODOS">Todos</option>
                                <option value="PENDIENTE">Pendientes</option>
                                <option value="CANCELADO">Cancelados</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filtroVencidas}
                                onChange={(e) => setFiltroVencidas(e.target.checked)}
                                className="rounded border-gray-300 focus:ring-2 focus:ring-red-500"
                            />
                            Solo vencidas
                        </label>
                        <div className="ml-auto text-sm text-gray-600">
                            Mostrando {cuentasFiltradas.length} de {cuentas.length} cuentas
                        </div>
                    </div>
                </div>

                {/* Tabla de Cuentas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Código</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Detalle</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">A Cuenta</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Saldo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Vencimiento</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Estado</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {cuentasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                                            No hay cuentas por cobrar
                                        </td>
                                    </tr>
                                ) : (
                                    cuentasFiltradas.map(cuenta => {
                                        const vencida = esVencida(cuenta);
                                        const dias = diasParaVencer(cuenta);

                                        return (
                                            <tr
                                                key={cuenta.id}
                                                className={`hover:bg-gray-50 ${vencida ? 'bg-red-50' : ''}`}
                                            >
                                                <td className="px-4 py-3 text-xs font-mono text-gray-800">
                                                    {cuenta.codigo_cuenta}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600">
                                                    {format(new Date(cuenta.fecha_registro), 'dd/MM/yyyy', { locale: es })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-medium text-gray-800">{cuenta.cliente_nombre}</div>
                                                    {cuenta.cliente_documento && (
                                                        <div className="text-xs text-gray-500">{cuenta.cliente_documento}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                                                    {cuenta.detalle_productos && cuenta.detalle_productos.length > 0 ? (
                                                        cuenta.detalle_productos.map(p => p.nombre).join(', ')
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right font-mono text-gray-800">
                                                    S/ {cuenta.total.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right font-mono text-green-700">
                                                    S/ {cuenta.a_cuenta.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-yellow-800">
                                                    S/ {cuenta.saldo_deudor.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600">
                                                    <div>{format(new Date(cuenta.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}</div>
                                                    {dias !== null && cuenta.estado === 'PENDIENTE' && (
                                                        <div className={`text-xs ${dias < 0 ? 'text-red-600' : dias <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                            {dias < 0 ? `Vencido (${Math.abs(dias)}d)` : `Faltan ${dias}d`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {cuenta.estado === 'PENDIENTE' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                            {vencida && <FaExclamationTriangle size={10} />}
                                                            Pendiente
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                            ✓ Cancelado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {cuenta.estado === 'PENDIENTE' && (
                                                        <button
                                                            onClick={() => handleRegistrarPago(cuenta)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                                                        >
                                                            <FaMoneyBillWave size={12} />
                                                            Pagar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuentasPorCobrar;
