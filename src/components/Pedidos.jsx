
import React, { useState, useEffect, useRef } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../utils/produccionNeonClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaWhatsapp, FaPrint, FaSearch, FaMoneyBillWave, FaShareAlt, FaImage, FaPhone, FaArrowLeft, FaHammer, FaCar } from 'react-icons/fa';
import html2canvas from 'html2canvas';

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
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);

    // Quick Pay Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payPedido, setPayPedido] = useState(null);
    const [payData, setPayData] = useState({
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        metodo: 'Efectivo'
    });

    const [showCancelAlert, setShowCancelAlert] = useState(false); // Nuevo estado para popup
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal de confirmación

    // Estado Modal para cambiar estado de pedido/producción
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [estadoPedido, setEstadoPedido] = useState(null);
    const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('');
    const [nuevoEstadoProduccion, setNuevoEstadoProduccion] = useState('');

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
            alert("Por favor complete todos los campos obligatorios del producto (Nombre, Cantidad, Precio).");
            return;
        }

        // Validar Metal y Tipo antes de agregar el producto
        if (!formData.metal || !formData.tipo_producto) {
            alert("Por favor seleccione el Metal y el Tipo antes de agregar el producto.");
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
            alert('No se puede editar un pedido que ya ha sido entregado.');
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
        if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;

        try {
            await pedidosDB.delete(id);
            setMessage({ type: 'success', text: 'Pedido eliminado correctamente.' });
            fetchPedidos();
        } catch (error) {
            console.error('Error al eliminar:', error);
            setMessage({ type: 'error', text: 'Error al eliminar: ' + error.message });
        }
    };

    const navigate = useNavigate();

    const handleCrearProduccion = async (pedido) => {
        // Navegar a producción con parámetro de pedido
        navigate(`/produccion?pedido=${pedido.id_pedido}`);
    };

    const handleEntregar = async (pedido) => {
        // Validación: Producción debe estar terminada
        if (pedido.estado_produccion !== 'terminado') {
            alert('⚠️ No se puede entregar: La producción aún no está terminada.');
            return;
        }

        // Validación: Saldo debe ser 0
        if (pedido.monto_saldo > 0) {
            const confirmar = window.confirm(
                `⚠️ El pedido aún tiene un saldo pendiente de S/ ${pedido.monto_saldo.toFixed(2)}.\n\n¿Deseas marcarlo como entregado de todos modos?`
            );
            if (!confirmar) return;
        }

        // Confirmar entrega
        if (!window.confirm(`¿Marcar pedido de ${pedido.nombre_cliente} como ENTREGADO?`)) {
            return;
        }

        try {
            await pedidosDB.updateEstadoPedido(pedido.id_pedido, 'entregado');
            setMessage({
                type: 'success',
                text: `Pedido de ${pedido.nombre_cliente} marcado como ENTREGADO.`
            });
            fetchPedidos(); // Recargar
        } catch (error) {
            console.error('Error al marcar como entregado:', error);
            setMessage({
                type: 'error',
                text: 'Error al actualizar el pedido: ' + error.message
            });
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
        setFechaPago(new Date().toISOString().split('T')[0]);
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
                        fecha_pago: new Date().toISOString().split('T')[0],
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
            console.error('❌ Error completo al guardar pedido:', error);
            console.error('❌ Stack trace:', error.stack);
            const errorMsg = error.message || 'Error desconocido';
            alert('ERROR AL GUARDAR: ' + errorMsg + '\n\nRevisa la consola para más detalles.');
            setMessage({ type: 'error', text: 'Error al guardar el pedido: ' + errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (pedido) => {
        const telefono = pedido.telefono ? pedido.telefono.replace(/\D/g, '') : '';
        if (!telefono) {
            alert("El cliente no tiene un teléfono registrado.");
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
            fecha: new Date().toISOString().split('T')[0],
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
            alert('Error al registrar pago: ' + error.message);
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
                if (!window.confirm('¿Marcar producción como "Terminado" también? (recomendado para pedidos entregados)')) {
                    return;
                }
                setNuevoEstadoProduccion('terminado');
            }

            await pedidosDB.update(estadoPedido.id_pedido, {
                ...estadoPedido,
                estado_pedido: nuevoEstadoPedido,
                estado_produccion: nuevoEstadoProduccion
            });

            setMessage({ type: 'success', text: 'Estado actualizado correctamente.' });
            handleCloseEstadoModal();
            fetchPedidos();

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar estado: ' + error.message);
        }
    };

    // Filter Logic
    const filteredPedidos = pedidos.filter(p => {
        // Status Filter - Usar nuevos estados
        let matchesStatus = true;
        if (filterStatus === 'aceptado') matchesStatus = p.estado_pedido === 'aceptado';
        if (filterStatus === 'entregado') matchesStatus = p.estado_pedido === 'entregado';
        // Mantener compatibilidad temporal con filtros antiguos
        if (filterStatus === 'cancelado') matchesStatus = p.cancelado === true;
        if (filterStatus === 'pendiente') matchesStatus = p.estado_pedido === 'aceptado' && !p.cancelado;

        // Search Filter
        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const cliente = p.nombre_cliente ? p.nombre_cliente.toLowerCase() : '';
            const telf = p.telefono ? p.telefono.toString() : '';
            matchesSearch = cliente.includes(term) || telf.includes(term);
        }

        return matchesStatus && matchesSearch;
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

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Sección Cliente */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg md:text-xl font-semibold mb-3 text-blue-600">Datos del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Cliente *</label>
                                <input
                                    type="text"
                                    name="nombre_cliente"
                                    value={formData.nombre_cliente}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DNI/RUC</label>
                                <input
                                    type="text"
                                    name="dni_ruc"
                                    value={formData.dni_ruc}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Producto *</label>
                                <select
                                    name="tipo_producto"
                                    value={formData.tipo_producto}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="">-- Selecciona tipo --</option>
                                    {TIPOS_PRODUCTO.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Metal *</label>
                                <select
                                    name="metal"
                                    value={formData.metal}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="">-- Selecciona metal --</option>
                                    {METALES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección Producto (Agregar Múltiples) */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg md:text-xl font-semibold mb-3 text-blue-600">Detalles del Producto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:items-start border p-3 md:p-4 rounded">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Producto *</label>
                                <textarea
                                    name="nombre_producto"
                                    value={productoActual.nombre_producto}
                                    onChange={handleProductoChange}
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cantidad *</label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={productoActual.cantidad}
                                    onChange={handleProductoChange}
                                    min="1"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                    onWheel={handleWheel}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Precio Unitario *</label>
                                    <input
                                        type="number"
                                        name="precio_unitario"
                                        value={productoActual.precio_unitario}
                                        onChange={handleProductoChange}
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                        onWheel={handleWheel}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarProducto}
                                    className="mt-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center text-sm"
                                    title="Agregar Producto"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        {/* Lista de productos agregados */}
                        {listaProductos.length > 0 && (
                            <div className="mt-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metal / Tipo</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">P. Unit</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {listaProductos.map((prod, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 text-sm text-gray-900">{prod.nombre_producto}</td>
                                                <td className="px-3 py-2 text-sm text-gray-500">
                                                    <div className="text-xs font-semibold text-gray-700">{prod.metal}</div>
                                                    <div className="text-xs text-gray-500">{prod.tipo_producto}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 text-center">{prod.cantidad}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900 text-right">S/ {parseFloat(prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">S/ {(prod.cantidad * prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarProductoLista(index)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {listaProductos.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-3 py-4 text-center text-sm text-gray-500">
                                                    No hay productos agregados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Sección Envío */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg md:text-xl font-semibold mb-3 text-blue-600">Envío</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="requiere_envio"
                                    checked={formData.requiere_envio}
                                    onChange={handleChange}
                                    id="requiere_envio"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="requiere_envio" className="ml-2 block text-sm text-gray-900">Requiere Envío</label>
                            </div>

                            {formData.requiere_envio && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 border p-3 md:p-4 rounded bg-gray-50">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Dirección de Entrega</label>
                                        <input
                                            type="text"
                                            name="direccion_entrega"
                                            value={formData.direccion_entrega}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Modalidad</label>
                                        <select
                                            name="modalidad_envio"
                                            value={formData.modalidad_envio}
                                            onChange={handleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        >
                                            <option value="Fijo">Envío Fijo/Calculado</option>
                                            <option value="Por Pagar">Por Pagar en Agencia</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Costo de Envío</label>
                                        <input
                                            type="number"
                                            name="envio_cobrado_al_cliente"
                                            value={formData.envio_cobrado_al_cliente}
                                            onChange={handleChange}
                                            step="0.01"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                            onWheel={handleWheel}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección Pago */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg md:text-xl font-semibold mb-3 text-blue-600">Pago y Totales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Forma de Pago</label>
                                <select
                                    name="forma_pago"
                                    value={formData.forma_pago}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Yape">Yape</option>
                                    <option value="Plin">Plin</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comprobante de Pago</label>
                                <input
                                    type="text"
                                    name="comprobante_pago"
                                    value={formData.comprobante_pago}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                />
                            </div>

                            <div className="flex items-center md:col-span-2">
                                <input
                                    type="checkbox"
                                    name="incluye_igv"
                                    checked={formData.incluye_igv}
                                    onChange={handleChange}
                                    id="incluye_igv"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="incluye_igv" className="ml-2 block text-sm text-gray-900">Incluye IGV (18%)</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Cuenta ó Pagado</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="monto_a_cuenta"
                                        value={formData.monto_a_cuenta}
                                        onChange={handleChange}
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                        required
                                        onWheel={handleWheel}
                                    />
                                    {/* Botón '+' eliminado por rediseño */}
                                </div>
                            </div>
                        </div>

                        {/* Resumen de Totales */}
                        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                            <div className="flex justify-between py-1">
                                <span>Subtotal:</span>
                                <span>S/ {calculos.precio_total_sin_igv.toFixed(2)}</span>
                            </div>
                            {formData.incluye_igv && (
                                <div className="flex justify-between py-1 text-sm text-gray-600">
                                    <span>+ IGV (18%):</span>
                                    <span>S/ {calculos.monto_igv.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-300 mt-2">
                                <span>Total:</span>
                                <span>S/ {calculos.precio_total.toFixed(2)}</span>
                            </div>
                            {formData.requiere_envio && parseFloat(formData.envio_cobrado_al_cliente) > 0 && (
                                <div className="flex justify-between py-1 text-xs text-gray-500">
                                    <span>(incluye envío)</span>
                                    <span>S/ {parseFloat(formData.envio_cobrado_al_cliente).toFixed(2)}</span>
                                </div>
                            )}
                            {!calculos.cancelado && (
                                <div className="flex justify-between py-2 font-bold text-red-600 border-t border-gray-300 mt-2">
                                    <span>Saldo Pendiente:</span>
                                    <span>S/ {calculos.monto_saldo.toFixed(2)}</span>
                                </div>
                            )}

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
            < div className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto" >
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Historial de Pedidos</h3>

                {/* Filtros y Totales + Buscador */}
                <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilterStatus('todos')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterStatus('aceptado')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'aceptado' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Aceptados
                            </button>
                            <button
                                onClick={() => setFilterStatus('entregado')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'entregado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Entregados
                            </button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar cliente o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg flex space-x-6 text-sm justify-end">
                        {(filterStatus === 'todos' || filterStatus === 'cancelado') && (
                            <div>
                                <span className="text-gray-500 block">Total Cancelado (Sin Envío)</span>
                                <span className="font-bold text-lg text-green-600">
                                    S/ {filteredPedidos.filter(p => p.cancelado).reduce((acc, p) => {
                                        const envio = p.envio_cobrado_al_cliente || 0;
                                        const envioConIgv = p.incluye_igv ? envio * 1.18 : envio;
                                        return acc + (p.precio_total - envioConIgv);
                                    }, 0).toFixed(2)}
                                </span>
                            </div>
                        )}
                        {(filterStatus === 'todos' || filterStatus === 'pendiente') && (
                            <div>
                                <span className="text-gray-500 block">Total Pendiente</span>
                                <span className="font-bold text-lg text-red-600">
                                    S/ {filteredPedidos.filter(p => !p.cancelado).reduce((acc, p) => acc + (p.monto_saldo || 0), 0).toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cliente</th>
                                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">Producto</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Producción</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pago</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Saldo</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado Pedido</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPedidos.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No hay pedidos registrados en esta categoría.</td>
                                </tr>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <tr key={pedido.id_pedido} className="hover:bg-gray-50 transition-colors">
                                        {/* FECHA */}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
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
                                                        <div key={idx} className="flex justify-between border-b last:border-0 border-gray-100 pb-1 last:pb-0 text-xs">
                                                            <span className="font-medium text-gray-800">{d.nombre_producto}</span>
                                                            <span className="text-gray-500 ml-2">x{d.cantidad}</span>
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

                                        {/* ESTADO PEDIDO */}
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <EstadoPedidoBadge estado={pedido.estado_pedido || 'aceptado'} />
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                {pedido.metal && pedido.tipo_producto && (pedido.estado_produccion === 'no_iniciado' || pedido.tiene_productos_pendientes) && (
                                                    <button
                                                        onClick={() => handleCrearProduccion(pedido)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                        title="Crear Producción"
                                                    >
                                                        <FaHammer className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {pedido.estado_pedido !== 'entregado' && (
                                                    <button
                                                        onClick={() => handleOpenPayModal(pedido)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Registrar Pago"
                                                    >
                                                        <FaMoneyBillWave className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handlePrint(pedido)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Imprimir"
                                                >
                                                    <FaPrint className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(pedido)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Editar"
                                                    disabled={pedido.estado_pedido === 'entregado'}
                                                >
                                                    <FaEdit className="h-5 w-5" />
                                                </button>
                                                {/* NUEVO: Botón Entregar */}
                                                {pedido.estado_pedido !== 'entregado' && (
                                                    <button
                                                        onClick={() => handleEntregar(pedido)}
                                                        disabled={pedido.estado_produccion !== 'terminado'}
                                                        className={`${pedido.estado_produccion === 'terminado'
                                                            ? 'text-green-600 hover:text-green-900 cursor-pointer'
                                                            : 'text-gray-300 cursor-not-allowed'
                                                            }`}
                                                        title={
                                                            pedido.estado_produccion === 'terminado'
                                                                ? 'Marcar como Entregado'
                                                                : 'No se puede entregar: producción no terminada'
                                                        }
                                                    >
                                                        <FaCar className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(pedido.id_pedido)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
                                    <p className="text-sm text-gray-500 mt-1">{new Date(printPedido.fecha_pedido).toLocaleDateString()}</p>
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

                                <table className="w-full mb-6 text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-2 px-3 text-left">Producto</th>
                                            <th className="py-2 px-3 text-center">Cant.</th>
                                            <th className="py-2 px-3 text-right">P.Unit</th>
                                            <th className="py-2 px-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {printPedido.detalles_pedido.map((d, i) => (
                                            <tr key={i}>
                                                <td className="py-2 px-3">{d.nombre_producto}</td>
                                                <td className="py-2 px-3 text-center">{d.cantidad}</td>
                                                <td className="py-2 px-3 text-right">{d.precio_unitario.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-right">{(d.cantidad * d.precio_unitario).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="flex justify-end">
                                    <div className="w-full md:w-1/2 space-y-1 text-sm">
                                        {/* Sección 1: Desglose de Venta */}
                                        {/* Mostrar detalle solo si hay IGV */}
                                        {printPedido.incluye_igv && (
                                            <>
                                                <div className="flex justify-between text-gray-800">
                                                    <span>Valor Venta:</span>
                                                    <span>S/ {printPedido.precio_total_sin_igv.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-800">
                                                    <span>IGV (18%):</span>
                                                    <span>S/ {printPedido.monto_igv.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-800">
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
                                                <span>{new Date(pago.fecha_pago).toLocaleDateString()}</span>
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
                                    <p className="text-[4px] text-gray-500">ACLARACIÓN IMPORTANTE</p>
                                    <p className="text-[2px] text-gray-500">Esta Nota de Pedido no tiene validez como comprobante de pago o factura.</p>
                                    <p className="text-[4px] text-gray-500 font-semibold mt-1">¡Gracias por tu pedido!</p>
                                </div>
                            </div>

                            {/* Footer Modal */}
                            {/* Footer Modal */}
                            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
                                {/* Botón WhatsApp (Izquierda) */}
                                <button
                                    onClick={() => {
                                        const phone = printPedido.telefono ? printPedido.telefono.replace(/\D/g, '') : '';
                                        if (phone) {
                                            window.open(`https://wa.me/51${phone}`, '_blank');
                                        }
                                    }}
                                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center transition-colors"
                                    title="Abrir WhatsApp"
                                >
                                    <FaWhatsapp className="h-5 w-5" />
                                </button>

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
            {showCancelAlert && calculos.cancelado && (
                <div className="fixed top-20 right-4 z-50 animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl cursor-pointer flex items-center bg-opacity-90 hover:bg-opacity-100 transition-all font-bold text-lg" onClick={() => setShowCancelAlert(false)}>
                        <span>✓ PEDIDO CANCELADO</span>
                        <span className="ml-3 text-sm font-normal underline">(Click para cerrar)</span>
                    </div>
                </div>
            )}

            {/* Modal de Cambio de Estado */}
            {showEstadoModal && estadoPedido && (
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
            )}

            {/* Modal de Confirmación de Pedido Ingresado */}
            {showSuccessModal && (
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
            )}
        </div >
    );
};

export default Pedidos;
