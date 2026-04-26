import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialesDB } from '../../../utils/materialesNeonClient'; // <-- AHORA USA LA BD MAESTRA
import { FaArrowLeft, FaTrash, FaSave } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

export default function TiposMateriales() {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [nuevoTipo, setNuevoTipo] = useState({
        nombre: '',
        unidad: 'Gramos',
        precio_gramo: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTipos();
    }, []);

    const loadTipos = async () => {
        try {
            const data = await materialesDB.getMetales();
            setTipos(data);
        } catch (error) {
            console.error('Error cargando metales:', error);
            toast.error('Error al cargar catálogo de metales');
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
            await materialesDB.createMetal({
                nombre: nuevoTipo.nombre,
                unidad: nuevoTipo.unidad,
                precio_gramo: parseFloat(nuevoTipo.precio_gramo) || 0,
                orden: tipos.length + 1
            });
            toast.success('Material/Metal creado exitosamente');
            setNuevoTipo({ nombre: '', unidad: 'Gramos', precio_gramo: '' });
            loadTipos();
        } catch (error) {
            console.error('Error creando material:', error);
            toast.error('Error al guardar. Verifica que no esté duplicado.');
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar "${nombre}" del catálogo?`)) return;

        try {
            await materialesDB.deleteMetal(id);
            toast.success('Material eliminado');
            loadTipos();
        } catch (error) {
            console.error('Error eliminando material:', error);
            toast.error('Error al eliminar');
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
                        <h1 className="text-base font-bold text-gray-800">Catálogo de Materiales (Metales)</h1>
                        <p className="text-xs text-gray-500">Administra tus metales y precios base</p>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">Agregar Nuevo Material</h2>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-5">
                                <label className="block text-xs text-gray-500 mb-1">Material/Metal *</label>
                                <input
                                    type="text" value={nuevoTipo.nombre} placeholder="Ej: ORO 18K"
                                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, nombre: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none uppercase font-bold"
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
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs text-gray-500 mb-1">Precio Referencia (S/)</label>
                                <input
                                    type="number" step="0.0001" value={nuevoTipo.precio_gramo} placeholder="0.00"
                                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, precio_gramo: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 outline-none font-medium"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button onClick={handleAdd} className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition text-sm font-bold flex justify-center items-center gap-2">
                                    <FaSave size={12} /> Guardar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Catálogo Actual</h2>
                        {loading ? (
                            <p className="text-center text-gray-400 py-8">Cargando...</p>
                        ) : tipos.length === 0 ? (
                            <p className="text-center text-gray-400 py-8">No hay materiales registrados</p>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">Material / Insumo</th>
                                            <th className="px-4 py-3 text-center font-semibold w-32">Unidad</th>
                                            <th className="px-4 py-3 text-right font-semibold w-40">Precio Referencia</th>
                                            <th className="px-4 py-3 text-center font-semibold w-24">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tipos.map((tipo) => (
                                            <tr key={tipo.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-gray-800">{tipo.nombre}</td>
                                                <td className="px-4 py-3 text-center text-gray-600 text-xs">{tipo.unidad}</td>
                                                <td className="px-4 py-3 text-right font-medium text-blue-600">S/ {Number(tipo.precio_gramo).toFixed(4)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => handleDelete(tipo.id, tipo.nombre)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
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
            <Toaster position="top-right" />
        </div>
    );
}