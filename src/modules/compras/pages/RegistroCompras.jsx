import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comprasDB, generarCodigoCompra } from '../../../utils/comprasClient';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { storage } from '../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { FaArrowLeft, FaBox, FaTools, FaSave } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { compressAndResizeImage } from '../../../utils/imageUtils';

export default function RegistroCompras() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        fecha_compra: new Date().toISOString().split('T')[0],
        tipo_compra: 'MATERIAL',
        proveedor: '',
        descripcion: '',
        cantidad: '',
        costo_unitario: '',
        observaciones: '',
        // Campos específicos para productos
        nombre_producto: '',
        categoria: '',
        codigo_usuario: '',
        precio_venta: '',
        stock_minimo: 1,
        imagen: null
    });

    // Calcular total automáticamente
    const total = (parseFloat(formData.cantidad) || 0) * (parseFloat(formData.costo_unitario) || 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                imagen: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!formData.descripcion.trim()) {
            toast.error('La descripción es obligatoria');
            return;
        }

        if (!formData.cantidad || formData.cantidad <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        if (!formData.costo_unitario || formData.costo_unitario <= 0) {
            toast.error('El costo unitario debe ser mayor a 0');
            return;
        }

        // Validaciones específicas para productos
        if (formData.tipo_compra === 'PRODUCTO') {
            if (!formData.nombre_producto.trim()) {
                toast.error('El nombre del producto es obligatorio');
                return;
            }
            if (!formData.categoria) {
                toast.error('La categoría es obligatoria');
                return;
            }
            if (!formData.precio_venta || formData.precio_venta <= 0) {
                toast.error('El precio de venta es obligatorio');
                return;
            }
        }

        setLoading(true);

        try {
            if (formData.tipo_compra === 'MATERIAL') {
                await handleSubmitMaterial();
            } else {
                await handleSubmitProducto();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al registrar la compra');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitMaterial = async () => {
        const codigo = generarCodigoCompra();

        await comprasDB.create({
            codigo_compra: codigo,
            fecha_compra: formData.fecha_compra + 'T00:00:00',
            tipo_compra: 'MATERIAL',
            proveedor: formData.proveedor.trim() || null,
            descripcion: formData.descripcion,
            cantidad: parseFloat(formData.cantidad),
            costo_unitario: parseFloat(formData.costo_unitario),
            total: total,
            observaciones: formData.observaciones.trim() || null,
            producto_id: null
        });

        toast.success('Material registrado correctamente');
        resetForm();
    };

    const handleSubmitProducto = async () => {
        // 1. Subir imagen si existe
        let imagenUrl = null;
        if (formData.imagen) {
            const optimizedFile = await compressAndResizeImage(formData.imagen, {
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

        // 2. Crear producto en inventario
        const producto = await productosExternosDB.create({
            nombre: formData.nombre_producto,
            codigo_usuario: formData.codigo_usuario || generarCodigoAuto(),
            categoria: formData.categoria,
            precio: parseFloat(formData.precio_venta),
            costo: parseFloat(formData.costo_unitario),
            stock_actual: parseFloat(formData.cantidad),
            stock_minimo: parseInt(formData.stock_minimo) || 1,
            unidad: 'und',
            origen: 'COMPRA',
            imagen_url: imagenUrl,
            descripcion: formData.descripcion
        });

        // 3. Registrar la compra con link al producto
        const codigo = generarCodigoCompra();
        await comprasDB.create({
            codigo_compra: codigo,
            fecha_compra: formData.fecha_compra + 'T00:00:00',
            tipo_compra: 'PRODUCTO',
            proveedor: formData.proveedor.trim() || null,
            descripcion: formData.descripcion,
            cantidad: parseFloat(formData.cantidad),
            costo_unitario: parseFloat(formData.costo_unitario),
            total: total,
            observaciones: formData.observaciones.trim() || null,
            producto_id: producto.id
        });

        toast.success(`Producto "${formData.nombre_producto}" agregado al inventario`, { duration: 4000 });
        resetForm();
    };

    const generarCodigoAuto = () => {
        const random = Math.floor(1000 + Math.random() * 9000);
        return `PROD-${random}`;
    };

    const resetForm = () => {
        setFormData({
            fecha_compra: new Date().toISOString().split('T')[0],
            tipo_compra: 'MATERIAL',
            proveedor: '',
            descripcion: '',
            cantidad: '',
            costo_unitario: '',
            observaciones: '',
            nombre_producto: '',
            categoria: '',
            codigo_usuario: '',
            precio_venta: '',
            stock_minimo: 1,
            imagen: null
        });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="flex items-center text-gray-600 hover:text-slate-700 transition-colors text-sm mb-3"
                    >
                        <FaArrowLeft className="mr-2" size={14} />
                        Volver al Panel
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBox className="text-slate-700" />
                        Registro de Compras
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Materiales, insumos y productos para reventa</p>
                </div>
            </div>

            {/* Formulario */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Información General */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Información General</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    required
                                />
                            </div>

                            {/* Tipo de Compra */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Compra *
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tipo_compra"
                                            value="MATERIAL"
                                            checked={formData.tipo_compra === 'MATERIAL'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <FaTools className="mr-1 text-gray-600" />
                                        <span className="text-sm">Material/Insumo</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tipo_compra"
                                            value="PRODUCTO"
                                            checked={formData.tipo_compra === 'PRODUCTO'}
                                            onChange={handleChange}
                                            className="mr-2"
                                        />
                                        <FaBox className="mr-1 text-blue-600" />
                                        <span className="text-sm">Producto para Reventa</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Proveedor */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Proveedor <span className="text-gray-400">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                name="proveedor"
                                value={formData.proveedor}
                                onChange={handleChange}
                                placeholder="Nombre del proveedor"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Describe el artículo o material"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                required
                            />
                        </div>

                        {/* Cantidad y Costo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cantidad *
                                </label>
                                <input
                                    type="number"
                                    name="cantidad"
                                    value={formData.cantidad}
                                    onChange={handleChange}
                                    placeholder="0"
                                    step="0.01"
                                    min="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Costo Unitario *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">S/</span>
                                    <input
                                        type="number"
                                        name="costo_unitario"
                                        value={formData.costo_unitario}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0.01"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total
                                </label>
                                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-slate-700">
                                    S/ {total.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Notas adicionales (opcional)"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Campos adicionales para PRODUCTO */}
                    {formData.tipo_compra === 'PRODUCTO' && (
                        <div className="border-t pt-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaBox className="text-blue-600" />
                                Datos para Inventario
                            </h2>

                            {/* Nombre del Producto */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    name="nombre_producto"
                                    value={formData.nombre_producto}
                                    onChange={handleChange}
                                    placeholder="Nombre comercial del producto"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    required={formData.tipo_compra === 'PRODUCTO'}
                                />
                            </div>

                            {/* Categoría y Código */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Categoría *
                                    </label>
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                        required={formData.tipo_compra === 'PRODUCTO'}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Anillos">Anillos</option>
                                        <option value="Collares">Collares</option>
                                        <option value="Aretes">Aretes</option>
                                        <option value="Pulseras">Pulseras</option>
                                        <option value="Dijes">Dijes</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código <span className="text-gray-400">(opcional, se auto-genera)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo_usuario"
                                        value={formData.codigo_usuario}
                                        onChange={handleChange}
                                        placeholder="Ej: PROD-1234"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Precio de Venta y Stock Mínimo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Precio de Venta *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">S/</span>
                                        <input
                                            type="number"
                                            name="precio_venta"
                                            value={formData.precio_venta}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0.01"
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                            required={formData.tipo_compra === 'PRODUCTO'}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_minimo"
                                        value={formData.stock_minimo}
                                        onChange={handleChange}
                                        placeholder="1"
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Imagen del Producto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagen del Producto
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                                />
                                {formData.imagen && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Archivo seleccionado: {formData.imagen.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/inventario-home')}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-2 rounded-lg text-white transition flex items-center justify-center gap-2 ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-slate-700 hover:bg-slate-800'
                                }`}
                        >
                            <FaSave />
                            {loading ? 'Guardando...' : 'Registrar Compra'}
                        </button>
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
