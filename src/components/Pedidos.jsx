import React, { useState, useEffect, useRef } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../utils/produccionNeonClient';
import { getLocalDate } from '../utils/dateUtils';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaWhatsapp, FaPrint, FaSearch, FaMoneyBillWave, FaShareAlt, FaImage, FaPhone, FaArrowLeft, FaHammer, FaCar, FaExclamationTriangle, FaCheck, FaEye, FaUser, FaBox, FaTruck } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ui/ConfirmModal';
import Tooltip from './ui/Tooltip';

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

    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        dni_ruc: '',
        direccion_entrega: '',
        metal: '',
        tipo_producto: '',
        forma_pago: 'Efectivo',
        comprobante_pago: '',
        requiere_envio: false,
        modalidad_envio: 'Fijo',
        envio_cobrado_al_cliente: 0,
        monto_a_cuenta: '',
        incluye_igv: false,
        estado_pedido: 'aceptado',
        estado_produccion: 'no_iniciado',
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

    // FASE 1: Estado para tabs - Empezamos solo con Pendientes
    const [activeTab, setActiveTab] = useState('pendientes');

    useEffect(() => {
        fetchPedidos();
    }, []);

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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        if (!formData.metal || !formData.tipo_producto) {
            toast.warning('Seleccione Metal y Tipo antes de agregar el producto', {
                duration: 4000
            });
            return;
        }

        setListaProductos(prev => [...prev, {
            ...productoActual,
            cantidad: parseFloat(productoActual.cantidad),
            precio_unitario: parseFloat(productoActual.precio_unitario),
            metal: formData.metal,           // Guardar metal específico
            tipo_producto: formData.tipo_producto // Guardar tipo específico
        }]);

        // Resetear campos del producto
        setProductoActual({
            nombre_producto: '',
            cantidad: '',
            precio_unitario: ''
        });

        // Resetear selección de Metal y Tipo para el siguiente producto
        setFormData(prev => ({
            ...prev,
            metal: '',
            tipo_producto: ''
        }));
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
            metal: pedido.metal || 'Plata',
            tipo_producto: pedido.tipo_producto || 'Anillo',
            forma_pago: pedido.forma_pago || 'Efectivo',
            comprobante_pago: pedido.comprobante_pago || '',
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
                precio_unitario: d.precio_unitario
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

        // Validación: Saldo debe ser 0
        if (pedido.monto_saldo > 0) {
            setConfirmModal({
                isOpen: true,
                title: 'Saldo Pendiente',
                message: `El pedido tiene S/ ${pedido.monto_saldo.toFixed(2)} pendiente. ¿Entregar de todos modos?`,
                icon: <FaExclamationTriangle />,
                confirmText: 'Sí, entregar',
                confirmColor: 'yellow',
                onConfirm: () => confirmarEntrega(pedido)
            });
            return;
        }

        // Confirmar entrega
        setConfirmModal({
            isOpen: true,
            title: 'Marcar como Entregado',
            message: `¿Confirmar entrega del pedido de ${pedido.nombre_cliente}?`,
            icon: <FaCar />,
            confirmText: 'Sí, entregar',
            confirmColor: 'green',
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
            comprobante_pago: '',
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
            precio_unitario: ''
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
                comprobante_pago: formData.comprobante_pago,
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
                        referencia: formData.comprobante_pago || ''
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
        } else if (activeTab === 'entregados') {
            // Tab Entregados: pedidos entregados
            if (estadoPed !== 'entregado') {
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
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-800">{editingId ? 'Editar Pedido' : 'Registrar Nuevo Pedido'}</h2>
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
                            Datos del Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">Nombre Cliente *</label>
                                <input
                                    type="text"
                                    name="nombre_cliente"
                                    value={formData.nombre_cliente}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:col-span-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Teléfono *</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">DNI/RUC</label>
                                    <input
                                        type="text"
                                        name="dni_ruc"
                                        value={formData.dni_ruc}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                    />
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Sección Producto (Agregar Múltiples) */}
                    <div className="bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-lg md:text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                            <FaBox className="text-blue-500" />
                            Detalles del Producto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:items-start border border-gray-200 p-4 rounded-xl bg-white/50">

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Metal *</label>
                                <select
                                    name="metal"
                                    value={formData.metal}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                >
                                    <option value="">-- Selecciona metal --</option>
                                    {METALES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>


                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Tipo de Producto *</label>
                                <select
                                    name="tipo_producto"
                                    value={formData.tipo_producto}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                >
                                    <option value="">-- Selecciona tipo --</option>
                                    {TIPOS_PRODUCTO.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>


                            <div className="md:col-span-3">


                                <label className="block text-sm font-semibold text-gray-700">Descripción del Producto *</label>
                                <textarea
                                    name="nombre_producto"
                                    value={productoActual.nombre_producto}
                                    onChange={handleProductoChange}
                                    rows="2"
                                    placeholder="Ej: Anillo de compromiso con grabado..."
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Cantidad *</label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={productoActual.cantidad}
                                    onChange={handleProductoChange}
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
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Metal / Tipo</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Cant.</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">P. Unit</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Subtotal</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {listaProductos.map((prod, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-900">{prod.nombre_producto}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    <div className="text-xs font-bold text-gray-700">{prod.metal}</div>
                                                    <div className="text-xs text-gray-500">{prod.tipo_producto}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">{prod.cantidad}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">S/ {parseFloat(prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">S/ {(prod.cantidad * prod.precio_unitario).toFixed(2)}</td>
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
                            Envío
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center bg-white/50 p-3 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    name="requiere_envio"
                                    checked={formData.requiere_envio}
                                    onChange={handleChange}
                                    id="requiere_envio"
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all cursor-pointer"
                                />
                                <label htmlFor="requiere_envio" className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer">Requiere Envío a Domicilio / Agencia</label>
                            </div>

                            {formData.requiere_envio && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-blue-100 p-4 rounded-xl bg-blue-50/30">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700">Dirección de Entrega / Referencia</label>
                                        <input
                                            type="text"
                                            name="direccion_entrega"
                                            value={formData.direccion_entrega}
                                            onChange={handleChange}
                                            placeholder="Ciudad, Agencia o Dirección exacta..."
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">Modalidad de Envío</label>
                                        <select
                                            name="modalidad_envio"
                                            value={formData.modalidad_envio}
                                            onChange={handleChange}
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
                                            step="0.01"
                                            placeholder="0.00"
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
                            Pago y Totales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Forma de Pago del Adelanto</label>
                                <select
                                    name="forma_pago"
                                    value={formData.forma_pago}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Yape">Yape</option>
                                    <option value="Plin">Plin</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">N° Operación / Comprobante</label>
                                <input
                                    type="text"
                                    name="comprobante_pago"
                                    value={formData.comprobante_pago}
                                    onChange={handleChange}
                                    placeholder="Ej: Op. 123456"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                                />
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
                                <label className="block text-sm font-bold text-blue-800 mb-2">💰 Monto Pagado (Adelanto)</label>
                                <input
                                    type="number"
                                    name="monto_a_cuenta"
                                    value={formData.monto_a_cuenta}
                                    onChange={handleChange}
                                    step="0.01"
                                    placeholder="0.00"
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
                            {loading ? 'Guardando...' : (editingId ? 'Actualizar Pedido' : 'Registrar Pedido')}
                        </button>
                    </div>
                </form>
            </div >

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
                {(() => {
                    const counts = {
                        pendientes: pedidos.filter(p => p.estado_pedido !== 'entregado' && p.estado_pedido !== 'cancelado' && p.estado_produccion === 'terminado').length,
                        /* Ajuste lógico: Pendientes de entrega (Terminados pero no entregados) ? 
                           O "Pendientes" general? El filtro original de 'pendientes' era complejo.
                           Revisemos el filtro original en el código (que no se ve aquí pero asumiremos una lógica estándar o la ajustaremos abajo).
                           
                           Vamos a definir "Pendientes" como aquellos que NO están entregados y NO están en producción/terminados (son nuevos/aceptados) 
                           O mejor, repliquemos la lógica de filtrado que se usa abajo:
                        */

                        // Lógica basada en como se filtra abajo (activeTab)
                        pendientes: pedidos.filter(p => !p.entregado && p.estado_pedido !== 'entregado' && p.estado_produccion !== 'terminado' && p.estado_produccion !== 'en_proceso').length, // Nuevos/Aceptados sin iniciar producción
                        produccion: pedidos.filter(p => p.estado_produccion === 'en_proceso').length,
                        terminados: pedidos.filter(p => p.estado_produccion === 'terminado' && p.estado_pedido !== 'entregado').length, // Terminados listos para entregar
                        entregados: pedidos.filter(p => p.estado_pedido === 'entregado').length
                    };

                    /* 
                       NOTA: La lógica anterior de "Pendientes" en el código original (que no he visto completa) parecía ser "todo lo que no es entregado".
                       Sin embargo, con pestañas de Producción y Terminados, "Pendientes" suele referirse a "Por Iniciar".
                       Voy a usar una lógica segura:
                       - Pendientes: Recibidos/Aceptados (estado_produccion = no_iniciado)
                       - Producción: En Proceso
                       - Terminados: Terminados (pero no entregados)
                       - Entregados: Entregados

                       Si el usuario tenía otra lógica, esto lo refina para ser más útil.
                    */

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

                                <button
                                    onClick={() => setActiveTab('entregados')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'entregados'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-xl">🚚</span>
                                    <span>Entregados</span>
                                    <span className={`ml-1 py-0.5 px-2.5 rounded-full text-xs font-bold ${activeTab === 'entregados' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {counts.entregados}
                                    </span>
                                </button>
                            </nav>
                        </div>
                    );
                })()}

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
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS TERMINADOS</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">
                                {filteredPedidos.length}
                            </span>
                        </div>
                    )}
                    {activeTab === 'entregados' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS ENTREGADOS</span>
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
                                    // Grid simplificado para Terminados (7 columnas)
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Producto</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pago</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                                    </>
                                ) : activeTab === 'entregados' ? (
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">FECHA ENTREGA</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                        <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Producto</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                                    </>
                                ) : activeTab === 'produccion' ? (
                                    // Grid simplificado para Producción (6 columnas + acciones)
                                    <>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            <div>Fecha</div>
                                            <div>Ingreso</div>
                                        </th>
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
                                    <td colSpan={activeTab === 'terminados' ? "7" : activeTab === 'entregados' ? "4" : activeTab === 'produccion' ? "7" : "8"} className="px-6 py-4 text-center text-gray-500">No hay pedidos registrados en esta categoría.</td>
                                </tr>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <tr key={pedido.id_pedido} className="hover:bg-gray-50 transition-colors">
                                        {activeTab === 'terminados' ? (
                                            // Grid simplificado para Terminados (5 columnas)
                                            <>
                                                {/* FECHA */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatLocalDate(pedido.fecha_pedido)}
                                                </td>

                                                {/* CLIENTE */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {pedido.nombre_cliente}
                                                </td>

                                                {/* PRODUCTO */}
                                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                                                    {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {pedido.detalles_pedido.map((d, idx) => (
                                                                <div key={idx} className="border-b last:border-0 border-gray-100 pb-1 last:pb-0 text-xs">
                                                                    <span className="font-normal text-gray-800">{pedido.tipo_producto} - {pedido.metal} x{d.cantidad}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </td>

                                                {/* TOTAL */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                    S/ {pedido.precio_total?.toFixed(2)}
                                                </td>

                                                {/* PAGO */}
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <EstadoPagoBadge pedido={pedido} />
                                                </td>

                                                {/* SALDO */}
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    S/ {pedido.monto_saldo.toFixed(2)}
                                                </td>

                                                {/* ACCIONES - Terminados */}
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        {/* Botón de Pago: Solo visible si hay saldo pendiente */}
                                                        {!pedido.cancelado && pedido.monto_saldo > 0.1 && (
                                                            <Tooltip text="Registrar pago">
                                                                <button
                                                                    onClick={() => handleOpenPayModal(pedido)}
                                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                                >
                                                                    <FaMoneyBillWave className="h-5 w-5" />
                                                                </button>
                                                            </Tooltip>
                                                        )}

                                                        <Tooltip text="Ver Nota de Pedido">
                                                            <button
                                                                onClick={() => handlePrint(pedido)}
                                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                <FaEye className="h-5 w-5" />
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip text="Entregar pedido">
                                                            <button
                                                                onClick={() => handleEntregar(pedido)}
                                                                disabled={pedido.estado_pedido === 'entregado'}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            >
                                                                <FaCar className="h-5 w-5" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </>
                                        ) : activeTab === 'entregados' ? (
                                            // Grid simplificado para Entregados (4 columnas)
                                            <>
                                                {/* FECHA ENTREGA */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatLocalDate(pedido.fecha_entrega)}
                                                </td>

                                                {/* CLIENTE */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {pedido.nombre_cliente}
                                                </td>

                                                {/* PRODUCTO */}
                                                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600">
                                                    {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {pedido.detalles_pedido.map((d, idx) => (
                                                                <div key={idx} className="border-b last:border-0 border-gray-100 pb-1 last:pb-0 text-xs">
                                                                    <span className="font-normal text-gray-800">{pedido.tipo_producto} - {pedido.metal} x{d.cantidad}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </td>

                                                {/* ACCIONES - Entregados */}
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        {/* Botón de Pago: Visible siempre que haya saldo por pagar */}
                                                        {!pedido.cancelado && pedido.monto_saldo > 0.1 && (
                                                            <Tooltip text="Registrar pago">
                                                                <button
                                                                    onClick={() => handleOpenPayModal(pedido)}
                                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                                >
                                                                    <FaMoneyBillWave className="h-5 w-5" />
                                                                </button>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip text="Ver Nota de Pedido">
                                                            <button
                                                                onClick={() => handlePrint(pedido)}
                                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                <FaEye className="h-5 w-5" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </>
                                        ) : activeTab === 'produccion' ? (
                                            // Grid simplificado para Producción (4 columnas)
                                            <>
                                                {/* FECHA INGRESO PRODUCCIÓN */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatLocalDate(pedido.fecha_pedido)}
                                                </td>

                                                {/* CLIENTE */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {pedido.nombre_cliente}
                                                </td>

                                                {/* PRODUCTO */}
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {pedido.detalles_pedido.map((d, idx) => (
                                                                <div key={idx} className="border-b last:border-0 border-gray-100 pb-1 last:pb-0 text-xs">
                                                                    <span className="font-normal text-gray-800">{pedido.tipo_producto} - {pedido.metal} x{d.cantidad}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </td>

                                                {/* PRODUCCIÓN */}
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pedido.estado_produccion === 'terminado'
                                                        ? 'bg-green-100 text-green-800'
                                                        : pedido.estado_produccion === 'en_proceso'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {pedido.estado_produccion === 'terminado' ? '● Terminado' :
                                                            pedido.estado_produccion === 'en_proceso' ? '● En Proceso' : '● No Iniciado'}
                                                    </span>
                                                </td>

                                                {/* PAGO */}
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <EstadoPagoBadge pedido={pedido} />
                                                </td>

                                                {/* SALDO */}
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    S/ {pedido.monto_saldo.toFixed(2)}
                                                </td>

                                                {/* ACCIONES - Producción */}
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <Tooltip text="Ver Nota de Pedido">
                                                            <button
                                                                onClick={() => handlePrint(pedido)}
                                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                <FaEye className="h-5 w-5" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            // Grid completo para otros tabs (9 columnas)
                                            <>
                                                {/* FECHA */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatLocalDate(pedido.fecha_pedido)}
                                                </td>

                                                {/* CLIENTE */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {pedido.nombre_cliente}
                                                </td>

                                                {/* PRODUCTO */}
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {pedido.detalles_pedido && pedido.detalles_pedido.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {pedido.detalles_pedido.map((d, idx) => (
                                                                <div key={idx} className="border-b last:border-0 border-gray-100 pb-1 last:pb-0 mb-1 last:mb-0">
                                                                    <div className="font-normal text-gray-800 text-xs">
                                                                        {pedido.tipo_producto} - {pedido.metal} x{d.cantidad}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                </td>

                                                {/* TOTAL */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                    S/ {pedido.precio_total?.toFixed(2)}
                                                </td>

                                                {/* PRODUCCIÓN */}
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <EstadoProduccionBadge estado={pedido.estado_produccion || 'no_iniciado'} />
                                                </td>

                                                {/* PAGO */}
                                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                                    <EstadoPagoBadge pedido={pedido} />
                                                </td>

                                                {/* SALDO */}
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    S/ {pedido.monto_saldo.toFixed(2)}
                                                </td>


                                                {/* ACCIONES */}
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        {pedido.metal && pedido.tipo_producto && (pedido.estado_produccion === 'no_iniciado' || pedido.tiene_productos_pendientes) && (
                                                            <Tooltip text="Crear producción">
                                                                <button
                                                                    onClick={() => handleCrearProduccion(pedido)}
                                                                    className="text-purple-600 hover:text-purple-900 transition-colors"
                                                                >
                                                                    <FaHammer className="h-5 w-5" />
                                                                </button>
                                                            </Tooltip>
                                                        )}

                                                        {/* Botón de Pago: Visible siempre que haya saldo por pagar (no cancelado o saldo > 0), incluso si entregado */}
                                                        {!pedido.cancelado && pedido.monto_saldo > 0.1 && (
                                                            <Tooltip text="Registrar pago">
                                                                <button
                                                                    onClick={() => handleOpenPayModal(pedido)}
                                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                                >
                                                                    <FaMoneyBillWave className="h-5 w-5" />
                                                                </button>
                                                            </Tooltip>
                                                        )}

                                                        {/* Botón de Entrega: Solo visible si está terminado (listo) y no entregado */}
                                                        {pedido.estado_produccion === 'terminado' && pedido.estado_pedido !== 'entregado' && (
                                                            <Tooltip text="Entregar pedido">
                                                                <button
                                                                    onClick={() => handleEntregar(pedido)}
                                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                                >
                                                                    <FaCar className="h-5 w-5" />
                                                                </button>
                                                            </Tooltip>
                                                        )}

                                                        {/* Botón de Ver / Imprimir */}
                                                        <Tooltip text="Ver Nota de Pedido">
                                                            <button
                                                                onClick={() => handlePrint(pedido)}
                                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                <FaEye className="h-5 w-5" />
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip text={pedido.estado_pedido === 'entregado' ? 'No se puede editar' : 'Editar pedido'}>
                                                            <button
                                                                onClick={() => handleEdit(pedido)}
                                                                className={`transition-colors ${pedido.estado_pedido === 'entregado'
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-indigo-600 hover:text-indigo-900'
                                                                    }`}
                                                                disabled={pedido.estado_pedido === 'entregado'}
                                                            >
                                                                <FaEdit className="h-5 w-5" />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Eliminar pedido">
                                                            <button
                                                                onClick={() => handleDelete(pedido.id_pedido)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                            >
                                                                <FaTrash className="h-5 w-5" />
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
        </div >
    );
};

export default Pedidos;
