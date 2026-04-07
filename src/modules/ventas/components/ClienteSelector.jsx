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

    const filteredClientes = searchQuery.length > 0
        ? clientes.filter(c =>
            (c.nombre && c.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.telefono && c.telefono.includes(searchQuery))
        )
        : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 md:pt-24 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Header Profesional */}
                <div className="bg-gray-800 p-5 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold">Buscar Cliente</h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Enigma Sistema ERP</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                    {/* Elemento decorativo */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Buscador Autocomplete */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
                            Nombre del Cliente o Celular
                        </label>
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Escribe para buscar..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none text-gray-800 font-medium"
                            />
                        </div>
                    </div>

                    {/* Resultados de Búsqueda DINÁMICOS */}
                    <div className="max-h-64 overflow-y-auto space-y-2 py-2">
                        {loading ? (
                            <div className="text-center py-6">
                                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : searchQuery.length < 2 ? (
                            <div className="text-center py-10 opacity-40">
                                <FaSearch size={40} className="mx-auto mb-3" />
                                <p className="text-xs font-bold uppercase">Empieza a escribir...</p>
                            </div>
                        ) : filteredClientes.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400 mb-4">No encontramos a ningún cliente</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                                >
                                    + Crear Nuevo Cliente
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredClientes.map(cliente => (
                                    <button
                                        key={cliente.id}
                                        onClick={() => onSelect(cliente)}
                                        className="w-full text-left p-4 rounded-2xl border-2 border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {cliente.nombre.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">
                                                    {cliente.nombre}
                                                </div>
                                                <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                    {cliente.telefono || 'Sin teléfono'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-blue-600 text-white p-1.5 rounded-full">
                                                <FaPlus size={10} />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer con Botón Crear Siempre Visible si hay búsqueda */}
                {(searchQuery.length >= 2 || filteredClientes.length > 0) && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                        >
                            ¿No está en la lista? Crea un cliente nuevo
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de Formulario (Mantiene su estado arriba) */}
            <ClienteForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSave={handleSaveCliente}
            />
        </div>
    );
};

export default ClienteSelector;
