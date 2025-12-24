import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { comprasDB, generarCodigoCompra } from '../../../utils/comprasClient';
import { comprasItemsDB } from '../../../utils/comprasItemsClient';
import { proveedoresDB } from '../../../utils/proveedoresNeonClient';
import ModalProveedorRapido from '../../../components/ModalProveedorRapido';
import toast, { Toaster } from 'react-hot-toast';

export default function RegistroCompras() {
    const navigate = useNavigate();

    // Estado del formulario
    const [proveedores, setProveedores] = useState([]);
    const [formData, setFormData] = useState({
        proveedor_id: '',
        observaciones: ''
    });

    // Estado de items
    const [items, setItems] = useState([
        { nombre_item: '', cantidad: '', costo_unitario: '', subtotal: 0 }
    ]);

    // Estado del modal
    const [showModalProveedor, setShowModalProveedor] = useState(false);
    const [saving, setSaving] = useState(false);

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
            toast.error('Error al cargar proveedores');
        }
    };

    // Manejar cambios en cabecera
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambios en items
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Calcular subtotal automáticamente
        if (field === 'cantidad' || field === 'costo_unitario') {
            const cantidad = parseFloat(newItems[index].cantidad) || 0;
            const costo = parseFloat(newItems[index].costo_unitario) || 0;
            newItems[index].subtotal = (cantidad * costo).toFixed(2);
        }

        setItems(newItems);
    };

    // Agregar nueva fila de item
    const agregarItem = () => {
        setItems([...items, { nombre_item: '', cantidad: '', costo_unitario: '', subtotal: 0 }]);
    };

    // Eliminar item
    const eliminarItem = (index) => {
        if (items.length === 1) {
            toast.error('Debe haber al menos un item');
            return;
        }
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    // Calcular total general
    const calcularTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    };

    // Manejar creación de proveedor
    const handleProveedorCreado = (nuevoProveedor) => {
        setProveedores(prev => [...prev, nuevoProveedor]);
        setFormData(prev => ({
            ...prev,
            proveedor_id: nuevoProveedor.id
        }));
    };

    // Validar formulario
    const validarFormulario = () => {
        if (!formData.proveedor_id) {
            toast.error('Debe seleccionar un proveedor');
            return false;
        }

        // Validar que haya al menos un item válido
        const itemsValidos = items.filter(item =>
            item.nombre_item.trim() &&
            parseFloat(item.cantidad) > 0 &&
            parseFloat(item.costo_unitario) > 0
        );

        if (itemsValidos.length === 0) {
            toast.error('Debe agregar al menos un item válido');
            return false;
        }

        return true;
    };

    // Guardar compra
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setSaving(true);
        try {
            // 1. Crear cabecera de compra
            const codigoCompra = generarCodigoCompra();
            const total = calcularTotal();

            const compra = await comprasDB.create({
                codigo_compra: codigoCompra,
                fecha_compra: new Date().toISOString(),
                proveedor_id: formData.proveedor_id,
                observaciones: formData.observaciones || null
            });

            // 2. Crear items de compra
            const itemsValidos = items.filter(item =>
                item.nombre_item.trim() &&
                parseFloat(item.cantidad) > 0 &&
                parseFloat(item.costo_unitario) > 0
            );

            const itemsParaGuardar = itemsValidos.map(item => ({
                nombre_item: item.nombre_item.trim(),
                cantidad: parseFloat(item.cantidad),
                costo_unitario: parseFloat(item.costo_unitario),
                subtotal: parseFloat(item.subtotal)
            }));

            await comprasItemsDB.createBatch(compra.id, itemsParaGuardar);

            toast.success(`Compra ${codigoCompra} registrada exitosamente`);

            // Limpiar formulario
            setFormData({ proveedor_id: '', observaciones: '' });
            setItems([{ nombre_item: '', cantidad: '', costo_unitario: '', subtotal: 0 }]);

        } catch (error) {
            console.error('Error guardando compra:', error);
            toast.error('Error al guardar la compra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Toaster position="top-right" />

            {/* Contenedor con altura fija y scroll */}
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: '90vh' }}>
                {/* Header fijo */}
                <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-10">
                    <button
                        onClick={() => navigate('/inventario')}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <h1 className="text-lg font-medium text-gray-900">
                        🛒 Registro de Compras
                    </h1>
                </div>

                {/* Contenido con scroll */}
                <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 60px)' }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Información de la Compra */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h2 className="text-sm font-medium text-gray-700 mb-2">Información de la Compra</h2>

                            {/* Proveedor */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Proveedor <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        name="proveedor_id"
                                        value={formData.proveedor_id}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar proveedor...</option>
                                        {proveedores.map(prov => (
                                            <option key={prov.id} value={prov.id}>
                                                {prov.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowModalProveedor(true)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        title="Crear proveedor rápido"
                                    >
                                        <FaPlus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Notas adicionales..."
                                />
                            </div>
                        </div>

                        {/* Items de la Compra */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium text-gray-700">Items de la Compra</h2>
                                <button
                                    type="button"
                                    onClick={agregarItem}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <FaPlus size={12} /> Agregar Item
                                </button>
                            </div>

                            {/* Items - Vista responsive */}
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                                        {/* Producto - Fila completa */}
                                        <div className="mb-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Producto
                                            </label>
                                            <input
                                                type="text"
                                                value={item.nombre_item}
                                                onChange={(e) => handleItemChange(index, 'nombre_item', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Nombre del producto"
                                            />
                                        </div>

                                        {/* Cantidad, Precio, Subtotal - Grid */}
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Cant.
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Precio
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.costo_unitario}
                                                    onChange={(e) => handleItemChange(index, 'costo_unitario', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Subtotal
                                                </label>
                                                <div className="px-2 py-1.5 text-sm text-center bg-gray-50 border border-gray-200 rounded font-medium text-gray-900">
                                                    S/ {parseFloat(item.subtotal || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón eliminar */}
                                        <button
                                            type="button"
                                            onClick={() => eliminarItem(index)}
                                            className="w-full px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <FaTrash size={12} /> Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total:</span>
                                <span className="text-xl font-bold text-blue-600">
                                    S/ {calcularTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Botones de acción fijos al fondo */}
                        <div className="sticky bottom-0 bg-white pt-4 pb-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/inventario')}
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <FaTimes size={14} /> Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSave size={14} />
                                {saving ? 'Guardando...' : 'Guardar Compra'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de Proveedor Rápido */}
            <ModalProveedorRapido
                isOpen={showModalProveedor}
                onClose={() => setShowModalProveedor(false)}
                onProveedorCreado={handleProveedorCreado}
            />
        </div>
    );
}
