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

            {/* Lista de Clientes */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
                ) : filteredClientes.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </div>
                ) : (
                    filteredClientes.map(cliente => (
                        <div
                            key={cliente.id}
                            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                        {cliente.nombre}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                        <FaPhone size={10} />
                                        <span>{cliente.telefono}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(cliente)}
                                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition"
                                        title="Editar"
                                    >
                                        <FaEdit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cliente.id)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                                        title="Eliminar"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
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
