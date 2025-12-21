import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comprasDB, generarCodigoCompra } from '../../../utils/comprasClient';
import { comprasItemsDB } from '../../../utils/comprasItemsClient';
import { proveedoresDB } from '../../../utils/proveedoresNeonClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaBox, FaTools } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { compressAndResizeImage } from '../../../utils/imageOptimizer';

export default function RegistroCompras() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [showNewProveedorForm, setShowNewProveedorForm] = useState(false);

    // Estado del formulario principal
    const [formData, setFormData] = useState({
        fecha_compra: new Date().toISOString().split('T')[0],
        tipo_item: 'MATERIAL',
        proveedor_id: '',
        observaciones: ''
    });

    // Estado para nuevo proveedor
    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombre: '',
        contacto: '',
        telefono: ''
    });

    // Estado para items de la compra
    const [items, setItems] = useState([]);
    const [currentItem, setCurrentItem] = useState({
        nombre_item: '',
        cantidad: '',
        costo_unitario: ''
    });

    // Estado para datos de inventario (solo si tipo_item === 'NUEVO_MATERIAL')
    const [datosInventario, setDatosInventario] = useState({
        nombre_producto: '',
        categoria: '',
        codigo_usuario: '',
        precio_venta: '',
        stock_minimo: 1,
        imagen: null
    });

    // Cargar proveedores al montar
    useEffect(() => {
        loadProveedores();
    }, []);

    const loadProveedores = async () => {
        try {
            const data = await proveedoresDB.getAll();
            setProveedores(data);
        } catch (error) {
            console.error('Error cargando proveedores:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value
        });
    };

    const handleInventarioChange = (e) => {
        const { name, value } = e.target;
        // Convertir código a mayúsculas automáticamente
        const finalValue = name === 'codigo_usuario' ? value.toUpperCase() : value;
        setDatosInventario({
            ...datosInventario,
            [name]: finalValue
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDatosInventario({
                ...datosInventario,
                imagen: file
            });
        }
    };

    const handleAgregarItem = () => {
        if (!currentItem.nombre_item.trim()) {
            toast.error('El nombre del item es obligatorio');
            return;
        }
        if (!currentItem.cantidad || currentItem.cantidad <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }
        if (!currentItem.costo_unitario || currentItem.costo_unitario <= 0) {
            toast.error('El costo unitario debe ser mayor a 0');
            return;
        }

        const cantidad = parseFloat(currentItem.cantidad);
        const costoUnitario = parseFloat(currentItem.costo_unitario);
        const subtotal = cantidad * costoUnitario;

        const nuevoItem = {
            id: uuidv4(), // ID temporal para el frontend
            nombre_item: currentItem.nombre_item,
            cantidad: cantidad,
            costo_unitario: costoUnitario,
            subtotal: subtotal
        };

        setItems([...items, nuevoItem]);
        setCurrentItem({
            nombre_item: '',
            cantidad: '',
            costo_unitario: ''
        });
        toast.success('Item agregado');
    };

    const handleEliminarItem = (id) => {
        setItems(items.filter(item => item.id !== id));
        toast.success('Item eliminado');
    };

    const handleCrearProveedor = async () => {
        if (!nuevoProveedor.nombre.trim()) {
            toast.error('El nombre del proveedor es obligatorio');
            return;
        }

        try {
            const proveedor = await proveedoresDB.create(nuevoProveedor);
            setProveedores([...proveedores, proveedor]);
            setFormData({ ...formData, proveedor_id: proveedor.id });
            setNuevoProveedor({ nombre: '', contacto: '', telefono: '' });
            setShowNewProveedorForm(false);
            toast.success('Proveedor creado');
        } catch (error) {
            console.error('Error creando proveedor:', error);
            toast.error('Error al crear proveedor');
        }
    };

    const generarCodigoAuto = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        return `PROD-${random}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.proveedor_id) {
            toast.error('Selecciona un proveedor');
            return;
        }

        if (items.length === 0) {
            toast.error('Agrega al menos un item');
            return;
        }

        // Validaciones para NUEVO_MATERIAL
        if (formData.tipo_item === 'NUEVO_MATERIAL') {
            if (!datosInventario.nombre_producto.trim()) {
                toast.error('El nombre del producto es obligatorio');
                return;
            }
            if (!datosInventario.categoria) {
                toast.error('La categoría es obligatoria');
                return;
            }
        }

        setLoading(true);

        try {
            // 1. Crear producto en inventario si es NUEVO_MATERIAL
            let productoId = null;
            if (formData.tipo_item === 'NUEVO_MATERIAL') {
                let imagenUrl = null;
                if (datosInventario.imagen) {
                    const optimizedFile = await compressAndResizeImage(datosInventario.imagen, {
                        maxSizeMB: 1,
                        maxWidth: 1200,
                        maxHeight: 1200,
                        quality: 0.95
                    });

                    const fileName = `productos_comprados/${uuidv4()}_${optimizedFile.name}`;
                    const storageRef = ref(storage, fileName);
                    await uploadBytes(storageRef, optimizedFile);
                    imagenUrl = await getDownloadURL(storageRef);
                }

                const producto = await productosExternosDB.create({
                    nombre: datosInventario.nombre_producto,
                    codigo_usuario: datosInventario.codigo_usuario || generarCodigoAuto(),
                    categoria: datosInventario.categoria,
                    precio: parseFloat(datosInventario.precio_venta) || 0,
                    costo: items[0]?.costo_unitario || 0,
                    stock_actual: items[0]?.cantidad || 0,
                    stock_minimo: parseInt(datosInventario.stock_minimo) || 1,
                    unidad: 'und',
                    imagen_url: imagenUrl,
                    descripcion: items[0]?.nombre_item || ''
                });
                productoId = producto.id;
            }

            // 2. Crear compra (cabecera)
            const codigo = generarCodigoCompra();
            const compra = await comprasDB.create({
                codigo_compra: codigo,
                fecha_compra: formData.fecha_compra + 'T00:00:00',
                tipo_compra: formData.tipo_item === 'MATERIAL' ? 'MATERIAL' : 'PRODUCTO',
                tipo_item: formData.tipo_item,
                proveedor_id: formData.proveedor_id,
                observaciones: formData.observaciones.trim() || null
            });

            // 3. Crear items de la compra
            const itemsParaGuardar = items.map(item => ({
                nombre_item: item.nombre_item,
                cantidad: item.cantidad,
                costo_unitario: item.costo_unitario,
                subtotal: item.subtotal,
                producto_externo_id: productoId
            }));

            await comprasItemsDB.createBatch(compra.id, itemsParaGuardar);

            toast.success('Compra registrada correctamente', { duration: 4000 });
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al registrar la compra');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            fecha_compra: new Date().toISOString().split('T')[0],
            tipo_item: 'MATERIAL',
            proveedor_id: '',
            observaciones: ''
        });
        setItems([]);
        setCurrentItem({
            nombre_item: '',
            cantidad: '',
            costo_unitario: ''
        });
        setDatosInventario({
            nombre_producto: '',
            categoria: '',
            codigo_usuario: '',
            precio_venta: '',
            stock_minimo: 1,
            imagen: null
        });
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const totalGeneral = items.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="flex items-center text-gray-600 hover:text-slate-700 transition-colors text-sm mb-3"
                    >
                        <FaArrowLeft className="mr-2" size={14} />
                        Volver al Panel
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Registro de Compras
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Registra compras en 3 pasos: Información → Items → Guardar</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* PASO 1: Información General */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">1. Información General</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_compra"
                                    value={formData.fecha_compra}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                    required
                                />
                            </div>

                            {/* Tipo de Item */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Compra *
                                </label>
                                <select
                                    name="tipo_item"
                                    value={formData.tipo_item}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                    required
                                >
                                    <option value="MATERIAL">Material/Insumo</option>
                                    <option value="PRODUCTO_TERMINADO">Producto Terminado</option>
                                    <option value="NUEVO_MATERIAL">Crear Nuevo Material</option>
                                </select>
                            </div>

                            {/* Proveedor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proveedor *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        name="proveedor_id"
                                        value={formData.proveedor_id}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {proveedores.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewProveedorForm(!showNewProveedorForm)}
                                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm"
                                        title="Nuevo proveedor"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Formulario para nuevo proveedor */}
                        {showNewProveedorForm && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Nuevo Proveedor</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nombre *"
                                        value={nuevoProveedor.nombre}
                                        onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Contacto"
                                        value={nuevoProveedor.contacto}
                                        onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, contacto: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Teléfono"
                                        value={nuevoProveedor.telefono}
                                        onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCrearProveedor}
                                    className="mt-3 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition text-sm"
                                >
                                    Crear Proveedor
                                </button>
                            </div>
                        )}
                    </div>

                    {/* PASO 2: Agregar Items */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Items de la Compra</h2>

                        {/* Formulario para agregar item */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                            <input
                                type="text"
                                name="nombre_item"
                                placeholder="Nombre/Descripción *"
                                value={currentItem.nombre_item}
                                onChange={handleItemChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            <input
                                type="number"
                                name="cantidad"
                                placeholder="Cantidad *"
                                value={currentItem.cantidad}
                                onChange={handleItemChange}
                                step="0.01"
                                min="0.01"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            <input
                                type="number"
                                name="costo_unitario"
                                placeholder="Costo Unitario *"
                                value={currentItem.costo_unitario}
                                onChange={handleItemChange}
                                step="0.01"
                                min="0.01"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAgregarItem}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition text-sm flex items-center justify-center gap-2"
                            >
                                <FaPlus /> Agregar
                            </button>
                        </div>

                        {/* Tabla de items */}
                        {items.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Item</th>
                                            <th className="px-4 py-2 text-right">Cantidad</th>
                                            <th className="px-4 py-2 text-right">Costo Unit.</th>
                                            <th className="px-4 py-2 text-right">Subtotal</th>
                                            <th className="px-4 py-2 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {items.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2">{item.nombre_item}</td>
                                                <td className="px-4 py-2 text-right">{item.cantidad}</td>
                                                <td className="px-4 py-2 text-right">S/ {item.costo_unitario.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right font-semibold">S/ {item.subtotal.toFixed(2)}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarItem(item.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right font-semibold">Total:</td>
                                            <td className="px-4 py-3 text-right font-bold text-lg">S/ {totalGeneral.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {items.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No hay items agregados</p>
                        )}
                    </div>

                    {/* DATOS PARA INVENTARIO (solo si tipo_item === 'NUEVO_MATERIAL') */}
                    {formData.tipo_item === 'NUEVO_MATERIAL' && (
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaBox className="text-blue-600" />
                                Datos para Inventario
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Este bloque aparece solo al crear un nuevo material/producto</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre Comercial */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Comercial *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_producto"
                                        value={datosInventario.nombre_producto}
                                        onChange={handleInventarioChange}
                                        placeholder="Ej: Collar Elegance Oro 18K"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                    />
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categoría *
                                    </label>
                                    <select
                                        name="categoria"
                                        value={datosInventario.categoria}
                                        onChange={handleInventarioChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Materiales">Materiales</option>
                                        <option value="Collares">Collares</option>
                                        <option value="Anillos">Anillos</option>
                                        <option value="Aretes">Aretes</option>
                                        <option value="Pulseras">Pulseras</option>
                                        <option value="Pendientes">Pendientes</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>

                                {/* Código de Producto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código de Producto <span className="text-gray-400">(auto-generado)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo_usuario"
                                        value={datosInventario.codigo_usuario}
                                        onChange={handleInventarioChange}
                                        placeholder="Ej: PROD-001 (MAYÚSCULAS)"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm uppercase"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Se auto-genera si se deja vacío. Solo MAYÚSCULAS.</p>
                                </div>

                                {/* Precio de Venta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Precio de Venta <span className="text-gray-400">(solo productos terminados)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 text-sm">S/</span>
                                        <input
                                            type="number"
                                            name="precio_venta"
                                            value={datosInventario.precio_venta}
                                            onChange={handleInventarioChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Stock Mínimo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_minimo"
                                        value={datosInventario.stock_minimo}
                                        onChange={handleInventarioChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Configurable una vez. Opcional en compra.</p>
                                </div>

                                {/* Imagen del Producto */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Imagen del Producto <span className="text-gray-400">(opcional)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                                    />
                                    {datosInventario.imagen && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Archivo: {datosInventario.imagen.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Guardar */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">3. Finalizar</h2>

                        {/* Observaciones */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones <span className="text-gray-400">(opcional)</span>
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Notas adicionales sobre esta compra"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/inventario-home')}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className={`flex-1 px-4 py-2 rounded-lg text-white transition text-sm flex items-center justify-center gap-2 ${loading || items.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-slate-700 hover:bg-slate-800'
                                    }`}
                            >
                                <FaSave />
                                {loading ? 'Guardando...' : 'Guardar Compra'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Toaster */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: '14px', maxWidth: '300px', padding: '12px 16px' },
                    success: { iconTheme: { primary: '#10b981', secondary: 'white' }, style: { borderLeft: '4px solid #10b981' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: 'white' }, duration: 4000, style: { borderLeft: '4px solid #ef4444' } }
                }}
            />
        </div>
    );
}
