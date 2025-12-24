import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { comprasItemsDB } from '../utils/comprasItemsClient';
import toast from 'react-hot-toast';

export default function ModalEditarItem({ isOpen, onClose, item, onItemUpdated }) {
    const [formData, setFormData] = useState({
        nombre_item: '',
        cantidad: '',
        costo_unitario: '',
        subtotal: 0
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                nombre_item: item.nombre_item || '',
                cantidad: item.cantidad || '',
                costo_unitario: item.costo_unitario || '',
                subtotal: item.subtotal || 0
            });
        }
    }, [item]);

    // Calcular subtotal automáticamente
    useEffect(() => {
        const cantidad = parseFloat(formData.cantidad) || 0;
        const costo = parseFloat(formData.costo_unitario) || 0;
        setFormData(prev => ({
            ...prev,
            subtotal: (cantidad * costo).toFixed(2)
        }));
    }, [formData.cantidad, formData.costo_unitario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.nombre_item.trim()) {
            toast.error('El nombre del producto es obligatorio');
            return;
        }
        if (parseFloat(formData.cantidad) <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }
        if (parseFloat(formData.costo_unitario) <= 0) {
            toast.error('El precio debe ser mayor a 0');
            return;
        }

        setSaving(true);
        try {
            await comprasItemsDB.update(item.id, {
                nombre_item: formData.nombre_item.trim(),
                cantidad: parseFloat(formData.cantidad),
                costo_unitario: parseFloat(formData.costo_unitario),
                subtotal: parseFloat(formData.subtotal)
            });

            toast.success('Item actualizado exitosamente');
            onItemUpdated();
            onClose();
        } catch (error) {
            console.error('Error actualizando item:', error);
            toast.error('Error al actualizar el item');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        ✏️ Editar Item
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        disabled={saving}
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Nombre del producto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Producto *
                        </label>
                        <input
                            type="text"
                            name="nombre_item"
                            value={formData.nombre_item}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del producto"
                            disabled={saving}
                        />
                    </div>

                    {/* Cantidad y Precio en grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad *
                            </label>
                            <input
                                type="number"
                                name="cantidad"
                                value={formData.cantidad}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Unit. *
                            </label>
                            <input
                                type="number"
                                name="costo_unitario"
                                value={formData.costo_unitario}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Subtotal (solo lectura) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtotal
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 font-medium">
                            S/ {parseFloat(formData.subtotal || 0).toFixed(2)}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
