import React, { useState } from 'react';
import { FaTimes, FaSave, FaCamera } from 'react-icons/fa';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import { comprasItemsDB } from '../utils/comprasItemsClient';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

/**
 * Modal simplificado para registrar producto en inventario desde compra
 */
export default function ModalInventariar({ isOpen, onClose, item, onInventariado }) {
    const [tiposProducto, setTiposProducto] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo_usuario: '',
        tipo_producto_id: '',
        stock_inicial: '',
        stock_minimo: '',
        costo: '',
        precio: '',
        precio_oferta: '',
        descripcion: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Cargar tipos de producto y prellenar datos al abrir
    React.useEffect(() => {
        if (isOpen && item) {
            loadTiposProducto();
            setFormData({
                nombre: item.nombre_item || '',
                codigo_usuario: '',
                tipo_producto_id: '',
                stock_inicial: item.cantidad || '',
                stock_minimo: '',
                costo: item.costo_unitario || '',
                precio: '',
                precio_oferta: '',
                descripcion: `Comprado de ${item.proveedor_nombre || 'proveedor'} el ${new Date(item.fecha_compra).toLocaleDateString('es-PE')}`
            });
        }
    }, [isOpen, item]);

    const loadTiposProducto = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setTiposProducto(data);
        } catch (error) {
            console.error('Error cargando tipos de producto:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Auto-convertir código a mayúsculas
        if (name === 'codigo_usuario') {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        setUploading(true);
        try {
            const timestamp = Date.now();
            const filename = `productos/${timestamp}_${imageFile.name}`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, imageFile);
            const url = await getDownloadURL(storageRef);

            return url;
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            toast.error('Error al subir imagen');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }
        if (!formData.codigo_usuario.trim()) {
            toast.error('El código es obligatorio');
            return;
        }
        if (!formData.tipo_producto_id) {
            toast.error('Debe seleccionar un tipo de producto');
            return;
        }
        if (!formData.stock_inicial || parseFloat(formData.stock_inicial) <= 0) {
            toast.error('El stock inicial debe ser mayor a 0');
            return;
        }
        if (!formData.costo || parseFloat(formData.costo) <= 0) {
            toast.error('El costo debe ser mayor a 0');
            return;
        }
        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            toast.error('El precio debe ser mayor a 0');
            return;
        }

        setSaving(true);
        try {
            // 1. Subir imagen si existe
            let imagenUrl = null;
            if (imageFile) {
                imagenUrl = await uploadImage();
                if (!imagenUrl) {
                    setSaving(false);
                    return;
                }
            }

            // 2. Crear producto en inventario
            const nuevoProducto = await productosExternosDB.create({
                codigo_usuario: formData.codigo_usuario.trim(),
                nombre: formData.nombre.trim(),
                categoria: formData.tipo_producto_id, // Guardar el ID del tipo
                descripcion: formData.descripcion.trim() || '',
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseFloat(formData.stock_inicial),
                stock_minimo: formData.stock_minimo ? parseFloat(formData.stock_minimo) : 5,
                unidad: 'UND',
                imagen_url: imagenUrl,
                precio_adicional: formData.precio_oferta ? parseFloat(formData.precio_oferta) : null,
                origen: 'COMPRA'
            });

            // 3. Marcar item como inventariado
            await comprasItemsDB.marcarInventariado(item.id, nuevoProducto.id);

            toast.success('Producto registrado en inventario exitosamente');

            // Notificar al componente padre
            if (onInventariado) {
                onInventariado();
            }

            // Limpiar y cerrar
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error registrando producto:', error);
            toast.error('Error al registrar producto en inventario');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            codigo_usuario: '',
            tipo_producto_id: '',
            stock_inicial: '',
            stock_minimo: '',
            costo: '',
            precio: '',
            precio_oferta: '',
            descripcion: ''
        });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Agregar Producto
                    </h3>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={saving}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Código */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                            Código *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="codigo_usuario"
                                value={formData.codigo_usuario}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                title="Generar código QR"
                            >
                                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                                    <div className="bg-gray-400 rounded-sm"></div>
                                    <div className="bg-gray-400 rounded-sm"></div>
                                    <div className="bg-gray-400 rounded-sm"></div>
                                    <div className="bg-gray-400 rounded-sm"></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Tipo de Producto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                            Categoría
                        </label>
                        <select
                            name="tipo_producto_id"
                            value={formData.tipo_producto_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {tiposProducto.map(tipo => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Imagen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                            Foto
                        </label>
                        <div className="flex justify-center">
                            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <>
                                        <FaCamera className="text-gray-400 text-2xl mb-2" />
                                        <span className="text-xs text-gray-500">Foto</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Stock Inicial y Mínimo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                Stock Inicial *
                            </label>
                            <input
                                type="number"
                                name="stock_inicial"
                                value={formData.stock_inicial}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                Stock Mínimo
                            </label>
                            <input
                                type="number"
                                name="stock_minimo"
                                value={formData.stock_minimo}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>

                    {/* Costo y Precio */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                Costo (S/) *
                            </label>
                            <input
                                type="number"
                                name="costo"
                                value={formData.costo}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                                Precio (S/) *
                            </label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    {/* Precio Oferta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                            Precio Oferta (S/)
                        </label>
                        <input
                            type="number"
                            name="precio_oferta"
                            value={formData.precio_oferta}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                            placeholder="Opcional"
                        />
                    </div>

                    {/* Información Adicional */}
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-1 text-center">
                            Información Adicional
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notas, características, etc."
                        />
                    </div>

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving || uploading}
                    >
                        <FaSave />
                        {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : 'Agregar Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
