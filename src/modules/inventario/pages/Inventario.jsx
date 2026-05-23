import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaBox, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StockIngressModal from '../components/StockIngressModal';

export default function Inventario() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [pendientes, setPendientes] = useState([]);
    const [pendientesExpanded, setPendientesExpanded] = useState(true);
    const [selectedPendiente, setSelectedPendiente] = useState(null);
    const [showStockIngressModal, setShowStockIngressModal] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', onConfirm: () => { }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
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
        }
    };

    const handleIngresar = (item) => {
        setSelectedPendiente(item);
        setShowStockIngressModal(true);
    };

    const handleIngresarSuccess = () => {
        setShowStockIngressModal(false);
        setSelectedPendiente(null);
        toast.success('✅ Producto ingresado al inventario');
        loadData();
    };

    const handleDelete = (id, nombre) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Producto',
            message: `¿Estás seguro de eliminar "${nombre}" del inventario?`,
            onConfirm: async () => {
                await productosExternosDB.delete(id);
                toast.success('Producto eliminado');
                loadData();
            }
        });
    };

    const filteredProductos = productos.filter(p => {
        const hasStock = p.stock_actual > 0;
        const matchesSearch =
            (p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.codigo_usuario?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = !selectedCategory || (p.categoria?.toUpperCase() === selectedCategory.toUpperCase());
        return hasStock && matchesSearch && matchesCategory;
    });

    const categorias = [...new Set(productos.map(p => p.categoria?.toUpperCase()).filter(Boolean))].sort();

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Toaster position="top-right" />

            {/* Topbar */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/inventario-home" className="flex items-center text-gray-600 text-sm font-semibold">
                        <FaArrowLeft className="mr-2" /> Volver
                    </Link>
                    <button
                        onClick={() => navigate('/inventario/nuevo')}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700"
                    >
                        <FaPlus className="inline mr-1" /> Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* Header - Reporte de Inventario */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <FaBox className="text-teal-700 text-xl" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                                Reporte de inventario
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Enigma Artesanías · stock activo
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                        Activo
                    </span>
                </div>

                {/* Producción Pendiente */}
                {!loading && pendientes.length > 0 && (
                    <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setPendientesExpanded(!pendientesExpanded)}
                            className="w-full flex items-center justify-between px-4 py-3 text-amber-800 text-xs font-bold uppercase"
                        >
                            Producción en Taller ({pendientes.length})
                            {pendientesExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        {pendientesExpanded && (
                            <div className="divide-y divide-amber-100 bg-white">
                                {pendientes.map(item => (
                                    <div key={item.id_produccion} className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs font-medium text-gray-700">{item.nombre_producto}</span>
                                        <button
                                            onClick={() => handleIngresar(item)}
                                            className="px-3 py-1 bg-amber-600 text-white text-[10px] rounded-lg"
                                        >
                                            INGRESAR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por código o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-3 border rounded-lg text-sm"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-3 border rounded-lg text-sm"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* Tabla con scroll horizontal en móvil */}
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-600 uppercase font-bold">
                            <tr>
                                <th className="p-4 whitespace-nowrap">Código</th>
                                <th className="p-4">Producto</th>
                                <th className="p-4 text-center whitespace-nowrap">Stock</th>
                                <th className="p-4 text-right whitespace-nowrap">Precio</th>
                                <th className="p-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredProductos.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono font-bold text-gray-700 whitespace-nowrap">{p.codigo_usuario}</td>
                                    <td className="p-4">
                                        <div className="font-semibold">{p.nombre}</div>
                                        <div className="text-gray-400 italic">{p.material}</div>
                                    </td>
                                    <td className="p-4 text-center font-bold text-green-600 whitespace-nowrap">{p.stock_actual}</td>
                                    <td className="p-4 text-right font-bold whitespace-nowrap">S/ {Number(p.precio).toFixed(2)}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => navigate(`/inventario/editar/${p.id}`)} className="text-blue-500"><FaEdit /></button>
                                            <button onClick={() => handleDelete(p.id, p.nombre)} className="text-red-500"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Estado vacío */}
                    {!loading && filteredProductos.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <FaBox className="mx-auto text-3xl mb-3 opacity-30" />
                            <p className="text-sm">No hay productos con stock disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {showStockIngressModal && (
                <StockIngressModal
                    item={selectedPendiente}
                    onSuccess={handleIngresarSuccess}
                    onCancel={() => setShowStockIngressModal(false)}
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