import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import toast, { Toaster } from 'react-hot-toast';

export default function TiposProducto() {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingNombre, setEditingNombre] = useState('');

    useEffect(() => {
        loadTipos();
    }, []);

    const loadTipos = async () => {
        try {
            setLoading(true);
            const data = await tiposProductoDB.getAll();
            setTipos(data);
        } catch (error) {
            console.error('Error cargando tipos:', error);
            toast.error('Error al cargar tipos de producto');
        } finally {
            setLoading(false);
        }
    };

    const handleAgregar = async (e) => {
        e.preventDefault();

        if (!nuevoNombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        if (nuevoNombre.trim().length < 3) {
            toast.error('El nombre debe tener al menos 3 caracteres');
            return;
        }

        // Verificar duplicados
        const existe = tipos.some(t => t.nombre.toUpperCase() === nuevoNombre.trim().toUpperCase());
        if (existe) {
            toast.error('Este tipo de producto ya existe');
            return;
        }

        try {
            await tiposProductoDB.create(nuevoNombre.trim());
            toast.success('Tipo de producto agregado');
            setNuevoNombre('');
            loadTipos();
        } catch (error) {
            console.error('Error agregando tipo:', error);
            toast.error('Error al agregar tipo de producto');
        }
    };

    const handleEditar = (tipo) => {
        setEditingId(tipo.id);
        setEditingNombre(tipo.nombre);
    };

    const handleCancelarEdicion = () => {
        setEditingId(null);
        setEditingNombre('');
    };

    const handleGuardarEdicion = async (id) => {
        if (!editingNombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        if (editingNombre.trim().length < 3) {
            toast.error('El nombre debe tener al menos 3 caracteres');
            return;
        }

        // Verificar duplicados (excluyendo el actual)
        const existe = tipos.some(t =>
            t.id !== id && t.nombre.toUpperCase() === editingNombre.trim().toUpperCase()
        );
        if (existe) {
            toast.error('Este tipo de producto ya existe');
            return;
        }

        try {
            await tiposProductoDB.update(id, editingNombre.trim());
            toast.success('Tipo de producto actualizado');
            setEditingId(null);
            setEditingNombre('');
            loadTipos();
        } catch (error) {
            console.error('Error actualizando tipo:', error);
            toast.error('Error al actualizar tipo de producto');
        }
    };

    const handleEliminar = async (tipo) => {
        if (!window.confirm(`¿Eliminar "${tipo.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await tiposProductoDB.delete(tipo.id);
            toast.success('Tipo de producto eliminado');
            loadTipos();
        } catch (error) {
            console.error('Error eliminando tipo:', error);
            toast.error('Error al eliminar. Puede estar en uso.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Tipos de Producto</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Formulario Agregar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Tipo</h2>
                    <form onSubmit={handleAgregar} className="flex gap-3">
                        <input
                            type="text"
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            placeholder="Ej: Tiara, Tobillera, Adorno..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={50}
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <FaPlus size={14} />
                            Agregar
                        </button>
                    </form>
                </div>

                {/* Lista de Tipos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Tipos Existentes ({tipos.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Cargando...
                        </div>
                    ) : tipos.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No hay tipos de producto registrados
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {tipos.map((tipo) => (
                                <div
                                    key={tipo.id}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    {editingId === tipo.id ? (
                                        // Modo edición
                                        <>
                                            <input
                                                type="text"
                                                value={editingNombre}
                                                onChange={(e) => setEditingNombre(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                maxLength={50}
                                                autoFocus
                                            />
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleGuardarEdicion(tipo.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Guardar"
                                                >
                                                    <FaSave size={18} />
                                                </button>
                                                <button
                                                    onClick={handleCancelarEdicion}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                    title="Cancelar"
                                                >
                                                    <FaTimes size={18} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        // Modo vista
                                        <>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-500 font-mono">
                                                    #{tipo.id}
                                                </span>
                                                <span className="text-lg font-semibold text-gray-900">
                                                    {tipo.nombre}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditar(tipo)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(tipo)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
