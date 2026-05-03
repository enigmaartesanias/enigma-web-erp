import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { produccionDB } from '../../../utils/produccionNeonClient';
import {
    FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaBox,
    FaDollarSign, FaWarehouse, FaEye, FaCalendarAlt, FaTimes,
    FaHammer, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import QRCode from 'react-qr-code';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';
import StockIngressModal from '../components/StockIngressModal';

export default function Inventario() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [pendientes, setPendientes] = useState([]);
    const [loadingPendientes, setLoadingPendientes] = useState(true);
    const [pendientesExpanded, setPendientesExpanded] = useState(true);
    const [selectedPendiente, setSelectedPendiente] = useState(null);
    const [showStockIngressModal, setShowStockIngressModal] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', icon: null, confirmText: '', confirmColor: 'blue', onConfirm: () => { }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setLoadingPendientes(true);
        try {
            const [prodData, pendData] = await Promise.all([
                productosExternosDB.getAllConsolidated(),
                produccionDB.getPendientesInventario()
            ]);
            setProductos(prodData);
            setPendientes(pendData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
            setLoadingPendientes(false);
        }
    };

    const handleIngresar = (item) => {
        setSelectedPendiente(item);
        setShowStockIngressModal(true);
    };

    const handleIngresarSuccess = async () => {
        try {
            await produccionDB.marcarIngresadoInventario(selectedPendiente.id_produccion);
            setShowStockIngressModal(false);
            setSelectedPendiente(null);
            toast.success('✅ Producto ingresado al inventario correctamente');
            loadData();
        } catch (error) {
            toast.error("Error al procesar el ingreso");
        }
    };

    const handleDelete = (id, nombre) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Producto',
            message: `¿Estás seguro de eliminar "${nombre}" del inventario?`,
            icon: <FaTrash />,
            confirmText: 'Sí, eliminar',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await productosExternosDB.delete(id);
                    toast.success('Producto eliminado del inventario');
                    await loadData();
                } catch (error) {
                    console.error('Error eliminando:', error);
                    toast.error('Error al eliminar producto', { duration: 4000 });
                }
            }
        });
    };

    // --- AQUÍ ESTÁ LA CORRECCIÓN DEL FILTRO ---
    const filteredProductos = productos.filter(p => {
        const matchesSearch =
            (p.nombre && p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.codigo_usuario && p.codigo_usuario.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = !selectedCategory ||
            (p.categoria && p.categoria.toUpperCase() === selectedCategory.toUpperCase());

        return matchesSearch && matchesCategory;
    });

    // --- AQUÍ ESTÁ LA CORRECCIÓN DE LA LISTA DE CATEGORÍAS (SIN DUPLICADOS) ---
    const categorias = [...new Set(
        productos
            .map(p => p.categoria ? p.categoria.toUpperCase() : '')
            .filter(Boolean)
    )].sort();

    const stats = {
        total: filteredProductos.length,
        valorTotal: filteredProductos.reduce((sum, p) => sum + (p.stock_actual * (p.precio || 0)), 0),
        stockBajo: filteredProductos.filter(p => p.stock_actual <= (p.stock_minimo || 0)).length,
        ultimoIngreso: productos.length > 0
            ? new Date(Math.max(...productos.map(p => new Date(p.fecha_registro || p.created_at).getTime()))).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })
            : '-'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-gray-100 text-gray-900 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
                    <div className="flex justify-between items-center mb-4">
                        <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                            <FaArrowLeft className="mr-2" />
                            <span className="font-semibold text-sm">Enigma Sistema ERP</span>
                        </Link>
                        <button
                            onClick={() => navigate('/inventario/nuevo')}
                            className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center hover:bg-slate-700 transition-all shadow-sm"
                        >
                            <FaPlus className="mr-1.5" size={10} />
                            Nuevo Producto
                        </button>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center text-gray-800">
                        <FaBox className="mr-3 text-blue-600" />
                        Reporte de Inventario
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">

                {/* ── SECCIÓN PENDIENTES DE PRODUCCIÓN (MINIMALISTA) ── */}
                {!loadingPendientes && pendientes.length > 0 && (
                    <div className="mb-6 bg-amber-50/30 border border-amber-100 rounded-xl overflow-hidden transition-all duration-300">
                        {/* Header Compacto */}
                        <button
                            onClick={() => setPendientesExpanded(!pendientesExpanded)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <FaHammer className="text-amber-500" size={12} />
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-medium text-amber-800 uppercase tracking-[0.1em]">
                                        Pendientes de Taller
                                    </span>
                                    <span className="text-[10px] text-amber-500/80 font-normal">
                                        ({pendientes.length})
                                    </span>
                                </div>
                            </div>
                            {pendientesExpanded
                                ? <FaChevronUp size={10} className="text-amber-300" />
                                : <FaChevronDown size={10} className="text-amber-300" />
                            }
                        </button>

                        {/* Lista de pendientes Compacta */}
                        {pendientesExpanded && (
                            <div className="divide-y divide-amber-100/50 bg-white/40">
                                {pendientes.map((item) => (
                                    <div key={item.id_produccion} className="flex items-center justify-between px-4 py-3 sm:py-2.5">
                                        <div className="flex items-center gap-3">
                                            {/* Imagen o Icono pequeño */}
                                            <div className="w-8 h-8 rounded-lg bg-white border border-amber-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {item.imagen_url ? (
                                                    <img src={item.imagen_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaBox className="text-amber-100" size={14} />
                                                )}
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-700 leading-none mb-1">
                                                    {item.nombre_producto || `${item.tipo_producto} ${item.metal}`}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-normal uppercase tracking-tight">
                                                    {item.cantidad}u · Costo: S/ {parseFloat(item.costo_total_unitario || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botón Minimalista */}
                                        <button
                                            onClick={() => handleIngresar(item)}
                                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-medium rounded-lg shadow-sm shadow-amber-100 transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap"
                                        >
                                            INGRESAR
                                            <span className="text-[8px] opacity-70">→</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Cards (Manteniendo tu estructura) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-blue-500">
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Total</p>
                        <p className="text-sm sm:text-lg text-gray-900 font-bold">{stats.total}</p>
                    </div>

                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-green-500">
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Valor Stock</p>
                        <p className="text-xs sm:text-lg text-gray-900 font-bold">S/ {stats.valorTotal.toFixed(2)}</p>
                    </div>

                    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border-l-2 sm:border-l-4 border-orange-500">
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">Último Ingreso</p>
                        <p className="text-sm sm:text-lg text-gray-900 font-bold">{stats.ultimoIngreso}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando productos...</div>
                    ) : filteredProductos.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No se encontraron productos.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">Cód. Usuario</th>
                                    <th className="px-4 py-3 text-center">Origen</th>
                                    <th className="px-4 py-3 text-left">Producto</th>
                                    <th className="px-4 py-3 text-center">Stock</th>
                                    <th className="px-4 py-3 text-right">Costo (S/)</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProductos.map((producto) => (
                                    <tr key={producto.id} className="hover:bg-gray-50 transition-colors text-sm">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{producto.codigo_usuario}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">{producto.origen}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-700 font-medium uppercase">{producto.categoria}</div>
                                            <div className="text-[10px] text-gray-400 italic">{producto.material}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-green-600">{producto.stock_actual}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">S/ {Number(producto.costo).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                                            <button onClick={() => navigate(`/inventario/editar/${producto.id}`)} className="text-gray-400 hover:text-blue-600 p-2"><FaEdit /></button>
                                            <button onClick={() => handleDelete(producto.id, producto.nombre)} className="text-gray-400 hover:text-red-600 p-2"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL DE INGRESO DESDE TALLER */}
            {showStockIngressModal && selectedPendiente && (
                <StockIngressModal
                    item={selectedPendiente}
                    onSuccess={handleIngresarSuccess}
                    onCancel={() => { setShowStockIngressModal(false); setSelectedPendiente(null); }}
                />
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
}