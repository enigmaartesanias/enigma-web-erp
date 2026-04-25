import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaClipboardList, FaWallet } from 'react-icons/fa';
import GastosFijos from '../components/GastosFijos';
import GastosVariables from '../components/GastosVariables';
import DeudasPanel from '../components/DeudasPanel';
import { gastosDB } from '../../../utils/gastosNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import toast, { Toaster } from 'react-hot-toast';

const Gastos = () => {
    // Calcular periodo actual por defecto (YYYY-MM)
    const [periodo, setPeriodo] = useState(getLocalDate().substring(0, 7));
    const [activeTab, setActiveTab] = useState('FIJO');
    const [gastos, setGastos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGastos = async () => {
        setLoading(true);
        try {
            const data = await gastosDB.getByPeriodo(periodo);
            setGastos(data);
        } catch (error) {
            console.error('Error cargando gastos:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGastos();
        // Check window search URL for tab param
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') === 'deudas') {
            setActiveTab('DEUDAS');
        }
    }, [periodo]);

    const gastosFijos = gastos.filter(g => g.tipo_gasto === 'FIJO');
    const gastosVariables = gastos.filter(g => g.tipo_gasto === 'VARIABLE');

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-6 font-sans">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto">
                {/* Header Compacto */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link to="/inventario-home" className="text-gray-500 hover:text-gray-800 transition-colors">
                            <FaArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Control de Gastos</h1>
                            <p className="text-xs text-gray-500">Gestión de compromisos y caja chica</p>
                        </div>
                    </div>

                    {/* Selector de Periodo */}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600">Periodo:</span>
                        <input
                            type="month"
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value)}
                            className="text-sm font-bold text-gray-800 border-none focus:ring-0 bg-transparent cursor-pointer p-0"
                        />
                    </div>
                </div>

                {/* Tabs de Navegación Estilo iOS Segmented Control */}
                <div className="flex p-1 bg-gray-200 rounded-xl mb-6 w-full max-w-full overflow-x-auto gap-1 md:gap-0 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('FIJO')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 md:px-4 text-center rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap
                            ${activeTab === 'FIJO'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <FaClipboardList className="hidden md:block" />
                        <span className="md:hidden">Compromisos</span>
                        <span className="hidden md:inline">Compromisos Mensuales</span>
                        <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]">
                            {gastosFijos.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('VARIABLE')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 md:px-4 text-center rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap
                            ${activeTab === 'VARIABLE'
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <FaWallet className="hidden md:block" />
                        <span className="md:hidden">Variables</span>
                        <span className="hidden md:inline">Gastos Variables</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('DEUDAS')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 md:px-4 text-center rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap
                            ${activeTab === 'DEUDAS'
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <FaClipboardList className="hidden md:block" />
                        <span className="md:hidden">Deudas/Prést.</span>
                        <span className="hidden md:inline">Deudas y Préstamos</span>
                    </button>
                </div>

                {/* Contenido Principal */}
                <div className="animate-fadeIn">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'FIJO' ? (
                                <GastosFijos
                                    gastos={gastosFijos}
                                    periodo={periodo}
                                    onRefresh={fetchGastos}
                                />
                            ) : activeTab === 'VARIABLE' ? (
                                <GastosVariables
                                    gastos={gastosVariables}
                                    periodo={periodo}
                                    onRefresh={fetchGastos}
                                />
                            ) : (
                                <DeudasPanel />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gastos;
