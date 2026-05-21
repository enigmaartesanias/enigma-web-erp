import React, { useState } from 'react';
import { FaTimes, FaSave, FaCamera } from 'react-icons/fa';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import { comprasItemsDB } from '../utils/comprasItemsClient';
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
        tipo_inventario: 'Único',
        origen: 'COMPRA',
        stock_inicial: '',
        stock_minimo: '',
        costo: '',
        precio: '',
        precio_oferta: '',
        descripcion: ''
    });
    const [saving, setSaving] = useState(false);

    // Cargar tipos de producto y prellenar datos al abrir
    React.useEffect(() => {
        if (isOpen && item) {
            loadTiposProducto();
            setFormData({
                nombre: item.nombre_item || '',
                codigo_usuario: '',
                tipo_producto_id: '',
                tipo_inventario: 'Único',
                origen: 'COMPRA',
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

        setFormData(prev => {
            const nextState = { ...prev, [name]: (name === 'codigo_usuario' ? value.toUpperCase() : value) };
            if (['tipo_inventario', 'origen', 'precio', 'tipo_producto_id'].includes(name)) {
                if (nextState.tipo_inventario === 'Grupal') {
                    const catObj = tiposProducto.find(t => String(t.id) === String(nextState.tipo_producto_id));
                    const catName = catObj ? catObj.nombre.substring(0,3).toUpperCase() : 'VAR';
                    const prefix = nextState.origen === 'COMPRA' ? 'COMP' : 'PROD';
                    const mat = 'GEN'; 
                    const precioStr = nextState.precio || '0';
                    nextState.codigo_usuario = `${prefix}-${catName}-${mat}-${precioStr}`;
                } else if (name === 'tipo_inventario') {
                    nextState.codigo_usuario = '';
                }
            }
            return nextState;
        });
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
            const dataToSave = {
                codigo_usuario: formData.codigo_usuario.trim(),
                nombre: formData.nombre.trim(),
                categoria: formData.tipo_producto_id, // Guardar el ID del tipo
                descripcion: formData.descripcion.trim() || '',
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseFloat(formData.stock_inicial),
                stock_minimo: formData.stock_minimo ? parseFloat(formData.stock_minimo) : 5,
                unidad: 'UND',
                imagen_url: null, // NUNCA foto en inventario
                precio_adicional: formData.precio_oferta ? parseFloat(formData.precio_oferta) : null,
                origen: formData.origen,
                tipo_inventario: formData.tipo_inventario
            };

            let nuevoProducto;
            if (formData.tipo_inventario === 'Grupal') {
                nuevoProducto = await productosExternosDB.upsertGrupal(dataToSave);
            } else {
                nuevoProducto = await productosExternosDB.create(dataToSave);
            }

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
            tipo_inventario: 'Único',
            origen: 'COMPRA',
            stock_inicial: '',
            stock_minimo: '',
            costo: '',
            precio: '',
            precio_oferta: '',
            descripcion: ''
        });
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

                    {/* Selectores Múltiples (Tipo de Registro, Origen) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Tipo de Registro</label>
                            <select
                                name="tipo_inventario"
                                value={formData.tipo_inventario}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Único">Único (Individual)</option>
                                <option value="Grupal">Grupal (Lote)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Origen</label>
                            <select
                                name="origen"
                                value={formData.origen}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="COMPRA">Compra</option>
                                <option value="PRODUCCION">Producción</option>
                            </select>
                        </div>
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
                                readOnly={formData.tipo_inventario === 'Grupal'}
                                className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.tipo_inventario === 'Grupal' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                required
                            />
                            {formData.tipo_inventario !== 'Grupal' && (
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
                            )}
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
                        disabled={saving}
                    >
                        <FaSave />
                        {saving ? 'Guardando...' : 'Agregar Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
