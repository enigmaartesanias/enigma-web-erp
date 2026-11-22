import React, { useState, useEffect, useRef } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';
import { clientesDB } from '../utils/clientesNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import { materialesDB } from '../utils/materialesNeonClient';
import { getLocalDate } from '../utils/dateUtils';
import { ventasDB } from '../utils/ventasClient';
import { TOLERANCIA_SALDO, METODOS_PAGO, calcularSaldo, estadoPago, formatLocalDate, asegurarVentaPedido } from '../utils/pedidosUtils';
import PagoModal from './pedidos/PagoModal';
import NotaPedido from './pedidos/NotaPedido';
import CerrarPedidoModal from './pedidos/CerrarPedidoModal';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheckCircle, FaPlus, FaMoneyBillWave, FaPhone, FaArrowLeft, FaHammer, FaCar, FaEye, FaTruck, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ui/ConfirmModal';
import Tooltip from './ui/Tooltip';

// ========================================
// COMPONENTES DE BADGE
// ========================================
const EstadoPagoBadge = ({ pedido }) => {
    const estado = estadoPago(pedido);
    const estilos = { pendiente: 'bg-red-100 text-red-800', adelanto: 'bg-yellow-100 text-yellow-800', pagado: 'bg-green-100 text-green-800' };
    const iconos = { pendiente: '🔴', adelanto: '🟡', pagado: '🟢' };
    const labels = { pendiente: 'Pendiente', adelanto: 'Adelanto', pagado: 'Pagado' };
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
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pedidos, setPedidos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printPedido, setPrintPedido] = useState(null);
    const [ultimoPagoRealizado, setUltimoPagoRealizado] = useState(null);

    // Quick Pay Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payPedido, setPayPedido] = useState(null);

    // Cierre histórico / lote
    const [modoHistorico, setModoHistorico] = useState(false);
    const [seleccionados, setSeleccionados] = useState([]);
    const [showCerrarModal, setShowCerrarModal] = useState(false);
    const [pedidosACerrar, setPedidosACerrar] = useState([]);

    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Mobile Drawer for Address
    const [showAddressDrawer, setShowAddressDrawer] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', icon: null, confirmText: '', confirmColor: 'blue', onConfirm: () => { } });

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
    });

    const [productoActual, setProductoActual] = useState({ nombre_producto: '', cantidad: '1', precio_unitario: '', metal: '', tipo_producto: '' });
    const [listaProductos, setListaProductos] = useState([]);
    const [calculos, setCalculos] = useState({ precio_total_sin_igv: 0, monto_igv: 0, precio_total: 0, monto_saldo: 0, cancelado: false });

    const [activeTab, setActiveTab] = useState('pendientes');
    const [tiposDisponibles, setTiposDisponibles] = useState([]);

    // <-- ESTADO NUEVO PARA METALES DESDE BD
    const [metalesList, setMetalesList] = useState([]);

    const [clientesSugeridos, setClientesSugeridos] = useState([]);
    const [showSugerencias, setShowSugerencias] = useState(false);
    const [nombreBusqueda, setNombreBusqueda] = useState('');
    const searchRef = useRef(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(false);
    const [showModalNuevoCliente, setShowModalNuevoCliente] = useState(false);
    const [nuevoClienteForm, setNuevoClienteForm] = useState({ nombre: '', telefono: '' });
    const [savingCliente, setSavingCliente] = useState(false);

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
        setClienteSeleccionado(false);
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
        setClienteSeleccionado(true);
        setShowSugerencias(false);
    };

    const abrirModalNuevoCliente = (nombrePrecargado = '') => {
        setNuevoClienteForm({ nombre: nombrePrecargado || '', telefono: '' });
        setShowSugerencias(false);
        setShowModalNuevoCliente(true);
    };

    const cerrarModalNuevoCliente = () => {
        setShowModalNuevoCliente(false);
        setNuevoClienteForm({ nombre: '', telefono: '' });
        setSavingCliente(false);
    };

    const handleGuardarNuevoCliente = async () => {
        if (!nuevoClienteForm.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
        if (!nuevoClienteForm.telefono.trim()) { toast.error('El teléfono es obligatorio'); return; }
        setSavingCliente(true);
        try {
            const nuevoCliente = await clientesDB.create({
                nombre: nuevoClienteForm.nombre.trim(),
                telefono: nuevoClienteForm.telefono.trim(),
                dni: null,
                direccion: null
            });
            handleSelectCliente(nuevoCliente);
            cerrarModalNuevoCliente();
            toast.success(`Cliente "${nuevoCliente.nombre}" creado y seleccionado`);
        } catch (err) {
            toast.error('Error al crear cliente: ' + err.message);
        } finally {
            setSavingCliente(false);
        }
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
        if (formData.requiere_envio && formData.tipo_envio === 'cobro') {
            envioParaTotal = parseFloat(formData.costo_envio) || 0;
        }

        const precio_total_sin_igv = subtotalProductos;
        const precio_total = parseFloat((precio_total_sin_igv + envioParaTotal).toFixed(2));
        const monto_a_cuenta = parseFloat(formData.monto_a_cuenta) || 0;

        const monto_saldo = calcularSaldo(precio_total, monto_a_cuenta);
        const cancelado = precio_total > 0 && monto_saldo <= TOLERANCIA_SALDO;

        setCalculos({
            precio_total_sin_igv: parseFloat(precio_total_sin_igv.toFixed(2)),
            monto_igv: 0,
            precio_total,
            monto_saldo,
            cancelado
        });

        if (cancelado) setShowCancelAlert(true);
        else setShowCancelAlert(false);

    }, [formData.requiere_envio, formData.tipo_envio, formData.costo_envio, formData.monto_a_cuenta, listaProductos]);

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
            toast.error('Seleccione Metal y Tipo'); return;
        }
        setListaProductos(prev => [...prev, {
            ...productoActual, cantidad: parseFloat(productoActual.cantidad), precio_unitario: parseFloat(productoActual.precio_unitario)
        }]);
        setProductoActual({ nombre_producto: '', cantidad: '1', precio_unitario: '', metal: '', tipo_producto: '' });
    };

    const eliminarProductoLista = (index) => setListaProductos(prev => prev.filter((_, i) => i !== index));

    const handleEdit = (pedido) => {
        if (pedido.estado_pedido === 'entregado') { toast.error('No se puede editar un pedido entregado'); return; }
        setEditingId(pedido.id_pedido);

        let mappedTipoEnvio = 'destino';
        if (pedido.requiere_envio) {
            if (pedido.modalidad_envio === 'Por Pagar') mappedTipoEnvio = 'destino';
            else mappedTipoEnvio = 'cobro';
        }

        setFormData({
            nombre_cliente: pedido.nombre_cliente,
            telefono: pedido.telefono || '',
            dni_ruc: pedido.dni_ruc || '',
            direccion_entrega: pedido.direccion_entrega || '',
            metal: pedido.metal || 'Plata',
            tipo_producto: pedido.tipo_producto || 'Anillo',
            forma_pago: pedido.forma_pago || 'Efectivo',
            requiere_envio: !!pedido.requiere_envio,
            tipo_envio: mappedTipoEnvio,
            costo_envio: pedido.envio_cobrado_al_cliente || '',
            monto_a_cuenta: pedido.monto_a_cuenta || 0,
            incluye_igv: false,
            estado_pedido: pedido.estado_pedido || 'aceptado',
            estado_produccion: pedido.estado_produccion || 'no_iniciado',
        });

        setClienteSeleccionado(true);
        setNombreBusqueda(pedido.nombre_cliente || '');

        if (pedido.detalles_pedido?.length > 0) {
            setListaProductos(pedido.detalles_pedido.map(d => ({ ...d })));
        } else {
            setListaProductos([]);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const pedidoObj = pedidos.find(p => p.id_pedido === id);
        if (pedidoObj && pedidoObj.pagos && pedidoObj.pagos.length > 0) {
            toast.error('Tiene pagos registrados. No se puede eliminar.');
            return;
        }

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
            incluye_igv: false, estado_pedido: 'aceptado', estado_produccion: 'no_iniciado', direccion_cliente_db: ''
        });
        setProductoActual({ nombre_producto: '', cantidad: '1', precio_unitario: '', metal: '', tipo_producto: '' });
        setListaProductos([]); setEditingId(null);
        setClienteSeleccionado(false);
        setNombreBusqueda('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (listaProductos.length === 0) { toast.error("Agregue al menos un producto."); return; }
        if (!formData.nombre_cliente || !formData.telefono) { toast.error("Nombre y Teléfono obligatorios."); return; }
        if (!clienteSeleccionado && !editingId) { toast.error("Selecciona un cliente de la lista o crea uno nuevo con el botón +Nuevo."); return; }

        const adelanto = parseFloat(formData.monto_a_cuenta) || 0;
        if (adelanto < 0) { toast.error("El adelanto no puede ser negativo."); return; }
        if (adelanto > calculos.precio_total + TOLERANCIA_SALDO) {
            toast.error(`El adelanto (S/ ${adelanto.toFixed(2)}) no puede superar el total (S/ ${calculos.precio_total.toFixed(2)}).`);
            return;
        }

        setLoading(true);

        let dbModalidadEnvio = 'Fijo';
        let dbEnvioPagoPendiente = false;
        let dbCostoEnvio = 0;

        if (formData.requiere_envio) {
            if (formData.tipo_envio === 'destino') {
                dbModalidadEnvio = 'Por Pagar';
                dbEnvioPagoPendiente = true;
                dbCostoEnvio = 0;
            } else { // 'cobro'
                dbModalidadEnvio = 'Fijo';
                dbEnvioPagoPendiente = false;
                dbCostoEnvio = parseFloat(formData.costo_envio) || 0;
            }
        }

        try {
            // Actualizar DNI / dirección en cliente si aplica
            if (formData.nombre_cliente && (formData.dni_ruc || formData.direccion_entrega)) {
                try {
                    const clientes = await clientesDB.search(formData.nombre_cliente);
                    const cMatch = clientes.find(c => c.nombre.trim().toLowerCase() === formData.nombre_cliente.trim().toLowerCase());
                    if (cMatch && cMatch.id) {
                        await clientesDB.update(cMatch.id, {
                            nombre: cMatch.nombre,
                            telefono: cMatch.telefono,
                            dni: formData.dni_ruc || cMatch.dni,
                            direccion: formData.direccion_entrega || cMatch.direccion
                        });
                    }
                } catch (errC) {
                    console.warn('No se pudo actualizar datos del cliente:', errC);
                }
            }

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
                monto_igv: 0,
                incluye_igv: false,
                monto_saldo: calculos.monto_saldo,
                cancelado: calculos.cancelado,
                entregado: false,
                comprobante_pago: ''
            };

            let pedidoId = editingId;
            if (editingId) {
                await pedidosDB.update(editingId, pedidoData);
                await pedidosDB.deleteDetalles(editingId);
                await pedidosDB.createDetalles(editingId, listaProductos);
                toast.success('Pedido actualizado');
            } else {
                const pedido = await pedidosDB.create(pedidoData);
                pedidoId = pedido.id_pedido;
                await pedidosDB.createDetalles(pedidoId, listaProductos);
                if (pedidoData.monto_a_cuenta > 0) {
                    await pedidosDB.createPago({
                        id_pedido: pedidoId,
                        monto: pedidoData.monto_a_cuenta,
                        fecha_pago: getLocalDate(),
                        metodo_pago: formData.forma_pago,
                        referencia: ''
                    });
                }
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);
            }

            // ── Sincronización con Reporte de Ventas ──
            if (calculos.cancelado) {
                const resultadoVenta = await asegurarVentaPedido(
                    {
                        ...pedidoData,
                        id_pedido: pedidoId,
                        nombre_cliente: formData.nombre_cliente,
                        detalles_pedido: listaProductos
                    },
                    { metodo: formData.forma_pago }
                );
                if (resultadoVenta.ventaError) {
                    toast.error('Pedido guardado, pero no se pudo registrar la venta: ' + resultadoVenta.ventaError);
                } else if (resultadoVenta.ventaRegistrada && editingId) {
                    toast.success('Venta registrada/actualizada');
                }
            }

            await fetchPedidos();
            resetForm();
        } catch (error) { toast.error(`Error: ${error.message}`); }
        finally { setLoading(false); }
    };

    const handlePrint = (pedido) => {
        setPrintPedido(pedido);
        setUltimoPagoRealizado(null);
        setShowPrintModal(true);
    };
    const closePrintModal = () => {
        setShowPrintModal(false);
        setPrintPedido(null);
        setUltimoPagoRealizado(null);
    };

    const handleOpenPayModal = (pedido) => {
        setPayPedido(pedido);
        setShowPayModal(true);
    };
    const handleClosePayModal = () => {
        setShowPayModal(false);
        setPayPedido(null);
    };

    const handlePagoSuccess = (resultado) => {
        fetchPedidos();
        if (resultado && resultado.pedido) {
            setUltimoPagoRealizado(resultado.pago);
            setPrintPedido(resultado.pedido);
            setShowPrintModal(true);
        }
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
        return true;
    });

    // ========================================
    // CIERRE HISTÓRICO / EN LOTE
    // ========================================
    const toggleSeleccion = (id) => {
        setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSeleccionarTodos = () => {
        const visibles = filteredPedidos.map(p => p.id_pedido);
        const todosSeleccionados = visibles.length > 0 && visibles.every(id => seleccionados.includes(id));
        setSeleccionados(todosSeleccionados ? [] : visibles);
    };

    const abrirCerrar = (lista) => {
        if (!lista || lista.length === 0) { toast.error('Selecciona al menos un pedido.'); return; }
        setPedidosACerrar(lista);
        setShowCerrarModal(true);
    };

    const handleCerrarSeleccionados = () => {
        const lista = pedidos.filter(p => seleccionados.includes(p.id_pedido));
        abrirCerrar(lista);
    };

    const handleCerrarFila = (pedido) => abrirCerrar([pedido]);

    const handleCerrarSuccess = () => {
        fetchPedidos();
        setSeleccionados([]);
    };

    const salirModoHistorico = () => {
        setModoHistorico(false);
        setSeleccionados([]);
    };

    return (
        <div className={`container mx-auto p-3 md:p-6 bg-gray-50 min-h-screen font-sans ${modoHistorico && activeTab === 'pendientes' ? 'pb-44' : 'pb-20'}`}>

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
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">Cliente *</label>
                            {/* BOTON "+ NUEVO CLIENTE" SUTIL */}
                            <button
                                type="button"
                                onClick={() => abrirModalNuevoCliente(nombreBusqueda)}
                                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                                title="Crear nuevo cliente rápido"
                            >
                                <FaPlus size={9} /> Nuevo
                            </button>
                        </div>
                        <div className="relative" ref={searchRef}>
                            <input
                                type="text"
                                name="nombre_cliente"
                                value={formData.nombre_cliente}
                                onChange={(e) => handleSearchCliente(e.target.value)}
                                autoComplete="off"
                                className="w-full h-11 sm:h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium text-gray-900 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                                placeholder="Buscar o ingresar nombre..."
                            />
                            {showSugerencias && (clientesSugeridos.length > 0 || nombreBusqueda.trim().length > 1) && (
                                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                                    {clientesSugeridos.map(c => (
                                        <button key={c.id} type="button" onClick={() => handleSelectCliente(c)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-800">{c.nombre}</span>
                                            <span className="text-xs text-gray-400">{c.telefono}</span>
                                        </button>
                                    ))}
                                    {nombreBusqueda.trim().length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => abrirModalNuevoCliente(nombreBusqueda)}
                                            className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 text-blue-700 font-semibold text-sm border-t border-blue-100"
                                        >
                                            <FaPlus size={10} />
                                            <span>Crear "{nombreBusqueda}"</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Teléfono como dato de referencia del cliente seleccionado */}
                        {formData.nombre_cliente && formData.telefono && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 w-fit">
                                <FaPhone size={11} className="text-gray-400" />
                                <span className="font-medium">{formData.telefono}</span>
                                {formData.dni_ruc && (
                                    <span className="text-gray-400 border-l border-gray-200 pl-2">DNI: {formData.dni_ruc}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* ========================================
                        SECCIÓN PRODUCTOS (RESPONSIVE)
                    ======================================== */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px]">Añadir Producto</label>
                        <div className="bg-gray-50 rounded-2xl p-3 ring-1 ring-gray-200 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <select name="metal" value={productoActual.metal} onChange={handleProductoChange} className="w-full h-11 bg-white rounded-lg px-3 text-xs font-medium border-none ring-1 ring-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500">
                                    <option value="">Metal...</option>
                                    {metalesList.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select name="tipo_producto" value={productoActual.tipo_producto} onChange={handleProductoChange} className="w-full h-11 bg-white rounded-lg px-3 text-xs font-medium border-none ring-1 ring-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500">
                                    <option value="">Tipo...</option>
                                    {tiposDisponibles.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <textarea
                                name="nombre_producto"
                                value={productoActual.nombre_producto}
                                onChange={handleProductoChange}
                                rows={2}
                                placeholder="Descripción (Ej. Anillo talla 7 con piedra ónix y acabado mate)"
                                className="w-full min-h-[64px] bg-white rounded-lg px-3 py-2.5 text-xs font-medium border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none leading-relaxed"
                            />
                            <div className="flex gap-2">
                                <input type="number" inputMode="decimal" min="1" name="cantidad" value={productoActual.cantidad} onChange={handleProductoChange} placeholder="Cant." className="w-20 sm:w-24 h-11 bg-white rounded-lg px-3 text-center text-sm font-medium border-none ring-1 ring-gray-200 text-gray-900 shrink-0" />
                                <div className="relative flex-1 min-w-0">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                                    <input type="number" inputMode="decimal" step="0.01" name="precio_unitario" value={productoActual.precio_unitario} onChange={handleProductoChange} placeholder="Precio" className="w-full h-11 bg-white rounded-lg pl-8 pr-3 text-sm font-bold text-gray-800 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <button type="button" onClick={agregarProducto} className="h-11 w-11 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform shadow-sm shrink-0">
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
                                        <div className="flex items-center gap-3 shrink-0">
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
                        SECCIÓN ENVÍO (2 OPCIONES)
                    ======================================== */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px] flex items-center gap-1">
                            <FaTruck className="text-gray-400" /> Delivery / Envío
                        </label>

                        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, requiere_envio: false }))}
                                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all text-center ${!formData.requiere_envio ? 'bg-white text-gray-800 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200/60'}`}
                            >
                                Sin envío
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, requiere_envio: true }))}
                                className={`py-2.5 px-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${formData.requiere_envio ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200/60'}`}
                            >
                                <FaTruck size={11} /> Con envío
                            </button>
                        </div>

                        {formData.requiere_envio && (
                            <div className="bg-blue-50/30 rounded-2xl p-3 border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">

                                <button type="button" onClick={() => setShowAddressDrawer(true)} className="w-full bg-white flex items-center justify-between p-3 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors text-left shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-500 shrink-0"><FaMapMarkerAlt size={14} /></div>
                                        <div className="truncate min-w-0">
                                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Dirección de Entrega</p>
                                            <p className="text-xs font-semibold text-gray-800 truncate">{formData.direccion_entrega || 'Tocar para agregar dirección y DNI...'}</p>
                                            {formData.dni_ruc && (
                                                <p className="text-[10px] text-gray-500 truncate">DNI/RUC: {formData.dni_ruc}</p>
                                            )}
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-gray-300 shrink-0 ml-2" size={12} />
                                </button>

                                <div className="grid grid-cols-2 gap-2 bg-gray-100/70 p-1 rounded-xl border border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, tipo_envio: 'cobro' }))}
                                        className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${formData.tipo_envio === 'cobro' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
                                    >
                                        Lo cobro yo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, tipo_envio: 'destino' }))}
                                        className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${formData.tipo_envio === 'destino' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
                                    >
                                        Paga en destino
                                    </button>
                                </div>

                                {formData.tipo_envio === 'cobro' && (
                                    <div className="relative animate-in zoom-in-95 duration-200 shadow-sm">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                                        <input
                                            type="number" inputMode="decimal" step="0.01" name="costo_envio"
                                            value={formData.costo_envio} onChange={handleChange}
                                            placeholder="Monto de envío a cobrar"
                                            className="w-full h-11 bg-white rounded-xl pl-8 pr-4 text-sm font-bold text-gray-800 border border-blue-100 focus:ring-2 focus:ring-blue-500"
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
                        <div className="border-b border-gray-100 pb-3">
                            <label className="text-sm font-bold text-blue-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <FaMoneyBillWave className="text-blue-500" /> Resumen y Pago
                            </label>
                        </div>

                        {/* Desglose */}
                        <div className="space-y-2 text-xs text-gray-600 font-medium px-1">
                            <div className="flex justify-between">
                                <span>Subtotal Joyas</span>
                                <span className="font-semibold text-gray-800">S/ {calculos.precio_total_sin_igv.toFixed(2)}</span>
                            </div>

                            {formData.requiere_envio && formData.tipo_envio === 'cobro' && parseFloat(formData.costo_envio) > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>Envío (cobrado)</span>
                                    <span className="font-semibold">+ S/ {parseFloat(formData.costo_envio).toFixed(2)}</span>
                                </div>
                            )}
                            {formData.requiere_envio && formData.tipo_envio === 'destino' && (
                                <div className="flex justify-between text-amber-600 italic text-[10px]">
                                    <span>Envío (pago en destino)</span>
                                    <span>S/ 0.00</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-3 border-t border-dashed border-gray-200 mt-2">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Total Pedido</span>
                                <span className="text-xl font-black text-blue-700">S/ {calculos.precio_total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Fila de Método de pago y Adelanto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Método de pago</label>
                                <select
                                    name="forma_pago"
                                    value={formData.forma_pago}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-bold text-gray-800 border-none focus:ring-0 p-0 cursor-pointer"
                                >
                                    {METODOS_PAGO.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adelanto S/</label>
                                    {editingId && (
                                        <span className="text-[9px] text-amber-600 font-semibold">Solo lectura</span>
                                    )}
                                </div>
                                <div className="relative flex items-center">
                                    <span className="text-gray-400 text-sm font-bold mr-1">S/</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        name="monto_a_cuenta"
                                        value={formData.monto_a_cuenta}
                                        onChange={handleChange}
                                        readOnly={!!editingId}
                                        className={`w-full bg-transparent text-right text-lg font-black border-none focus:ring-0 p-0 ${editingId ? 'text-gray-500 cursor-not-allowed' : 'text-green-600 placeholder:text-gray-300'}`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {editingId && (
                            <p className="text-[11px] text-gray-500 italic px-1">
                                ℹ️ Para registrar pagos adicionales o abonos al saldo pendiente, usa el botón de pago en la lista de pedidos.
                            </p>
                        )}

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
                        <div className="p-3 rounded-lg flex flex-wrap gap-3 justify-between items-center text-sm border border-gray-200">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-700 font-semibold uppercase tracking-wide">PEDIDOS PENDIENTES</span>
                                <span className="font-bold text-2xl text-gray-900">{filteredPedidos.length}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => (modoHistorico ? salirModoHistorico() : setModoHistorico(true))}
                                className={`h-9 px-3 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-2 ${modoHistorico
                                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {modoHistorico ? 'Salir del modo histórico' : 'Modo histórico'}
                            </button>
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
                                        {modoHistorico && (
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredPedidos.length > 0 && filteredPedidos.every(p => seleccionados.includes(p.id_pedido))}
                                                    onChange={toggleSeleccionarTodos}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    title="Seleccionar todos"
                                                />
                                            </th>
                                        )}
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
                                    <td colSpan={modoHistorico && activeTab === 'pendientes' ? 9 : 8} className="px-6 py-4 text-center text-gray-500 font-medium italic">No hay pedidos activos en esta categoría.</td>
                                </tr>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <tr key={pedido.id_pedido} className="hover:bg-gray-50/50 transition-colors group">
                                        {activeTab === 'terminados' ? (
                                            <>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatLocalDate(pedido.fecha_pedido)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <span>{pedido.nombre_cliente}</span>
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
                                                        <Tooltip text="Cerrar pedido (histórico)">
                                                            <button onClick={() => handleCerrarFila(pedido)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                                                                <FaCheckCircle className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        {!pedido.cancelado && Number(pedido.monto_saldo) > TOLERANCIA_SALDO && (
                                                            <Tooltip text="Cobrar saldo">
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
                                                    <span>{pedido.nombre_cliente}</span>
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
                                                        <Tooltip text="Cerrar pedido (histórico)">
                                                            <button onClick={() => handleCerrarFila(pedido)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                                                                <FaCheckCircle className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        {!pedido.cancelado && Number(pedido.monto_saldo) > TOLERANCIA_SALDO && (
                                                            <Tooltip text="Cobrar saldo">
                                                                <button onClick={() => handleOpenPayModal(pedido)} className="text-green-600 hover:text-green-800 transition-colors">
                                                                    <FaMoneyBillWave className="h-6 w-6" />
                                                                </button>
                                                            </Tooltip>
                                                        )}
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
                                                {modoHistorico && (
                                                    <td className="px-3 py-4 whitespace-nowrap text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={seleccionados.includes(pedido.id_pedido)}
                                                            onChange={() => toggleSeleccion(pedido.id_pedido)}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{formatLocalDate(pedido.fecha_pedido)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <span>{pedido.nombre_cliente}</span>
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
                                                        <Tooltip text="Cerrar pedido (histórico)">
                                                            <button onClick={() => handleCerrarFila(pedido)} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                                                                <FaCheckCircle className="h-6 w-6" />
                                                            </button>
                                                        </Tooltip>
                                                        {!pedido.cancelado && Number(pedido.monto_saldo) > TOLERANCIA_SALDO && (
                                                            <Tooltip text="Cobrar saldo">
                                                                <button onClick={() => handleOpenPayModal(pedido)} className="text-green-600 hover:text-green-800 transition-colors">
                                                                    <FaMoneyBillWave className="h-6 w-6" />
                                                                </button>
                                                            </Tooltip>
                                                        )}
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

            {/* BARRA FIJA DE CIERRE EN LOTE */}
            {modoHistorico && activeTab === 'pendientes' && (
                <div className="fixed bottom-0 left-0 right-0 z-[120] bg-gray-900 text-white shadow-2xl border-t border-gray-700">
                    <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={filteredPedidos.length > 0 && filteredPedidos.every(p => seleccionados.includes(p.id_pedido))}
                                onChange={toggleSeleccionarTodos}
                                className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gray-300">
                                {seleccionados.length} seleccionado{seleccionados.length === 1 ? '' : 's'}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-400 flex-1 min-w-[200px]">
                            Elige los pedidos ya cobrados/entregados y define su fecha real de cierre.
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={salirModoHistorico}
                                className="h-10 px-4 rounded-lg bg-gray-800 text-gray-200 text-xs font-bold hover:bg-gray-700 transition-colors"
                            >
                                Salir
                            </button>
                            <button
                                type="button"
                                onClick={handleCerrarSeleccionados}
                                disabled={seleccionados.length === 0}
                                className="h-10 px-5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Cerrar seleccionados
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DRAWER PARA DIRECCIÓN DE ENVÍO Y DNI */}
            {showAddressDrawer && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /> Detalle de Entrega</h3>

                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">DNI / RUC (para envío)</label>
                                <input
                                    type="text"
                                    name="dni_ruc"
                                    value={formData.dni_ruc || ''}
                                    onChange={handleChange}
                                    placeholder="Número de documento..."
                                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Dirección de Entrega</label>
                                <textarea
                                    name="direccion_entrega"
                                    value={formData.direccion_entrega}
                                    onChange={handleChange}
                                    placeholder="Ej: Av. Larco 123, Miraflores. Ref: Frente al parque. Recibe: Juan."
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowAddressDrawer(false)} className="flex-1 h-12 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Cerrar</button>
                            <button type="button" onClick={() => setShowAddressDrawer(false)} className="flex-[2] h-12 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-blue-700 transition-colors">Guardar Datos</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Nota de Pedido (Adelanto / Cancelación) */}
            <NotaPedido
                isOpen={showPrintModal}
                pedido={printPedido}
                ultimoPago={ultimoPagoRealizado}
                onClose={closePrintModal}
            />

            {/* Modal de Cobro de Saldo / Abono */}
            <PagoModal
                isOpen={showPayModal}
                pedido={payPedido}
                onClose={handleClosePayModal}
                onSuccess={handlePagoSuccess}
            />

            {/* Popup Pedido Cancelado */}
            {showCancelAlert && calculos.cancelado && (
                <div className="fixed top-20 right-4 z-50 animate-bounce">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl cursor-pointer flex items-center bg-opacity-90 hover:bg-opacity-100 transition-all font-bold text-lg" onClick={() => setShowCancelAlert(false)}>
                        <span>✓ PEDIDO CANCELADO</span>
                        <span className="ml-3 text-sm font-normal underline">(Click para cerrar)</span>
                    </div>
                </div>
            )}

            {/* Cierre histórico: vista previa y ejecución */}
            <CerrarPedidoModal
                isOpen={showCerrarModal}
                pedidos={pedidosACerrar}
                fechaInicial={getLocalDate()}
                metodoInicial="Efectivo"
                onClose={() => {
                    setShowCerrarModal(false);
                    setPedidosACerrar([]);
                }}
                onSuccess={handleCerrarSuccess}
            />

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

            {/* MODAL RÁPIDO: NUEVO CLIENTE */}
            {showModalNuevoCliente && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-800">Nuevo Cliente</h3>
                            <button type="button" onClick={cerrarModalNuevoCliente} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    value={nuevoClienteForm.nombre}
                                    onChange={e => setNuevoClienteForm(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium text-gray-900 ring-1 ring-gray-200 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nombre completo"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Teléfono *</label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={nuevoClienteForm.telefono}
                                    onChange={e => setNuevoClienteForm(prev => ({ ...prev, telefono: e.target.value }))}
                                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-sm font-medium text-gray-900 ring-1 ring-gray-200 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Número de celular"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={cerrarModalNuevoCliente}
                                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleGuardarNuevoCliente}
                                disabled={savingCliente}
                                className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {savingCliente ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
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