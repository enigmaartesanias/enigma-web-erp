import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialesDB, materialesItemsDB, generarCodigoMaterial } from '../../../utils/materialesNeonClient';
import { proveedoresDB } from '../../../utils/proveedoresNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function RegistroMateriales() {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [formData, setFormData] = useState({
        fecha: getLocalDate(),
        proveedor_id: '',
        observaciones: ''
    });
    const [items, setItems] = useState([
        { nombre_material: '', cantidad: '', unidad: 'Gramos', costo_unitario: '', subtotal: 0 }
    ]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProveedores();
    }, []);

    const loadProveedores = async () => {
        try {
            const data = await proveedoresDB.getAll();
            setProveedores(data.filter(p => p.activo));
        } catch (error) {
            console.error('Error cargando proveedores:', error);
            toast.error('Error al cargar proveedores');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Calcular subtotal
        if (field === 'cantidad' || field === 'costo_unitario') {
            const cantidad = parseFloat(newItems[index].cantidad) || 0;
            const costo = parseFloat(newItems[index].costo_unitario) || 0;
            newItems[index].subtotal = cantidad * costo;
        }

        setItems(newItems);
    };

    const agregarItem = () => {
        setItems([
            ...items,
            { nombre_material: '', cantidad: '', unidad: 'Gramos', costo_unitario: '', subtotal: 0 }
        ]);
    };

    const eliminarItem = (index) => {
        if (items.length === 1) {
            toast.error('Debe haber al menos un item');
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const calcularTotal = () => {
        return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.fecha) {
            toast.error('La fecha es obligatoria');
            return;
        }

        const itemsValidos = items.filter(item =>
            item.nombre_material.trim() &&
            item.cantidad &&
            item.costo_unitario
        );

        if (itemsValidos.length === 0) {
            toast.error('Debe agregar al menos un material');
            return;
        }

        try {
            setSaving(true);

            // Crear compra de materiales
            const codigo = generarCodigoMaterial();
            const total = calcularTotal();

            const compra = await materialesDB.create({
                codigo_compra: codigo,
                fecha_compra: formData.fecha,
                proveedor_id: formData.proveedor_id || null,
                total: total,
                observaciones: formData.observaciones
            });

            // Crear items
            await materialesItemsDB.createBatch(compra.id, itemsValidos);

            toast.success('Compra de materiales registrada exitosamente');

            // Resetear formulario
            setFormData({
                fecha: new Date().toISOString().split('T')[0],
                proveedor_id: '',
                observaciones: ''
            });
            setItems([
                { nombre_material: '', cantidad: '', unidad: 'Gramos', costo_unitario: '', subtotal: 0 }
            ]);

        } catch (error) {
            console.error('Error guardando materiales:', error);
            toast.error('Error al guardar la compra');
        } finally {
            setSaving(false);
        }
    };

    const unidades = ['Gramos', 'Kilogramos', 'Unidad', 'Metro', 'Litro', 'Mililitro'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-800">Registro de Materiales/Insumos</h1>
                        <p className="text-xs text-gray-500">Materias primas para producción</p>
                    </div>
                </div>
            </header>

            {/* Formulario */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    {/* Información General */}
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Información General</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha *
                                </label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proveedor
                                </label>
                                <select
                                    name="proveedor_id"
                                    value={formData.proveedor_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                                >
                                    <option value="">Seleccionar...</option>
                                    {proveedores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items de Materiales */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-semibold text-gray-700">Materiales/Insumos</h2>
                            <button
                                type="button"
                                onClick={agregarItem}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs flex items-center gap-1"
                            >
                                <FaPlus size={10} />
                                Agregar Material
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium">Material</th>
                                        <th className="px-3 py-2 text-center font-medium w-24">Cantidad</th>
                                        <th className="px-3 py-2 text-center font-medium w-32">Unidad</th>
                                        <th className="px-3 py-2 text-right font-medium w-28">Costo Unit.</th>
                                        <th className="px-3 py-2 text-right font-medium w-28">Subtotal</th>
                                        <th className="px-3 py-2 text-center font-medium w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.nombre_material}
                                                    onChange={(e) => handleItemChange(index, 'nombre_material', e.target.value)}
                                                    placeholder="Ej: Oro 18k, Plata 925..."
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 outline-none text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.cantidad}
                                                    onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 outline-none text-sm text-center"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={item.unidad}
                                                    onChange={(e) => handleItemChange(index, 'unidad', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 outline-none text-sm"
                                                >
                                                    {unidades.map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.costo_unitario}
                                                    onChange={(e) => handleItemChange(index, 'costo_unitario', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-500 outline-none text-sm text-right"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                                                ${item.subtotal.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarItem(index)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                                    disabled={items.length === 1}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="4" className="px-3 py-3 text-right font-semibold text-gray-700">
                                            Total:
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-gray-900 text-base">
                                            ${calcularTotal().toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observaciones
                        </label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Notas adicionales..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/inventario-home')}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                        >
                            <FaTimes className="inline mr-2" size={12} />
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium disabled:opacity-50"
                        >
                            <FaSave className="inline mr-2" size={12} />
                            {saving ? 'Guardando...' : 'Guardar Compra'}
                        </button>
                    </div>
                </form>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: '14px' }
                }}
            />
        </div>
    );
}
