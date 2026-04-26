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

    // <-- AHORA CARGAMOS LA LISTA UNIFICADA -->
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
        } catch (error) { toast.error('Error al cargar proveedores'); }
    };

    const loadTiposMateriales = async () => {
        try {
            // <-- USAMOS getMetales QUE TRAE PRECIOS Y NOMBRES -->
            const data = await materialesDB.getMetales();
            setTiposMateriales(data);
        } catch (error) { toast.error('Error al cargar tipos de materiales'); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === 'cantidad' || field === 'costo_unitario') {
            const cantidad = parseFloat(newItems[index].cantidad) || 0;
            const costo = parseFloat(newItems[index].costo_unitario) || 0;
            newItems[index].subtotal = cantidad * costo;
        }
        setItems(newItems);
    };

    const handleNuevoMaterialChange = (materialNombre) => {
        const tipo = tiposMateriales.find(t => t.nombre === materialNombre);
        if (tipo) {
            // UX MEJORADA: Al seleccionar, autocompleta la unidad y el precio base actual
            setNuevoItem({
                ...nuevoItem,
                nombre_material: materialNombre,
                unidad: tipo.unidad,
                costo_unitario: tipo.precio_gramo > 0 ? tipo.precio_gramo : '' // Te sugiere el precio
            });
        } else {
            setNuevoItem({ ...nuevoItem, nombre_material: materialNombre });
        }
    };

    const handleNuevoItemChange = (field, value) => {
        setNuevoItem({ ...nuevoItem, [field]: value });
    };

    const agregarItem = () => {
        if (!nuevoItem.nombre_material || !nuevoItem.cantidad || !nuevoItem.costo_unitario) {
            toast.error('Complete todos los campos del material');
            return;
        }
        const cantidad = parseFloat(nuevoItem.cantidad) || 0;
        const costo = parseFloat(nuevoItem.costo_unitario) || 0;
        setItems([...items, { ...nuevoItem, subtotal: cantidad * costo }]);
        setNuevoItem({ nombre_material: '', cantidad: '', unidad: 'Gramos', costo_unitario: '' });
    };

    const eliminarItem = (index) => {
        if (items.length === 1) { toast.error('Debe haber al menos un item'); return; }
        setItems(items.filter((_, i) => i !== index));
    };

    const calcularTotal = () => items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fecha) { toast.error('La fecha es obligatoria'); return; }

        const itemsValidos = items.filter(item => item.nombre_material.trim() && item.cantidad && item.costo_unitario);
        if (itemsValidos.length === 0) { toast.error('Debe agregar al menos un material'); return; }

        try {
            setSaving(true);
            const codigo = generarCodigoMaterial();
            const compra = await materialesDB.create({
                codigo_compra: codigo,
                fecha_compra: formData.fecha,
                proveedor_id: formData.proveedor_id || null,
                total: calcularTotal(),
                observaciones: formData.observaciones
            });

            await materialesItemsDB.createBatch(compra.id, itemsValidos);
            toast.success('Compra registrada y catálogo actualizado');
            setFormData({ fecha: getLocalDate(), proveedor_id: '', observaciones: '' });
            setItems([]);
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/inventario-home')} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition">
                        <FaArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-800">Registro Compra Materiales</h1>
                        <p className="text-xs text-gray-500">Ingreso de materias primas con actualización de precios</p>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Información General</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                                <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                                <select name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm">
                                    <option value="">Seleccionar...</option>
                                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Materiales/Insumos Comprados</h2>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Material *</label>
                                    <select value={nuevoItem.nombre_material} onChange={(e) => handleNuevoMaterialChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white font-bold text-gray-800">
                                        <option value="">Seleccionar...</option>
                                        {tiposMateriales.map(tipo => <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Cantidad *</label>
                                    <input type="number" step="0.01" value={nuevoItem.cantidad} onChange={(e) => handleNuevoItemChange('cantidad', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Unidad</label>
                                    <input type="text" value={nuevoItem.unidad} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center bg-gray-100 text-gray-500" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs text-gray-600 mb-1 font-medium">Costo Unitario *</label>
                                    <input type="number" step="0.0001" value={nuevoItem.costo_unitario} onChange={(e) => handleNuevoItemChange('costo_unitario', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="md:col-span-1">
                                    <button type="button" onClick={agregarItem} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                                        <FaPlus size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TABLA Y CARDS MÓVIL INTACTOS (OMITIDO PARA BREVEDAD, ES IGUAL AL QUE ME DISTE) */}
                        <div className="space-y-4">
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
                                        {items.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Agregue materiales</td></tr> : items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-bold text-gray-800">{item.nombre_material}</td>
                                                <td className="px-4 py-3 text-center">{item.cantidad}</td>
                                                <td className="px-4 py-3 text-center text-xs">{item.unidad}</td>
                                                <td className="px-4 py-3 text-right">S/ {parseFloat(item.costo_unitario).toFixed(4)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-blue-700">S/ {item.subtotal.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center"><button type="button" onClick={() => eliminarItem(index)} className="text-red-400 hover:text-red-500"><FaTrash size={14} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr><td colSpan="4" className="px-3 py-2 text-right font-bold text-gray-600">Total Factura:</td><td className="px-3 py-2 text-right font-black text-gray-900 text-sm">S/ {calcularTotal().toFixed(2)}</td><td></td></tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm" />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate('/inventario-home')} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-[2] py-3 bg-gray-900 text-white rounded-lg hover:bg-black font-bold disabled:opacity-50">
                            {saving ? 'Procesando...' : 'Guardar Factura/Compra'}
                        </button>
                    </div>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}