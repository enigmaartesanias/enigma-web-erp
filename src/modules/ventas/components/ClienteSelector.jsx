import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaPlus } from 'react-icons/fa';
import { clientesDB } from '../../../utils/clientesNeonClient';
import ClienteForm from '../../clientes/components/ClienteForm';

const ClienteSelector = ({ isOpen, onClose, onSelect }) => {
    const [clientes, setClientes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadClientes();
        }
    }, [isOpen]);

    const loadClientes = async () => {
        try {
            setLoading(true);
            const data = await clientesDB.getAll();
            setClientes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCliente = async (clienteData) => {
        try {
            const newCliente = await clientesDB.create(clienteData);
            setShowForm(false);
            loadClientes();
            // Seleccionar automáticamente el cliente recién creado
            setSelectedId(newCliente.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleConfirm = () => {
        const selected = clientes.find(c => c.id === selectedId);
        if (selected) {
            onSelect(selected);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedId(null);
        setSearchQuery('');
        setShowForm(false);
        onClose();
    };

    const filteredClientes = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.telefono.includes(searchQuery)
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
                    {/* Header */}
                    <div className="bg-gray-700 text-white px-4 py-3 rounded-t-lg flex justify-between items-center flex-shrink-0">
                        <h3 className="text-base font-semibold">Seleccionar Cliente</h3>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-gray-200 transition"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-gray-100 flex-shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar cliente..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 outline-none"
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
                        ) : filteredClientes.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No hay clientes
                            </div>
                        ) : (
                            filteredClientes.map(cliente => (
                                <label
                                    key={cliente.id}
                                    className={`block p-3 rounded-lg border cursor-pointer transition ${selectedId === cliente.id
                                            ? 'border-gray-600 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <input
                                            type="radio"
                                            name="cliente"
                                            checked={selectedId === cliente.id}
                                            onChange={() => setSelectedId(cliente.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800 text-sm">
                                                {cliente.nombre}
                                            </div>
                                            <div className="text-gray-600 text-xs">
                                                📞 {cliente.telefono}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    {/* Crear Nuevo Cliente */}
                    <div className="p-3 border-t border-gray-100 flex-shrink-0">
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                            <FaPlus size={12} />
                            Crear nuevo cliente
                        </button>
                    </div>

                    {/* Botones de Acción */}
                    <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedId}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>

            {/* Formulario de Crear Cliente */}
            <ClienteForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSaveCliente}
            />
        </>
    );
};

export default ClienteSelector;
