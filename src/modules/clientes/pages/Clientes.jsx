import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesDB } from '../../../utils/clientesNeonClient';
import ClienteForm from '../components/ClienteForm';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaPhone, FaSearch } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

const Clientes = () => {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);

    useEffect(() => {
        loadClientes();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = clientes.filter(c =>
                c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.telefono.includes(searchQuery)
            );
            setFilteredClientes(filtered);
        } else {
            setFilteredClientes(clientes);
        }
    }, [searchQuery, clientes]);

    const loadClientes = async () => {
        try {
            setLoading(true);
            const data = await clientesDB.getAll();
            setClientes(data);
            setFilteredClientes(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (clienteData) => {
        try {
            if (clienteData.id) {
                await clientesDB.update(clienteData.id, clienteData);
                toast.success('Cliente actualizado');
            } else {
                await clientesDB.create(clienteData);
                toast.success('Cliente creado');
            }
            setShowForm(false);
            setEditingCliente(null);
            loadClientes();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cliente');
        }
    };

    const handleEdit = (cliente) => {
        setEditingCliente(cliente);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este cliente?')) return;

        try {
            await clientesDB.delete(id);
            toast.success('Cliente eliminado');
            loadClientes();
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar cliente');
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCliente(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <h1 className="text-base font-bold text-gray-800">Clientes</h1>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-1.5 text-sm font-medium"
                >
                    <FaPlus size={12} />
                    Nuevo
                </button>
            </header>

            {/* Search */}
            <div className="p-3 bg-white border-b border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre o teléfono..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                </div>
            </div>

            {/* Lista de Clientes en Tabla */}
            <div className="flex-1 overflow-auto p-3">
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
                ) : filteredClientes.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                        {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                        <table className="min-w-[800px] w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">DNI</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Dirección</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClientes.map(cliente => (
                                    <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {cliente.nombre}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {cliente.telefono}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                                            {cliente.dni || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                            {cliente.direccion || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(cliente)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cliente.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <ClienteForm
                isOpen={showForm}
                onClose={handleCloseForm}
                onSave={handleSave}
                initialData={editingCliente}
            />
        </div>
    );
};

export default Clientes;
