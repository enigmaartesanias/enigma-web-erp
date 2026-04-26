import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { clientesDB } from '../utils/clientesNeonClient';
import { produccionDB, METALES, TIPOS_PRODUCTO } from '../utils/produccionNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import { materialesDB } from '../utils/materialesNeonClient'; // <-- IMPORT NUEVO
import { getLocalDate } from '../utils/dateUtils';
import { ventasDB } from '../utils/ventasClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaWhatsapp, FaPrint, FaSearch, FaMoneyBillWave, FaShareAlt, FaImage, FaPhone, FaArrowLeft, FaHammer, FaCar, FaExclamationTriangle, FaCheck, FaEye, FaUser, FaBox, FaTruck, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ui/ConfirmModal';
import Tooltip from './ui/Tooltip';
import VoiceDialog from './VoiceDialog';
import DictationTextarea from '../voice/DictationTextarea';

// ========================================
// UTILIDADES DE FECHA
// ========================================
const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    try {
        let dateStr = typeof dateString === 'string' ? dateString : dateString.toString();
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        if (!datePart.includes('-')) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        }
        const [year, month, day] = datePart.split('-');
        if (!year || !month || !day) return '';
        return `${day}/${month}/${year}`;
    } catch (error) {
        return '';
    }
};

// ========================================
// COMPONENTES DE BADGE
// ========================================
const EstadoPedidoBadge = ({ estado }) => {
    const estilos = { aceptado: 'bg-blue-100 text-blue-800', entregado: 'bg-green-100 text-green-800' };
    const iconos = { aceptado: '🔵', entregado: '🟢' };
    const labels = { aceptado: 'Aceptado', entregado: 'Entregado' };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[estado] || 'bg-gray-100 text-gray-800'}`}>
            {iconos[estado] || '⚪'} {labels[estado] || estado}
        </span>
    );
};

const EstadoPagoBadge = ({ pedido }) => {
    let estado = 'pendiente';
    if (pedido.monto_a_cuenta === 0) estado = 'pendiente';
    else if (pedido.monto_saldo > 0) estado = 'adelanto';
    else estado = 'pagado';
    const estilos = { pendiente: 'bg-red-100 text-red-800', adelanto: 'bg-yellow-100 text-yellow-800', pagado: 'bg-green-100 text-green-800' };
    const iconos = { pendiente: '🔴', adelanto: '🟡', pagado: '🟢' };
    const labels = { pendiente: 'Pendiente', adelanto: 'Adelanto', pagado: 'Pagado' };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[estado]}`}>
            {iconos[estado]} {labels[estado]}
        </span>
    );
};

const MATERIALES_PEDIDO = ['Plata', 'Alpaca', 'Cobre', 'Bronce', 'Bisutería'];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
const Pedidos = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [pedidos, setPedidos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printPedido, setPrintPedido] = useState(null);

    // Quick Pay Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payPedido, setPayPedido] = useState(null);
    const [payData, setPayData] = useState({ monto: '', fecha: getLocalDate(), metodo: 'Efectivo' });

    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showEstadoModal, setShowEstadoModal] = useState(false);
    const [estadoPedido, setEstadoPedido] = useState(null);
    const [nuevoEstadoPedido, setNuevoEstadoPedido] = useState('');
    const [nuevoEstadoProduccion, setNuevoEstadoProduccion] = useState('');

    // Mobile Drawer for Address
    const [showAddressDrawer, setShowAddressDrawer] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', icon: null, confirmText: '', confirmColor: 'blue', onConfirm: () => { } });
    const [focusedField, setFocusedField] = useState(null);
    const handleFocus = (e) => setFocusedField(e.target.name);

    // ESTADO DE FORMULARIO REFINADO
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        dni_ruc: '',
        direccion_entrega: '',
        direccion_cliente_db: '',
        metal: '',
        tipo_producto: '',
        forma_pago: 'Efectivo',

        // LÓGICA DE ENVÍOS
        requiere_envio: false,
        tipo_envio: 'destino', // 'destino', 'pagado', 'pendiente'
        costo_envio: '',

        monto_a_cuenta: '',
        incluye_igv: false,
        estado_pedido: 'aceptado',
        estado_produccion: 'no_iniciado',
        origen_pedido: 'INTERNET',
    });

    const [productoActual, setProductoActual] = useState({ nombre_producto: '', cantidad: '', precio_unitario: '' });
    const [listaProductos, setListaProductos] = useState([]);
    const [calculos, setCalculos] = useState({ precio_total_sin_igv: 0, monto_igv: 0, precio_total: 0, monto_saldo: 0, cancelado: false });

    const [showVoiceReviewModal, setShowVoiceReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [voiceState, setVoiceState] = useState({ isListening: false, transcriptActual: '' });
    const [activeTab, setActiveTab] = useState('pendientes');
    const [tiposDisponibles, setTiposDisponibles] = useState([]);

    // <-- ESTADO NUEVO PARA METALES DESDE BD
    const [metalesList, setMetalesList] = useState([]);

    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [showSugerencias, setShowSugerencias] = useState(false);
    const [nombreBusqueda, setNombreBusqueda] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSugerencias(false);
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

        // <-- CARGA DE METALES DESDE BD AL INICIAR
        materialesDB.getMetales()
            .then(rows => setMetalesList(rows.map(r => r.nombre)))
            .catch(err => console.error("Error al cargar metales:", err));
    }, []);

    const loadTipos = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setTiposDisponibles(data || []);
        } catch (error) { console.error('Error cargando tipos:', error); }
    };

    const handleSearchCliente = async (query) => {
        setNombreBusqueda(query);
        setFormData(prev => ({ ...prev, nombre_cliente: query, telefono: '', dni_ruc: '', direccion_cliente_db: '' }));
        if (query.trim().length > 1) {
            try {
                const results = await clientesDB.search(query);
                setClientesSugeridos(results);
                setShowSugerencias(true);
            } catch (error) { console.error('Error buscando clientes:', error); }
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
            direccion_cliente_db: cliente.direccion || '',
            direccion_entrega: cliente.direccion || prev.direccion_entrega
        }));
        setNombreBusqueda(cliente.nombre);
        setShowSugerencias(false);
    };

    const fetchPedidos = async () => {
        try {
            const data = await pedidosDB.getAll();
            setPedidos(data || []);
        } catch (error) { console.error('Error al cargar pedidos:', error); }
    };

    // ========================================
    // LÓGICA DE CÁLCULOS 
    // ========================================
    useEffect(() => {
        const subtotalProductos = listaProductos.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

        let envioParaTotal = 0;
        if (formData.requiere_envio && (formData.tipo_envio === 'pagado' || formData.tipo_envio === 'pendiente')) {
            envioParaTotal = parseFloat(formData.costo_envio) || 0;
        }

        const precio_total_sin_igv = subtotalProductos;
        let monto_igv = formData.incluye_igv ? precio_total_sin_igv * 0.18 : 0;

        const precio_total = precio_total_sin_igv + monto_igv + envioParaTotal;
        const monto_a_cuenta = parseFloat(formData.monto_a_cuenta) || 0;

        const monto_saldo_raw = precio_total - monto_a_cuenta;
        const monto_saldo = monto_saldo_raw < 0.10 ? 0 : monto_saldo_raw;
        const cancelado = precio_total > 0 && monto_saldo <= 0.001;

        setCalculos({
            precio_total_sin_igv: parseFloat(precio_total_sin_igv.toFixed(2)),
            monto_igv: parseFloat(monto_igv.toFixed(2)),
            precio_total: parseFloat(precio_total.toFixed(2)),
            monto_saldo: parseFloat(monto_saldo.toFixed(2)),
            cancelado
        });

        if (cancelado) setShowCancelAlert(true);
        else setShowCancelAlert(false);

    }, [formData.requiere_envio, formData.tipo_envio, formData.costo_envio, formData.monto_a_cuenta, formData.incluye_igv, listaProductos]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProductoChange = (e) => {
        const { name, value } = e.target;
        setProductoActual(prev => ({ ...prev, [name]: value }));
    };

    const agregarProducto = () => {
        if (!productoActual.nombre_producto.trim() || !productoActual.cantidad || productoActual.cantidad <= 0 || productoActual.precio_unitario === '' || productoActual.precio_unitario < 0) {
            toast.error('Complete nombre, cantidad y precio'); return;
        }
        if (!productoActual.metal || !productoActual.tipo_producto) {
            toast.warning('Seleccione Metal y Tipo'); return;
        }
        setListaProductos(prev => [...prev, {
            ...productoActual, cantidad: parseFloat(productoActual.cantidad), precio_unitario: parseFloat(productoActual.precio_unitario)
        }]);
        setProductoActual({ nombre_producto: '', cantidad: '', precio_unitario: '', metal: '', tipo_producto: '' });
    };

    const eliminarProductoLista = (index) => setListaProductos(prev => prev.filter((_, i) => i !== index));

    const handleEdit = (pedido) => {
        if (pedido.estado_pedido === 'entregado') { toast.error('No se puede editar un pedido entregado'); return; }
        setEditingId(pedido.id_pedido);

        let mappedTipoEnvio = 'destino';
        if (pedido.requiere_envio) {
            if (pedido.modalidad_envio === 'Por Pagar') mappedTipoEnvio = 'destino';
            else if (pedido.envio_pago_pendiente) mappedTipoEnvio = 'pendiente';
            else mappedTipoEnvio = 'pagado';
        }

        setFormData({
            nombre_cliente: pedido.nombre_cliente,
            telefono: pedido.telefono || '',
            dni_ruc: pedido.dni_ruc || '',
            direccion_entrega: pedido.direccion_entrega || '',
            metal: pedido.metal || 'Plata',
            tipo_producto: pedido.tipo_producto || 'Anillo',
            forma_pago: pedido.forma_pago || 'Efectivo',
            requiere_envio: pedido.requiere_envio,
            tipo_envio: mappedTipoEnvio,
            costo_envio: pedido.envio_cobrado_al_cliente || '',
            monto_a_cuenta: pedido.monto_a_cuenta || 0,
            incluye_igv: pedido.incluye_igv,
            estado_pedido: pedido.estado_pedido || 'aceptado',
            estado_produccion: pedido.estado_produccion || 'no_iniciado',
            origen_pedido: pedido.origen_pedido || 'INTERNET',
        });

        if (pedido.detalles_pedido?.length > 0) {
            setListaProductos(pedido.detalles_pedido.map(d => ({ ...d })));
        } else {
            setListaProductos([]);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Pedido', message: '¿Estás seguro? Esta acción no se puede deshacer.',
            icon: <FaTrash />, confirmText: 'Sí, eliminar', confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await ventasDB.deleteByPedidoId(id);
                    await pedidosDB.delete(id);
                    toast.success('Pedido y venta asociada eliminados');
                    fetchPedidos();
                } catch (error) { toast.error('Error al eliminar: ' + error.message); }
            }
        });
    };

    const handleEntregar = async (pedido) => {
        if (pedido.estado_produccion !== 'terminado') { toast.error('Producción no terminada'); return; }
        setConfirmModal({
            isOpen: true, title: 'Confirmar Entrega', message: '¿Confirmar entrega del pedido?',
            icon: <FaCar className="text-blue-500" />, confirmText: 'Confirmar', confirmColor: 'blue',
            onConfirm: async () => {
                try {
                    await pedidosDB.updateEstadoPedido(pedido.id_pedido, 'entregado', new Date().toISOString());
                    toast.success('Pedido entregado'); fetchPedidos();
                } catch (error) { toast.error('Error: ' + error.message); }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            nombre_cliente: '', telefono: '', dni_ruc: '', direccion_entrega: '', metal: '', tipo_producto: '',
            forma_pago: 'Efectivo', requiere_envio: false, tipo_envio: 'destino', costo_envio: '', monto_a_cuenta: '',
            incluye_igv: false, estado_pedido: 'aceptado', estado_produccion: 'no_iniciado', direccion_cliente_db: '', origen_pedido: 'INTERNET'
        });
        setProductoActual({ nombre_producto: '', cantidad: '', precio_unitario: '', metal: '', tipo_producto: '' });
        setListaProductos([]); setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (listaProductos.length === 0) { toast.error("Agregue al menos un producto."); return; }
        if (!formData.nombre_cliente || !formData.telefono) { toast.error("Nombre y Teléfono obligatorios."); return; }

        setLoading(true);

        let dbModalidadEnvio = 'Fijo';
        let dbEnvioPagoPendiente = false;
        let dbCostoEnvio = 0;

        if (formData.requiere_envio) {
            if (formData.tipo_envio === 'destino') {
                dbModalidadEnvio = 'Por Pagar';
                dbEnvioPagoPendiente = true;
                dbCostoEnvio = 0;
            } else if (formData.tipo_envio === 'pagado') {
                dbModalidadEnvio = 'Fijo';
                dbEnvioPagoPendiente = false;
                dbCostoEnvio = parseFloat(formData.costo_envio) || 0;
            } else if (formData.tipo_envio === 'pendiente') {
                dbModalidadEnvio = 'Fijo';
                dbEnvioPagoPendiente = true;
                dbCostoEnvio = parseFloat(formData.costo_envio) || 0;
            }
        }

        try {
            const pedidoData = {
                ...formData,
                metal: formData.metal || listaProductos[0].metal,
                tipo_producto: formData.tipo_producto || listaProductos[0].tipo_producto,
                modalidad_envio: dbModalidadEnvio,
                envio_pago_pendiente: dbEnvioPagoPendiente,
                envio_cobrado_al_cliente: dbCostoEnvio,
                envio_referencia: 0,
                precio_total_sin_igv: calculos.precio_total_sin_igv,
                precio_total: calculos.precio_total,
                monto_a_cuenta: parseFloat(formData.monto_a_cuenta) || 0,
                monto_igv: calculos.monto_igv,
                monto_saldo: calculos.monto_saldo,
                cancelado: calculos.cancelado,
                entregado: false,
                origen_pedido: formData.origen_pedido || 'INTERNET'
            };

            let pedidoId = editingId;
            if (editingId) {
                await pedidosDB.update(editingId, pedidoData);
                await pedidosDB.deleteDetalles(editingId);
                await pedidosDB.createDetalles(editingId, listaProductos);
            } else {
                const pedido = await pedidosDB.create(pedidoData);
                pedidoId = pedido.id_pedido;
                await pedidosDB.createDetalles(pedidoId, listaProductos);
                if (pedidoData.monto_a_cuenta > 0) {
                    await pedidosDB.createPago({ id_pedido: pedidoId, monto: pedidoData.monto_a_cuenta, fecha_pago: getLocalDate(), metodo_pago: formData.forma_pago, referencia: '' });
                }
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);
            }

            // ── Sincronización con Reporte de Ventas ──
            if (calculos.cancelado) {
                const codigoPed = `PED-${String(pedidoId).padStart(4, '0')}`;
                const ventasExistentes = await ventasDB.getAll();
                const yaExistente = ventasExistentes.some(v =>
                    v.detalles && v.detalles.some(d => d.producto_codigo === codigoPed)
                );

                if (!yaExistente) {
                    await ventasDB.createVentaPedido({
                        pedidoId: pedidoId,
                        clienteNombre: formData.nombre_cliente,
                        total: calculos.precio_total,
                        formaPago: formData.forma_pago,
                        costo_materiales: 0,
                        observaciones: `Cobro pedido #${pedidoId}`,
                        fecha_venta: new Date().toISOString()
                    });
                    if (editingId) toast.success('Venta registrada/actualizada');
                }
            }

            await fetchPedidos();
            resetForm();
        } catch (error) { toast.error(`Error: ${error.message}`); }
        finally { setLoading(false); }
    };

    const handlePrint = (pedido) => { setPrintPedido(pedido); setShowPrintModal(true); };
    const closePrintModal = () => { setShowPrintModal(false); setPrintPedido(null); };

    const handleOpenPayModal = (pedido) => {
        setPayPedido(pedido);
        setPayData({ monto: pedido.monto_saldo, fecha: getLocalDate(), metodo: 'Efectivo' });
        setShowPayModal(true);
    };
    const handleClosePayModal = () => { setShowPayModal(false); setPayPedido(null); };

    const handleQuickPay = async () => {
        if (!payPedido || !payData.monto) return;
        try {
            const montoPago = parseFloat(payData.monto);
            const nuevoAcuenta = (payPedido.monto_a_cuenta || 0) + montoPago;
            const nuevoSaldo = payPedido.precio_total - nuevoAcuenta;
            const pedidoActualizado = { ...payPedido, monto_a_cuenta: nuevoAcuenta, monto_saldo: Math.max(0, nuevoSaldo), cancelado: nuevoSaldo <= 0.05 };
            await pedidosDB.update(payPedido.id_pedido, pedidoActualizado);
            await pedidosDB.createPago({ id_pedido: payPedido.id_pedido, monto: montoPago, fecha_pago: payData.fecha, metodo_pago: payData.metodo, referencia: '' });

            // ── Si el saldo queda en cero → registrar ingreso en Ventas ──
            if (nuevoSaldo <= 0.05) {
                const codigoPed = `PED-${String(payPedido.id_pedido).padStart(4, '0')}`;
                const ventasExistentes = await ventasDB.getAll();
                const yaRegistrado = ventasExistentes.some(v =>
                    v.detalles && v.detalles.some(d => d.producto_codigo === codigoPed)
                );
                if (!yaRegistrado) {
                    await ventasDB.createVentaPedido({
                        pedidoId: payPedido.id_pedido,
                        clienteNombre: payPedido.nombre_cliente,
                        total: payPedido.precio_total,
                        formaPago: payData.metodo || payPedido.forma_pago,
                        costo_materiales: 0,
                        observaciones: `Cobro pedido #${payPedido.id_pedido}`,
                        fecha_venta: new Date().toISOString()
                    });
                    toast.success('Ingreso registrado en Reporte de Ventas ✅');
                }
            }

            toast.success('Pago registrado');
            handleClosePayModal(); fetchPedidos();
        } catch (error) { toast.error('Error al registrar pago'); }
    };

    const handleCrearProduccion = async (pedido) => { navigate(`/produccion?pedido=${pedido.id_pedido}`); };

    const filteredPedidos = pedidos.filter(p => {
        const estadoProd = (p.estado_produccion || 'no_iniciado').trim().toLowerCase();
        const estadoPed = (p.estado_pedido || 'aceptado').trim().toLowerCase();
        if (activeTab === 'pendientes') {
            const isNoIniciado = estadoProd === 'no_iniciado' || estadoProd === 'pendiente' || !estadoProd;
            if (estadoPed === 'entregado' || estadoPed === 'cancelado') return false;
            return isNoIniciado || p.tiene_productos_pendientes;
        } else if (activeTab === 'produccion') {
            const isEnProceso = estadoProd === 'en_proceso' || estadoProd === 'en proceso' || estadoProd === 'en_produccion';
            return isEnProceso && estadoPed !== 'entregado';
        } else if (activeTab === 'terminados') {
            return estadoProd === 'terminado' && estadoPed !== 'entregado';
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (p.nombre_cliente?.toLowerCase().includes(term) || p.telefono?.toString().includes(term));
        }
        return true;
    });

    const handleWheel = (e) => e.target.blur();

    return (
        <div className="container mx-auto p-3 md:p-6 bg-gray-50 min-h-screen pb-20 font-sans">

            <div className="mb-4">
                <Link to="/inventario-home" className="flex items-center text-gray-500 hover:text-gray-800 transition-colors w-fit text-sm font-medium">
                    <FaArrowLeft className="mr-2" />
                    <span>Volver</span>
                </Link>
            </div>

            <div className="bg-white shadow-sm md:shadow-lg rounded-2xl p-4 md:p-6 mb-8 max-w-2xl mx-auto border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-5">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">{editingId ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
                    {editingId && (
                        <button onClick={resetForm} className="text-xs text-gray-400 hover:text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-full">
                            Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ========================================
                        SECCIÓN CLIENTE
                    ======================================== */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">Cliente *</label>
                            {/* BOTON "+ NUEVO CLIENTE" SUTIL */}
                            <Link
                                to="/clientes"
                                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50/50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                                title="Ir a registrar un nuevo cliente"
                            >
                                <FaPlus size={8} /> Nuevo
                            </Link>
                        </div>
                        <div className="relative" ref={searchRef}>
                            <input
                                type="text"
                                name="nombre_cliente"
                                value={formData.nombre_cliente}
                                onChange={(e) => handleSearchCliente(e.target.value)}
                                autoComplete="off"
                                className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium text-gray-900 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                                placeholder="Buscar o ingresar nombre..."
                            />
                            {showSugerencias && clientesSugeridos.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                                    {clientesSugeridos.map(c => (
                                        <button key={c.id} type="button" onClick={() => handleSelectCliente(c)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-800">{c.nombre}</span>
                                            <span className="text-xs text-gray-400">{c.telefono}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px] block mb-1">Teléfono *</label>
                                <input
                                    type="tel" inputMode="numeric" name="telefono"
                                    value={formData.telefono} onChange={handleChange}
                                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium text-gray-900 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Celular"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[10px] block mb-1">DNI / RUC (Opcional)</label>
                                <input
                                    type="text" inputMode="numeric" name="dni_ruc"
                                    value={formData.dni_ruc} onChange={handleChange}
                                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium text-gray-900 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* ========================================
                        SECCIÓN PRODUCTOS (MINIMALISTA)
                    ======================================== */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">Añadir Producto</label>
                        <div className="bg-gray-50 rounded-2xl p-3 ring-1 ring-gray-200">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {/* <-- REEMPLAZADO PARA USAR METALES DESDE LA BD --> */}
                                <select name="metal" value={productoActual.metal} onChange={handleProductoChange} className="w-full h-11 bg-white rounded-lg text-xs font-medium border-none ring-1 ring-gray-200 text-gray-600 focus:ring-2 focus:ring-blue-500">
                                    <option value="">Metal...</option>
                                    {metalesList.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select name="tipo_producto" value={productoActual.tipo_producto} onChange={handleProductoChange} className="w-full h-11 bg-white rounded-lg text-xs font-medium border-none ring-1 ring-gray-200 text-gray-600 focus:ring-2 focus:ring-blue-500">
                                    <option value="">Tipo...</option>
                                    {tiposDisponibles.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <input
                                type="text" name="nombre_producto" value={productoActual.nombre_producto} onChange={handleProductoChange}
                                placeholder="Descripción (Ej. Anillo texturizado)"
                                className="w-full h-11 bg-white rounded-lg px-3 text-xs font-medium border-none ring-1 ring-gray-200 mb-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                            />
                            <div className="flex gap-2">
                                <input type="number" inputMode="decimal" min="1" name="cantidad" value={productoActual.cantidad} onChange={handleProductoChange} placeholder="Cant." className="w-20 h-11 bg-white rounded-lg px-3 text-center text-sm font-medium border-none ring-1 ring-gray-200 text-gray-900" />
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                                    <input type="number" inputMode="decimal" step="0.01" name="precio_unitario" value={productoActual.precio_unitario} onChange={handleProductoChange} placeholder="Precio" className="w-full h-11 bg-white rounded-lg pl-8 pr-3 text-sm font-bold text-gray-800 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <button type="button" onClick={agregarProducto} className="h-11 w-11 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform shadow-sm">
                                    <FaPlus size={14} />
                                </button>
                            </div>
                        </div>

                        {listaProductos.length > 0 && (
                            <div className="space-y-2 mt-3">
                                {listaProductos.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex-1 min-w-0 pr-3">
                                            <p className="text-xs font-bold text-gray-800 truncate">{p.tipo_producto} - {p.nombre_producto}</p>
                                            <p className="text-[10px] text-gray-500">{p.cantidad}x {p.metal} @ S/ {p.precio_unitario.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-blue-700">S/ {(p.cantidad * p.precio_unitario).toFixed(2)}</span>
                                            <button type="button" onClick={() => eliminarProductoLista(i)} className="text-red-400 hover:text-red-600 p-1"><FaTrash size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* ========================================
                        SECCIÓN ENVÍO
                    ======================================== */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px] flex items-center gap-1">
                                <FaTruck className="text-gray-400" /> Delivery / Envío
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="requiere_envio" checked={formData.requiere_envio} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {formData.requiere_envio && (
                            <div className="bg-blue-50/30 rounded-2xl p-3 border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">

                                <button type="button" onClick={() => setShowAddressDrawer(true)} className="w-full bg-white flex items-center justify-between p-3 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors text-left shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><FaMapMarkerAlt size={14} /></div>
                                        <div className="truncate">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Dirección de Entrega</p>
                                            <p className="text-xs font-semibold text-gray-800 truncate">{formData.direccion_entrega || 'Tocar para agregar dirección...'}</p>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-gray-300" size={12} />
                                </button>

                                <div className="bg-white p-1 rounded-xl flex shadow-sm border border-gray-100">
                                    {[
                                        { id: 'destino', label: 'En Destino' },
                                        { id: 'pagado', label: 'Ya Pagado' },
                                        { id: 'pendiente', label: 'Pendiente' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id} type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tipo_envio: opt.id }))}
                                            className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all text-center ${formData.tipo_envio === opt.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                {formData.tipo_envio !== 'destino' && (
                                    <div className="relative animate-in zoom-in-95 duration-200 shadow-sm">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                                        <input
                                            type="number" inputMode="decimal" step="0.01" name="costo_envio"
                                            value={formData.costo_envio} onChange={handleChange}
                                            placeholder="Costo de envío"
                                            className="w-full h-12 bg-white rounded-xl pl-8 pr-4 text-sm font-bold text-gray-800 border border-blue-100 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* ========================================
                        SECCIÓN FINANZAS / PAGO
                    ======================================== */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <label className="text-sm font-bold text-blue-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <FaMoneyBillWave className="text-blue-500" /> Resumen y Pago
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-2 py-1 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors">
                                <input type="checkbox" name="incluye_igv" checked={formData.incluye_igv} onChange={handleChange} className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 h-4 w-4" />
                                <span className="text-[10px] font-bold text-blue-700 uppercase">+ IGV</span>
                            </label>
                        </div>

                        {/* Desglose */}
                        <div className="space-y-2 text-xs text-gray-600 font-medium px-1">
                            <div className="flex justify-between">
                                <span>Subtotal Joyas</span>
                                <span className="font-semibold text-gray-800">S/ {calculos.precio_total_sin_igv.toFixed(2)}</span>
                            </div>

                            {formData.requiere_envio && formData.tipo_envio !== 'destino' && parseFloat(formData.costo_envio) > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>Envío ({formData.tipo_envio === 'pagado' ? 'Ya Pagado' : 'Pendiente'})</span>
                                    <span className="font-semibold">+ S/ {parseFloat(formData.costo_envio).toFixed(2)}</span>
                                </div>
                            )}
                            {formData.requiere_envio && formData.tipo_envio === 'destino' && (
                                <div className="flex justify-between text-amber-600 italic text-[10px]">
                                    <span>Envío Pago en Destino</span>
                                    <span>S/ 0.00</span>
                                </div>
                            )}

                            {formData.incluye_igv && (
                                <div className="flex justify-between text-gray-500">
                                    <span>IGV (18%)</span>
                                    <span>+ S/ {calculos.monto_igv.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-3 border-t border-dashed border-gray-200 mt-2">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Total Pedido</span>
                                <span className="text-xl font-black text-blue-700">S/ {calculos.precio_total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Ingreso de Adelanto/Pago */}
                        <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-center border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all shadow-inner">
                            <select name="forma_pago" value={formData.forma_pago} onChange={handleChange} className="bg-transparent text-xs font-bold text-gray-700 border-none focus:ring-0 p-0 w-24 cursor-pointer">
                                <option value="Efectivo">Efectivo</option>
                                <option value="Yape">Yape</option>
                                <option value="Plin">Plin</option>
                                <option value="Transferencia">Transferencia</option>
                            </select>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="relative flex-1 flex items-center">
                                <span className="text-gray-500 text-[10px] sm:text-xs font-bold whitespace-nowrap mr-2">Adelanto S/</span>
                                <input
                                    type="number" inputMode="decimal" step="0.01" name="monto_a_cuenta"
                                    value={formData.monto_a_cuenta} onChange={handleChange} required
                                    className="w-full bg-transparent text-right text-lg font-black text-green-600 border-none focus:ring-0 p-0 placeholder:text-gray-300"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* CAMPO NUEVO: Origen del pedido */}
                        <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-center border border-gray-200 mt-3 shadow-inner relative">
                            <label className="text-gray-500 text-[10px] sm:text-xs font-bold whitespace-nowrap absolute -top-2 left-3 bg-white px-1 border border-gray-200 rounded">Origen</label>
                            <select
                                name="origen_pedido"
                                value={formData.origen_pedido || 'INTERNET'}
                                onChange={handleChange}
                                className="w-full bg-transparent text-sm font-bold text-gray-700 border-none focus:ring-0 p-0 pt-2 cursor-pointer"
                            >
                                <option value="INTERNET">🌐 Redes</option>
                                <option value="TIENDA">🏪 Tienda</option>
                            </select>
                        </div>

                        {/* Saldo Final */}
                        {!calculos.cancelado ? (
                            <div className="flex justify-between items-center bg-red-50 rounded-lg p-3 border border-red-100">
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest">Saldo Pendiente</span>
                                <span className="text-sm font-black text-red-600">S/ {calculos.monto_saldo.toFixed(2)}</span>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center bg-green-50 rounded-lg p-3 border border-green-200 text-green-700 gap-2 shadow-sm">
                                <FaCheckCircle />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Pedido Cancelado (Pagado)</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className={`w-full h-14 rounded-xl shadow-lg text-sm font-bold uppercase tracking-widest text-white transition-all active:scale-[0.98] flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
                    >
                        {loading ? 'Guardando...' : (editingId ? 'Actualizar Pedido' : 'Registrar Pedido')}
                    </button>
                </form>
            </div>

            {/* ========================================
                GRILLA DE PEDIDOS (INTACTA)
            ======================================== */}
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto pb-8 md:pb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🧾</span>
                    <span>Gestión de Pedidos</span>
                </h2>

                {
                    (() => {
                        const counts = {
                            pendientes: pedidos.filter(p => p.estado_pedido !== 'entregado' && p.estado_pedido !== 'cancelado' && (p.estado_produccion === 'no_iniciado' || p.tiene_productos_pendientes)).length,
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

                <div className="mb-6">
                    {activeTab === 'pendientes' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS PENDIENTES</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">{filteredPedidos.length}</span>
                        </div>
                    )}
                    {activeTab === 'produccion' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS EN PRODUCCIÓN</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">{filteredPedidos.length}</span>
                        </div>
                    )}
                    {activeTab === 'terminados' && (
                        <div className="p-3 rounded-lg flex justify-between md:justify-center items-center text-sm border border-gray-200">
                            <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS LISTOS PARA ENTREGA</span>
                            <span className="font-bold text-2xl text-gray-900 ml-4">{filteredPedidos.length}</span>
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
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span>{pedido.nombre_cliente}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pedido.origen_pedido === 'TIENDA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {pedido.origen_pedido === 'TIENDA' ? '🏪 Tienda' : '🌐 Internet'}
                                                        </span>
                                                    </div>
                                                </td>
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
                                                    <div className="flex justify-center md:justify-end gap-3 md:gap-4">
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
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span>{pedido.nombre_cliente}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pedido.origen_pedido === 'TIENDA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {pedido.origen_pedido === 'TIENDA' ? '🏪 Tienda' : '🌐 Internet'}
                                                        </span>
                                                    </div>
                                                </td>
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
                                                    <div className="flex justify-center md:justify-end gap-3 md:gap-4">
                                                        {pedido.tiene_productos_pendientes && (
                                                            <Tooltip text="Continuar producción (items faltantes)">
                                                                <button onClick={() => handleCrearProduccion(pedido)} className="text-purple-600 hover:text-purple-900 transition-colors">
                                                                    <FaHammer className="h-6 w-6" />
                                                                </button>
                                                            </Tooltip>
                                                        )}
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
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span>{pedido.nombre_cliente}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pedido.origen_pedido === 'TIENDA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {pedido.origen_pedido === 'TIENDA' ? '🏪 Tienda' : '🌐 Internet'}
                                                        </span>
                                                    </div>
                                                </td>
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
                                                    {pedido.estado_produccion === 'en_proceso' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                            ● Ini. Parcial
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">● Pendiente</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center"><EstadoPagoBadge pedido={pedido} /></td>
                                                <td className={`px-4 py-4 whitespace-nowrap text-sm font-bold text-right ${pedido.monto_saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>S/ {pedido.monto_saldo.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-center md:justify-end gap-3 md:gap-4">
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

            {/* DRAWER PARA DIRECCIÓN DE ENVÍO */}
            {showAddressDrawer && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /> Detalle de Entrega</h3>

                        <textarea
                            name="direccion_entrega"
                            value={formData.direccion_entrega}
                            onChange={handleChange}
                            placeholder="Ej: Av. Larco 123, Miraflores. Ref: Frente al parque. Recibe: Juan."
                            rows="4"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
                        ></textarea>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowAddressDrawer(false)} className="flex-1 h-12 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Cancelar</button>
                            <button type="button" onClick={() => setShowAddressDrawer(false)} className="flex-[2] h-12 bg-gray-900 text-white font-bold rounded-xl text-sm shadow-md hover:bg-black transition-colors">Confirmar Dirección</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VOUCHER IMPRESIÓN (DISEÑO MEJORADO) */}
            {showPrintModal && printPedido && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-[98%] sm:max-w-[460px] flex flex-col relative animate-in zoom-in-95 duration-200">

                        {/* HEADER ACCIONES */}
                        <div className="px-4 py-3 flex justify-between items-center bg-gray-50 border-b border-gray-100 rounded-t-2xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vista Previa</span>
                            <div className="flex gap-2">
                                <button onClick={async () => {
                                    const element = document.getElementById('printable-voucher');
                                    const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
                                    canvas.toBlob(async (blob) => {
                                        const file = new File([blob], `Pedido_${printPedido.id_pedido}.jpg`, { type: 'image/jpeg' });
                                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                            try { await navigator.share({ files: [file] }); } catch (e) { }
                                        } else {
                                            const link = document.createElement('a');
                                            link.download = `Pedido_${printPedido.id_pedido}.jpg`; link.href = canvas.toDataURL('image/jpeg', 1.0); link.click();
                                        }
                                    }, 'image/jpeg', 1.0);
                                }} className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                                    <FaShareAlt size={12} />
                                </button>
                                <button onClick={closePrintModal} className="h-8 w-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                                    <FaTimesCircle size={14} />
                                </button>
                            </div>
                        </div>

                        {/* CONTENIDO DEL VOUCHER (CONTENEDOR SEGURO) */}
                        <div className="p-6 sm:p-8 bg-white relative overflow-hidden rounded-b-2xl" id="printable-voucher">

                            {/* SELLO DE PAGADO ELIMINADO PARA MANTENER LA VISTA LIMPIA */}

                            {/* TAG DE ESTADO Y FECHA */}
                            <div className="flex justify-between items-center mb-5 relative z-10">
                                {printPedido.monto_saldo > 0.05 ? (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">En Proceso</span>
                                ) : (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Completado</span>
                                )}
                                <span className="text-[11px] font-mono font-bold text-gray-500">
                                    {formatLocalDate(printPedido.fecha_pedido)}
                                </span>
                            </div>

                            {/* HEADER - ROW 2: LOGO & FOLIO (A LA MISMA ALTURA) */}
                            <div className="flex justify-between items-start mb-6 relative z-10 border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-[12px] font-normal text-gray-600 leading-none mb-1.5">Enigma artesanías y accesorios</p>
                                    <h1 className="text-base font-bold uppercase tracking-widest text-gray-900 leading-none">NOTA DE PEDIDO</h1>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded">
                                    <p className="text-[11px] font-bold text-gray-700 font-mono tracking-wide">N° {String(printPedido.id_pedido).padStart(4, '0')}</p>
                                </div>
                            </div>

                            {/* CLIENT DETAILS (ICONS) */}
                            <div className="mb-6 space-y-3 relative z-10">
                                <div className="flex items-start gap-2.5 text-[15px]">
                                    <FaUser className="text-gray-400 mt-1 shrink-0" size={13} />
                                    <span className="font-semibold text-gray-800 capitalize leading-tight">{printPedido.nombre_cliente.toLowerCase()}</span>
                                </div>
                                {printPedido.telefono && (
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <FaPhone className="text-gray-400 shrink-0" size={13} />
                                        <span className="text-gray-600">{printPedido.telefono}</span>
                                    </div>
                                )}
                                {printPedido.requiere_envio && printPedido.direccion_entrega && (
                                    <div className="flex items-start gap-2.5 text-sm">
                                        <FaMapMarkerAlt className="text-gray-400 mt-1 shrink-0" size={13} />
                                        <span className="text-gray-600 leading-snug">{printPedido.direccion_entrega}</span>
                                    </div>
                                )}
                            </div>

                            {/* PRODUCTS LIST */}
                            <div className="mb-7 relative z-10">
                                <div className="space-y-3.5">
                                    {printPedido.detalles_pedido.map((d, index) => (
                                        <div key={index} className="flex justify-between text-sm items-start">
                                            <div className="pr-2 leading-tight">
                                                <span className="font-bold text-gray-800">{d.cantidad}x </span>
                                                <span className="text-gray-700">{d.nombre_producto}</span>
                                                <span className="text-[10px] text-gray-400 block mt-1">({d.metal})</span>
                                            </div>
                                            <span className="font-semibold text-gray-800 pt-0.5 whitespace-nowrap">S/ {(d.cantidad * d.precio_unitario).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TOTALS & SHIPPING */}
                            <div className="border-t border-gray-200 pt-5 space-y-2 relative z-10 bg-transparent">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>S/ {printPedido.precio_total_sin_igv.toFixed(2)}</span>
                                </div>

                                {printPedido.requiere_envio && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Envío {printPedido.envio_pago_pendiente && printPedido.envio_cobrado_al_cliente === 0 ? '(Pago en destino)' : ''}</span>
                                        <span>S/ {printPedido.envio_cobrado_al_cliente.toFixed(2)}</span>
                                    </div>
                                )}

                                {printPedido.incluye_igv && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>IGV (18%)</span>
                                        <span>S/ {printPedido.monto_igv.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-base text-gray-900 pt-3 mt-3 border-t border-gray-100">
                                    <span>TOTAL</span>
                                    <span>S/ {printPedido.precio_total.toFixed(2)}</span>
                                </div>

                                {/* ESTADOS FINALES DE BALANCE */}
                                {printPedido.monto_saldo > 0.05 ? (
                                    <>
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span>A Cuenta</span>
                                            <span>- S/ {printPedido.monto_a_cuenta.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-black text-base text-red-600 bg-red-50 px-3 py-2.5 rounded mt-3 border border-red-100">
                                            <span className="uppercase tracking-wide text-[11px]">Saldo Pendiente</span>
                                            <span>S/ {printPedido.monto_saldo.toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-center gap-2">
                                        <FaCheckCircle className="text-emerald-500" size={16} />
                                        <div className="text-center">
                                            <span className="block font-bold text-emerald-700 text-xs py-0.5 uppercase tracking-widest leading-none">Totalmente Pagado</span>
                                            <span className="block text-[10px] text-emerald-600 mt-1.5 leading-none">Gracias por tu compra</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Pago Rápido */}
            {showPayModal && payPedido && (
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
                                        type="number" step="0.01" value={payData.monto}
                                        onChange={(e) => setPayData({ ...payData, monto: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                    <input
                                        type="date" value={payData.fecha}
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
                            <button onClick={handleClosePayModal} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Cancelar</button>
                            <button onClick={handleQuickPay} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Confirmar Pago</button>
                        </div>
                    </div>
                </div>
            )}

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
                            <button onClick={() => setShowEstadoModal(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Actualizar Estado</button>
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

            {/* Toaster y Confirm Modal */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: '14px', maxWidth: '300px', padding: '12px 16px' },
                    success: { iconTheme: { primary: '#10b981', secondary: 'white' }, style: { borderLeft: '4px solid #10b981' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: 'white' }, duration: 4000, style: { borderLeft: '4px solid #ef4444' } },
                    warning: { icon: '⚠️', style: { borderLeft: '4px solid #f59e0b' } }
                }}
            />

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
        </div>
    );
};

export default Pedidos;