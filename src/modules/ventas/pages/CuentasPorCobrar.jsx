import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
                <div className="max-w-7xl mx-auto flex flex-col gap-2">
                    <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                        <FaArrowLeft className="mr-2" size={14} />
                        <span className="font-semibold text-sm">Enigma Sistema ERP</span>
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
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
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cliente / Ref</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                                    <th className="px-3 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-32">Progreso de Pago</th>
                                    <th className="px-3 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Saldo Pendiente</th>
                                    <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
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
                                        const porcentajePago = Math.min(100, (cuenta.a_cuenta / cuenta.total) * 100);

                                        return (
                                            <tr
                                                key={cuenta.id}
                                                className={`hover:bg-gray-50 transition-colors ${vencida ? 'bg-red-50/30' : ''}`}
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-gray-900 truncate max-w-[150px]">{cuenta.cliente_nombre}</span>
                                                        <span className="text-[9px] font-mono text-gray-400">{cuenta.codigo_cuenta}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className={`text-[10px] font-medium ${vencida ? 'text-red-600' : 'text-gray-700'}`}>
                                                        {format(new Date(cuenta.fecha_vencimiento), 'dd MMM yyyy', { locale: es })}
                                                    </div>
                                                    {cuenta.estado === 'PENDIENTE' && (
                                                        <div className={`text-[9px] ${dias < 0 ? 'font-bold text-red-500' : 'text-gray-400'}`}>
                                                            {dias < 0 ? `Atrasado ${Math.abs(dias)}d` : `En ${dias} días`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-right font-mono text-[11px] text-gray-600">
                                                    S/ {cuenta.total.toFixed(2)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${porcentajePago === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                                style={{ width: `${porcentajePago}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-gray-500">{porcentajePago.toFixed(0)}% pagado</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <div className={`text-[12px] font-black ${cuenta.saldo_deudor > 0 ? 'text-amber-700' : 'text-green-600'}`}>
                                                        S/ {cuenta.saldo_deudor.toFixed(2)}
                                                    </div>
                                                    {cuenta.a_cuenta > 0 && cuenta.saldo_deudor > 0 && (
                                                        <div className="text-[9px] text-gray-400">Abonado: S/ {cuenta.a_cuenta.toFixed(2)}</div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    {cuenta.estado === 'PENDIENTE' ? (
                                                        <button
                                                            onClick={() => handleRegistrarPago(cuenta)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm text-[10px] font-bold uppercase tracking-wider"
                                                        >
                                                            <FaMoneyBillWave size={12} />
                                                            Cobrar
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center justify-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                            Liquidado
                                                        </span>
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
            </div >
        </div >
    );
};

export default CuentasPorCobrar;
