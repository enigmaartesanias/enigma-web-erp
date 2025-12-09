
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus, FaWhatsapp, FaPrint, FaSearch, FaMoneyBillWave, FaShareAlt, FaImage, FaPhone } from 'react-icons/fa';
import html2canvas from 'html2canvas';


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

    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        dni_ruc: '',
        direccion_entrega: '',
        forma_pago: 'Efectivo',
        comprobante_pago: '',
        requiere_envio: false,
        modalidad_envio: 'Fijo',
        envio_cobrado_al_cliente: 0,
        monto_a_cuenta: 0,
        incluye_igv: false,
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
            const { data, error } = await supabase
                .from('pedidos')
                .select(`
                    *,
                    detalles_pedido (*),
                    pagos (*)
                `)
                .order('fecha_pedido', { ascending: false });

            if (error) throw error;
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
        const cancelado = monto_saldo <= 0.001;

        setCalculos({
            precio_total_sin_igv: parseFloat(precio_total_sin_igv.toFixed(2)),
            monto_igv: parseFloat(monto_igv.toFixed(2)),
            precio_total: parseFloat(precio_total.toFixed(2)),
            monto_saldo: parseFloat(monto_saldo.toFixed(2)),
            cancelado
        });

    }, [formData, listaProductos]);

    // Efecto para sincronizar monto a cuenta con total si se selecciona "Pago Total"
    useEffect(() => {
        if (tipoPagoInicial === 'total') {
            setFormData(prev => {
                if (prev.monto_a_cuenta !== calculos.precio_total) {
                    return { ...prev, monto_a_cuenta: calculos.precio_total };
                }
                return prev;
            });
        }
    }, [calculos.precio_total, tipoPagoInicial]);

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

        setListaProductos(prev => [...prev, {
            ...productoActual,
            cantidad: parseFloat(productoActual.cantidad),
            precio_unitario: parseFloat(productoActual.precio_unitario)
        }]);

        setProductoActual({
            nombre_producto: '',
            cantidad: '',
            precio_unitario: ''
        });
    };

    const eliminarProductoLista = (index) => {
        setListaProductos(prev => prev.filter((_, i) => i !== index));
    };



    const handleEdit = (pedido) => {
        setEditingId(pedido.id_pedido);

        setFormData({
            nombre_cliente: pedido.nombre_cliente,
            telefono: pedido.telefono || '',
            dni_ruc: pedido.dni_ruc || '',
            direccion_entrega: pedido.direccion_entrega || '',
            forma_pago: pedido.forma_pago || 'Efectivo',
            comprobante_pago: pedido.comprobante_pago || '',
            requiere_envio: pedido.requiere_envio,
            modalidad_envio: pedido.modalidad_envio || 'Fijo',
            envio_cobrado_al_cliente: pedido.envio_cobrado_al_cliente || 0,
            envio_referencia: pedido.envio_referencia || 0,
            monto_a_cuenta: pedido.monto_a_cuenta || 0,
            entregado: pedido.entregado,
            incluye_igv: pedido.incluye_igv,
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
            // 1. Eliminar Detalles de Pedido (Foreign Key)
            const { error: errorDetalles } = await supabase
                .from('detalles_pedido')
                .delete()
                .eq('id_pedido', id);

            if (errorDetalles) throw errorDetalles;

            // 2. Eliminar Pagos (Foreign Key)
            const { error: errorPagos } = await supabase
                .from('pagos')
                .delete()
                .eq('id_pedido', id);

            if (errorPagos) throw errorPagos;

            // 3. Eliminar Pedido Principal
            const { error } = await supabase
                .from('pedidos')
                .delete()
                .eq('id_pedido', id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Pedido eliminado correctamente.' });
            fetchPedidos();
        } catch (error) {
            console.error('Error al eliminar:', error);
            setMessage({ type: 'error', text: 'Error al eliminar: ' + error.message });
        }
    };

    const resetForm = () => {
        setFormData({
            nombre_cliente: '',
            telefono: '',
            dni_ruc: '',
            direccion_entrega: '',
            forma_pago: 'Efectivo',
            comprobante_pago: '',
            requiere_envio: false,
            modalidad_envio: 'Fijo',
            envio_cobrado_al_cliente: 0,
            envio_referencia: 0,
            monto_a_cuenta: 0,
            entregado: false,
            incluye_igv: false,
        });
        setProductoActual({
            nombre_producto: '',
            cantidad: '',
            precio_unitario: ''
        });
        setListaProductos([]);
        setListaProductos([]);
        setEditingId(null);
        setTipoPagoInicial('adelanto');
        setFechaPago(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (listaProductos.length === 0) {
            alert("Debe agregar al menos un producto al pedido.");
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
                forma_pago: formData.forma_pago,
                comprobante_pago: formData.comprobante_pago,
                requiere_envio: formData.requiere_envio,
                modalidad_envio: formData.modalidad_envio,
                envio_cobrado_al_cliente: parseFloat(formData.envio_cobrado_al_cliente),
                envio_referencia: parseFloat(formData.envio_referencia),
                precio_total_sin_igv: calculos.precio_total_sin_igv,
                precio_total: calculos.precio_total,
                monto_a_cuenta: parseFloat(formData.monto_a_cuenta),
                entregado: false,
                incluye_igv: formData.incluye_igv,
                monto_igv: calculos.monto_igv,
                monto_saldo: calculos.monto_saldo,
                cancelado: calculos.cancelado
            };

            let pedidoId = editingId;

            if (editingId) {
                // Actualizar Pedido
                const { error: errorPedido } = await supabase
                    .from('pedidos')
                    .update(pedidoData)
                    .eq('id_pedido', editingId);

                if (errorPedido) throw errorPedido;

                // Reemplazar detalles: Primero eliminar todos los existentes
                const { error: errorDelete } = await supabase
                    .from('detalles_pedido')
                    .delete()
                    .eq('id_pedido', editingId);

                if (errorDelete) throw errorDelete;

                // Insertar los nuevos detalles de la lista
                const detallesParaInsertar = listaProductos.map(p => ({
                    id_pedido: editingId,
                    nombre_producto: p.nombre_producto,
                    cantidad: parseInt(p.cantidad),
                    precio_unitario: parseFloat(p.precio_unitario)
                }));

                const { error: errorInsert } = await supabase
                    .from('detalles_pedido')
                    .insert(detallesParaInsertar);

                if (errorInsert) throw errorInsert;

                setMessage({ type: 'success', text: 'Pedido actualizado correctamente.' });

            } else {
                // Crear Nuevo Pedido
                const { data: pedido, error: errorPedido } = await supabase
                    .from('pedidos')
                    .insert([pedidoData])
                    .select()
                    .single();

                if (errorPedido) throw errorPedido;
                pedidoId = pedido.id_pedido;

                const detallesParaInsertar = listaProductos.map(p => ({
                    id_pedido: pedidoId,
                    nombre_producto: p.nombre_producto,
                    cantidad: parseInt(p.cantidad),
                    precio_unitario: parseFloat(p.precio_unitario)
                }));

                const { error: errorDetalle } = await supabase
                    .from('detalles_pedido')
                    .insert(detallesParaInsertar);

                if (errorDetalle) throw errorDetalle;

                // Registrar pago inicial si hay monto a cuenta
                if (pedidoData.monto_a_cuenta > 0) {
                    const { error: errorPago } = await supabase
                        .from('pagos')
                        .insert([{
                            id_pedido: pedidoId,
                            monto: pedidoData.monto_a_cuenta,
                            fecha_pago: new Date().toISOString().split('T')[0],
                            metodo_pago: formData.forma_pago,
                            referencia: formData.comprobante_pago
                        }]);
                    if (errorPago) console.error('Error creando pago inicial', errorPago);
                }

                setMessage({ type: 'success', text: 'Pedido registrado correctamente.' });
            }

            resetForm();
            fetchPedidos();

        } catch (error) {
            console.error('Error al guardar pedido:', error);
            setMessage({ type: 'error', text: 'Error al guardar el pedido: ' + error.message });
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
            // Recalculate saldo based on total price
            const nuevoSaldo = payPedido.precio_total - nuevoAcuenta;
            const cancelado = nuevoSaldo <= 0.05; // Tolerance

            // Update in DB (Update Pedido + Insert Pago)
            const { error: errorUpdate } = await supabase
                .from('pedidos')
                .update({
                    monto_a_cuenta: nuevoAcuenta,
                    monto_saldo: nuevoSaldo < 0 ? 0 : nuevoSaldo,
                    cancelado: cancelado
                })
                .eq('id_pedido', payPedido.id_pedido);

            if (errorUpdate) throw errorUpdate;

            // Insert new payment record
            const { error: errorPago } = await supabase
                .from('pagos')
                .insert([{
                    id_pedido: payPedido.id_pedido,
                    monto: montoPago,
                    fecha_pago: payData.fecha,
                    metodo_pago: payData.metodo,
                    referencia: ''
                }]);

            if (errorPago) console.error('Error insertando pago', errorPago);

            setMessage({ type: 'success', text: 'Pago registrado correctamente.' });
            handleClosePayModal();
            fetchPedidos(); // Refresh Grid

        } catch (error) {
            console.error('Error al registrar pago:', error);
            alert('Error al registrar pago: ' + error.message);
        }
    };

    // Filter Logic
    const filteredPedidos = pedidos.filter(p => {
        // Status Filter
        let matchesStatus = true;
        if (filterStatus === 'cancelado') matchesStatus = p.cancelado;
        if (filterStatus === 'pendiente') matchesStatus = !p.cancelado;

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

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-light text-gray-800 mb-8 text-center">Registro de Pedidos</h1>
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

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sección Cliente */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600">Datos del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Cliente *</label>
                                <input
                                    type="text"
                                    name="nombre_cliente"
                                    value={formData.nombre_cliente}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    required
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
                                    required
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
                        </div>
                    </div>

                    {/* Sección Producto (Agregar Múltiples) */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600">Detalles del Producto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-start border p-4 rounded">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Producto *</label>
                                <textarea
                                    name="nombre_producto"
                                    value={productoActual.nombre_producto}
                                    onChange={handleProductoChange}
                                    rows="4"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={agregarProducto}
                                    className="mt-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                                    title="Agregar Producto"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        {/* Lista de productos agregados */}
                        {listaProductos.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">P. Unit</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {listaProductos.map((prod, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{prod.nombre_producto}</td>
                                                <td className="px-4 py-2 text-center text-sm text-gray-900">{prod.cantidad}</td>
                                                <td className="px-4 py-2 text-right text-sm text-gray-900">S/ {parseFloat(prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right text-sm text-gray-900 font-medium">S/ {(prod.cantidad * prod.precio_unitario).toFixed(2)}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarProductoLista(index)}
                                                        className="text-red-500 hover:text-red-700"
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
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600">Envío</h3>
                        <div className="space-y-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded bg-gray-50">
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
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección Pago */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-blue-600">Pago y Totales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago Inicial</label>
                                <div className="flex space-x-4 mb-2">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-600"
                                            name="tipoPagoInicial"
                                            value="adelanto"
                                            checked={tipoPagoInicial === 'adelanto'}
                                            onChange={() => setTipoPagoInicial('adelanto')}
                                        />
                                        <span className="ml-2">Adelanto / A Cuenta</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-green-600"
                                            name="tipoPagoInicial"
                                            value="total"
                                            checked={tipoPagoInicial === 'total'}
                                            onChange={() => setTipoPagoInicial('total')}
                                        />
                                        <span className="ml-2 font-semibold text-green-700">Pago Total (Cancelar)</span>
                                    </label>
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        name="monto_a_cuenta"
                                        value={formData.monto_a_cuenta}
                                        onChange={handleChange}
                                        step="0.01"
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 ${tipoPagoInicial === 'total' ? 'bg-gray-100 text-gray-500' : ''}`}
                                        required
                                        readOnly={tipoPagoInicial === 'total'}
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
                            <div className="text-center mt-3">
                                <span className={`px-4 py-2 rounded text-sm font-bold ${calculos.cancelado ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                    {calculos.cancelado ? '✓ CANCELADO' : 'PENDIENTE DE PAGO'}
                                </span>
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
            </div>

            {/* Listado de Pedidos */}
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto">
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
                                onClick={() => setFilterStatus('cancelado')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'cancelado' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cancelados
                            </button>
                            <button
                                onClick={() => setFilterStatus('pendiente')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === 'pendiente' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Pendientes
                            </button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar cliente o telÃ©fono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg flex space-x-6 text-sm justify-end">
                        {(filterStatus === 'todos' || filterStatus === 'cancelado') && (
                            <div>
                                <span className="text-gray-500 block">Total Cancelado (Sin EnvÃ­o)</span>
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
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A Cuenta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPedidos.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No hay pedidos registrados en esta categorÃ­a.</td>
                                </tr>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <tr key={pedido.id_pedido} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(pedido.fecha_pedido).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {pedido.nombre_cliente}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 min-w-[250px]">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            S/ {pedido.precio_total?.toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${pedido.monto_a_cuenta > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div>S/ {pedido.monto_a_cuenta.toFixed(2)}</div>
                                            {pedido.pagos && pedido.pagos.length > 0 && pedido.monto_a_cuenta > 0 && (
                                                <div className="text-xs text-gray-400 font-normal">
                                                    ({new Date(pedido.pagos.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))[0].fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: 'numeric', year: '2-digit' })})
                                                </div>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${pedido.cancelado ? 'text-green-600' : 'text-red-600'}`}>
                                            <div>S/ {pedido.monto_saldo.toFixed(2)}</div>
                                            {pedido.cancelado && pedido.pagos && pedido.pagos.length > 0 && (
                                                <div className="text-xs text-green-800 font-normal">
                                                    {new Date(pedido.pagos.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))[0].fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: 'numeric', year: '2-digit' })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pedido.cancelado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {pedido.cancelado ? 'Cancelado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex justify-center space-x-3">
                                                {!pedido.cancelado && (
                                                    <button onClick={() => handleOpenPayModal(pedido)} className="text-green-600 hover:text-green-900" title="Registrar Pago / Adelanto">
                                                        <FaMoneyBillWave className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button onClick={() => handlePrint(pedido)} className="text-gray-600 hover:text-gray-900" title="Imprimir / Ver Detalle">
                                                    <FaPrint className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleEdit(pedido)} className="text-blue-600 hover:text-blue-900" title="Editar">
                                                    <FaEdit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleDelete(pedido.id_pedido)} className="text-red-600 hover:text-red-900" title="Eliminar">
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

            {/* Modal de ImpresiÃ³n / Vista Previa */}
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
        </div >
    );
};

export default Pedidos;
