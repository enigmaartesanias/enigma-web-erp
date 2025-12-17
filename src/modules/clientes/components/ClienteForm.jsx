import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ClienteForm = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        telefono: initialData?.telefono || ''
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.trim().length < 2) {
            newErrors.nombre = 'Mínimo 2 caracteres';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!/^\d{7,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
            newErrors.telefono = 'Formato inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSave({
                ...formData,
                id: initialData?.id
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="bg-gray-700 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-base font-semibold">
                        {initialData ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {/* Nombre */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-gray-400 outline-none ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Ej: Juan Pérez"
                        />
                        {errors.nombre && (
                            <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-gray-400 outline-none ${errors.telefono ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Ej: 999888777"
                        />
                        {errors.telefono && (
                            <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClienteForm;
