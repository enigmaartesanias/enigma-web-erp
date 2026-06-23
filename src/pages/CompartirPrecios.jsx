import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaSearch, FaArrowLeft, FaShareAlt } from 'react-icons/fa';

const CompartirPrecios = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [materiales, setMateriales] = useState([]);

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMaterial, setFilterMaterial] = useState('');
    const [filterStatus, setFilterStatus] = useState('active'); // active por defecto

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
        fetchMateriales();
    }, []);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('productos')
                .select('*, categorias(nombre), producto_material(material_id)')
                .order('id', { ascending: false });

            if (error) throw error;
            setProductos(data || []);
            setError(null);
        } catch (err) {
            setError('Error al cargar los productos.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategorias = async () => {
        try {
            const { data, error } = await supabase.from('categorias').select('*');
            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error('Error al cargar categorías:', err);
        }
    };

    const fetchMateriales = async () => {
        try {
            const { data, error } = await supabase.from('materiales').select('*');
            if (error) throw error;
            setMateriales(data || []);
        } catch (err) {
            console.error('Error al cargar materiales:', err);
        }
    };

    const handleSharePrice = async (producto, currency) => {
        let priceText = '';
        if (currency === 'PEN') {
            priceText = `S/ ${producto.precio ? Math.round(producto.precio) : 'A consultar'} PEN`;
        } else if (currency === 'USD') {
            const usdPrice = Math.round(producto.precio_internacional_base * 0.45);
            priceText = `$ ${usdPrice} USD`;
        } else if (currency === 'EUR') {
            const eurPrice = Math.round(producto.precio_internacional_base * 0.4063);
            priceText = `€ ${eurPrice} EUR`;
        }

        const titleText = `✨ ${producto.titulo} — ${priceText} (no incluye envío)`;
        // In some cases they might use id or slug. Using id as in the example screenshot
        const urlText = `https://artesaniasenigma.com/producto/${producto.slug || producto.id}`;
        const fullText = `${titleText}\n${urlText}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: producto.titulo,
                    text: titleText,
                    url: urlText,
                });
            } else {
                // Fallback to whatsapp link
                const waUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
                window.open(waUrl, '_blank');
            }
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    };

    // Lógica de filtrado
    const filteredProducts = productos.filter(producto => {
        const matchesSearch = producto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (producto.slug && producto.slug.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory ? producto.categoria_id === parseInt(filterCategory) : true;
        const matchesMaterial = filterMaterial ? 
            producto.producto_material?.some(pm => pm.material_id === parseInt(filterMaterial)) : true;
        const matchesStatus = filterStatus === 'all' ? true :
            filterStatus === 'active' ? producto.activo :
                !producto.activo;

        return matchesSearch && matchesCategory && matchesMaterial && matchesStatus;
    });

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterMaterial, filterStatus]);

    if (loading) {
        return <div className="p-4 text-center">Cargando productos...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-5xl mt-8">
            <div className="mb-6">
                <Link to="/dashboard-master" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                    <FaArrowLeft className="mr-2" />
                    <span className="font-medium">Regresar al Panel Principal</span>
                </Link>
            </div>

            <div className="mb-4">
                <h1 className="text-2xl font-black text-gray-800">Compartir Precios</h1>
                <p className="text-sm text-gray-500">Selecciona el precio en la moneda deseada para compartirlo rápidamente.</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* BARRA DE FILTROS SUPERIOR */}
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4">
                <div className="flex flex-col lg:flex-row gap-3 items-center">
                    {/* Búsqueda */}
                    <div className="relative w-full lg:w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="pl-10 w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2 w-full lg:w-auto flex-wrap">
                        <select
                            className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Todas las Categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>

                        <select
                            className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={filterMaterial}
                            onChange={(e) => setFilterMaterial(e.target.value)}
                        >
                            <option value="">Todos los Materiales</option>
                            {materiales.map(mat => (
                                <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                            ))}
                        </select>

                        <select
                            className="p-2 border border-gray-600 bg-gray-700 text-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="active">Solo Activos</option>
                            <option value="all">Todos los Estados</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                    </div>

                    {/* Contador de resultados */}
                    <div className="text-sm text-gray-300 ml-auto">
                        {currentProducts.length} de {filteredProducts.length} productos
                    </div>
                </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-16">Imagen</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Título</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-28">Soles</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-28">Dólares</th>
                                <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-28">Euros</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentProducts.length > 0 ? (
                                currentProducts.map((producto) => (
                                    <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Imagen Thumbnail */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex-shrink-0 h-12 w-12">
                                                {producto.imagen_principal_url ? (
                                                    <img
                                                        className="h-12 w-12 rounded object-cover border border-gray-200 shadow-sm"
                                                        src={producto.imagen_principal_url}
                                                        alt={producto.titulo}
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs border border-gray-300">
                                                        Sin img
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Título */}
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900 line-clamp-2" title={producto.titulo}>
                                                {producto.titulo}
                                            </div>
                                        </td>

                                        {/* Categoría */}
                                        <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {producto.categorias?.nombre || 'Sin Cat.'}
                                            </span>
                                        </td>

                                        {/* Precio Soles */}
                                        <td className="px-2 py-3 whitespace-nowrap text-center">
                                            {producto.precio ? (
                                                <button
                                                    onClick={() => handleSharePrice(producto, 'PEN')}
                                                    className="w-full text-xs font-bold px-2 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 text-center"
                                                    title="Compartir en Soles"
                                                >
                                                    S/ {Math.round(producto.precio)}
                                                </button>
                                            ) : (
                                                <button disabled className="w-full h-8 rounded-lg bg-slate-50 border border-slate-100 cursor-not-allowed"></button>
                                            )}
                                        </td>

                                        {/* Precio Dólares */}
                                        <td className="px-2 py-3 whitespace-nowrap text-center">
                                            {producto.precio_internacional_base > 0 ? (
                                                <button
                                                    onClick={() => handleSharePrice(producto, 'USD')}
                                                    className="w-full text-xs font-bold px-2 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm active:scale-95 text-center"
                                                    title="Compartir en Dólares"
                                                >
                                                    $ {Math.round(producto.precio_internacional_base * 0.45)}
                                                </button>
                                            ) : (
                                                <button disabled className="w-full h-8 rounded-lg bg-slate-50 border border-slate-100 cursor-not-allowed"></button>
                                            )}
                                        </td>

                                        {/* Precio Euros */}
                                        <td className="px-2 py-3 whitespace-nowrap text-center">
                                            {producto.precio_internacional_base > 0 ? (
                                                <button
                                                    onClick={() => handleSharePrice(producto, 'EUR')}
                                                    className="w-full text-xs font-bold px-2 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 text-center"
                                                    title="Compartir en Euros"
                                                >
                                                    € {Math.round(producto.precio_internacional_base * 0.4063)}
                                                </button>
                                            ) : (
                                                <button disabled className="w-full h-8 rounded-lg bg-slate-50 border border-slate-100 cursor-not-allowed"></button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompartirPrecios;
