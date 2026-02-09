import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { clientesDB } from '../utils/clientesNeonClient';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../utils/produccionNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import { getLocalDate } from '../utils/dateUtils';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaWhatsapp, FaPrint, FaSearch, FaMoneyBillWave, FaShareAlt, FaImage, FaPhone, FaArrowLeft, FaHammer, FaCar, FaExclamationTriangle, FaCheck, FaEye, FaUser, FaBox, FaTruck } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ui/ConfirmModal';
import Tooltip from './ui/Tooltip';
import VoiceDialog from './VoiceDialog';
import DictationTextarea from '../voice/DictationTextarea';

// ========================================
// UTILIDADES DE FECHA
// ========================================

// Función para formatear fechas sin problemas de zona horaria
const formatLocalDate = (dateString) => {
    if (!dateString) return '';

    try {
        // Convertir a string si es un objeto Date
        let dateStr = typeof dateString === 'string' ? dateString : dateString.toString();

        // Si la fecha viene en formato ISO (YYYY-MM-DD), la parseamos directamente
        // Extraer solo la parte de la fecha (antes de 'T' si existe)
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

        // Verificar que tenga el formato correcto (YYYY-MM-DD)
        if (!datePart.includes('-')) {
            // Si no tiene guiones, intentar crear una fecha y formatearla
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        }

        const [year, month, day] = datePart.split('-');

        // Validar que tenemos los tres componentes
        if (!year || !month || !day) return '';

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formateando fecha:', dateString, error);
        return '';
    }
};

// ========================================
// COMPONENTES DE BADGE
// ========================================

const EstadoPedidoBadge = ({ estado }) => {
    const estilos = {
        aceptado: 'bg-blue-100 text-blue-800',
        entregado: 'bg-green-100 text-green-800'
    };

    const iconos = {
        aceptado: '🔵',
        entregado: '🟢'
    };

    const labels = {
        aceptado: 'Aceptado',
        entregado: 'Entregado'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[estado] || 'bg-gray-100 text-gray-800'}`}>
            {iconos[estado] || '⚪'} {labels[estado] || estado}
        </span>
    );
};

const EstadoProduccionBadge = ({ estado }) => {
    const estilos = {
        no_iniciado: 'bg-yellow-100 text-yellow-800',
        en_proceso: 'bg-blue-100 text-blue-800',
        terminado: 'bg-green-100 text-green-800'
    };

    const iconos = {
        no_iniciado: '🟡',
        en_proceso: '🔵',
        terminado: '🟢'
    };

    const labels = {
        no_iniciado: 'No iniciado',
        en_proceso: 'En proceso',
        terminado: 'Terminado'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[estado] || 'bg-gray-100 text-gray-800'}`}>
            {iconos[estado] || '⚪'} {labels[estado] || estado}
        </span>
    );
};

const EstadoPagoBadge = ({ pedido }) => {
    let estado = 'pendiente';

    if (pedido.monto_a_cuenta === 0) {
        estado = 'pendiente';
    } else if (pedido.monto_saldo > 0) {
        estado = 'adelanto';
    } else {
        estado = 'pagado';
    }

    const estilos = {
        pendiente: 'bg-red-100 text-red-800',
        adelanto: 'bg-yellow-100 text-yellow-800',
        pagado: 'bg-green-100 text-green-800'
    };

    const iconos = {
        pendiente: '🔴',
        adelanto: '🟡',
        pagado: '🟢'
    };

    const labels = {
        pendiente: 'Pendiente',
        adelanto: 'Adelanto',
        pagado: 'Pagado'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[estado]}`}>
            {iconos[estado]} {labels[estado]}
        </span>
    );
};

// ========================================
// CONSTANTES LOCALES
// ========================================
const MATERIALES_PEDIDO = ['Plata', 'Alpaca', 'Cobre', 'Bronce', 'Bisutería'];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================


const Pedidos = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printPedido, setPrintPedido] = useState(null);
    const [fechaPago, setFechaPago] = useState(getLocalDate());

    // Quick Pay Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payPedido, setPayPedido] = useState(null);
    const [payData, setPayData] = useState({
        monto: '',
        fecha: getLocalDate(),
        metodo: 'Efectivo'
    });

    const [showCancelAlert, setShowCancelAlert] = useState(false); // Nuevo estado para popup
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal de confirmación

    // Estado Modal para cambiar estado de pedido/producción
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [estadoPedido, setEstadoPedido] = useState(null);
    const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('');
    const [nuevoEstadoProduccion, setNuevoEstadoProduccion] = useState('');

    // Estados para Confirm Modals
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        icon: null,
        confirmText: '',
        confirmColor: 'blue',
        onConfirm: () => { }
    });
    const [focusedField, setFocusedField] = useState(null);

    // Trackear en qué campo está el cursor
    const handleFocus = (e) => {
        setFocusedField(e.target.name);
    };

    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        dni_ruc: '',
        direccion_entrega: '',
        metal: '',
        tipo_producto: '',
        forma_pago: 'Efectivo',
        requiere_envio: false,
        modalidad_envio: 'Fijo',
        envio_cobrado_al_cliente: '',
        monto_a_cuenta: '',
        incluye_igv: false,
        estado_pedido: 'aceptado',
        estado_produccion: 'no_iniciado',
        direccion_cliente_db: '', // Guardamos la dirección del registro para autocompletado
    });

    // Estado para el producto actual siendo agregado
    const [productoActual, setProductoActual] = useState({
        nombre_producto: '',
        cantidad: '',
        precio_unitario: ''
    });

    // Lista de productos del pedido actual
    const [listaProductos, setListaProductos] = useState([]);

    // Cálculos
    const [calculos, setCalculos] = useState({
        precio_total_sin_igv: 0,
        monto_igv: 0,
        precio_total: 0,
        monto_saldo: 0,
        cancelado: false
    });

    const [tipoPagoInicial, setTipoPagoInicial] = useState('adelanto'); // 'adelanto' | 'total'

    // Estado para Resumen de Voz
    const [showVoiceReviewModal, setShowVoiceReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [voiceState, setVoiceState] = useState({ isListening: false, transcriptActual: '' });
    // FASE 1: Estado para tabs - Empezamos solo con Pendientes
    const [activeTab, setActiveTab] = useState('pendientes');
    const [tiposDisponibles, setTiposDisponibles] = useState([]);
    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [showSugerencias, setShowSugerencias] = useState(false);
    const [nombreBusqueda, setNombreBusqueda] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSugerencias(false);
                // Si cerramos y no hay un cliente seleccionado (validado por teléfono), reseteamos el nombre y búsqueda
                if (!formData.telefono && formData.nombre_cliente) {
                    setNombreBusqueda('');
                    setFormData(prev => ({ ...prev, nombre_cliente: '' }));
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [formData.telefono, formData.nombre_cliente]);

    useEffect(() => {
        fetchPedidos();
        loadTipos();
    }, []);

    const loadTipos = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setTiposDisponibles(data || []);
        } catch (error) {
            console.error('Error cargando tipos:', error);
        }
    };

    const handleSearchCliente = async (query) => {
        setNombreBusqueda(query);
        setFormData(prev => ({
            ...prev,
            nombre_cliente: query,
            telefono: '', // Limpiar datos de cliente previo mientras se busca
            dni_ruc: '',
            direccion_cliente_db: ''
        }));

        if (query.trim().length > 1) {
            try {
                const results = await clientesDB.search(query);
                setClientesSugeridos(results);
                setShowSugerencias(true);
            } catch (error) {
                console.error('Error buscando clientes:', error);
            }
        } else {
            setClientesSugeridos([]);
            setShowSugerencias(false);
        }
    };

    const handleSelectCliente = (cliente) => {
        setFormData(prev => ({
            ...prev,
            nombre_cliente: cliente.nombre,
            telefono: cliente.telefono || prev.telefono,
            dni_ruc: cliente.dni || cliente.dni_ruc || prev.dni_ruc,
            direccion_cliente_db: cliente.direccion || ''
        }));
        setNombreBusqueda(cliente.nombre);
        setShowSugerencias(false);
    };

    const fetchPedidos = async () => {
        try {
            const data = await pedidosDB.getAll();
            setPedidos(data || []);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        }
    };

    useEffect(() => {
        // Calcular subtotal de la lista de productos
        const subtotalProductos = listaProductos.reduce((acc, item) => {
            return acc + (item.cantidad * item.precio_unitario);
        }, 0);

        const envio = formData.requiere_envio ? (parseFloat(formData.envio_cobrado_al_cliente) || 0) : 0;

        // Nueva Lógica: precio_total_sin_igv es SOLO productos (Valor Venta)
        const precio_total_sin_igv = subtotalProductos;

        let monto_igv = 0;
        if (formData.incluye_igv) {
            monto_igv = precio_total_sin_igv * 0.18;
        }

        // Total = (Productos + IGV) + Envío
        const precio_total = precio_total_sin_igv + monto_igv + envio;

        const monto_a_cuenta = parseFloat(formData.monto_a_cuenta) || 0;
        const monto_saldo_raw = precio_total - monto_a_cuenta;
        const monto_saldo = monto_saldo_raw < 0.10 ? 0 : monto_saldo_raw;
        // Cancelado solo si hay monto total (> 0) y el saldo es 0
        const cancelado = precio_total > 0 && monto_saldo <= 0.001;

        setCalculos({
            precio_total_sin_igv: parseFloat(precio_total_sin_igv.toFixed(2)),
            monto_igv: parseFloat(monto_igv.toFixed(2)),
            precio_total: parseFloat(precio_total.toFixed(2)),
            monto_saldo: parseFloat(monto_saldo.toFixed(2)),
            cancelado
        });

        // Mostrar popup si se cancela (solo si no estaba ya mostrado y es true)
        if (cancelado) {
            setShowCancelAlert(true);
        } else {
            setShowCancelAlert(false);
        }

    }, [formData, listaProductos]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Si se activa el check de envío y hay una dirección guardada en el cliente, la cargamos
            if (name === 'requiere_envio' && checked && prev.direccion_cliente_db) {
                newData.direccion_entrega = prev.direccion_cliente_db;
            }

            return newData;
        });
    };

    const handleProductoChange = (e) => {
        const { name, value } = e.target;
        setProductoActual(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const agregarProducto = () => {
        // Validación más estricta: nombre, cantidad > 0, precio >= 0 (y que no esté vacío)
        if (!productoActual.nombre_producto.trim() || !productoActual.cantidad || productoActual.cantidad <= 0 || productoActual.precio_unitario === '' || productoActual.precio_unitario < 0) {
            toast.error('Complete nombre, cantidad y precio del producto', {
                duration: 4000
            });
            return;
        }

        // Validar Metal y Tipo antes de agregar el producto
        if (!productoActual.metal || !productoActual.tipo_producto) {
            toast.warning('Seleccione Metal y Tipo antes de agregar el producto', {
                duration: 4000
            });
            return;
        }

        setListaProductos(prev => [...prev, {
            ...productoActual,
            cantidad: parseFloat(productoActual.cantidad),
            precio_unitario: parseFloat(productoActual.precio_unitario),
            metal: productoActual.metal,           // Guardar metal específico
            tipo_producto: productoActual.tipo_producto // Guardar tipo específico
        }]);

        // Resetear campos del producto
        setProductoActual({
            nombre_producto: '',
            cantidad: '',
            precio_unitario: '',
            metal: '',
            tipo_producto: ''
        });
    };

    const eliminarProductoLista = (index) => {
        setListaProductos(prev => prev.filter((_, i) => i !== index));
    };



    const handleEdit = (pedido) => {
        // No permitir edición de pedidos entregados
        if (pedido.estado_pedido === 'entregado') {
            toast.error('No se puede editar un pedido entregado', {
                duration: 4000
            });
            return;
        }

        setEditingId(pedido.id_pedido);

        setFormData({
            nombre_cliente: pedido.nombre_cliente,
            telefono: pedido.telefono || '',
            dni_ruc: pedido.dni_ruc || '',
            direccion_entrega: pedido.direccion_entrega || '',
            metal: pedido.metal || 'Plata', // This is for the form, but products are now individual
            tipo_producto: pedido.tipo_producto || 'Anillo', // This is for the form, but products are now individual
            forma_pago: pedido.forma_pago || 'Efectivo',
            requiere_envio: pedido.requiere_envio,
            modalidad_envio: pedido.modalidad_envio || 'Fijo',
            envio_cobrado_al_cliente: pedido.envio_cobrado_al_cliente || 0,
            envio_referencia: pedido.envio_referencia || 0,
            monto_a_cuenta: pedido.monto_a_cuenta || 0,
            entregado: pedido.entregado,
            incluye_igv: pedido.incluye_igv,
            estado_pedido: pedido.estado_pedido || 'aceptado',
            estado_produccion: pedido.estado_produccion || 'no_iniciado',
        });

        // Cargar productos en la lista desde detalles_pedido
        if (pedido.detalles_pedido && pedido.detalles_pedido.length > 0) {
            setListaProductos(pedido.detalles_pedido.map(d => ({
                nombre_producto: d.nombre_producto,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                metal: d.metal,
                tipo_producto: d.tipo_producto
            })));
        } else {
            setListaProductos([]);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar / Cancelar Pedido',
            message: '¿Estás seguro? Esta acción no se puede deshacer.',
            icon: <FaTrash />,
            confirmText: 'Sí, eliminar',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await pedidosDB.delete(id);
                    toast.success('Pedido eliminado correctamente');
                    fetchPedidos();
                } catch (error) {
                    console.error('Error al eliminar:', error);
                    toast.error('Error al eliminar: ' + error.message);
                }
            }
        });
    };

    const navigate = useNavigate();

    const handleEntregar = async (pedido) => {
        // Validación: Producción debe estar terminada
        if (pedido.estado_produccion !== 'terminado') {
            toast.error('No se puede entregar: producción no terminada', {
                icon: '⚠️',
                duration: 4000
            });
            return;
        }

        // Confirmar entrega Minimalista
        setConfirmModal({
            isOpen: true,
            title: 'Confirmar Entrega',
            message: '¿Confirmar entrega del pedido?',
            icon: <FaCar className="text-blue-500" />,
            confirmText: 'Confirmar',
            confirmColor: 'blue',
            onConfirm: () => confirmarEntrega(pedido)
        });
    };

    const confirmarEntrega = async (pedido) => {
        try {
            await pedidosDB.updateEstadoPedido(pedido.id_pedido, 'entregado', new Date().toISOString());
            toast.success(`Pedido de ${pedido.nombre_cliente} marcado como entregado`);
            fetchPedidos();
        } catch (error) {
            console.error('Error al marcar como entregado:', error);
            toast.error('Error al actualizar el pedido: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre_cliente: '',
            telefono: '',
            dni_ruc: '',
            direccion_entrega: '',
            metal: '',
            tipo_producto: '',
            forma_pago: 'Efectivo',
            requiere_envio: false,
            modalidad_envio: 'Fijo',
            envio_cobrado_al_cliente: 0,
            monto_a_cuenta: '',
            incluye_igv: false,
            entregado: false,
            estado_pedido: 'aceptado',
            estado_produccion: 'no_iniciado',
        });
        setProductoActual({
            nombre_producto: '',
            cantidad: '',
            precio_unitario: '',
            metal: '',
            tipo_producto: ''
        });
        setListaProductos([]);
        setEditingId(null);
        setTipoPagoInicial('adelanto');
        setFechaPago(getLocalDate());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validar Productos
        if (listaProductos.length === 0) {
            setMessage({ type: 'error', text: "Debe agregar al menos un producto al pedido." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // 2. Validar Campos Obligatorios Clientes
        if (!formData.nombre_cliente || !formData.telefono) {
            setMessage({ type: 'error', text: "El Nombre del Cliente y Teléfono son obligatorios." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }



        setLoading(true);
        setMessage(null);

        try {
            const pedidoData = {
                nombre_cliente: formData.nombre_cliente,
                telefono: formData.telefono,
                dni_ruc: formData.dni_ruc,
                direccion_entrega: formData.direccion_entrega,
                metal: formData.metal || (listaProductos.length > 0 ? listaProductos[0].metal : ''),
                tipo_producto: formData.tipo_producto || (listaProductos.length > 0 ? listaProductos[0].tipo_producto : ''),
                forma_pago: formData.forma_pago,
                requiere_envio: formData.requiere_envio,
                modalidad_envio: formData.modalidad_envio,
                envio_cobrado_al_cliente: parseFloat(formData.envio_cobrado_al_cliente) || 0,
                envio_referencia: parseFloat(formData.envio_referencia || 0),
                precio_total_sin_igv: calculos.precio_total_sin_igv,
                precio_total: calculos.precio_total,
                monto_a_cuenta: parseFloat(formData.monto_a_cuenta) || 0,
                entregado: false,
                incluye_igv: formData.incluye_igv,
                monto_igv: calculos.monto_igv,
                monto_saldo: calculos.monto_saldo,
                cancelado: calculos.cancelado,
                estado_pedido: formData.estado_pedido || 'aceptado',
                estado_produccion: formData.estado_produccion || 'no_iniciado',
            };

            console.log('📝 Datos del pedido a guardar:', pedidoData);
            console.log('📦 Productos:', listaProductos);

            let pedidoId = editingId;

            if (editingId) {
                // Actualizar Pedido
                console.log('🔄 Actualizando pedido ID:', editingId);
                const pedidoActualizado = await pedidosDB.update(editingId, pedidoData);

                if (!pedidoActualizado) {
                    throw new Error("La base de datos no devolvió confirmación de actualización.");
                }

                // Reemplazar detalles
                await pedidosDB.deleteDetalles(editingId);
                await pedidosDB.createDetalles(editingId, listaProductos);

                setMessage({ type: 'success', text: 'Pedido actualizado correctamente.' });

            } else {
                // Crear Nuevo Pedido
                console.log('✨ Creando nuevo pedido...');
                const pedido = await pedidosDB.create(pedidoData);

                if (!pedido || !pedido.id_pedido) {
                    console.error("Respuesta de BD inválida:", pedido);
                    throw new Error("No se pudo crear el pedido: La base de datos no devolvió un ID válido.");
                }

                console.log('✅ Pedido creado:', pedido);
                pedidoId = pedido.id_pedido;

                // Crear detalles
                console.log('📦 Creando detalles del pedido...');
                await pedidosDB.createDetalles(pedidoId, listaProductos);
                console.log('✅ Detalles creados');

                // Registrar pago inicial si hay monto a cuenta
                if (pedidoData.monto_a_cuenta > 0) {
                    console.log('💰 Registrando pago inicial...');
                    await pedidosDB.createPago({
                        id_pedido: pedidoId,
                        monto: pedidoData.monto_a_cuenta,
                        fecha_pago: getLocalDate(),
                        metodo_pago: formData.forma_pago,
                        referencia: ''
                    });
                    console.log('✅ Pago registrado');
                }

                // Mostrar modal de confirmación en lugar de mensaje
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000); // Auto-cerrar después de 3 segundos
            }

            console.log('🔄 Refrescando lista de pedidos...');
            await fetchPedidos();
            console.log('✅ Lista actualizada');

            resetForm();

        } catch (error) {
            console.error('Error completo al guardar pedido:', error);
            console.error('Stack trace:', error.stack);
            const errorMsg = error.message || 'Error desconocido';
            toast.error(`Error al guardar: ${errorMsg}`, {
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (pedido) => {
        const telefono = pedido.telefono ? pedido.telefono.replace(/\D/g, '') : '';
        if (!telefono) {
            toast.warning('Cliente sin teléfono registrado', { duration: 3000 });
            return;
        }

        const items = pedido.detalles_pedido.map(d => `- ${d.cantidad}x ${d.nombre_producto} (S/ ${d.precio_unitario.toFixed(2)})`).join('\n');
        const mensaje = `*Hola ${pedido.nombre_cliente}, aquí está el resumen de tu pedido:*\n\n${items}\n\n*Total a Pagar:* S/ ${pedido.precio_total.toFixed(2)}\n*A Cuenta:* S/ ${pedido.monto_a_cuenta.toFixed(2)}\n*Saldo Pendiente:* S/ ${pedido.monto_saldo.toFixed(2)}\n\nGracias por tu preferencia!`;

        const url = `https://wa.me/51${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    const handlePrint = (pedido) => {
        setPrintPedido(pedido);
        setShowPrintModal(true);
    };

    const closePrintModal = () => {
        setShowPrintModal(false);
        setPrintPedido(null);
    };

    // Quick Pay Handlers
    const handleOpenPayModal = (pedido) => {
        setPayPedido(pedido);
        setPayData({
            monto: pedido.monto_saldo,
            fecha: getLocalDate(),
            metodo: 'Efectivo'
        });
        setShowPayModal(true);
    };

    const handleClosePayModal = () => {
        setShowPayModal(false);
        setPayPedido(null);
    };

    const handleQuickPay = async () => {
        if (!payPedido || !payData.monto) return;

        try {
            const montoPago = parseFloat(payData.monto);
            const nuevoAcuenta = (payPedido.monto_a_cuenta || 0) + montoPago;
            const nuevoSaldo = payPedido.precio_total - nuevoAcuenta;
            const cancelado = nuevoSaldo <= 0.05;

            // Update pedido
            await pedidosDB.update(payPedido.id_pedido, {
                ...payPedido,
                monto_a_cuenta: nuevoAcuenta,
                monto_saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo,
                cancelado: cancelado
            });

            // Insert payment record
            await pedidosDB.createPago({
                id_pedido: payPedido.id_pedido,
                monto: montoPago,
                fecha_pago: payData.fecha,
                metodo_pago: payData.metodo,
                referencia: ''
            });

            setMessage({ type: 'success', text: 'Pago registrado correctamente.' });
            handleClosePayModal();
            fetchPedidos();

        } catch (error) {
            console.error('Error al registrar pago:', error);
            toast.error('Error al registrar pago', { duration: 4000 });
        }
    };

    // ========================================
    // NUEVO: Funciones para Modal de Estado
    // ========================================

    const handleOpenEstadoModal = (pedido) => {
        setEstadoPedido(pedido);
        setNuevoEstadoPedido(pedido.estado_pedido || 'aceptado');
        setNuevoEstadoProduccion(pedido.estado_produccion || 'no_iniciado');
        setShowEstadoModal(true);
    };

    const handleCloseEstadoModal = () => {
        setShowEstadoModal(false);
        setEstadoPedido(null);
    };

    const handleUpdateEstado = async () => {
        if (!estadoPedido) return;

        try {
            // Validación: Si se marca como entregado, la producción debe estar terminada
            if (nuevoEstadoPedido === 'entregado' && nuevoEstadoProduccion !== 'terminado') {
                setConfirmModal({
                    isOpen: true,
                    title: 'Actualizar Producción',
                    message: '¿Marcar la producción como "Terminado" también?',
                    icon: <FaHammer />,
                    confirmText: 'Sí, marcar',
                    confirmColor: 'green',
                    onConfirm: async () => {
                        setNuevoEstadoProduccion('terminado');
                        await actualizarEstadoPedido();
                    }
                });
                return;
            }
            await actualizarEstadoPedido();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast.error('Error al actualizar estado', { duration: 4000 });
        }
    };

    const actualizarEstadoPedido = async () => {
        try {
            await pedidosDB.update(estadoPedido.id_pedido, {
                ...estadoPedido,
                estado_pedido: nuevoEstadoPedido,
                estado_produccion: nuevoEstadoProduccion
            });
            toast.success('Estado actualizado correctamente');
            handleCloseEstadoModal();
            fetchPedidos();

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast.error('Error al actualizar estado', { duration: 4000 });
        }
    };

    // ========================================
    // CREAR PRODUCCIÓN DESDE PEDIDO
    // ========================================

    const handleCrearProduccion = async (pedido) => {
        try {
            // Validar que el pedido tenga productos
            if (!pedido.detalles_pedido || pedido.detalles_pedido.length === 0) {
                toast.error('El pedido no tiene productos registrados', { duration: 4000 });
                return;
            }

            // Validar que no existan ya registros de producción para este pedido
            const produccionExistente = await produccionDB.getAll();
            const yaEnProduccion = produccionExistente.some(p => p.pedido_id === pedido.id_pedido);

            if (yaEnProduccion) {
                toast.warning('Este pedido ya tiene registros de producción creados', { duration: 4000 });
                return;
            }

            toast.loading('Creando registros de producción...', { id: 'creating-production', duration: 2000 });

            // Crear un registro de producción por cada producto del pedido
            for (const detalle of pedido.detalles_pedido) {
                await produccionDB.createFromPedido(pedido.id_pedido, {
                    cantidad: detalle.cantidad,
                    costo_materiales: 0,
                    mano_de_obra: 0,
                    porcentaje_alquiler: 0,
                    costo_herramientas: 0,
                    otros_gastos: 0,
                    observaciones: `Producción creada desde pedido #${pedido.id_pedido} - ${detalle.tipo_producto || 'Producto'} de ${detalle.metal || 'Metal'}`
                });
            }

            // Actualizar el estado del pedido a 'en_proceso'
            await pedidosDB.update(pedido.id_pedido, {
                ...pedido,
                estado_produccion: 'en_proceso'
            });

            toast.success(`✓ Producción creada: ${pedido.detalles_pedido.length} producto(s)`, {
                id: 'creating-production',
                duration: 3000
            });

            // Refrescar la lista de pedidos
            fetchPedidos();

        } catch (error) {
            console.error('Error al crear producción:', error);
            toast.error(`Error al crear producción: ${error.message}`, {
                id: 'creating-production',
                duration: 4000
            });
        }
    };

    // Filter Logic
    const filteredPedidos = pedidos.filter(p => {
        // Normalizar estados: trim() + lowercase para consistencia
        // Esto convierte "Terminado" → "terminado", "en_proceso" → "en_proceso", etc.
        const estadoProd = (p.estado_produccion || 'no_iniciado').trim().toLowerCase();
        const estadoPed = (p.estado_pedido || 'aceptado').trim().toLowerCase();

        // FASE 3: Filtrado por tab (Pendientes, Producción, Terminados)
        if (activeTab === 'pendientes') {
            // Tab Pendientes: pedidos aceptados sin iniciar producción
            const isNoIniciado = estadoProd === 'no_iniciado' || estadoProd === 'pendiente' || !estadoProd;
            if (!isNoIniciado || estadoPed === 'entregado') {
                return false;
            }
        } else if (activeTab === 'produccion') {
            // Tab Producción: pedidos EN PROCESO (no terminados, no entregados)
            // Normaliza variaciones: 'en_proceso', 'en proceso', 'en_produccion'
            const isEnProceso = estadoProd === 'en_proceso' ||
                estadoProd === 'en proceso' ||
                estadoProd === 'en_produccion';

            if (!isEnProceso || estadoPed === 'entregado') {
                return false;
            }
        } else if (activeTab === 'terminados') {
            // Tab Terminados: producción terminada pero NO entregados
            // Ahora comparamos 'terminado' (minúscula) con el valor normalizado
            const isTerminado = estadoProd === 'terminado';
            if (!isTerminado || estadoPed === 'entregado') {
                return false;
            }
        }

        // Filtro de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const cliente = p.nombre_cliente ? p.nombre_cliente.toLowerCase() : '';
            const telf = p.telefono ? p.telefono.toString() : '';
            return cliente.includes(term) || telf.includes(term);
        }

        return true;
    });




    // Prevent mouse wheel from changing number inputs
    const handleWheel = (e) => {
        e.target.blur();
    };

    // Handler para actualización parcial de voz (Feedback visual)
    const handleVoicePartial = useCallback((data) => {
        if (!data) return;

        // Sincronizar FormData (Fase 1, 3 y 4)
        setFormData(prev => ({
            ...prev,
            nombre_cliente: data.nombre_cliente !== undefined ? data.nombre_cliente : prev.nombre_cliente,
            telefono: data.telefono !== undefined ? data.telefono : prev.telefono,
            dni_ruc: data.dni_ruc !== undefined ? data.dni_ruc : prev.dni_ruc,
            // Fase 3: Envío
            requiere_envio: data.requiere_envio !== undefined ? data.requiere_envio : prev.requiere_envio,
            direccion_entrega: data.direccion_entrega !== undefined ? data.direccion_entrega : prev.direccion_entrega,
            modalidad_envio: data.modalidad_envio !== undefined ? data.modalidad_envio : prev.modalidad_envio,
            envio_cobrado_al_cliente: data.envio_cobrado_al_cliente !== undefined ? data.envio_cobrado_al_cliente : prev.envio_cobrado_al_cliente,
            // Fase 4: Pago
            forma_pago: data.forma_pago !== undefined ? data.forma_pago : prev.forma_pago,
            incluye_igv: data.incluye_igv !== undefined ? data.incluye_igv : prev.incluye_igv,
            monto_a_cuenta: data.monto_a_cuenta !== undefined ? data.monto_a_cuenta : prev.monto_a_cuenta,
        }));

        // Fase 2: Detalles del Producto
        if (data.productoActual) {
            setProductoActual(prev => ({
                ...prev,
                tipo_producto: data.productoActual.tipo_producto !== undefined ? data.productoActual.tipo_producto : prev.tipo_producto,
                metal: data.productoActual.metal !== undefined ? data.productoActual.metal : prev.metal,
                nombre_producto: data.productoActual.nombre_producto !== undefined ? data.productoActual.nombre_producto : prev.nombre_producto,
                cantidad: data.productoActual.cantidad !== undefined ? data.productoActual.cantidad : prev.cantidad,
                precio_unitario: data.productoActual.precio_unitario !== undefined ? data.productoActual.precio_unitario : prev.precio_unitario,
            }));
        }
    }, []);

    // Handler para voz (Confirmaciones y Acciones Directas)
    const handleVoiceConfirm = (dataVoz) => {
        if (!dataVoz) return;

        if (dataVoz.type === 'ADD_PRODUCT_TO_GRID') {
            const p = dataVoz.producto;
            const nuevoP = {
                tipo_producto: p.tipo_producto,
                metal: p.metal,
                cantidad: parseFloat(p.cantidad) || 0,
                precio_unitario: parseFloat(p.precio_unitario) || 0,
                nombre_producto: p.nombre_producto || `${p.tipo_producto} de ${p.metal}`
            };

            setListaProductos(prev => [...prev, nuevoP]);
            setProductoActual({ tipo_producto: '', metal: '', nombre_producto: '', cantidad: '', precio_unitario: '' });
            toast.success(`${p.tipo_producto} agregado`, { icon: '➕' });
            return;
        }

        if (dataVoz.type === 'FIN_FASE_2') {
            toast.success('Fase de productos completada', { icon: '🏁' });
            return;
        }

        if (dataVoz.type === 'FIN_VOZ_TOTAL') {
            const d = dataVoz.data;
            // Sincronizar todos los datos finales al formulario
            setFormData(prev => ({ ...prev, ...d }));

            // Preparar datos para el modal de revisión
            setReviewData({
                cliente: d.nombre_cliente,
                telefono: d.telefono,
                productos: listaProductos,
                envio: d.requiere_envio ? d.direccion_entrega : 'No requiere',
                pago: d.forma_pago,
                monto: d.monto_a_cuenta
            });
            setShowVoiceReviewModal(true);

            // Generar texto para que la voz lo lea (Calculado manualmente aquí para inmediatez)
            const subtotal = listaProductos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);
            const igv = d.incluye_igv ? (subtotal * 0.18) : 0;
            const envio = d.requiere_envio ? (parseFloat(d.envio_cobrado_al_cliente) || 0) : 0;
            const totalVenta = subtotal + igv + envio;
            const saldoPendiente = totalVenta - d.monto_a_cuenta;

            // Formatear teléfono para lectura dígito a dígito
            const telefonoLeible = d.telefono ? d.telefono.toString().split('').join(', ') : 'no registrado';

            let textoResumen = `Resumen del pedido a nombre de ${d.nombre_cliente}. Teléfono ${telefonoLeible}. ` +
                `Productos: ${listaProductos.map(p => `${p.cantidad} ${p.nombre_producto}`).join(', ')}. ` +
                (d.requiere_envio ? (d.direccion_entrega ? `Con envío a ${d.direccion_entrega}. ` : 'Con envío, pero falta la dirección. ') : 'Sin envío. ') +
                `Método de pago ${d.forma_pago} con un adelanto de ${d.monto_a_cuenta} soles. `;

            if (d.incluye_igv) {
                textoResumen += `El total incluye I G V. `;
            }

            textoResumen += (saldoPendiente > 0.1 ? `Queda un saldo pendiente de ${saldoPendiente.toFixed(2)} soles. ` : 'Este pedido está cancelado. No se olvide de registrar. ') +
                `¿Es conforme el registro?`;

            // Cancelar cualquier síntesis previa para evitar bucles o solapamientos
            window.speechSynthesis.cancel();

            // Usar síntesis de voz para leer el resumen
            const utterance = new SpeechSynthesisUtterance(textoResumen);
            utterance.lang = 'es-PE';
            utterance.rate = 0.95; // Un poco más lento para claridad
            window.speechSynthesis.speak(utterance);

            toast.success('Resumen generado', { icon: '📋' });
            return;
        }

        if (dataVoz.type === 'UPDATE_CLIENT_DATA') {
            const d = dataVoz.data;
            setFormData(prev => ({
                ...prev,
                nombre_cliente: d.nombre_cliente !== undefined ? d.nombre_cliente : prev.nombre_cliente,
                telefono: d.telefono !== undefined ? d.telefono : prev.telefono,
                dni_ruc: d.dni_ruc !== undefined ? d.dni_ruc : prev.dni_ruc,
                requiere_envio: d.requiere_envio !== undefined ? d.requiere_envio : prev.requiere_envio,
                direccion_entrega: d.direccion_entrega !== undefined ? d.direccion_entrega : prev.direccion_entrega,
                modalidad_envio: d.modalidad_envio !== undefined ? d.modalidad_envio : prev.modalidad_envio,
                envio_cobrado_al_cliente: d.envio_cobrado_al_cliente !== undefined ? d.envio_cobrado_al_cliente : prev.envio_cobrado_al_cliente,
                forma_pago: d.forma_pago !== undefined ? d.forma_pago : prev.forma_pago,
                incluye_igv: d.incluye_igv !== undefined ? d.incluye_igv : prev.incluye_igv,
                monto_a_cuenta: d.monto_a_cuenta !== undefined ? d.monto_a_cuenta : prev.monto_a_cuenta,
            }));
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">


            <div className="mb-6">
                <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Enigma Sistema ERP</span>
                </Link>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 mb-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-800">{editingId ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
                    {editingId && (
                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 underline">
                            Cancelar Edición
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección Cliente */}
                    <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                            <FaUser className="text-blue-500" />
                            Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="md:col-span-2 relative" ref={searchRef}>
                                <input
                                    type="text"
                                    name="nombre_cliente"
                                    value={formData.nombre_cliente}
                                    onChange={(e) => handleSearchCliente(e.target.value)}
                                    onFocus={handleFocus}
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white pr-10"
                                    placeholder="Buscar cliente por nombre..."
                                />
                                {formData.nombre_cliente && !formData.telefono && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNombreBusqueda('');
                                            setFormData(prev => ({ ...prev, nombre_cliente: '' }));
                                            setShowSugerencias(false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <FaPlus size={12} className="rotate-45" />
                                    </button>
                                )}

                                {showSugerencias && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto overflow-x-hidden">
                                        {clientesSugeridos.length > 0 ? (
                                            clientesSugeridos.map(cliente => (
                                                <button
                                                    key={cliente.id}
                                                    type="button"
                                                    onClick={() => handleSelectCliente(cliente)}
                                                    className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-all group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[16px] font-semibold text-gray-800 group-hover:text-blue-700 transition-colors capitalize">
                                                            {cliente.nombre.toLowerCase()}
                                                        </span>
                                                        <span className="text-[14px] text-gray-600 font-medium flex items-center gap-1.5 whitespace-nowrap">
                                                            <FaPhone size={10} className="text-gray-400" />
                                                            {cliente.telefono || '---'}
                                                        </span>
                                                    </div>
                                                    {cliente.dni && (
                                                        <div className="text-[12px] text-gray-400 flex items-center gap-1.5">
                                                            <span>🪪</span>
                                                            <span className="uppercase tracking-wider">DNI: {cliente.dni}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-8 bg-gray-50/50 flex flex-col items-center gap-4 text-center">
                                                <div className="text-[13px] text-gray-400 font-medium tracking-tight">Cliente no encontrado en la base de datos</div>
                                                <div className="flex flex-col w-full gap-2 px-4">
                                                    <Link
                                                        to="/clientes"
                                                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm group"
                                                    >
                                                        <FaPlus size={10} className="text-blue-400 group-hover:text-blue-600" />
                                                        REGISTRAR NUEVO CLIENTE
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setNombreBusqueda('');
                                                            setFormData(prev => ({ ...prev, nombre_cliente: '' }));
                                                            setShowSugerencias(false);
                                                        }}
                                                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors py-1"
                                                    >
                                                        Limpiar búsqueda
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Información del Cliente Cargada (Solo lectura) */}
                            {(formData.nombre_cliente && formData.telefono && !showSugerencias) && (
                                <div className="md:col-span-2 grid grid-cols-2 gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                            <FaPhone size={12} className="text-gray-400" /> Teléfono
                                        </span>
                                        <span className="text-sm font-medium text-gray-800 tracking-tight">
                                            {formData.telefono || '---'}
                                        </span>
                                    </div>

                                    {formData.dni_ruc && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                <span className="text-gray-400 font-normal">🪪</span> DNI / RUC
                                            </span>
                                            <span className="text-sm font-medium text-gray-800 tracking-tight uppercase">
                                                {formData.dni_ruc}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección Producto (Agregar Múltiples) */}
                    <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                            <FaBox className="text-blue-500" />
                            Producto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 md:items-start border border-gray-200 p-3 md:p-4 rounded-xl bg-white/50">

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Metal *</label>
                                <select
                                    name="metal"
                                    value={productoActual.metal}
                                    onChange={handleProductoChange}
                                    onFocus={handleFocus}
                                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                >
                                    <option value="">-- Selecciona metal --</option>
                                    {MATERIALES_PEDIDO.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>


                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Tipo de Producto *</label>
                                <select
                                    name="tipo_producto"
                                    value={productoActual.tipo_producto}
                                    onChange={handleProductoChange}
                                    onFocus={handleFocus}
                                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                >
                                    <option value="">-- Selecciona tipo --</option>
                                    {tiposDisponibles.map(t => (
                                        <option key={t.id} value={t.nombre}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            <div className="md:col-span-3 -mx-1 md:mx-0">


                                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                                <DictationTextarea
                                    id="nombre_producto"
                                    name="nombre_producto"
                                    value={productoActual.nombre_producto}
                                    onChange={(val) => setProductoActual(prev => ({ ...prev, nombre_producto: val }))}
                                    onFocus={handleFocus}
                                    isListening={voiceState.isListening && focusedField === 'nombre_producto'}
                                    interimText={focusedField === 'nombre_producto' ? voiceState.transcriptActual : ""}
                                    placeholder="Ej: pulsera con mostacillas rojas"
                                    rows={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Cantidad *</label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={productoActual.cantidad}
                                    onChange={handleProductoChange}
                                    onFocus={handleFocus}
                                    min="1"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                    onWheel={handleWheel}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700">Precio Unitario *</label>
                                    <input
                                        type="number"
                                        name="precio_unitario"
                                        value={productoActual.precio_unitario}
                                        onChange={handleProductoChange}
                                        onFocus={handleFocus}
                                        step="0.01"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                        onWheel={handleWheel}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarProducto}
                                    className="mt-7 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center justify-center transition-all active:scale-95"
                                    title="Agregar Producto"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        {/* Lista de productos agregados */}
                        {listaProductos.length > 0 && (
                            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Producto</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Metal</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Cant.</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">P. Unit</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {listaProductos.map((prod, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{prod.tipo_producto}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{prod.metal}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">{prod.cantidad}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{parseFloat(prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{(prod.cantidad * prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarProductoLista(index)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-all"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Sección Envío */}
                    <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                            <FaTruck className="text-blue-500" />
                            Envío (opcional)
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center bg-white/50 p-3 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    name="requiere_envio"
                                    checked={formData.requiere_envio}
                                    onChange={handleChange}
                                    id="requiere_envio"
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all cursor-pointer"
                                />
                                <label htmlFor="requiere_envio" className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer">Dirección de entrega</label>
                            </div>

                            {formData.requiere_envio && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-blue-100 p-4 rounded-xl bg-blue-50/30">
                                    <div className="md:col-span-2">
                                        <div className="flex flex-col gap-1.5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">

                                            <span className="text-sm font-medium text-gray-800 tracking-tight">
                                                {formData.direccion_cliente_db || 'Sin dirección registrada'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">Modalidad de Envío</label>
                                        <select
                                            name="modalidad_envio"
                                            value={formData.modalidad_envio}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                                        >
                                            <option value="Fijo">Envío Fijo/Calculado</option>
                                            <option value="Por Pagar">Por Pagar en Agencia</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">Costo de Envío (S/)</label>
                                        <input
                                            type="number"
                                            name="envio_cobrado_al_cliente"
                                            value={formData.envio_cobrado_al_cliente}
                                            onChange={handleChange}
                                            onFocus={handleFocus}
                                            step="0.01"
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                                            onWheel={handleWheel}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección Pago */}
                    <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                            <FaMoneyBillWave className="text-blue-500" />
                            Pago
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Forma de pago</label>
                                <select
                                    name="forma_pago"
                                    value={formData.forma_pago}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Yape">Yape</option>
                                    <option value="Plin">Plin</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>


                            <div className="flex items-center bg-white/50 p-3 rounded-xl border border-gray-100 md:col-span-2">
                                <input
                                    type="checkbox"
                                    name="incluye_igv"
                                    checked={formData.incluye_igv}
                                    onChange={handleChange}
                                    id="incluye_igv"
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all cursor-pointer"
                                />
                                <label htmlFor="incluye_igv" className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer">Incluye IGV (18%) en el total</label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-blue-800 mb-2">💰 Adelanto</label>
                                <input
                                    type="number"
                                    name="monto_a_cuenta"
                                    value={formData.monto_a_cuenta}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    step="0.01"
                                    className="mt-1 block w-full rounded-xl border-2 border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 text-lg font-bold text-blue-900 bg-white"
                                    required
                                    onWheel={handleWheel}
                                />
                            </div>
                        </div>

                        {/* Resumen de Totales */}
                        <div className="mt-8 bg-white p-5 rounded-2xl border border-gray-200 shadow-inner">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span className="font-medium">Subtotal Productos:</span>
                                    <span className="font-semibold">S/ {calculos.precio_total_sin_igv.toFixed(2)}</span>
                                </div>

                                {formData.incluye_igv && (
                                    <div className="flex justify-between items-center text-sm text-gray-500 italic">
                                        <span>+ IGV (18%):</span>
                                        <span>S/ {calculos.monto_igv.toFixed(2)}</span>
                                    </div>
                                )}

                                {formData.requiere_envio && parseFloat(formData.envio_cobrado_al_cliente) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-500 italic">
                                        <span>Costos de Envío:</span>
                                        <span>S/ {parseFloat(formData.envio_cobrado_al_cliente).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-3 font text-1xl text-gray-900 border-t border-gray-100 mt-2">
                                    <span>Total Pedido:</span>
                                    <span className="text-blue-700">S/ {calculos.precio_total.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 text-green-700 font border-t border-gray-50">
                                    <span>Monto a Cuenta:</span>
                                    <span>- S/ {parseFloat(formData.monto_a_cuenta || 0).toFixed(2)}</span>
                                </div>

                                {!calculos.cancelado && (
                                    <div className="flex justify-between items-center py-4 px-4 bg-red-50 rounded-xl font text-1xl text-red-600 border-t-2 border-red-100 mt-4">
                                        <span>Saldo Pendiente:</span>
                                        <span className="animate-pulse">S/ {calculos.monto_saldo.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Guardando...' : (editingId ? 'Actualizar Pedido' : 'Guardar Pedido')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Listado de Pedidos */}
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto pb-8 md:pb-6">
                {/* Título de la sección */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🧾</span>
                    <span>Gestión de Pedidos</span>
                </h2>

                {/* FASE 2: Navegación de Tabs - Pendientes y Producción */}
                {/* FASE 2: Navegación de Tabs - Pendientes y Producción */}
                {/* Calculamos los conteos dinámicamente */}
                {
                    (() => {
                        const counts = {
                            pendientes: pedidos.filter(p => p.estado_pedido !== 'entregado' && p.estado_produccion !== 'terminado' && p.estado_produccion !== 'en_proceso' && p.estado_pedido !== 'cancelado').length,
                            produccion: pedidos.filter(p => p.estado_produccion === 'en_proceso' && p.estado_pedido !== 'entregado').length,
                            terminados: pedidos.filter(p => p.estado_produccion === 'terminado' && p.estado_pedido !== 'entregado').length
                        };

                        return (
                            <div className="border-b border-gray-200 mb-6 font-sans">
                                <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto pb-1">
                                    <button
                                        onClick={() => setActiveTab('pendientes')}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'pendientes'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">📋</span>
                                        <span>Pendientes</span>
                                        <span className={`ml-1 py-0.5 px-2.5 rounded-full text-xs font-bold ${activeTab === 'pendientes' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {counts.pendientes}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('produccion')}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'produccion'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">⚒️</span>
                                        <span>Producción</span>
                                        <span className={`ml-1 py-0.5 px-2.5 rounded-full text-xs font-bold ${activeTab === 'produccion' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {counts.produccion}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('terminados')}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'terminados'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">✅</span>
                                        <span>Listos</span>
                                        <span className={`ml-1 py-0.5 px-2.5 rounded-full text-xs font-bold ${activeTab === 'terminados' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {counts.terminados}
                                        </span>
                                    </button>
                                </nav>
                            </div>
                        );
                    })()
                }

                {/* Estadísticas por Tab */}
                <div className="mb-6">

                    {/* FASE 3: Estadísticas por Tab */}
                    {activeTab === 'pendientes' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS PENDIENTES</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">
                                {filteredPedidos.length}
                            </span>
                        </div>
                    )}
                    {activeTab === 'produccion' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS EN PRODUCCIÓN</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">
                                {filteredPedidos.length}
                            </span>
                        </div>
                    )}
                    {activeTab === 'terminados' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS LISTOS PARA ENTREGA</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">
                                {filteredPedidos.length}
                            </span>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {activeTab === 'terminados' ? (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Producto</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Producción</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pago</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                                    </>
                                ) : activeTab === 'produccion' ? (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Producto</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Producción</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pago</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                                    </>
                                ) : (
                                    // Grid completo para Pendientes (8 columnas)
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/2 md:w-2/5">Producto</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Producción</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pago</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPedidos.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500 font-medium italic">No hay pedidos activos en esta categoría.</td>
                                </tr>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <tr key={pedido.id_pedido} className="hover:bg-gray-50/50 transition-colors group">
                                        {activeTab === 'terminados' ? (
                                            <>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatLocalDate(pedido.fecha_pedido)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pedido.nombre_cliente}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    <div className="space-y-1">
                                                        {pedido.detalles_pedido?.map((d, idx) => (
                                                            <div key={idx} className="text-xs border-b last:border-0 border-gray-100 pb-1 last:pb-0">
                                                                <span className="font-normal text-gray-800">{d.tipo_producto} - {d.metal} x{d.cantidad}</span>
                                                            </div>
                                                        )) || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">● Listo</span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center"><EstadoPagoBadge pedido={pedido} /></td>
                                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>S/ {pedido.monto_saldo.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-4">
                                                        {!pedido.cancelado && pedido.monto_saldo > 0.1 && (
                                                            <Tooltip text="Registrar pago">
                                                                <button onClick={() => handleOpenPayModal(pedido)} className="text-green-600 hover:text-green-800 transition-colors">
                                                                    <FaMoneyBillWave className="h-6 w-6" />
                                                                </button>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip text="Ver Nota">
                                                            <button onClick={() => handlePrint(pedido)} className="text-gray-500 hover:text-gray-800 transition-colors">
                                                                <FaEye className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Entregar pedido">
                                                            <button onClick={() => handleEntregar(pedido)} className="text-blue-600 hover:text-blue-800 transition-colors">
                                                                <FaCar className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </>
                                        ) : activeTab === 'produccion' ? (
                                            <>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatLocalDate(pedido.fecha_pedido)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pedido.nombre_cliente}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    <div className="space-y-1">
                                                        {pedido.detalles_pedido?.map((d, idx) => (
                                                            <div key={idx} className="text-xs border-b last:border-0 border-gray-100 pb-1 last:pb-0">
                                                                <span className="font-normal text-gray-800">{d.tipo_producto} - {d.metal} x{d.cantidad}</span>
                                                            </div>
                                                        )) || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">● En Proceso</span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center"><EstadoPagoBadge pedido={pedido} /></td>
                                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>S/ {pedido.monto_saldo.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-4">
                                                        <Tooltip text="Ver Nota">
                                                            <button onClick={() => handlePrint(pedido)} className="text-gray-500 hover:text-gray-800 transition-colors">
                                                                <FaEye className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatLocalDate(pedido.fecha_pedido)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pedido.nombre_cliente}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    <div className="space-y-1">
                                                        {pedido.detalles_pedido?.map((d, idx) => (
                                                            <div key={idx} className="text-xs border-b last:border-0 border-gray-100 pb-1 last:pb-0">
                                                                <span className="font-normal text-gray-800">{d.tipo_producto} - {d.metal} x{d.cantidad}</span>
                                                            </div>
                                                        )) || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">S/ {pedido.precio_total?.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">● Pendiente</span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center"><EstadoPagoBadge pedido={pedido} /></td>
                                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>S/ {pedido.monto_saldo.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-4">
                                                        <Tooltip text="Registrar producción">
                                                            <button onClick={() => handleCrearProduccion(pedido)} className="text-purple-600 hover:text-purple-900 transition-colors">
                                                                <FaHammer className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Ver Nota">
                                                            <button onClick={() => handlePrint(pedido)} className="text-gray-500 hover:text-gray-800 transition-colors">
                                                                <FaEye className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Editar">
                                                            <button onClick={() => handleEdit(pedido)} className="text-amber-500 hover:text-amber-800 transition-colors">
                                                                <FaEdit className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Eliminar">
                                                            <button onClick={() => handleDelete(pedido.id_pedido)} className="text-red-500 hover:text-red-800 transition-colors">
                                                                <FaTrash className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div >
            </div >

            {/* Modal de Impresión / Vista Previa */}
            {
                showPrintModal && printPedido && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start md:items-center justify-center p-4 pt-24 md:pt-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                            {/* Header Modal */}
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                                <h3 className="text-lg font-bold text-gray-800">Detalle del Pedido #{printPedido.id_pedido}</h3>
                                <button onClick={closePrintModal} className="text-gray-600 hover:text-gray-800">
                                    <FaTimesCircle size={24} />
                                </button>
                            </div>

                            {/* Content (Printable Area) */}
                            <div className="p-8 overflow-y-auto bg-white" id="printable-area">
                                <div className="text-center mb-6 border-b pb-4">
                                    <p className="text-sm text-gray-500 mb-1">Enigma artesanías y accesorios</p>
                                    <h1 className="text-xl font-bold uppercase tracking-widest text-gray-900">Nota de Pedido</h1>
                                    <p className="text-sm text-gray-500 mt-1">{formatLocalDate(printPedido.fecha_pedido)}</p>
                                </div>

                                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-left">
                                        <h4 className="font-bold text-gray-700 mb-1">Cliente</h4>
                                        <p className="text-gray-900">{printPedido.nombre_cliente}</p>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <FaPhone className="mr-1" size={12} />
                                            <span>{printPedido.telefono}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {printPedido.requiere_envio && (
                                            <>
                                                <h4 className="font-bold text-gray-700 mb-1">Envío</h4>
                                                <p className="text-gray-900">{printPedido.direccion_entrega}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6 text-left">
                                    <h4 className="font-bold text-gray-700 text-xs mb-2 uppercase tracking-wider text-teal-600 text-left">Productos</h4>
                                    <div className="space-y-3">
                                        {printPedido.detalles_pedido.map((d, index) => (
                                            <div key={index} className="pl-0 text-left">
                                                <div className="text-[7px] font-normal text-teal-800 flex items-center mb-0.5 text-left">
                                                    <span className="mr-1">•</span>
                                                    {d.tipo_producto || 'Producto'} - {d.metal || 'Metal'}
                                                    {d.cantidad > 1 && <span className="text-gray-600 ml-1">(x{d.cantidad})</span>}
                                                </div>
                                                <div className="text-[7px] text-gray-800 font-normal pl-2 leading-tight text-left">
                                                    {d.nombre_producto}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 mt-4 pt-2">
                                    <div className="w-full max-w-[200px] ml-auto text-[10px]">
                                        {/* Totals Section */}
                                        {printPedido.incluye_igv && (
                                            <>
                                                <div className="flex justify-between text-gray-600 mb-1">
                                                    <span>IGV (18%):</span>
                                                    <span>S/ {printPedido.monto_igv.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-800 font-semibold">
                                                    <span>Total Venta:</span>
                                                    <span>S/ {(printPedido.precio_total_sin_igv + printPedido.monto_igv).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Costo de Envío (Azul) */}
                                        {printPedido.envio_cobrado_al_cliente > 0 && (
                                            <div className="flex justify-between text-blue-600 font-medium mt-1">
                                                <span>Costo de Envío:</span>
                                                <span>S/ {printPedido.envio_cobrado_al_cliente.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between font-bold text-sm border-t pt-1 mt-1">
                                            <span>
                                                {printPedido.envio_cobrado_al_cliente > 0
                                                    ? "TOTAL A PAGAR + ENV.:"
                                                    : (printPedido.incluye_igv ? "TOTAL:" : "TOTAL A PAGAR:")}
                                            </span>
                                            <span>S/ {printPedido.precio_total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Espaciador Vertical */}
                                <div className="py-2"></div>

                                {/* Sección 2: Estado de Cuenta */}
                                <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">Estado de Cuenta</h4>

                                {/* Tabla de Adelantos */}
                                <div className="mb-2">
                                    <div className="flex justify-between font-bold text-xs text-gray-600 border-b pb-1 mb-1">
                                        <span>Adelantos (Pagos a Cuenta)</span>
                                        <span>Método</span>
                                        <span>Monto</span>
                                    </div>
                                    {printPedido.pagos && printPedido.pagos.length > 0 ? (
                                        printPedido.pagos.sort((a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago)).map((pago, idx) => (
                                            <div key={idx} className="flex justify-between text-xs py-1">
                                                <span>{formatLocalDate(pago.fecha_pago)}</span>
                                                <span>{pago.metodo_pago}</span>
                                                <span>S/ {pago.monto.toFixed(2)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-xs text-center text-gray-400 italic">No hay pagos registrados</div>
                                    )}
                                </div>

                                <div className="flex justify-between font-bold text-red-600 border-t pt-1 mt-1 text-sm">
                                    <span>SALDO PENDIENTE:</span>
                                    <span>S/ {printPedido.monto_saldo > 0.1 ? printPedido.monto_saldo.toFixed(2) : '0.00'}</span>
                                </div>


                                <div className="mt-8 pt-4 border-t text-center">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Aclaración Importante</p>
                                    <p className="text-xs text-gray-500 leading-snug">Esta Nota de Pedido no tiene validez como comprobante de pago.</p>
                                    <p className="text-xs text-gray-600 font-semibold mt-0.5">¡Gracias por tu pedido!</p>
                                </div>
                            </div>

                            {/* Footer Modal */}
                            {/* Footer Modal */}
                            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end items-center">
                                {/* Botones de Acción (Derecha) */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={async () => {
                                            const element = document.getElementById('printable-area');
                                            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });

                                            canvas.toBlob(async (blob) => {
                                                const file = new File([blob], `pedido_${printPedido.id_pedido}.jpg`, { type: 'image/jpeg' });

                                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                    try {
                                                        await navigator.share({
                                                            files: [file],
                                                            title: `Pedido #${printPedido.id_pedido}`,
                                                            text: `Nota de Pedido para ${printPedido.nombre_cliente}`
                                                        });
                                                    } catch (_) {
                                                        // Fallback: descargar directamente
                                                        const link = document.createElement('a');
                                                        link.download = `pedido_${printPedido.id_pedido}.jpg`;
                                                        link.href = canvas.toDataURL('image/jpeg', 0.9);
                                                        link.click();
                                                    }
                                                } else {
                                                    // Dispositivo no soporta share con archivos, descargar
                                                    const link = document.createElement('a');
                                                    link.download = `pedido_${printPedido.id_pedido}.jpg`;
                                                    link.href = canvas.toDataURL('image/jpeg', 0.9);
                                                    link.click();
                                                }
                                            }, 'image/jpeg', 0.9);
                                        }}
                                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center transition-colors"
                                        title="Compartir Imagen del Pedido"
                                    >
                                        <FaImage className="h-5 w-5" />
                                    </button>
                                    <button onClick={closePrintModal} className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div >
                    </div >
                )
            }

            {/* Modal de Pago Rápido */}
            {
                showPayModal && payPedido && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                                <h3 className="text-lg font-bold text-gray-800">Registrar Pago / Adelanto</h3>
                                <button onClick={handleClosePayModal} className="text-gray-600 hover:text-gray-800">
                                    <FaTimesCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="mb-4 text-sm text-gray-600">
                                    Cliente: <span className="font-bold">{payPedido.nombre_cliente}</span><br />
                                    Saldo Pendiente: <span className="font-bold text-red-600">S/ {payPedido.monto_saldo.toFixed(2)}</span>
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Monto a Pagar</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={payData.monto}
                                            onChange={(e) => setPayData({ ...payData, monto: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                        <input
                                            type="date"
                                            value={payData.fecha}
                                            onChange={(e) => setPayData({ ...payData, fecha: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                                        <select
                                            value={payData.metodo}
                                            onChange={(e) => setPayData({ ...payData, metodo: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        >
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Yape">Yape</option>
                                            <option value="Plin">Plin</option>
                                            <option value="Transferencia">Transferencia</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                                <button onClick={handleClosePayModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                                    Cancelar
                                </button>
                                <button onClick={handleQuickPay} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                    Confirmar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Popup Pedido Cancelado */}
            {
                showCancelAlert && calculos.cancelado && (
                    <div className="fixed top-20 right-4 z-50 animate-bounce">
                        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl cursor-pointer flex items-center bg-opacity-90 hover:bg-opacity-100 transition-all font-bold text-lg" onClick={() => setShowCancelAlert(false)}>
                            <span>✓ PEDIDO CANCELADO</span>
                            <span className="ml-3 text-sm font-normal underline">(Click para cerrar)</span>
                        </div>
                    </div>
                )
            }

            {/* Modal de Cambio de Estado */}
            {
                showEstadoModal && estadoPedido && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">Cambiar Estado del Pedido</h3>

                            <div className="mb-4 p-3 bg-gray-100 rounded">
                                <p className="text-sm text-gray-600"><strong>Cliente:</strong> {estadoPedido.nombre_cliente}</p>
                                <p className="text-sm text-gray-600"><strong>Fecha:</strong> {new Date(estadoPedido.fecha_pedido).toLocaleDateString()}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pedido</label>
                                <select value={nuevoEstadoPedido} onChange={(e) => setNuevoEstadoPedido(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
                                    <option value="aceptado">🔵 Aceptado</option>
                                    <option value="entregado">🟢 Entregado</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Producción</label>
                                <select value={nuevoEstadoProduccion} onChange={(e) => setNuevoEstadoProduccion(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
                                    <option value="no_iniciado">🟡 No iniciado</option>
                                    <option value="en_proceso">🔵 En proceso</option>
                                    <option value="terminado">🟢 Terminado</option>
                                </select>
                            </div>

                            {nuevoEstadoPedido === 'entregado' && nuevoEstadoProduccion !== 'terminado' && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">⚠️ <strong>Nota:</strong> Si un pedido está entregado, la producción debería estar terminada.</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button onClick={handleCloseEstadoModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancelar</button>
                                <button onClick={handleUpdateEstado} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Actualizar Estado</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Confirmación de Pedido Ingresado */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-center animate-bounce">
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-green-500 p-4">
                                    <FaCheckCircle className="text-white text-5xl" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">PEDIDO INGRESADO</h2>
                            <p className="text-gray-600">El pedido ha sido registrado exitosamente</p>
                        </div>
                    </div>
                )
            }

            {/* Toaster para notificaciones */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '14px',
                        maxWidth: '300px',
                        padding: '12px 16px',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: 'white' },
                        style: { borderLeft: '4px solid #10b981' }
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: 'white' },
                        duration: 4000,
                        style: { borderLeft: '4px solid #ef4444' }
                    },
                    warning: {
                        icon: '⚠️',
                        style: { borderLeft: '4px solid #f59e0b' }
                    }
                }}
            />

            {/* Modal de Confirmación */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                icon={confirmModal.icon}
                confirmText={confirmModal.confirmText}
                confirmColor={confirmModal.confirmColor}
            />

            {/* Voice Review Modal - Rediseño Compacto y Elegante (Estilo Imagen 1) */}
            {
                showVoiceReviewModal && reviewData && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] shadow-2xl max-w-[360px] w-[95%] overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                            {/* Header Moderno Compacto */}
                            <div className="bg-blue-600 px-5 py-3 sm:py-4 flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h3 className="text-white font-bold flex items-center gap-2 relative z-10 text-lg">
                                    <FaCheckCircle className="text-blue-200" /> Revisión de Registro
                                </h3>
                                <button onClick={() => { window.speechSynthesis.cancel(); setShowVoiceReviewModal(false); }} className="text-white/80 hover:text-white transition-colors relative z-10 bg-white/20 p-1.5 rounded-full">
                                    <FaTimesCircle size={18} />
                                </button>
                            </div>

                            {/* Contenido Compacto */}
                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                                {/* Cliente y Teléfono en rejilla limpia - Compacto */}
                                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Cliente</label>
                                        <input
                                            type="text"
                                            name="nombre_cliente"
                                            value={formData.nombre_cliente}
                                            onChange={handleChange}
                                            className="w-full text-sm font-bold text-gray-800 bg-transparent border-none p-0 focus:ring-0"
                                        />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Teléfono</label>
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className="w-full text-sm font-bold text-gray-800 bg-transparent border-none p-0 focus:ring-0 text-right"
                                        />
                                    </div>
                                </div>

                                {/* Listado de Productos Estilo "Card Minimalista" */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Productos</label>
                                        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{listaProductos.length} ítem(s)</span>
                                    </div>
                                    <div className="space-y-2 max-h-[160px] sm:max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                                        {listaProductos.map((p, i) => (
                                            <div key={i} className="group relative bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between gap-2 hover:bg-blue-50/30 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={p.nombre_producto}
                                                        onChange={(e) => {
                                                            const newList = [...listaProductos];
                                                            newList[i].nombre_producto = e.target.value;
                                                            setListaProductos(newList);
                                                        }}
                                                        className="w-full bg-transparent border-none p-0 text-xs font-medium text-gray-600 truncate focus:ring-0"
                                                    />
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-blue-500">{p.cantidad}x</span>
                                                        <span className="text-[10px] text-gray-400">@ S/ {parseFloat(p.precio_unitario).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right whitespace-nowrap">
                                                    <span className="text-xs font-black text-blue-700">S/ {(p.cantidad * p.precio_unitario).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Entrega y Pago en paralelo compacto */}
                                <div className="grid grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Entrega</label>
                                        {formData.requiere_envio ? (
                                            <input
                                                type="text"
                                                name="direccion_entrega"
                                                value={formData.direccion_entrega}
                                                onChange={handleChange}
                                                placeholder="Dirección..."
                                                className="w-full text-[11px] font-semibold text-gray-700 bg-gray-50 border-gray-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-100 italic"
                                            />
                                        ) : (
                                            <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2 rounded-lg text-center">No requiere</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Pago ({formData.forma_pago})</label>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <span className="text-[11px] font-bold text-green-600 uppercase tracking-tighter">Adelanto: S/</span>
                                            <input
                                                type="number"
                                                name="monto_a_cuenta"
                                                value={formData.monto_a_cuenta}
                                                onChange={(e) => setFormData(prev => ({ ...prev, monto_a_cuenta: e.target.value }))}
                                                className="w-16 text-right text-sm font-black text-green-700 bg-green-50/50 border-none p-1 rounded-lg focus:ring-0"
                                            />
                                        </div>
                                        <p className="text-[11px] font-bold text-red-500">
                                            Saldo: S/ {calculos.monto_saldo.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* IGV y Total Final - Ultra Relevante */}
                                <div className="pt-4 border-t border-dashed border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="incluye_igv"
                                                    checked={formData.incluye_igv}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all group-hover:scale-110"
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors uppercase tracking-widest">¿IGV?</span>
                                        </label>
                                        <div className="text-right">
                                            <div className="flex items-baseline justify-end gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total:</span>
                                                <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                                    S/ {calculos.precio_total.toFixed(2)}
                                                </span>
                                            </div>
                                            {calculos.monto_igv > 0 && <span className="text-[9px] text-blue-500 font-bold block">(IGV: S/ {calculos.monto_igv.toFixed(2)})</span>}
                                        </div>
                                    </div>

                                    {/* Mensaje de advertencia optimizado */}
                                    <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 border border-amber-100/50 shadow-inner">
                                        <FaExclamationTriangle className="text-amber-500 shrink-0 mt-0.5 text-[10px]" />
                                        <p className="text-[9px] text-amber-800 font-bold leading-tight pr-1">
                                            Confirme si los datos son correctos para proceder con el registro manual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Flotante */}
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2">
                                <button
                                    onClick={() => { window.speechSynthesis.cancel(); setShowVoiceReviewModal(false); handleSubmit({ preventDefault: () => { } }); }}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    <FaCheckCircle className="text-blue-200 group-hover:rotate-12 transition-transform" />
                                    Sí, Registrar Pedido
                                </button>
                                <button onClick={() => { window.speechSynthesis.cancel(); setShowVoiceReviewModal(false); }} className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
                                    Necesito Modificar Datos
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Diálogo de Voz - DESACTIVADO POR AHORA 
            <VoiceDialog
                onConfirm={handleVoiceConfirm}
                onPartialUpdate={handleVoicePartial}
                formData={formData}
                productoActual={productoActual}
                focusedField={focusedField}
                onStateChange={setVoiceState}
            />
            */}

        </div>
    );
};

export default Pedidos;
