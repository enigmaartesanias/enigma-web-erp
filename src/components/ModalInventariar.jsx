import React, { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../utils/tiposProductoDB';
import { comprasItemsDB } from '../utils/comprasItemsClient';
import toast from 'react-hot-toast';

const METALES = ['Plata', 'Alpaca', 'Cobre', 'Bronce', 'Bisutería'];

/**
 * Modal simplificado para registrar producto en inventario desde compra
 * - Sin imagen_url (Regla de Oro)
 * - Selector de material para código grupal completo
 * - Código grupal: COMP-CAT-MAT-PRECIO / PROD-CAT-MAT-PRECIO
 */
export default function ModalInventariar({ isOpen, onClose, item, onInventariado }) {
    const [tiposProducto, setTiposProducto] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo_usuario: '',
        tipo_producto_id: '',
        material: '',
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

    React.useEffect(() => {
        if (isOpen && item) {
            loadTiposProducto();
            setFormData({
                nombre: item.nombre_item || '',
                codigo_usuario: '',
                tipo_producto_id: '',
                material: '',
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

    // Genera el código grupal con todos los campos disponibles
    const generarCodigoGrupal = (state, tipos) => {
        const catObj = tipos.find(t => String(t.id) === String(state.tipo_producto_id));
        const catName = catObj ? catObj.nombre.substring(0, 3).toUpperCase() : 'VAR';
        const mat = state.material ? state.material.substring(0, 3).toUpperCase() : 'GEN';
        const prefix = state.origen === 'COMPRA' ? 'COMP' : 'PROD';
        const precioStr = parseFloat(state.precio || 0);
        return `${prefix}-${catName}-${mat}-${precioStr}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const next = {
                ...prev,
                [name]: name === 'codigo_usuario' ? value.toUpperCase() : value
            };

            // Recalcular código grupal automáticamente cuando cambia cualquier campo relevante
            if (next.tipo_inventario === 'Grupal' &&
                ['tipo_inventario', 'origen', 'precio', 'tipo_producto_id', 'material'].includes(name)
            ) {
                next.codigo_usuario = generarCodigoGrupal(next, tiposProducto);
            }

            // Al cambiar a Único, limpiar código para que lo escriban manualmente
            if (name === 'tipo_inventario' && value === 'Único') {
                next.codigo_usuario = '';
            }

            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
        if (!formData.codigo_usuario.trim()) { toast.error('El código es obligatorio'); return; }
        if (!formData.tipo_producto_id) { toast.error('Selecciona una categoría'); return; }
        if (!formData.material) { toast.error('Selecciona el material'); return; }
        if (!formData.stock_inicial || parseFloat(formData.stock_inicial) <= 0) {
            toast.error('El stock inicial debe ser mayor a 0'); return;
        }
        if (!formData.costo || parseFloat(formData.costo) <= 0) {
            toast.error('El costo debe ser mayor a 0'); return;
        }
        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            toast.error('El precio debe ser mayor a 0'); return;
        }

        setSaving(true);
        try {
            const dataToSave = {
                codigo_usuario: formData.codigo_usuario.trim(),
                nombre: formData.nombre.trim(),
                categoria: formData.tipo_producto_id,
                material: formData.material,
                descripcion: formData.descripcion.trim() || '',
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseFloat(formData.stock_inicial),
                stock_minimo: formData.stock_minimo ? parseFloat(formData.stock_minimo) : 5,
                unidad: 'UND',
                imagen_url: null, // REGLA DE ORO: siempre null
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

            await comprasItemsDB.marcarInventariado(item.id, nuevoProducto.id);

            toast.success('Producto registrado en inventario exitosamente');
            if (onInventariado) onInventariado();
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
            nombre: '', codigo_usuario: '', tipo_producto_id: '', material: '',
            tipo_inventario: 'Único', origen: 'COMPRA', stock_inicial: '',
            stock_minimo: '', costo: '', precio: '', precio_oferta: '', descripcion: ''
        });
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Agregar Producto</h3>
                    <button onClick={() => { resetForm(); onClose(); }} disabled={saving} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    {/* Tipo de Registro y Origen */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Registro</label>
                            <select name="tipo_inventario" value={formData.tipo_inventario} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Único">Único (Individual)</option>
                                <option value="Grupal">Grupal (Lote)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                            <select name="origen" value={formData.origen} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="COMPRA">Compra</option>
                                <option value="PRODUCCION">Producción</option>
                            </select>
                        </div>
                    </div>

                    {/* Categoría y Material */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                            <select name="tipo_producto_id" value={formData.tipo_producto_id} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                <option value="">-- Seleccionar --</option>
                                {tiposProducto.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
                            <select name="material" value={formData.material} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                <option value="">-- Seleccionar --</option>
                                {METALES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Código */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código *
                            {formData.tipo_inventario === 'Grupal' && (
                                <span className="ml-2 text-xs text-gray-400 font-normal">(autogenerado)</span>
                            )}
                        </label>
                        <input type="text" name="codigo_usuario" value={formData.codigo_usuario} onChange={handleChange}
                            readOnly={formData.tipo_inventario === 'Grupal'}
                            placeholder={formData.tipo_inventario === 'Grupal' ? 'Se genera automáticamente' : 'Escribe el código'}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold ${formData.tipo_inventario === 'Grupal' ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                                }`} required />
                        {formData.tipo_inventario === 'Grupal' && formData.codigo_usuario && (
                            <p className="mt-1 text-[10px] text-gray-400">
                                Stock se sumará si este código ya existe en inventario.
                            </p>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
                            <input type="number" name="stock_inicial" value={formData.stock_inicial} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0" step="1" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                            <input type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0" step="1" />
                        </div>
                    </div>

                    {/* Costo y Precio */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Costo (S/) *</label>
                            <input type="number" name="costo" value={formData.costo} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0" step="0.01" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/) *</label>
                            <input type="number" name="precio" value={formData.precio} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0" step="0.01" required />
                        </div>
                    </div>

                    {/* Precio Oferta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Oferta (S/)</label>
                        <input type="number" name="precio_oferta" value={formData.precio_oferta} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0" step="0.01" placeholder="Opcional" />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-blue-600 mb-1">Información Adicional</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notas, características, etc." />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={saving}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FaSave />
                        {saving ? 'Guardando...' : 'Agregar Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
}
