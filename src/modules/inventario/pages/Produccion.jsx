import React, { useState, useEffect, useMemo } from 'react';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../../../utils/produccionNeonClient';
import { pedidosDB } from '../../../utils/pedidosNeonClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaSave, FaTimes, FaBox, FaMoneyBillWave, FaHammer, FaCheckCircle, FaCamera, FaCheck, FaQrcode, FaExclamationTriangle } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { compressAndResizeImage, validateImageFile } from '../../../utils/imageOptimizer';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Tooltip from '../../../components/ui/Tooltip';


const Produccion = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [produccion, setProduccion] = useState([]);
    const [pedidosPendientes, setPedidosPendientes] = useState([]);
    const [productosEnInventario, setProductosEnInventario] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [filterType, setFilterType] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [stats, setStats] = useState({
        total_registros: 0,
        pendientes: 0,
        en_proceso: 0,
        terminados: 0
    });
    const [uploadingId, setUploadingId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [qrData, setQrData] = useState({
        codigo: '',
        nombre: '',
        categoria: ''
    });
    const fileInputRef = React.useRef(null);

    // Estado para Confirm Modal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        icon: null,
        confirmText: '',
        confirmColor: 'blue',
        onConfirm: () => { }
    });

    // Estado inicial del formulario
    const initialFormState = {
        tipo_produccion: 'STOCK',
        pedido_id: null,
        metal: '',
        tipo_producto: '',
        nombre_producto: '',
        cantidad: '',
        costo_materiales: '',
        costo_materiales: '',
        mano_de_obra: '',
        costo_herramientas: '',
        otros_gastos: '',
        estado_produccion: 'en_proceso', // Valor por defecto automatico
        observaciones: '',
        imagen_url: '', // Nuevo campo imagen
        codigo_producto: '' // Nuevo campo codigo
    };

    const [formData, setFormData] = useState(initialFormState);

    // Derivar parámetro de URL de forma reactiva
    const urlPedidoId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('pedido');
    }, [location.search]);

    const pedidosFiltradosDropdown = useMemo(() => {
        return pedidosPendientes.filter(prod => {
            if (urlPedidoId) {
                // Comparación robusta (ambos a String)
                return String(prod.id_pedido) === String(urlPedidoId);
            }
            return true;
        });
    }, [pedidosPendientes, urlPedidoId]);

    // Efecto para manejar parámetro de URL ?pedido=ID
    useEffect(() => {
        console.log('URL Search Params:', location.search);
        console.log('urlPedidoId:', urlPedidoId);
        console.log('Pedidos Filtrados Length:', pedidosFiltradosDropdown.length);

        if (urlPedidoId) {
            setFormData(prev => ({
                ...prev,
                tipo_produccion: 'PEDIDO'
            }));
        }
    }, [urlPedidoId, location.search, pedidosFiltradosDropdown.length]); // Dependencia simplificada

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTipoChange = (tipo) => {
        setFormData(prev => ({
            ...prev,
            tipo_produccion: tipo,
            pedido_id: ''
        }));
    };

    const handlePedidoSelect = (e) => {
        const value = e.target.value;
        if (!value) {
            setFormData(prev => ({
                ...prev,
                pedido_id: '',
                nombre_producto: '',
                cantidad: '',
                metal: '',
                tipo_producto: ''
            }));
            return;
        }

        // Parsear formato: "pedidoId-detalleId"
        const [pedidoId, detalleId] = value.split('-');
        const producto = pedidosPendientes.find(p =>
            p.id_pedido == parseInt(pedidoId) && p.id_detalle == parseInt(detalleId)
        );

        if (producto) {
            setFormData(prev => ({
                ...prev,
                pedido_id: value,
                metal: producto.metal || '',
                tipo_producto: producto.tipo_producto || '',
                nombre_producto: `${producto.nombre_cliente} - ${producto.nombre_producto}`,
                cantidad: producto.cantidad // Aquí sí mantenemos la cantidad del pedido
            }));
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id_produccion);
        setFormData({
            tipo_produccion: item.tipo_produccion || 'STOCK',
            pedido_id: item.pedido_id || '',
            metal: item.metal || 'Plata',
            tipo_producto: item.tipo_producto || 'Anillo',
            nombre_producto: item.nombre_producto || '',
            cantidad: item.cantidad || '',
            costo_materiales: item.costo_materiales || '',
            mano_de_obra: item.mano_de_obra || '',
            costo_herramientas: item.costo_herramientas || '',
            otros_gastos: item.otros_gastos || '',
            estado_produccion: item.estado_produccion || 'pendiente',
            observaciones: item.observaciones || '',
            imagen_url: item.imagen_url || '',
            codigo_producto: item.codigo_producto || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Producción',
            message: '¿Estás seguro? Esta acción no se puede deshacer.',
            icon: <FaTrash />,
            confirmText: 'Sí, eliminar',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await produccionDB.delete(id);
                    toast.success('Producción eliminada correctamente');
                    fetchProduccion();
                    fetchStats();
                    fetchPedidosPendientes();
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    toast.error('Error al eliminar: ' + error.message);
                }
            }
        });
    };

    const handleMarkAsComplete = async (item) => {
        const isPedido = item.tipo_produccion === 'PEDIDO';
        const confirmMessage = isPedido
            ? `¿Marcar como terminado: ${item.nombre_producto || item.tipo_producto}?\n\nEste producto pertenece a un PEDIDO y NO irá al stock general.`
            : `¿Marcar como terminado: ${item.nombre_producto || item.tipo_producto}?\n\nEsto agregará el producto al inventario de STOCK.`;

        if (!window.confirm(confirmMessage)) return;

        try {
            await produccionDB.updateEstado(item.id_produccion, 'terminado');
            setMessage({ type: 'success', text: 'Producción marcada como terminada.' });
            fetchProduccion();
            fetchStats();
        } catch (error) {
            console.error('Error al marcar como terminado:', error);
            setMessage({ type: 'error', text: 'Error al actualizar: ' + error.message });
        }
    };

    // Handlers de Imagen y QR
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar
        const validation = validateImageFile(file, 5); // Max 5MB
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        setUploadingImage(true);
        try {
            // Comprimir
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 0.5,
                maxWidth: 1024,
                quality: 0.8
            });

            // Subir a Firebase
            const fileName = `produccion/${uuidv4()}_${optimizedFile.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, optimizedFile);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({
                ...prev,
                imagen_url: downloadURL
            }));
            toast.success('Imagen subida correctamente');

        } catch (error) {
            console.error('Error al subir imagen:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imagen_url: '' }));
    };

    const handleView = (item) => {
        // Cargar item en modo solo lectura
        setEditingId(item.id_produccion);
        setFormData({
            tipo_produccion: item.tipo_produccion || 'STOCK',
            pedido_id: item.pedido_id || '',
            metal: item.metal || '',
            tipo_producto: item.tipo_producto || '',
            nombre_producto: item.nombre_producto || '',
            cantidad: item.cantidad || '',
            costo_materiales: item.costo_materiales || '',
            mano_de_obra: item.mano_de_obra || '',
            costo_herramientas: item.costo_herramientas || '',
            otros_gastos: item.otros_gastos || '',
            estado_produccion: item.estado_produccion || 'en_proceso',
            observaciones: item.observaciones || '',
            imagen_url: item.imagen_url || '',
            codigo_producto: item.codigo_producto || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCompleted = async (id) => {
        if (!window.confirm('⚠️ ADVERTENCIA: Estás eliminando una producción terminada.\n\nEsto puede afectar el inventario.\n\n¿Estás seguro?')) return;

        try {
            await produccionDB.delete(id);
            setMessage({ type: 'success', text: 'Registro eliminado correctamente.' });
            fetchProduccion();
            fetchStats();
            fetchPedidosPendientes();
        } catch (error) {
            console.error('Error al eliminar:', error);
            setMessage({ type: 'error', text: 'Error al eliminar: ' + error.message });
        }
    };

    const resetForm = () => {
        setFormData({
            tipo_produccion: 'STOCK',
            pedido_id: '',
            metal: '',
            tipo_producto: '',
            nombre_producto: '',
            cantidad: '',
            costo_materiales: '',
            mano_de_obra: '',
            costo_herramientas: '',
            otros_gastos: '',
            estado_produccion: 'en_proceso',
            observaciones: '',
            imagen_url: '',
            codigo_producto: ''
        });
        setEditingId(null);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (editingId) {
                await produccionDB.update(editingId, {
                    metal: formData.metal,
                    tipo_producto: formData.tipo_producto,
                    nombre_producto: formData.nombre_producto,
                    cantidad: parseInt(formData.cantidad),
                    costo_materiales: parseFloat(formData.costo_materiales) || 0,
                    mano_de_obra: parseFloat(formData.mano_de_obra) || 0,
                    porcentaje_alquiler: parseFloat(formData.porcentaje_alquiler) || 0,
                    costo_herramientas: parseFloat(formData.costo_herramientas) || 0,
                    otros_gastos: parseFloat(formData.otros_gastos) || 0,
                    estado_produccion: formData.estado_produccion,
                    estado_produccion: formData.estado_produccion,
                    observaciones: formData.observaciones,
                    imagen_url: formData.imagen_url,
                    codigo_producto: formData.codigo_producto
                });

                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);
            } else {
                // Extraer solo el id_pedido del valor compuesto "pedidoId-detalleId"
                let pedidoIdToSave = null;
                if (formData.pedido_id) {
                    const parts = String(formData.pedido_id).split('-');
                    pedidoIdToSave = parseInt(parts[0]) || null;
                }

                await produccionDB.create({
                    pedido_id: pedidoIdToSave,
                    tipo_produccion: formData.tipo_produccion,
                    metal: formData.metal,
                    tipo_producto: formData.tipo_producto,
                    nombre_producto: formData.nombre_producto,
                    cantidad: parseInt(formData.cantidad),
                    costo_materiales: parseFloat(formData.costo_materiales) || 0,
                    mano_de_obra: parseFloat(formData.mano_de_obra) || 0,
                    porcentaje_alquiler: parseFloat(formData.porcentaje_alquiler) || 0,
                    costo_herramientas: parseFloat(formData.costo_herramientas) || 0,
                    otros_gastos: parseFloat(formData.otros_gastos) || 0,
                    estado_produccion: formData.estado_produccion,
                    observaciones: formData.observaciones,
                    imagen_url: formData.imagen_url,
                    codigo_producto: formData.codigo_producto
                });

                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);
            }

            setTimeout(() => {
                resetForm();
                fetchProduccion();
                fetchStats();
                fetchPedidosPendientes();
                setMessage(null);
            }, 1500);

        } catch (error) {
            console.error('Error al guardar:', error);
            setMessage({ type: 'error', text: 'Error al guardar: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduccion();
        fetchPedidosPendientes();
        fetchStats();
        fetchProductosInventario();
    }, []);

    const fetchProduccion = async () => {
        try {
            const data = await produccionDB.getAll();
            setProduccion(data || []);
        } catch (error) {
            console.error('Error al cargar producción:', error);
        }
    };

    const fetchPedidosPendientes = async () => {
        try {
            const data = await produccionDB.getPedidosPendientes();
            setPedidosPendientes(data || []);
        } catch (error) {
            console.error('Error al cargar pedidos pendientes:', error);
        }
    };

    const fetchProductosInventario = async () => {
        try {
            const data = await productosExternosDB.getAll();
            setProductosEnInventario(data || []);
        } catch (error) {
            console.error('Error al cargar inventario:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await produccionDB.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const filteredProduccion = produccion.filter(p => {
        let matchesType = true;
        if (filterType === 'stock') matchesType = p.tipo_produccion === 'STOCK';
        if (filterType === 'pedidos') matchesType = p.tipo_produccion === 'PEDIDO';

        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            matchesSearch =
                p.nombre_producto?.toLowerCase().includes(term) ||
                p.metal?.toLowerCase().includes(term) ||
                p.tipo_producto?.toLowerCase().includes(term) ||
                p.nombre_cliente?.toLowerCase().includes(term);
        }

        // Filtro de año: 2026 OR en_proceso
        let matchesYear = true;
        const fechaProduccion = new Date(p.fecha_registro || p.created_at);
        const year = fechaProduccion.getFullYear();

        // Siempre mostrar items en proceso
        if (p.estado_produccion === 'en_proceso') {
            matchesYear = true;
        } else {
            // Para el resto, solo mostrar 2026 en adelante
            matchesYear = year >= 2026;
        }

        return matchesType && matchesSearch && matchesYear;
    });

    const handleTerminar = async (item) => {
        if (!window.confirm(`¿Confirmar que la producción de "${item.nombre_producto}" ha finalizado?`)) return;

        try {
            await produccionDB.updateEstado(item.id_produccion, 'terminado');
            setMessage({ type: 'success', text: 'Producción marcada como terminada correctamente.' });
            fetchData();
        } catch (error) {
            console.error('Error al terminar producción:', error);
            setMessage({ type: 'error', text: 'Error al actualizar el estado.' });
        }
    };

    // Funciones de QR eliminadas - ahora se manejan en ProductoForm

    // Helper: Verificar si un producto de producción ya está en el inventario
    const isProductInInventory = (produccionItem) => {
        // Verificar por código si existe
        if (produccionItem.codigo_producto) {
            const existePorCodigo = productosEnInventario.some(p => p.codigo_usuario === produccionItem.codigo_producto);
            if (existePorCodigo) return true;
        }

        // Verificar por nombre (normalizado para comparación)
        if (produccionItem.nombre_producto) {
            const nombreProduccion = produccionItem.nombre_producto.toLowerCase().trim();
            const existePorNombre = productosEnInventario.some(p => {
                const nombreInventario = p.nombre?.toLowerCase().trim();
                return nombreInventario === nombreProduccion;
            });
            if (existePorNombre) return true;
        }

        return false;
    };

    const handleSendToInventory = async (item) => {
        // Verificar si ya existe en inventario
        if (isProductInInventory(item)) {
            toast.error('Este producto ya fue enviado al inventario');
            return;
        }

        // Redirigir directamente al formulario con el ID de producción
        navigate(`/producto-form?produccion_id=${item.id_produccion}`);
    };

    // Calcular costo total en tiempo real (Modelo Artesanal: Suma Directa)
    const costoTotalUnitario =
        (parseFloat(formData.costo_materiales) || 0) +
        (parseFloat(formData.mano_de_obra) || 0) +
        (parseFloat(formData.costo_herramientas) || 0) +
        (parseFloat(formData.otros_gastos) || 0);

    const costoTotalProduccion = costoTotalUnitario * (parseInt(formData.cantidad) || 1);



    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Enigma Sistema ERP</span>
                </Link>
            </div>



            {/* Formulario */}
            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 mb-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-medium text-gray-800">
                            {editingId ? 'Editar Producción' : 'Registrar Producción'}
                        </h2>
                    </div>
                    {editingId && (
                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <FaTimes size={14} /> Cancelar
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text- red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selector de Tipo */}
                    {!editingId && (
                        <div className="flex flex-col gap-2">
                            {/* Mostrar botón informativo según contexto */}
                            {urlPedidoId ? (
                                <div className="w-full py-3 px-4 rounded-lg bg-amber-500 text-white font-semibold text-center cursor-not-allowed opacity-90">
                                    📋 Producción para Pedido
                                </div>
                            ) : (
                                <div className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold text-center">
                                    📦 Producción para Stock
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selector de Pedido (si tipo = PEDIDO) */}
                    {formData.tipo_produccion === 'PEDIDO' && !editingId && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Seleccionar Producto del Pedido</label>
                            <select
                                value={formData.pedido_id}
                                onChange={handlePedidoSelect}
                                className="w-full text-xs md:text-sm lg:text-base rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 border p-2"
                                disabled={pedidosFiltradosDropdown.length === 0}
                                required
                            >
                                <option value="">-- Selecciona un producto --</option>
                                {pedidosFiltradosDropdown.map(prod => (
                                    <option key={`${prod.id_pedido}-${prod.id_detalle}`} value={`${prod.id_pedido}-${prod.id_detalle}`}>
                                        #{prod.id_pedido} - {prod.nombre_cliente} - {prod.nombre_producto} (Cant: {prod.cantidad})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Datos del Producto */}
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FaBox className="text-purple-600" />
                            Producto
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Producto *</label>
                                <select
                                    name="tipo_producto"
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2 ${formData.tipo_produccion === 'PEDIDO' ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
                                    value={formData.tipo_producto}
                                    onChange={handleChange}
                                    disabled={formData.tipo_produccion === 'PEDIDO'}
                                    required
                                >
                                    <option value="">-- Selecciona producto --</option>
                                    {TIPOS_PRODUCTO.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Metal *</label>
                                <select
                                    name="metal"
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2 ${formData.tipo_produccion === 'PEDIDO' ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
                                    value={formData.metal}
                                    onChange={handleChange}
                                    disabled={formData.tipo_produccion === 'PEDIDO'}
                                    required
                                >
                                    <option value="">-- Selecciona metal --</option>
                                    {METALES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre (Opcional)</label>
                                <input
                                    type="text"
                                    name="nombre_producto"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2"
                                    placeholder={formData.tipo_producto && formData.metal ? `${formData.tipo_producto} de ${formData.metal}` : "Nombre (Opcional)"}
                                    value={formData.nombre_producto}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Cantidad *</label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    min="1"
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2 ${formData.tipo_produccion === 'PEDIDO' ? 'bg-gray-100 cursor-not-allowed text-gray-600 select-none pointer-events-none' : ''}`}
                                    value={formData.cantidad}
                                    onChange={handleChange}
                                    readOnly={formData.tipo_produccion === 'PEDIDO'}
                                    tabIndex={formData.tipo_produccion === 'PEDIDO' ? -1 : 0}
                                    required
                                />
                            </div>

                        </div>
                    </div>

                    {/* Costos */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Materiales (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="costo_materiales"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                                placeholder="0.00"
                                value={formData.costo_materiales}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Mano de Obra (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="mano_de_obra"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                                placeholder="0.00"
                                value={formData.mano_de_obra}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Herramientas (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="costo_herramientas"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                                placeholder="0.00"
                                value={formData.costo_herramientas}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Otros Gastos (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="otros_gastos"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                                placeholder="0.00"
                                value={formData.otros_gastos}
                                onChange={handleChange}
                            />
                        </div>



                        {/* Info de Costos en Mobile ocupa 2 col, desktop 1 */}
                    </div>

                    {/* Cálculos */}
                    <div className="mt-4 bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100 col-span-2">
                                <span className="text-gray-600 font-medium">Costo Total Unitario:</span>
                                <span className="font-bold text-gray-800">S/ {costoTotalUnitario.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center col-span-2 pt-2">
                                <span className="text-gray-800 font-bold text-base">COSTO TOTAL PRODUCCIÓN:</span>
                                <span className="font-bold text-xl text-blue-700">S/ {costoTotalProduccion.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>


                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                        <textarea
                            name="observaciones"
                            rows="2"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Notas sobre la producción..."
                        />
                    </div>

                    {/* Imagen y Código */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FaCamera className="text-gray-600" />
                            Detalles Visuales e Identificación
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Carga de Imagen */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Imagen del Producto</label>
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden relative">
                                        {formData.imagen_url ? (
                                            <>
                                                <img src={formData.imagen_url} alt="Prod" className="w-full h-full object-cover" />
                                                {!editingId && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600"
                                                    >
                                                        <FaTimes size={10} />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <FaCamera className="text-gray-400 text-2xl" />
                                        )}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                                                Subiendo...
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            disabled={uploadingImage}
                                            className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <FaCamera />
                                            {formData.imagen_url ? 'Cambiar Imagen' : 'Subir Imagen'}
                                        </button>
                                        <p className="text-[10px] text-gray-500 mt-1">Máx 5MB. JPG, PNG.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white ${editingId
                                ? 'bg-amber-600 hover:bg-amber-700'
                                : 'bg-purple-600 hover:bg-purple-700'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''} flex justify-center items-center gap-2`}
                        >
                            <FaSave />
                            {loading ? 'Guardando...' : (editingId ? 'Actualizar Producción' : 'Guardar Producción')}
                        </button>
                    </div>
                </form>
            </div >

            {/* Lista de Producción */}
            < div className="bg-white shadow-lg rounded-lg p-6 max-w-7xl mx-auto" >
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Registros de Producción</h3>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilterType('todos')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'todos' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterType('stock')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'stock' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Stock
                        </button>
                        <button
                            onClick={() => setFilterType('pedidos')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === 'pedidos' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Pedidos
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    />
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Img</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Producto</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant</th>
                                <th className="hidden md:table-cell px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="hidden lg:table-cell px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProduccion.map((item) => (
                                <tr key={item.id_produccion} className="hover:bg-gray-50">
                                    <td className="px-3 py-3 whitespace-nowrap text-left text-xs text-gray-700">
                                        {new Date(item.fecha_registro || item.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </td>
                                    <td className="px-3 py-3 text-left">
                                        {item.imagen_url ? (
                                            <img src={item.imagen_url} alt="img" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">camera</div>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-left">
                                        <div className="text-xs text-gray-700">{item.nombre_cliente || 'Stock'}</div>
                                    </td>
                                    <td className="px-3 py-3 text-left">
                                        <div className="text-xs text-gray-700 max-w-xs">
                                            {item.nombre_producto?.replace(/^.*?\s*-\s*/, '') || `${item.tipo_producto} de ${item.metal}`}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center text-xs text-gray-700">{item.cantidad}</td>
                                    <td className="hidden md:table-cell px-3 py-3 text-right text-xs text-gray-700">S/ {parseFloat(item.costo_total_unitario || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.estado_produccion === 'terminado' ? 'bg-green-100 text-green-800' :
                                            item.estado_produccion === 'en_proceso' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.estado_produccion === 'terminado' ? 'Terminado' :
                                                item.estado_produccion === 'en_proceso' ? 'En proceso' : item.estado_produccion}
                                        </span>
                                    </td>
                                    <td className="hidden lg:table-cell px-4 py-3 text-center">
                                        {item.tipo_produccion === 'PEDIDO' ? (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                                Pedido
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            {/* Editar - Siempre visible */}
                                            <button
                                                onClick={() => item.estado_produccion === 'terminado' ? handleView(item) : handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <FaEdit size={18} />
                                            </button>

                                            {/* Enviar a Inventario - Solo para productos terminados de STOCK que NO están en inventario */}
                                            {item.estado_produccion === 'terminado' && item.tipo_produccion === 'STOCK' && !isProductInInventory(item) && (
                                                <button
                                                    onClick={() => handleSendToInventory(item)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Enviar a Inventario"
                                                >
                                                    <FaBox size={18} />
                                                </button>
                                            )}

                                            {/* Marcar como Terminado - Solo para productos en proceso */}
                                            {['en_proceso', 'pendiente'].includes(item.estado_produccion) && (
                                                <button
                                                    onClick={() => handleMarkAsComplete(item)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Marcar como Terminado"
                                                >
                                                    <FaCheck size={18} />
                                                </button>
                                            )}

                                            {/* Eliminar - Siempre visible */}
                                            <button
                                                onClick={() => handleDelete(item.id_produccion)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Eliminar"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProduccion.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron registros de producción.
                        </div>
                    )}
                </div>
            </div >





            {/* Modal de éxito */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4 animate-bounce">
                            <div className="flex flex-col items-center">
                                <FaCheckCircle className="text-green-500 text-6xl mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800 text-center">
                                    PRODUCCIÓN GUARDADA
                                </h3>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Produccion;
