import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proveedoresDB } from '../../../utils/proveedoresNeonClient';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// Gestión de Proveedores - CRUD completo
export default function Proveedores() {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: ''
    });

    useEffect(() => {
        loadProveedores();
    }, []);

    const loadProveedores = async () => {
        try {
            setLoading(true);
            const data = await proveedoresDB.getAll();
            setProveedores(data);
        } catch (error) {
            console.error('Error cargando proveedores:', error);
            toast.error('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        if (!formData.telefono.trim()) {
            toast.error('El teléfono es obligatorio');
            return;
        }

        try {
            if (editingId) {
                await proveedoresDB.update(editingId, formData);
                toast.success('Proveedor actualizado');
            } else {
                await proveedoresDB.create(formData);
                toast.success('Proveedor creado');
            }
            resetForm();
            loadProveedores();
        } catch (error) {
            console.error('Error guardando proveedor:', error);
            toast.error('Error al guardar proveedor');
        }
    };

    const handleEdit = (proveedor) => {
        setFormData({
            nombre: proveedor.nombre,
            telefono: proveedor.telefono || '',
            direccion: proveedor.direccion || ''
        });
        setEditingId(proveedor.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de desactivar este proveedor?')) {
            return;
        }

        try {
            await proveedoresDB.deactivate(id);
            toast.success('Proveedor desactivado');
            loadProveedores();
        } catch (error) {
            console.error('Error desactivando proveedor:', error);
            toast.error('Error al desactivar proveedor');
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            telefono: '',
            direccion: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-800">Gestión de Proveedores</h1>
                        <p className="text-xs text-gray-500">Administra tu catálogo de proveedores</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-1.5 text-sm font-medium"
                >
                    {showForm ? (
                        <>
                            <FaTimes size={12} />
                            Cancelar
                        </>
                    ) : (
                        <>
                            <FaPlus size={12} />
                            Nuevo
                        </>
                    )}
                </button>
            </header>

            {/* Contenido */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Formulario */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Nombre del proveedor"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                                        required
                                    />
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="999-888-777"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                                        required
                                    />
                                </div>

                                {/* Dirección */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dirección <span className="text-gray-400">(opcional)</span>
                                    </label>
                                    <textarea
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Dirección completa"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm flex items-center justify-center gap-2"
                                >
                                    <FaSave />
                                    {editingId ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de Proveedores */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                                    <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                                    <th className="px-4 py-3 text-left font-semibold">Dirección</th>
                                    <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : proveedores.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                            No hay proveedores registrados
                                        </td>
                                    </tr>
                                ) : (
                                    proveedores.map(proveedor => (
                                        <tr key={proveedor.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {proveedor.nombre}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {proveedor.telefono || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {proveedor.direccion || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(proveedor)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Editar"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(proveedor.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Desactivar"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resumen */}
                {!loading && proveedores.length > 0 && (
                    <div className="mt-4 text-sm text-gray-500 text-center">
                        Total: {proveedores.length} proveedor{proveedores.length !== 1 ? 'es' : ''}
                    </div>
                )}
            </div>

            {/* Toaster */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: { fontSize: '14px', maxWidth: '300px', padding: '12px 16px' },
                    success: { iconTheme: { primary: '#10b981', secondary: 'white' }, style: { borderLeft: '4px solid #10b981' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: 'white' }, duration: 4000, style: { borderLeft: '4px solid #ef4444' } }
                }}
            />
        </div>
    );
}
