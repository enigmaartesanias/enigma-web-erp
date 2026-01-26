import React, { useState, useEffect, useMemo } from 'react';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../../../utils/produccionNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import { pedidosDB } from '../../../utils/pedidosNeonClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaSave, FaTimes, FaBox, FaMoneyBillWave, FaHammer, FaCheckCircle, FaCamera, FaCheck, FaQrcode, FaExclamationTriangle, FaBan, FaSpinner } from 'react-icons/fa';
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

    // Nuevo estado para modal "Enviar a Stock" (Lógica Simplificada)
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockFormData, setStockFormData] = useState({
        codigo: '',
        cantidad: '',
        precio: '',
        precioReferencial: '',
        tipo_producto: ''
    });
    const [sendingToStockItem, setSendingToStockItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Estado para paginación

    // Bloquear scroll cuando el modal está abierto
    useEffect(() => {
        if (showStockModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showStockModal]);

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
            // CONSTRUCCIÓN DEL DETALLE ENRIQUECIDO REQUERIDO
            // Formato: Tipo - Nombre/Modelo - Descripción/Metal (Pedido #ID)
            const detalleEnriquecido = `${producto.tipo_producto} - ${producto.nombre_producto} - ${producto.metal || ''} (Pedido #${producto.id_pedido})`;

            setFormData(prev => ({
                ...prev,
                pedido_id: value,
                metal: producto.metal || '',
                tipo_producto: producto.tipo_producto || '',
                nombre_producto: detalleEnriquecido,
                cantidad: producto.cantidad // Aquí sí mantenemos la cantidad del pedido
            }));
        }
    };

    // Estados para el flujo de Foto al Terminar
    const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
    const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
    const [finishedItemForPhoto, setFinishedItemForPhoto] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false); // Estado para Modal Detalle


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

    const handleAnular = (item) => {
        setConfirmModal({
            isOpen: true,
            title: 'Anular Producción',
            message: `¿Estás seguro de anular esta producción? El registro se marcará como "Anulado" y permanecerá en el historial.`,
            icon: <FaBan />,
            confirmText: 'Sí, anular',
            confirmColor: 'yellow',
            onConfirm: async () => {
                try {
                    await produccionDB.anular(item.id_produccion);
                    toast.success('Producción anulada correctamente');
                    fetchProduccion();
                    fetchStats();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al anular:', error);
                    toast.error('Error al anular: ' + error.message);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleDelete = (item) => {
        // Verificar restricciones
        if (item.estado_produccion === 'terminado') {
            toast.error('No se puede eliminar un registro terminado. Usa "Anular" en su lugar.');
            return;
        }

        if (item.transferido_inventario) {
            toast.error('No se puede eliminar: el registro ya fue transferido al inventario.');
            return;
        }

        // NUEVA LÓGICA: Si es un pedido y está en proceso, permitir eliminación total
        if (item.pedido_id && item.estado_produccion === 'en_proceso') {
            setConfirmModal({
                isOpen: true,
                title: '⚠️ ¿ELIMINAR PEDIDO COMPLETO?',
                message: 'Esta acción eliminará definitivamente el pedido y toda su información (Pagos, Producción, Detalles). Esta acción no se puede deshacer.',
                icon: <FaExclamationTriangle className="text-red-500" />,
                confirmText: 'SÍ, ELIMINAR TODO',
                confirmColor: 'red',
                onConfirm: async () => {
                    setLoading(true);
                    try {
                        await pedidosDB.eliminarPedidoCompleto(item.pedido_id);
                        toast.success('Pedido y toda su información eliminada correctamente');
                        fetchProduccion();
                        fetchStats();
                        fetchPedidosPendientes();
                    } catch (error) {
                        console.error('Error al eliminar pedido completo:', error);
                        toast.error('Error al eliminar: ' + error.message);
                    } finally {
                        setLoading(false);
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                }
            });
            return;
        }

        if (item.pedido_id) {
            toast.error('No se puede eliminar: el registro está asociado a un pedido.');
            return;
        }

        // Si es STOCK normal
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Producción',
            message: '¿Estás seguro? Esta acción no se puede deshacer y el registro será eliminado permanentemente.',
            icon: <FaTrash />,
            confirmText: 'Sí, eliminar',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await produccionDB.delete(item.id_produccion);
                    toast.success('Producción eliminada correctamente');
                    fetchProduccion();
                    fetchStats();
                    fetchPedidosPendientes();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    toast.error('Error al eliminar: ' + error.message);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
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

            // 1. Actualizar UI
            fetchProduccion();
            fetchStats();
            toast.success('Producción marcada como terminada');

            // 2. Preparar Prompt de Foto
            setFinishedItemForPhoto(item);
            setShowPhotoPrompt(true);

        } catch (error) {
            console.error('Error al marcar como terminado:', error);
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    // Handlers para el flujo de Foto Post-Terminado
    const handlePhotoPromptConfirm = () => {
        setShowPhotoPrompt(false);
        // Abrir modal de subida real
        setShowPhotoUploadModal(true);
    };

    const handlePhotoPromptCancel = () => {
        setShowPhotoPrompt(false);
        setFinishedItemForPhoto(null);
    };

    const handlePhotoUpload = async (file) => {
        if (!finishedItemForPhoto || !file) return;

        setUploadingImage(true);
        try {
            // Reutilizar lógica de compresión
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 0.5,
                maxWidth: 1024,
                quality: 0.8
            });

            const fileExtension = optimizedFile.name?.split('.').pop() || 'jpg';
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const fileName = `produccion/${uniqueId}.${fileExtension}`;

            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, optimizedFile);
            const downloadURL = await getDownloadURL(storageRef);

            // Actualizar registro en DB
            await produccionDB.update(finishedItemForPhoto.id_produccion, {
                // Recuperamos campos obligatorios del item si es necesario, 
                // o usamos un método patch si lo tuviéramos. 
                // produccionDB.update espera un objeto completo o parcial?
                // Revisando produccionNeonClient.js: update hace UPDATE SET ... todos los campos.
                // ¡CUIDADO! produccionDB.update espera TODOS los campos porque usa `produccionData.metal`, etc.
                // Si paso solo imagen_url, los otros pueden ser undefined/null y borrar datos.
                // Necesito obtener el item actualizado completo o usar un método específico para imagen.

                // SOLUCIÓN: Usaré update pasando los valores existentes del item.
                ...finishedItemForPhoto,
                estado_produccion: 'terminado', // Asegurar
                imagen_url: downloadURL
            });

            toast.success('Foto subida y guardada');
            setShowPhotoUploadModal(false);
            setFinishedItemForPhoto(null);
            fetchProduccion();

        } catch (error) {
            console.error('Error subiendo foto final:', error);
            toast.error('Error al subir foto: ' + error.message);
        } finally {
            setUploadingImage(false);
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

            // Subir a Firebase con nombre único
            const fileExtension = optimizedFile.name?.split('.').pop() || 'jpg';
            const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const fileName = `produccion/${uniqueId}.${fileExtension}`;

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
            // Mostrar error más descriptivo
            const errorMsg = error.code === 'storage/unauthorized'
                ? 'Error de permisos en Firebase. Revisa las reglas de Storage.'
                : error.message || 'Error desconocido al subir la imagen';
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imagen_url: '' }));
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const handleEditingFromDetail = (item) => {
        handleEdit(item);
    };

    const handleDeleteCompleted = async (id) => {
        if (!window.confirm('⚠️ ADVERTENCIA: Estás eliminando una producción terminada.\n\nEsto puede afectar el inventario.\n\n¿Estás seguro?')) return;

        try {
            await produccionDB.delete(id);
            toast.success('Registro eliminado correctamente');
            fetchProduccion();
            fetchStats();
            fetchPedidosPendientes();
            setMessage(null);
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar: ' + error.message);
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

    // Paginación y Filtrado
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, searchTerm]);

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

        const matchesYear = true;

        return matchesType && matchesSearch && matchesYear;
    }).sort((a, b) => {
        const dateA = new Date(a.fecha_produccion || a.created_at);
        const dateB = new Date(b.fecha_produccion || b.created_at);
        return dateB - dateA;
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredProduccion.length / itemsPerPage);
    const paginatedProduccion = filteredProduccion.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleTerminar = async (item) => {
        if (!window.confirm(`¿Confirmar que la producción de "${item.nombre_producto}" ha finalizado?`)) return;

        try {
            await produccionDB.updateEstado(item.id_produccion, 'terminado');
            toast.success('Producción marcada como terminada');
            resetForm();
            setMessage(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            fetchData();
        } catch (error) {
            console.error('Error al terminar producción:', error);
            toast.error('Error al actualizar el estado: ' + error.message);
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

    const handleSendToInventory = (item) => {
        // En lugar de redirigir, abrimos el nuevo modal simplificado
        setSendingToStockItem(item);
        setStockFormData({
            codigo: item.codigo_producto || '',
            cantidad: item.cantidad || '',
            precio: '',
            precioReferencial: '',
            tipo_producto: item.tipo_producto || ''
        });
        setShowStockModal(true);
    };

    const handleConfirmSendToStock = async (e) => {
        e.preventDefault();
        if (!stockFormData.codigo || !stockFormData.cantidad) {
            toast.error('Código y Cantidad son obligatorios');
            return;
        }

        setLoading(true);
        try {
            const result = await productosExternosDB.enviarAStock({
                codigo: stockFormData.codigo,
                cantidad: parseInt(stockFormData.cantidad),
                precio: stockFormData.precio ? parseFloat(stockFormData.precio) : null,
                precioReferencial: stockFormData.precioReferencial ? parseFloat(stockFormData.precioReferencial) : null,
                produccionId: sendingToStockItem.id_produccion,
                tipo_producto: stockFormData.tipo_producto
            });

            // Marcar el registro de producción como transferido en la base de datos
            if (result) {
                await produccionDB.markAsTransferred(sendingToStockItem.id_produccion, result.id);
            }

            toast.success('Producto enviado a stock correctamente');
            setShowStockModal(false);
            fetchProduccion();
            fetchProductosInventario();
        } catch (error) {
            console.error('Error al enviar a stock:', error);
            toast.error(error.message || 'Error al procesar el ingreso a stock');
        } finally {
            setLoading(false);
        }
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
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {formData.tipo_produccion === 'PEDIDO' ? 'Detalle (Generado Automáticamente)' : 'Detalle / Descripción para Taller *'}
                                </label>
                                <input
                                    type="text"
                                    name="nombre_producto"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-2 text-sm"
                                    placeholder="Ej: Anillo Ariete - plata - talla 8 - grabado simple"
                                    value={formData.nombre_producto}
                                    onChange={handleChange}
                                    required={formData.tipo_produccion === 'STOCK'}
                                />
                                {formData.tipo_produccion === 'STOCK' && (
                                    <p className="text-[10px] text-gray-500 mt-1">Especifique claramente qué se debe fabricar (Tipo, Nombre, Características).</p>
                                )}
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

                                {formData.estado_produccion === 'terminado' ? (
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
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] animate-pulse">
                                                    <FaSpinner className="animate-spin text-xl mb-1" />
                                                    <span>Subiendo...</span>
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
                                ) : (
                                    <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                            <FaBan className="text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">Imagen no disponible</p>
                                        <p className="text-xs text-gray-400 max-w-[200px]">
                                            Solo se pueden subir fotos cuando la producción está en estado <strong>Terminado</strong>.
                                        </p>
                                    </div>
                                )}
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
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="h-[44px]">
                                <th className="px-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Origen</th>
                                <th className="px-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
                                <th className="hidden md:table-cell px-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cant</th>
                                <th className="px-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Est.</th>
                                <th className="px-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {paginatedProduccion.map((item) => (
                                <tr key={item.id_produccion} className="h-[70px] md:h-[58px] hover:bg-gray-50/50 transition-colors group">
                                    {/* ... content ... */}
                                    <td className="px-3 whitespace-nowrap hidden md:table-cell">
                                        {item.pedido_id ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-amber-50 text-amber-600 border border-amber-100">
                                                Ped #{item.pedido_id}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-gray-50 text-gray-500 border border-gray-200">
                                                Stock
                                            </span>
                                        )}
                                    </td>

                                    {/* 2. Producto (+ Origen/Cant on Mobile) */}
                                    <td className="px-3">
                                        <div className="flex flex-col">
                                            {/* Badge Mobile */}
                                            <div className="md:hidden flex items-center gap-2 mb-0.5">
                                                {item.pedido_id ? (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 uppercase">P#{item.pedido_id}</span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 uppercase">Stock</span>
                                                )}
                                            </div>
                                            <div className="text-[14px] text-gray-700 font-normal leading-tight">
                                                {item.tipo_producto} – {item.metal}
                                            </div>
                                            <div className="md:hidden text-[11px] text-gray-400 font-normal mt-0.5">
                                                {item.cantidad}u
                                            </div>
                                        </div>
                                    </td>

                                    {/* 3. Cant - Desktop */}
                                    <td className="hidden md:table-cell px-3 text-center text-[13px] text-gray-500 font-normal">
                                        {item.cantidad}u
                                    </td>

                                    {/* 4. Estado - Icono solamente */}
                                    <td className="px-3 text-center">
                                        <div className="flex justify-center">
                                            {item.estado_produccion === 'terminado' ? (
                                                <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 border border-green-100" title="Terminado">
                                                    <FaCheck size={14} className="md:w-3.5" />
                                                </div>
                                            ) : item.estado_produccion === 'anulado' ? (
                                                <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100" title="Anulado">
                                                    <FaBan size={14} className="md:w-3.5" />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100" title="En proceso">
                                                    <span className="text-sm md:text-xs animate-pulse">⏳</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* 5. Fecha - Solo una (Inicio o Fin) */}
                                    <td className="px-3 text-right whitespace-nowrap">
                                        <div className="text-[12px] md:text-[11px] text-gray-500 font-normal">
                                            {(() => {
                                                const dateStr = item.estado_produccion === 'terminado' ? (item.fecha_produccion || item.created_at) : item.created_at;
                                                if (!dateStr) return '-';
                                                const date = new Date(dateStr.toString().includes('T') ? dateStr : dateStr + 'T20:00:00');
                                                return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
                                            })()}
                                        </div>
                                    </td>

                                    {/* 6. Acciones - Iconos solamente */}
                                    <td className="px-3 text-right whitespace-nowrap">
                                        <div className="flex justify-end items-center gap-1 md:gap-3">
                                            {/* Ver Detalle */}
                                            <button
                                                onClick={() => handleView(item)}
                                                className="w-[40px] h-[40px] md:w-[36px] md:h-[36px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                title="Ver detalle"
                                            >
                                                <span className="text-[22px] md:text-[20px]">👁️</span>
                                            </button>

                                            {/* Subir Foto - Solo si terminado */}
                                            {item.estado_produccion === 'terminado' && (
                                                <button
                                                    onClick={() => { setFinishedItemForPhoto(item); setShowPhotoUploadModal(true); }}
                                                    className="w-[40px] h-[40px] md:w-[36px] md:h-[36px] flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
                                                    title="Subir foto"
                                                >
                                                    <FaCamera size={18} className="md:w-4 md:h-4" />
                                                </button>
                                            )}

                                            {/* Anular - Solo si terminado */}
                                            {item.estado_produccion === 'terminado' && (
                                                <button
                                                    onClick={() => handleAnular(item)}
                                                    className="w-[40px] h-[40px] md:w-[36px] md:h-[36px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                    title="Anular"
                                                >
                                                    <FaBan size={18} className="md:w-4 md:h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredProduccion.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No se encontraron registros de producción.
                        </div>
                    ) : (
                        /* Paginación */
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 px-4 py-3 border-t border-gray-200 mt-2 rounded-b-lg gap-4">
                            <div className="text-xs text-gray-500 font-medium">
                                Mostrando <span className="text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-gray-800">{Math.min(currentPage * itemsPerPage, filteredProduccion.length)}</span> de <span className="text-gray-800 font-bold">{filteredProduccion.length}</span> registros
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Anterior
                                </button>

                                <div className="flex items-center justify-center px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                                    Página {currentPage} de {totalPages}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
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

            {/* Modal Enviar a Stock (Simplificado) */}
            {
                showStockModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <FaBox /> Enviar a Stock
                                </h3>
                                <p className="text-blue-100 text-sm mt-1">
                                    Incrementa el stock de un producto existente en el inventario.
                                </p>
                            </div>

                            <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Producto:</span>
                                <span className="text-sm font-semibold text-blue-900">{stockFormData.tipo_producto}</span>
                            </div>

                            <form onSubmit={handleConfirmSendToStock} className="p-6 space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Código QR / Único *</label>
                                        <div className="relative">
                                            <FaQrcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono"
                                                placeholder="Ingresa o escanea el código"
                                                value={stockFormData.codigo}
                                                onChange={(e) => setStockFormData({ ...stockFormData, codigo: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-24 h-24 bg-white p-2 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                        {stockFormData.codigo ? (
                                            <QRCode value={stockFormData.codigo} size={80} className="w-full h-full" />
                                        ) : (
                                            <div className="text-[10px] text-gray-400 text-center">Sin código</div>
                                        )}
                                    </div>
                                </div>

                                {/* Aviso informativo si el código no existe */}
                                {stockFormData.codigo && !productosEnInventario.some(p => p.codigo_usuario === stockFormData.codigo) && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3 animate-pulse">
                                        <FaExclamationTriangle className="text-amber-500 mt-1 shrink-0" />
                                        <div className="text-xs text-amber-800">
                                            <p className="font-bold uppercase mb-0.5">Nuevo Producto Detectado</p>
                                            <p>El código <strong>{stockFormData.codigo}</strong> no existe. Se creará un nuevo registro en el inventario al confirmar.</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cantidad *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        value={stockFormData.cantidad}
                                        onChange={(e) => setStockFormData({ ...stockFormData, cantidad: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio de Venta</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            placeholder="0.00"
                                            value={stockFormData.precio}
                                            onChange={(e) => setStockFormData({ ...stockFormData, precio: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Opcional</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            placeholder="0.00"
                                            value={stockFormData.precioReferencial}
                                            onChange={(e) => setStockFormData({ ...stockFormData, precioReferencial: e.target.value })}
                                        />
                                    </div>
                                </div>


                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowStockModal(false)}
                                        className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'PROCESANDO...' : 'CONFIRMAR'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Modal de Confirmación */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                confirmColor={confirmModal.confirmColor}
                icon={confirmModal.icon}
            />

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Modal Prompt Foto Terminado */}
            {
                showPhotoPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                <FaCamera />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Subir foto del producto?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                El producto ha sido marcado como <strong>TERMINADO</strong>. <br />
                                ¿Deseas agregar una foto del resultado final ahora?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePhotoPromptCancel}
                                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    No, gracias
                                </button>
                                <button
                                    onClick={handlePhotoPromptConfirm}
                                    className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                >
                                    Sí, subir foto
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal Subida de Foto Final */}
            {
                showPhotoUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                            {/* Header con gradiente rojo/naranja */}
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <FaCamera /> Agregar Foto
                                    </h3>
                                    <p className="text-xs text-white/80 mt-1 max-w-[250px] truncate">
                                        {finishedItemForPhoto?.nombre_producto || finishedItemForPhoto?.tipo_producto || 'Producto finalizado'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPhotoUploadModal(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Zona de Drop/Click */}
                                <div
                                    className="border-2 border-dashed border-orange-200 bg-orange-50/30 rounded-xl h-48 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-orange-50 transition-colors group relative"
                                    onClick={() => !uploadingImage && document.getElementById('final-photo-input').click()}
                                >
                                    <input
                                        id="final-photo-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) handlePhotoUpload(e.target.files[0]);
                                        }}
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage ? (
                                        <div className="animate-pulse flex flex-col items-center justify-center w-full h-full bg-white/80 absolute inset-0 z-10">
                                            <FaSpinner className="animate-spin text-orange-500 text-3xl mb-2" />
                                            <span className="text-orange-600 font-bold text-sm">Subiendo foto...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <FaCamera size={24} />
                                            </div>
                                            <span className="text-gray-600 font-medium text-sm">Haz clic para subir imagen</span>
                                            <span className="text-gray-400 text-xs mt-1">JPG, PNG • Máx 5MB</span>
                                        </>
                                    )}
                                </div>

                                {/* Warning Box */}
                                <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-3 items-start">
                                    <FaExclamationTriangle className="text-amber-500 mt-0.5 shrink-0" size={14} />
                                    <div className="text-xs text-amber-800">
                                        <span className="font-bold block mb-0.5">Finalización de Proceso</span>
                                        La foto se asociará a este registro y será visible en el detalle del producto terminado.
                                    </div>
                                </div>

                                {/* Botón Cancelar */}
                                <button
                                    onClick={() => setShowPhotoUploadModal(false)}
                                    className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg text-sm uppercase tracking-wide transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal Detalle de Producción */}
            {
                showDetailModal && selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
                            {/* Header Refinado */}
                            <div className="bg-white border-b border-gray-100 px-4 h-[48px] flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                    <h3 className="text-[15px] font-semibold text-gray-800">Detalle Registro #{selectedItem.id_produccion}</h3>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors">
                                    <FaTimes size={16} />
                                </button>
                            </div>

                            {/* Contenido Compacto */}
                            <div className="overflow-y-auto p-3 space-y-2 bg-white flex-1 custom-scrollbar">

                                {/* Estado - Badge Compacto */}
                                <div className="flex justify-between items-center h-[34px] border-b border-gray-50 px-1">
                                    <span className="text-[11px] font-normal text-gray-500 uppercase tracking-tight">Estado:</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-tighter ${selectedItem.estado_produccion === 'terminado' ? 'bg-green-50 text-green-600 border border-green-100' :
                                        selectedItem.estado_produccion === 'en_proceso' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                            'bg-gray-50 text-gray-600 border border-gray-100'
                                        }`}>
                                        {selectedItem.estado_produccion === 'terminado' && <FaCheckCircle className="mr-1 text-[10px]" />}
                                        {selectedItem.estado_produccion.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Sección Producto - Minimalista */}
                                <div className="bg-gray-50/50 rounded-lg p-2.5 border border-gray-100">
                                    <div className="mb-2">
                                        <span className="block text-[11px] text-gray-400 uppercase font-normal mb-0.5">Nombre / Modelo:</span>
                                        <span className="text-[14px] text-gray-800 font-medium leading-tight">
                                            {selectedItem.nombre_producto?.replace(/^.*?\s*-\s*/, '') || '-'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                        <div className="h-[32px] flex flex-col justify-center">
                                            <span className="text-[11px] text-gray-400 uppercase font-normal leading-none">Tipo:</span>
                                            <span className="text-[12px] text-gray-700 font-normal">{selectedItem.tipo_producto}</span>
                                        </div>
                                        <div className="h-[32px] flex flex-col justify-center">
                                            <span className="text-[11px] text-gray-400 uppercase font-normal leading-none">Cantidad:</span>
                                            <span className="text-[12px] text-gray-700 font-normal">{selectedItem.cantidad} unidades</span>
                                        </div>
                                        <div className="col-span-2 h-[32px] flex flex-col justify-center border-t border-gray-100 mt-1 pt-1">
                                            <span className="text-[11px] text-gray-400 uppercase font-normal leading-none">Material / Metal:</span>
                                            <span className="text-[12px] text-gray-700 font-normal">{selectedItem.metal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección Cliente - Solo si corresponde */}
                                {selectedItem.pedido_id && (
                                    <div className="bg-blue-50/30 border border-blue-50 rounded-lg p-2.5 flex justify-between items-center group">
                                        <div>
                                            <span className="block text-[11px] text-blue-400 uppercase font-normal">Cliente:</span>
                                            <span className="text-[13px] text-gray-800 font-normal">{selectedItem.nombre_cliente}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                                PED #{selectedItem.pedido_id}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Sección Costos - Limpia y Compacta */}
                                <div className="p-2 px-1">
                                    <div className="flex justify-between items-center h-[28px] text-[12px] text-gray-600 font-normal">
                                        <span>Insumos / Materiales</span>
                                        <span>S/ {parseFloat(selectedItem.costo_materiales || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center h-[28px] text-[12px] text-gray-600 font-normal">
                                        <span>Mano de Obra</span>
                                        <span>S/ {parseFloat(selectedItem.mano_de_obra || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center h-[28px] text-[12px] text-gray-600 font-normal">
                                        <span>Costos Indirectos / Otros</span>
                                        <span>S/ {(parseFloat(selectedItem.costo_herramientas || 0) + parseFloat(selectedItem.otros_gastos || 0)).toFixed(2)}</span>
                                    </div>
                                    <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-[11px] text-gray-400 uppercase font-normal">Costo Total Unitario</span>
                                        <span className="text-[13px] font-semibold text-blue-600 tracking-tight">
                                            S/ {parseFloat(selectedItem.costo_total_unitario || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Observaciones - Secundarias */}
                                <div className="pt-1 border-t border-gray-50">
                                    <span className="block text-[11px] text-gray-400 uppercase font-normal mb-1">Observaciones:</span>
                                    <p className="text-[11px] text-gray-500 font-normal leading-relaxed overflow-hidden">
                                        {selectedItem.observaciones || "Sin notas adicionales."}
                                    </p>
                                </div>

                                {/* Fechas - Pie del contenido */}
                                <div className="flex justify-between items-center pt-3 text-[11px] text-gray-400 font-normal border-t border-gray-50 px-1">
                                    <span>Fabricado: {selectedItem.fecha_produccion ? new Date(selectedItem.fecha_produccion).toLocaleDateString() : '-'}</span>
                                    <span className="opacity-70">Registro: {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                                    <span>Fabricado: {selectedItem.fecha_produccion ? new Date(selectedItem.fecha_produccion).toLocaleDateString('es-ES') : '-'}</span>
                                    <span className="opacity-70">Registro: {new Date(selectedItem.created_at).toLocaleDateString('es-ES')}</span>
                                </div>

                            </div>

                            {/* Footer Refinado */}
                            <div className="bg-white px-4 py-3 border-t border-gray-100 shrink-0 flex gap-2.5">
                                {/* Botón Terminar (Nuevo lugar para limpiar el grid) */}
                                {selectedItem.estado_produccion === 'en_proceso' && (
                                    <button
                                        onClick={() => { setShowDetailModal(false); handleMarkAsComplete(selectedItem); }}
                                        className="flex-1 h-[38px] bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <FaCheck size={14} /> Terminar Proceso
                                    </button>
                                )}

                                <button
                                    onClick={() => { setShowDetailModal(false); handleEditingFromDetail(selectedItem); }}
                                    className="h-[38px] w-[38px] flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                    title="Editar"
                                >
                                    <FaEdit size={16} />
                                </button>

                                {selectedItem.estado_produccion !== 'terminado' && (
                                    <button
                                        onClick={() => { setShowDetailModal(false); handleDelete(selectedItem); }}
                                        className="h-[38px] w-[38px] flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                        title="Eliminar"
                                    >
                                        <FaTrash size={15} />
                                    </button>
                                )}

                                {selectedItem.estado_produccion !== 'en_proceso' && (
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="flex-1 h-[38px] bg-gray-900 hover:bg-black text-white text-[13px] font-medium rounded-lg transition-all active:scale-[0.98]"
                                    >
                                        Cerrar Detalle
                                    </button>
                                )}

                                {selectedItem.estado_produccion === 'en_proceso' && (
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 h-[38px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-all"
                                    >
                                        Cerrar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default Produccion;
