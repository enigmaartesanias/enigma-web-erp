import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tiposMaterialesDB } from '../../../utils/tiposMaterialesNeonClient';
import { FaArrowLeft, FaTrash, FaSave } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function TiposMateriales() {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [nuevoTipo, setNuevoTipo] = useState({
        nombre: '',
        unidad: 'Gramos',
        detalle: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTipos();
    }, []);

    const loadTipos = async () => {
        try {
            const data = await tiposMaterialesDB.getAll();
            setTipos(data);
        } catch (error) {
            console.error('Error cargando tipos:', error);
            toast.error('Error al cargar tipos de materiales');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!nuevoTipo.nombre.trim()) {
            toast.error('El nombre es obligatorio');
            return;
        }

        try {
            await tiposMaterialesDB.create(nuevoTipo);
            toast.success('Tipo creado exitosamente');
            setNuevoTipo({ nombre: '', unidad: 'Gramos', detalle: '' });
            loadTipos();
        } catch (error) {
            console.error('Error creando tipo:', error);
            const errorMsg = error?.message || String(error);
            if (errorMsg.toLowerCase().includes('unique') || errorMsg.toLowerCase().includes('duplicate')) {
                toast.error('Ya existe un tipo con ese nombre');
            } else {
                toast.error(`Error: ${errorMsg}`);
            }
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar "${nombre}"?`)) return;

        try {
            await tiposMaterialesDB.delete(id);
            toast.success('Tipo eliminado');
            loadTipos();
        } catch (error) {
            console.error('Error eliminando tipo:', error);
            toast.error('Error al eliminar tipo');
        }
    };

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
                        <h1 className="text-base font-bold text-gray-800">Tipos de Material/Insumo</h1>
                        <p className="text-xs text-gray-500">Catálogo de materiales predefinidos</p>
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Formulario de Agregar */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Agregar Nuevo Tipo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-5">
                                <label className="block text-xs text-gray-500 mb-1">Material/Insumo *</label>
                                <input
                                    type="text"
                                    value={nuevoTipo.nombre}
                                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, nombre: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none uppercase"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">Unidad *</label>
                                <select
                                    value={nuevoTipo.unidad}
                                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, unidad: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                                >
                                    <option value="Gramos">Gramos</option>
                                    <option value="Unidad">Unidad</option>
                                    <option value="Mililitros">Mililitros</option>
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-xs text-gray-500 mb-1">Detalle</label>
                                <input
                                    type="text"
                                    placeholder="Descripción opcional"
                                    value={nuevoTipo.detalle}
                                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, detalle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <button
                                    onClick={handleAdd}
                                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                                >
                                    <FaSave className="inline mr-1" size={12} />
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Tipos Existentes */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Tipos Registrados</h2>
                        {loading ? (
                            <p className="text-center text-gray-400 py-8">Cargando...</p>
                        ) : tipos.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">No hay tipos registrados</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Material/Insumo</th>
                                            <th className="px-4 py-2 text-center font-medium w-32">Unidad</th>
                                            <th className="px-4 py-2 text-left font-medium">Detalle</th>
                                            <th className="px-4 py-2 text-center font-medium w-24">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tipos.map((tipo) => (
                                            <tr key={tipo.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{tipo.nombre}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{tipo.unidad}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{tipo.detalle || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleDelete(tipo.id, tipo.nombre)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
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
