import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialesDB, materialesItemsDB, generarCodigoMaterial } from '../../../utils/materialesNeonClient';
import { proveedoresDB } from '../../../utils/proveedoresNeonClient';
import { tiposMaterialesDB } from '../../../utils/tiposMaterialesNeonClient';
import { getLocalDate } from '../../../utils/dateUtils';
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function RegistroMateriales() {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [tiposMateriales, setTiposMateriales] = useState([]);
    const [formData, setFormData] = useState({
        fecha: getLocalDate(),
        proveedor_id: '',
        observaciones: ''
    });
    const [items, setItems] = useState([]);
    const [nuevoItem, setNuevoItem] = useState({
        nombre_material: '',
        cantidad: '',
        unidad: 'Gramos',
        costo_unitario: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProveedores();
        loadTiposMateriales();
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

    const loadTiposMateriales = async () => {
        try {
            const data = await tiposMaterialesDB.getAll();
            setTiposMateriales(data);
        } catch (error) {
            console.error('Error cargando tipos de materiales:', error);
            toast.error('Error al cargar tipos de materiales');
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

    const handleMaterialChange = (index, materialNombre) => {
        const tipo = tiposMateriales.find(t => t.nombre === materialNombre);
        const newItems = [...items];
        newItems[index].nombre_material = materialNombre;
        if (tipo) {
            newItems[index].unidad = tipo.unidad;
        }
        setItems(newItems);
    };

    const agregarItem = () => {
        if (!nuevoItem.nombre_material || !nuevoItem.cantidad || !nuevoItem.costo_unitario) {
            toast.error('Complete todos los campos del material');
            return;
        }

        const cantidad = parseFloat(nuevoItem.cantidad) || 0;
        const costo = parseFloat(nuevoItem.costo_unitario) || 0;
        const subtotal = cantidad * costo;

        setItems([
            ...items,
            { ...nuevoItem, subtotal }
        ]);

        // Limpiar formulario
        setNuevoItem({
            nombre_material: '',
            cantidad: '',
            unidad: 'Gramos',
            costo_unitario: ''
        });
    };

    const handleNuevoItemChange = (field, value) => {
        setNuevoItem({ ...nuevoItem, [field]: value });
    };

    const handleNuevoMaterialChange = (materialNombre) => {
        const tipo = tiposMateriales.find(t => t.nombre === materialNombre);
        if (tipo) {
            setNuevoItem({ ...nuevoItem, nombre_material: materialNombre, unidad: tipo.unidad });
        } else {
            setNuevoItem({ ...nuevoItem, nombre_material: materialNombre });
        }
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

            console.log('📦 Datos a guardar:', {
                codigo_compra: codigo,
                fecha_compra: formData.fecha,
                proveedor_id: formData.proveedor_id || null,
                total: total,
                observaciones: formData.observaciones
            });

            const compra = await materialesDB.create({
                codigo_compra: codigo,
                fecha_compra: formData.fecha,
                proveedor_id: formData.proveedor_id || null,
                total: total,
                observaciones: formData.observaciones
            });

            console.log('✅ Compra creada:', compra);

            // Crear items
            await materialesItemsDB.createBatch(compra.id, itemsValidos);

            toast.success('Compra de materiales registrada exitosamente');

            // Resetear formulario
            setFormData({
                fecha: getLocalDate(),
                proveedor_id: '',
                observaciones: ''
            });
            setItems([]);

        } catch (error) {
            console.error('❌ Error guardando materiales:', error);
            const errorMsg = error?.message || String(error);
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const unidades = ['Gramos', 'Unidad', 'Mililitros'];

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
                        <h1 className="text-base font-bold text-gray-800">Registro Materiales e Insumos</h1>
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
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Materiales/Insumos</h2>

                        {/* Formulario Horizontal para Agregar */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Material *</label>
                                    <select
                                        value={nuevoItem.nombre_material}
                                        onChange={(e) => handleNuevoMaterialChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {tiposMateriales.map(tipo => (
                                            <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Cantidad *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={nuevoItem.cantidad}
                                        onChange={(e) => handleNuevoItemChange('cantidad', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-gray-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Unidad</label>
                                    <input
                                        type="text"
                                        value={nuevoItem.unidad}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center bg-white text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Costo Unitario *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={nuevoItem.costo_unitario}
                                        onChange={(e) => handleNuevoItemChange('costo_unitario', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-gray-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <button
                                        type="button"
                                        onClick={agregarItem}
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium flex items-center justify-center gap-1"
                                    >
                                        <FaPlus size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Vista Desktop (Tabla) */}
                            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium w-40">Material</th>
                                            <th className="px-3 py-2 text-center font-medium w-24">Cant.</th>
                                            <th className="px-3 py-2 text-center font-medium w-28">Unidad</th>
                                            <th className="px-3 py-2 text-right font-medium w-28">Costo U.</th>
                                            <th className="px-3 py-2 text-right font-medium w-28">Subtotal</th>
                                            <th className="px-3 py-2 text-center font-medium w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {items.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-400 text-sm">
                                                    Agregue materiales usando el formulario arriba
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-800">{item.nombre_material}</td>
                                                    <td className="px-4 py-3 text-center text-gray-700">{item.cantidad}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{item.unidad}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700">S/ {parseFloat(item.costo_unitario).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">S/ {item.subtotal.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarItem(index)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="4" className="px-3 py-2 text-right font-medium text-gray-600">
                                                Total:
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                                                S/ {calcularTotal().toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Vista Móvil (Cards) */}
                            <div className="md:hidden space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm relative">
                                        {/* Botón Eliminar Flotante */}
                                        <button
                                            type="button"
                                            onClick={() => eliminarItem(index)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500"
                                            disabled={items.length === 1}
                                        >
                                            <FaTrash size={14} />
                                        </button>

                                        <div className="space-y-3">
                                            {/* Fila 1: Material (Full Width) */}
                                            <div>
                                                <label className="block text-[10px] font-normal text-gray-500 mb-1">Material</label>
                                                <select
                                                    value={item.nombre_material}
                                                    onChange={(e) => handleMaterialChange(index, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 outline-none bg-white"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {tiposMateriales.map(tipo => (
                                                        <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Fila 2: Datos Numéricos */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-normal text-gray-500 mb-1">Cant.</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.cantidad}
                                                        onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-1 focus:ring-gray-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-normal text-gray-500 mb-1">Unidad</label>
                                                    <input
                                                        type="text"
                                                        value={item.unidad}
                                                        readOnly
                                                        className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center bg-gray-50 text-gray-600 cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-normal text-gray-500 mb-1">Costo U.</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.costo_unitario}
                                                        onChange={(e) => handleItemChange(index, 'costo_unitario', e.target.value)}
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-1 focus:ring-gray-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Fila 3: Subtotal */}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                                                <span className="text-xs font-medium text-gray-500">Subtotal Item:</span>
                                                <span className="text-sm font-medium text-gray-700">S/ {item.subtotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Total Móvil */}
                                <div className="bg-gray-900 text-white p-4 rounded-lg flex justify-between items-center shadow-lg">
                                    <span className="text-xs font-normal">Total Compra:</span>
                                    <span className="text-sm font-medium">S/ {calcularTotal().toFixed(2)}</span>
                                </div>
                            </div>
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
                            {saving ? 'Guardando...' : 'Guardar'}
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
