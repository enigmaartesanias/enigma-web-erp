import React, { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { proveedoresDB } from '../utils/proveedoresNeonClient';
import toast from 'react-hot-toast';

/**
 * Modal simple para crear proveedores rápidamente desde el formulario de compras
 * Solo pide el nombre (obligatorio), teléfono y observación son opcionales
 */
export default function ModalProveedorRapido({ isOpen, onClose, onProveedorCreado }) {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: '' // Usamos direccion como "observación"
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar nombre obligatorio
        if (!formData.nombre.trim()) {
            toast.error('El nombre del proveedor es obligatorio');
            return;
        }

        setSaving(true);
        try {
            const nuevoProveedor = await proveedoresDB.create({
                nombre: formData.nombre.trim(),
                telefono: formData.telefono.trim() || null,
                direccion: formData.direccion.trim() || null
            });

            toast.success('Proveedor creado exitosamente');

            // Notificar al componente padre
            if (onProveedorCreado) {
                onProveedorCreado(nuevoProveedor);
            }

            // Limpiar y cerrar
            setFormData({ nombre: '', telefono: '', direccion: '' });
            onClose();
        } catch (error) {
            console.error('Error creando proveedor:', error);
            toast.error('Error al crear proveedor');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ nombre: '', telefono: '', direccion: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Nuevo Proveedor (Rápido)
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
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Nombre - Obligatorio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Proveedor <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Distribuidora ABC"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Teléfono - Opcional */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 999-888-777"
                        />
                    </div>

                    {/* Observación/Dirección - Opcional */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observación <span className="text-gray-400 text-xs">(opcional)</span>
                        </label>
                        <textarea
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            disabled={saving}
                        >
                            <FaSave />
                            {saving ? 'Guardando...' : 'Guardar y usar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
