import React, { useState, useEffect, useMemo } from 'react';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../../../utils/produccionNeonClient';
import { pedidosDB } from '../../../utils/pedidosNeonClient';
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
        horas_trabajo: '',
        costo_hora: '',
        costo_herramientas: '',
        otros_gastos: '',
        estado_produccion: 'en_proceso', // Valor por defecto automatico
        observaciones: '',
        imagen_url: '' // Nuevo campo imagen
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
            horas_trabajo: item.horas_trabajo || '',
            costo_hora: item.costo_hora || '0',
            costo_herramientas: item.costo_herramientas || '',
            otros_gastos: item.otros_gastos || '',
            estado_produccion: item.estado_produccion || 'pendiente',
            observaciones: item.observaciones || ''
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

    // Trigger para subir imagen desde tabla
    const triggerTableImageUpload = (id) => {
        setUploadingId(id);
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }, 100);
    };

    // Manejar subida de imagen directa en tabla
    const handleTableImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingId) return;

        // Validar archivo
        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            setLoading(true);

            // Comprimir y redimensionar imagen
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 1,
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.95
            });

            const fileName = `productos_terminados/${uuidv4()}_${optimizedFile.name}`;
            const storageRef = ref(storage, fileName);

            await uploadBytes(storageRef, optimizedFile);
            const url = await getDownloadURL(storageRef);

            // Actualizar registro en BD
            const item = produccion.find(p => p.id_produccion === uploadingId);
            if (item) {
                await produccionDB.update(uploadingId, {
                    ...item,
                    imagen_url: url
                });
                setMessage({ type: 'success', text: 'Imagen subida correctamente.' });
                // Actualizar estado local
                setProduccion(prev => prev.map(p => p.id_produccion === uploadingId ? { ...p, imagen_url: url } : p));
            }

        } catch (error) {
            console.error('Error subiendo imagen:', error);
            toast.error('Error al subir la imagen', { duration: 4000 });
        } finally {
            setLoading(false);
            setUploadingId(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderImageCell = (item) => {
        if (item.imagen_url) {
            return (
                <div className="relative group w-12 h-12 mx-auto">
                    <a href={item.imagen_url} target="_blank" rel="noopener noreferrer">
                        <img src={item.imagen_url} alt="Prod" className="w-full h-full object-cover rounded shadow-sm border" />
                    </a>
                </div>
            );
        } else {
            if (item.estado_produccion === 'terminado') {
                return (
                    <button
                        onClick={() => triggerTableImageUpload(item.id_produccion)}
                        className="w-10 h-10 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Subir Foto"
                    >
                        <FaCamera size={16} />
                    </button>
                );
            }
            return <span className="text-gray-300">-</span>;
        }
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
            horas_trabajo: item.horas_trabajo || '',
            costo_hora: item.costo_hora || '0',
            costo_herramientas: item.costo_herramientas || '',
            otros_gastos: item.otros_gastos || '',
            estado_produccion: item.estado_produccion || 'en_proceso',
            observaciones: item.observaciones || ''
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
            horas_trabajo: '',
            costo_hora: '0',
            costo_herramientas: '',
            otros_gastos: '',
            estado_produccion: 'en_proceso',
            observaciones: ''
        });
        setEditingId(null);
    };


    // Manejar subida de imagen
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar archivo
        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            setUploadingImage(true);

            // Comprimir y redimensionar imagen
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 1,
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.95
            });

            const fileName = `productos_terminados/${uuidv4()}_${optimizedFile.name}`;
            const storageRef = ref(storage, fileName);

            await uploadBytes(storageRef, optimizedFile);
            const url = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, imagen_url: url }));
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            alert('Error al subir la imagen. Verifique su conexión y configuración.');
        } finally {
            setUploadingImage(false);
        }
    };

    // Manejar drag and drop
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageUpload({ target: { files: [file] } });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
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
                    horas_trabajo: parseFloat(formData.horas_trabajo) || 0,
                    costo_hora: parseFloat(formData.costo_hora) || 0,
                    costo_herramientas: parseFloat(formData.costo_herramientas) || 0,
                    otros_gastos: parseFloat(formData.otros_gastos) || 0,
                    estado_produccion: formData.estado_produccion,
                    observaciones: formData.observaciones
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
                    horas_trabajo: parseFloat(formData.horas_trabajo) || 0,
                    costo_hora: parseFloat(formData.costo_hora) || 0,
                    costo_herramientas: parseFloat(formData.costo_herramientas) || 0,
                    otros_gastos: parseFloat(formData.otros_gastos) || 0,
                    estado_produccion: formData.estado_produccion,
                    observaciones: formData.observaciones
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

        return matchesType && matchesSearch;
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

    // Funciones de manejo de Códigos QR
    const generateRandomCode = (tipoProducto) => {
        const prefix = tipoProducto.substring(0, 3).toUpperCase();
        const random = Math.floor(100000 + Math.random() * 900000);
        return `${prefix}${random}`;
    };

    const openQRModal = (item) => {
        setSelectedItem(item);
        setQrData({
            codigo: item.codigo_producto || '',
            nombre: item.nombre_producto || `${item.tipo_producto} de ${item.metal}`,
            categoria: item.tipo_producto.toUpperCase()
        });
        setShowQRModal(true);
    };

    const handleSaveQRCode = async () => {
        if (!qrData.codigo.trim()) {
            alert('Por favor, ingresa un código');
            return;
        }

        try {
            setLoading(true);
            await produccionDB.update(selectedItem.id_produccion, {
                ...selectedItem,
                codigo_producto: qrData.codigo,
                tiene_codigo_qr: true
            });
            setShowQRModal(false);
            setMessage({ type: 'success', text: 'Código QR guardado correctamente' });
            fetchData();
        } catch (error) {
            console.error('Error al guardar código QR:', error);
            setMessage({ type: 'error', text: 'Error al guardar el código QR' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendToInventory = (item) => {
        setSelectedItem(item);
        setShowInventoryModal(true);
    };

    const confirmSendToInventory = () => {
        navigate('/inventario/nuevo', {
            state: {
                prefill: {
                    nombre: selectedItem.nombre_producto || `${selectedItem.tipo_producto} de ${selectedItem.metal}`,
                    codigo_usuario: selectedItem.codigo_producto,
                    categoria: selectedItem.tipo_producto.toUpperCase(),
                    metal: selectedItem.metal,
                    cantidad: selectedItem.cantidad,
                    imagen_url: selectedItem.imagen_url
                }
            }
        });
        setShowInventoryModal(false);
    };

    // Calcular costo total en tiempo real
    const costoManoObra = (parseFloat(formData.horas_trabajo) || 0) * (parseFloat(formData.costo_hora) || 0);
    const costoTotalUnitario =
        (parseFloat(formData.costo_materiales) || 0) +
        costoManoObra +
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
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FaMoneyBillWave className="text-blue-600" />
                            Costos de Fabricación
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Materiales (S/)</label>
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
                                <label className="block text-xs font-medium text-gray-700 mb-1">Horas</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    name="horas_trabajo"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                                    placeholder="0.0"
                                    value={formData.horas_trabajo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Costo/Hora (S/) - Opcional</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="costo_hora"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white"
                                    value={formData.costo_hora}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Herramientas (S/)</label>
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

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Otros Gastos (S/)</label>
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
                        </div>

                        {/* Cálculos */}
                        <div className="mt-4 bg-white rounded-lg p-3 border-2 border-blue-200">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mano de Obra:</span>
                                    <span className="font-semibold">S/ {costoManoObra.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Costo Unitario:</span>
                                    <span className="font-semibold">S/ {costoTotalUnitario.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between col-span-2 pt-2 border-t">
                                    <span className="text-gray-800 font-semibold">Costo Total Producción:</span>
                                    <span className="font-bold text-lg text-red-600">S/ {costoTotalProduccion.toFixed(2)}</span>
                                </div>
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

                    {/* Imagen del Producto */}
                    <div className="mt-4 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {formData.tipo_produccion === 'PEDIDO'
                                ? '📷 Imagen de Referencia (Opcional)'
                                : '📷 Imagen del Producto (Opcional)'}
                        </label>

                        <div className="flex items-center gap-4">
                            {/* Botón de subida */}
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                                <FaCamera className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    {formData.imagen_url ? 'Cambiar Imagen' : 'Subir Imagen'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                            </label>

                            {uploadingImage && (
                                <span className="text-sm text-blue-600">Subiendo...</span>
                            )}

                            {/* Vista previa */}
                            {formData.imagen_url && !uploadingImage && (
                                <div className="relative">
                                    <img
                                        src={formData.imagen_url}
                                        alt="Preview"
                                        className="h-16 w-16 object-cover rounded-md border-2 border-gray-300 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, imagen_url: '' })}
                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                                        title="Eliminar imagen"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Texto de ayuda */}
                        {formData.tipo_produccion === 'PEDIDO' && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                                💡 Sube una imagen de referencia del producto fabricado para el cliente
                            </p>
                        )}
                        {formData.tipo_produccion === 'STOCK' && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                                💡 Esta imagen se mostrará en el inventario
                            </p>
                        )}
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
            </div>

            {/* Lista de Producción */}
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-7xl mx-auto">
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
                                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Imagen</th>
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
                                    <td className="px-3 py-3 whitespace-nowrap text-center">
                                        {renderImageCell(item)}
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
                                            {['en_proceso', 'pendiente'].includes(item.estado_produccion) ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Editar"
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkAsComplete(item)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Marcar como Terminado"
                                                    >
                                                        <FaCheck size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id_produccion)}
                                                        className="text-red-500 hover:text-red-700 ml-1"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </>
                                            ) : item.estado_produccion === 'terminado' && item.tipo_produccion === 'STOCK' ? (
                                                <>
                                                    {/* Botón Ver - Siempre visible */}
                                                    <button
                                                        onClick={() => handleView(item)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Editar"
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>

                                                    {/* Lógica condicional: según si tiene código QR */}
                                                    {!item.tiene_codigo_qr ? (
                                                        // Sin código QR: Mostrar botón "Generar QR"
                                                        <button
                                                            onClick={() => openQRModal(item)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Generar Código QR"
                                                        >
                                                            <FaQrcode size={18} />
                                                        </button>
                                                    ) : (
                                                        // Con código QR: Mostrar "Editar QR" y "Enviar a Inventario"
                                                        <>
                                                            <button
                                                                onClick={() => openQRModal(item)}
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="Editar Código QR"
                                                            >
                                                                <FaEdit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSendToInventory(item)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Enviar a Inventario"
                                                            >
                                                                <FaBox size={18} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Botón Eliminar - Siempre visible */}
                                                    <button
                                                        onClick={() => handleDelete(item.id_produccion)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                // Producto terminado de PEDIDO o cualquier otro caso
                                                <>
                                                    <button
                                                        onClick={() => handleView(item)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Editar"
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id_produccion)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </>
                                            )}
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
            </div>
            {/* Input oculto para subida desde tabla */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleTableImageUpload}
            />

            {/* Modal de Generación/Edición de Código QR */}
            {
                showQRModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <FaQrcode className="mr-2 text-blue-600" />
                                {selectedItem?.codigo_producto ? 'Editar Código QR' : 'Generar Código QR'}
                            </h2>

                            <div className="space-y-4">
                                {/* Nombre del Producto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Producto
                                    </label>
                                    <input
                                        type="text"
                                        value={qrData.nombre}
                                        disabled
                                        className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2 text-sm"
                                    />
                                </div>

                                {/* Código */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código Único *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={qrData.codigo}
                                            onChange={(e) => setQrData({ ...qrData, codigo: e.target.value })}
                                            placeholder="Ej: PUL722284"
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setQrData({ ...qrData, codigo: generateRandomCode(selectedItem.tipo_producto) })}
                                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex-shrink-0"
                                            title="Generar código aleatorio"
                                        >
                                            🔄
                                        </button>
                                    </div>
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoría
                                    </label>
                                    <input
                                        type="text"
                                        value={qrData.categoria}
                                        disabled
                                        className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm p-2 text-sm"
                                    />
                                </div>

                                {/* Vista Previa del QR */}
                                {qrData.codigo && (
                                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <p className="text-xs text-gray-600 mb-2 text-center font-medium">Vista Previa QR:</p>
                                        <div className="flex justify-center">
                                            <QRCode value={qrData.codigo} size={128} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveQRCode}
                                    disabled={!qrData.codigo.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <FaCheckCircle className="mr-2" />
                                    Guardar Código QR
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Confirmación de Envío a Inventario */}
            {
                showInventoryModal && selectedItem && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <FaBox className="mr-2 text-green-600" />
                                Enviar a Inventario
                            </h2>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">¿Confirmar envío a inventario?</p>

                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Producto:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedItem.nombre_producto || `${selectedItem.tipo_producto} de ${selectedItem.metal}`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Código:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedItem.codigo_producto}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Cantidad:</span>
                                        <span className="text-sm font-medium text-gray-900">{selectedItem.cantidad} unidad(es)</span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-4">
                                    Este producto quedará disponible para venta en el inventario.
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowInventoryModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmSendToInventory}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                                >
                                    <FaCheckCircle className="mr-2" />
                                    Confirmar Envío
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

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
