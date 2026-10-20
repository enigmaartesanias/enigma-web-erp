import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ImageUploader from './ImageUploader';
import { generateSlug } from '../utils';
import {
    FaEdit,
    FaTrash,
    FaSearch,
    FaPlus,
    FaCheck,
    FaStar,
    FaArrowLeft,
    FaBoxOpen,
    FaClipboardList,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';

const DEFAULT_FORM_DATA = {
    categoria_id: '',
    material_id: '',
    material: '',
    titulo: '',
    descripcion: '',
    short_description: '',
    imagen_principal_url: '',
    imagen2_url: '',
    imagen3_url: '',
    precio: '',
    price_offer: '',
    precio_internacional_base: '',
    slug: '',
    orden: 0,
    activo: true,
    is_novedoso: false,
    is_ready_to_ship: false,
    stock_quantity: 0,
    weight_grams: '',
    dimensions: '',
    process_technique: '',
    shipping_info: 'Envíos a todo el Perú por Shalom y Olva Courier.',
    payment_info: 'Aceptamos Yape, Plin y Transferencias BCP / Interbank.',
    custom_order_terms: 'Piezas bajo encargo: Elaboración con el 80% de adelanto (Tiempo de taller: 4-6 días hábiles).',
    meta_descripcion: '',
    palabras_clave: '',
    moneda: 'USD',
    workshop_desc: '',
    workshop_image: ''
};

const ProductoAdmin = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editingProducto, setEditingProducto] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterMaterial, setFilterMaterial] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Paginación y ordenamiento
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [sortBy, setSortBy] = useState('orden');
    const [sortOrder, setSortOrder] = useState('asc');

    // Estado del formulario
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

    if (!user) {
        return (
            <div className="p-8 text-center text-stone-600">
                <h2 className="text-xl font-medium mb-3 text-stone-800">Acceso restringido</h2>
                <p className="text-sm">Debes iniciar sesión para administrar los productos.</p>
            </div>
        );
    }

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
                .order('orden', { ascending: true });

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

    const handleToggleActivo = async (producto) => {
        try {
            const nuevoEstado = !producto.activo;
            const { error } = await supabase
                .from('productos')
                .update({ activo: nuevoEstado })
                .eq('id', producto.id);

            if (error) throw error;

            setSuccessMessage(`Producto ${nuevoEstado ? 'activado' : 'desactivado'}`);
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchProductos();
        } catch (err) {
            setError(`Error al actualizar el estado: ${err.message}`);
        }
    };

    const getMaterialNombre = (producto) => {
        if (!producto.producto_material || producto.producto_material.length === 0) {
            return producto.material || 'Sin material';
        }
        const materialId = producto.producto_material[0].material_id;
        const mat = materiales.find(m => m.id === materialId);
        return mat ? mat.nombre : (producto.material || 'Sin material');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Si se selecciona un material de la lista y el campo material de ficha técnica está vacío, autocompletar
            if (name === 'material_id' && value && !prev.material) {
                const found = materiales.find(m => m.id === parseInt(value));
                if (found) {
                    updated.material = found.nombre;
                }
            }

            // Sincronización automática: stock_quantity <-> is_ready_to_ship
            // Si el usuario ingresa stock > 0, activar is_ready_to_ship automáticamente
            // Si baja a 0 o queda vacío, desactivarlo
            if (name === 'stock_quantity') {
                const qty = parseInt(value, 10);
                updated.is_ready_to_ship = !isNaN(qty) && qty > 0;
            }

            // Si el usuario desactiva manualmente el switch, poner stock en 0
            if (name === 'is_ready_to_ship' && !checked) {
                updated.stock_quantity = 0;
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validación estricta de foto principal
        if (!formData.imagen_principal_url || formData.imagen_principal_url.trim() === '') {
            setError('Debes subir una foto principal para guardar el producto');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);

        try {
            // Extraer material_id y campos de join para evitar errores en postgrest
            const { material_id, categorias, producto_material, ...productData } = formData;

            // Generar slug automático si está vacío
            let slug = formData.slug?.trim();
            if (!slug) {
                const timestamp = Date.now();
                slug = generateSlug(formData.titulo) + '-' + timestamp;
            }

            const stockQty = formData.stock_quantity !== '' && formData.stock_quantity !== null
                ? Math.max(0, parseInt(formData.stock_quantity, 10))
                : 0;
            // Solo cuando el usuario lo active conscientemente y asigne stock_quantity > 0 se guarda como stock inmediato
            const isReadyToShip = Boolean(formData.is_ready_to_ship) && stockQty > 0;
            const precioParsed = formData.precio !== '' && formData.precio !== null ? parseFloat(formData.precio) : null;

            const formDataToSend = {
                ...productData,
                slug: slug,
                precio: precioParsed,
                precio_local: precioParsed,
                price_offer: formData.price_offer !== '' && formData.price_offer !== null ? parseFloat(formData.price_offer) : null,
                precio_internacional_base: formData.precio_internacional_base !== '' && formData.precio_internacional_base !== null ? parseFloat(formData.precio_internacional_base) : null,
                stock_quantity: isReadyToShip ? stockQty : 0,
                weight_grams: formData.weight_grams !== '' && formData.weight_grams !== null ? parseFloat(formData.weight_grams) : null,
                is_ready_to_ship: isReadyToShip,
                dimensions: formData.dimensions?.trim() || null,
                material: formData.material?.trim() || null,
                process_technique: formData.process_technique?.trim() || null,
                short_description: formData.short_description?.trim() || null,
                shipping_info: formData.shipping_info?.trim() || 'Envíos a todo el Perú por Shalom y Olva Courier.',
                payment_info: formData.payment_info?.trim() || 'Aceptamos Yape, Plin y Transferencias BCP / Interbank.',
                custom_order_terms: formData.custom_order_terms?.trim() || 'Piezas bajo encargo: Elaboración con el 80% de adelanto (Tiempo de taller: 4-6 días hábiles).'
            };

            let productId;

            if (editingProducto) {
                productId = editingProducto.id;
                const { error: updateError } = await supabase
                    .from('productos')
                    .update(formDataToSend)
                    .eq('id', productId);

                if (updateError) throw updateError;
            } else {
                const { data, error: insertError } = await supabase
                    .from('productos')
                    .insert([formDataToSend])
                    .select();

                if (insertError) throw insertError;
                productId = data[0].id;
            }

            // Manejo de la relación relacional con materiales
            if (material_id) {
                await supabase
                    .from('producto_material')
                    .delete()
                    .eq('producto_id', productId);

                const { error: relError } = await supabase
                    .from('producto_material')
                    .insert([{
                        producto_id: productId,
                        material_id: parseInt(material_id)
                    }]);

                if (relError) throw relError;
            }

            setSuccessMessage(editingProducto ? '¡Producto actualizado correctamente!' : '¡Producto guardado exitosamente!');
            setTimeout(() => setSuccessMessage(''), 4000);
            resetForm();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            fetchProductos();
        } catch (err) {
            setError(`Error al ${editingProducto ? 'actualizar' : 'crear'} el producto: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (producto) => {
        setEditingProducto(producto);

        let materialId = '';
        if (producto.producto_material && producto.producto_material.length > 0) {
            materialId = producto.producto_material[0].material_id;
        }

        setFormData({
            categoria_id: producto.categoria_id || '',
            material_id: materialId,
            material: producto.material || '',
            titulo: producto.titulo || '',
            descripcion: producto.descripcion || '',
            short_description: producto.short_description || '',
            imagen_principal_url: producto.imagen_principal_url || '',
            imagen2_url: producto.imagen2_url || '',
            precio: (producto.precio_local !== null && producto.precio_local !== undefined && producto.precio_local !== '')
                ? producto.precio_local
                : (producto.precio !== null && producto.precio !== undefined ? producto.precio : ''),
            price_offer: producto.price_offer !== null && producto.price_offer !== undefined ? producto.price_offer : '',
            precio_internacional_base: producto.precio_internacional_base !== null && producto.precio_internacional_base !== undefined ? producto.precio_internacional_base : '',
            slug: producto.slug || '',
            orden: producto.orden ?? 0,
            activo: producto.activo ?? true,
            is_novedoso: producto.is_novedoso ?? false,
            is_ready_to_ship: producto.is_ready_to_ship ?? false,
            stock_quantity: producto.stock_quantity ?? 0,
            weight_grams: producto.weight_grams !== null && producto.weight_grams !== undefined ? producto.weight_grams : '',
            dimensions: producto.dimensions || '',
            process_technique: producto.process_technique || '',
            shipping_info: producto.shipping_info || 'Envíos a todo el Perú por Shalom y Olva Courier.',
            payment_info: producto.payment_info || 'Aceptamos Yape, Plin y Transferencias BCP / Interbank.',
            custom_order_terms: producto.custom_order_terms || 'Piezas bajo encargo: Elaboración con el 80% de adelanto (Tiempo de taller: 4-6 días hábiles).',
            meta_descripcion: producto.meta_descripcion || '',
            palabras_clave: producto.palabras_clave || '',
            moneda: producto.moneda || 'USD',
            workshop_desc: producto.workshop_desc || '',
            workshop_image: producto.workshop_image || ''
        });

        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Deseas eliminar este producto permanentemente?')) return;

        try {
            const { error } = await supabase.from('productos').delete().eq('id', id);
            if (error) throw error;
            fetchProductos();
        } catch (err) {
            setError(`Error al eliminar: ${err.message}`);
        }
    };

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA);
        setEditingProducto(null);
        setError(null);
    };

    const handleImageUpload = (field, url) => {
        setFormData(prev => ({
            ...prev,
            [field]: url
        }));
    };

    // Filtros de búsqueda
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

    // Ordenamiento
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
            case 'titulo':
                aValue = a.titulo.toLowerCase();
                bValue = b.titulo.toLowerCase();
                break;
            case 'precio':
                aValue = a.precio || 0;
                bValue = b.precio || 0;
                break;
            case 'orden':
            default:
                aValue = a.orden || 0;
                bValue = b.orden || 0;
                break;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterMaterial, filterStatus]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-stone-500 text-sm">
                Cargando catálogo...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-3 sm:px-6 max-w-6xl py-6">
            {/* Navegación y Encabezado Minimalista */}
            <div className="flex items-center justify-between mb-5">
                <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
                >
                    <FaArrowLeft className="text-[10px]" />
                    <span>Panel de administración</span>
                </Link>

                <div className="text-xs text-stone-400">
                    {productos.length} productos registrados
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg mb-4 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
                </div>
            )}

            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3.5 py-2.5 rounded-lg mb-4 flex items-center gap-2">
                    <FaCheck className="text-emerald-500" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* FORMULARIO DE PRODUCTO: MINIMALISTA Y ELEGANTE */}
            <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden mb-8">
                {/* Header de la tarjeta */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/40">
                    <div>
                        <h2 className="text-sm font-medium text-stone-800">
                            {editingProducto ? 'Editar producto' : 'Nuevo producto'}
                        </h2>
                        <p className="text-[11px] text-stone-400">
                            Detalles generales, disponibilidad y ficha técnica artesanal
                        </p>
                    </div>

                    {editingProducto && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors"
                        >
                            Cancelar edición
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                    {/* BLOQUE 1: DATOS PRINCIPALES */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Categoría <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleInputChange}
                                    className="w-full text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                                    required
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Material clasificado <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="material_id"
                                    value={formData.material_id}
                                    onChange={handleInputChange}
                                    className="w-full text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                                    required
                                >
                                    <option value="">Seleccionar material...</option>
                                    {materiales.map(mat => (
                                        <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Título de la pieza <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Dije Nudo de Bruja en Plata"
                                    className="w-full text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Fila: Resumen Breve y Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-medium text-stone-600">
                                        Resumen breve (Ficha / SEO)
                                    </label>
                                    <span className="text-[10px] text-stone-400">
                                        {(formData.short_description || '').length}/160
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="short_description"
                                    maxLength={160}
                                    value={formData.short_description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Amuleto artesanal elaborado en plata 950 con acabados finos a mano."
                                    className="w-full text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Slug (URL amigable)
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    placeholder="Generación automática si se deja vacío"
                                    className="w-full text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">
                                Descripción completa de la pieza
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion || ''}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Describe el simbolismo, la inspiración y los detalles artesanales..."
                                className="w-full text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                            />
                        </div>
                    </div>

                    {/* BLOQUE 2: STOCK INMEDIATO & PRECIOS */}
                    <div className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/60">
                            {/* Toggle Stock Inmediato */}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_ready_to_ship"
                                        checked={Boolean(formData.is_ready_to_ship)}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-stone-800">
                                            ¿Producto para Stock Inmediato?
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${formData.is_ready_to_ship ? (parseInt(formData.stock_quantity, 10) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800') : 'bg-stone-200 text-stone-600'}`}>
                                            {formData.is_ready_to_ship ? (parseInt(formData.stock_quantity, 10) > 0 ? 'Listo para envío' : 'Falta stock') : 'Bajo encargo'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-400">
                                        {formData.is_ready_to_ship
                                            ? (parseInt(formData.stock_quantity, 10) > 0
                                                ? 'Visible en la sección de entrega inmediata con despacho prioritario.'
                                                : 'Debes asignar al menos 1 unidad disponible para que sea visible.')
                                            : 'Pieza elaborada bajo encargo en taller (4-6 días hábiles).'}
                                    </p>
                                </div>
                            </div>

                            {/* Unidades en Stock */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-xs text-stone-600 whitespace-nowrap">
                                    Cantidad disponible:
                                </label>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    min="0"
                                    value={formData.stock_quantity ?? 0}
                                    onChange={handleInputChange}
                                    className="w-20 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-center text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>
                        </div>

                        {/* Precios: Local, Oferta, Internacional */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Precio local (S/)
                                </label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Precio oferta (S/) <span className="text-stone-400 font-normal">(Opcional)</span>
                                </label>
                                <input
                                    type="number"
                                    name="price_offer"
                                    value={formData.price_offer}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 39.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Precio base USD (S/) <span className="text-stone-400 font-normal">(Opcional)</span>
                                </label>
                                <input
                                    type="number"
                                    name="precio_internacional_base"
                                    value={formData.precio_internacional_base}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 420.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>
                        </div>

                        {/* Visibilidad y destacados */}
                        <div className="flex items-center gap-6 pt-1">
                            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={formData.activo}
                                    onChange={handleInputChange}
                                    className="rounded border-stone-300 text-stone-900 focus:ring-0 h-3.5 w-3.5"
                                />
                                <span>Producto Activo en tienda</span>
                            </label>

                            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                                <input
                                    type="checkbox"
                                    name="is_novedoso"
                                    checked={formData.is_novedoso}
                                    onChange={handleInputChange}
                                    className="rounded border-stone-300 text-amber-500 focus:ring-0 h-3.5 w-3.5"
                                />
                                <span>Marcar como Novedad</span>
                            </label>
                        </div>
                    </div>

                    {/* BLOQUE 3: FICHA TÉCNICA ARTESANAL */}
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <FaClipboardList className="text-stone-400 text-xs" />
                            <h3 className="text-xs font-medium text-stone-700 tracking-wide uppercase">
                                Ficha Técnica de la Pieza
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">
                                    Material detallado
                                </label>
                                <input
                                    type="text"
                                    name="material"
                                    value={formData.material || ''}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Plata 950 y Cobre"
                                    className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">
                                    Peso terminado (g)
                                </label>
                                <input
                                    type="number"
                                    name="weight_grams"
                                    step="0.01"
                                    min="0"
                                    value={formData.weight_grams ?? ''}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 14.50"
                                    className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">
                                    Dimensiones / Medidas
                                </label>
                                <input
                                    type="text"
                                    name="dimensions"
                                    value={formData.dimensions || ''}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 3.5 cm x 2.0 cm"
                                    className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">
                                    Técnica artesanal
                                </label>
                                <input
                                    type="text"
                                    name="process_technique"
                                    value={formData.process_technique || ''}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Forjado a mano y calado"
                                    className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 4: IMÁGENES DEL PRODUCTO */}
                    <div>
                        <div className="flex items-center gap-2 mb-2.5">
                            <FaBoxOpen className="text-stone-400 text-xs" />
                            <h3 className="text-xs font-medium text-stone-700 tracking-wide uppercase">
                                Galería de Imágenes
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { field: 'imagen_principal_url', label: 'Foto Principal (Obligatoria)' },
                                { field: 'imagen2_url', label: 'Vista Secundaria' },
                                { field: 'imagen3_url', label: 'Detalle Cercano' }
                            ].map(({ field, label }, idx) => (
                                <div key={field} className="border border-stone-200/80 rounded-xl p-3 bg-stone-50/30 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-stone-600">{label}</span>
                                        {formData[field] && (
                                            <button
                                                type="button"
                                                onClick={() => handleImageUpload(field, '')}
                                                className="text-[10px] text-stone-400 hover:text-red-500 transition-colors"
                                            >
                                                Quitar
                                            </button>
                                        )}
                                    </div>

                                    {formData[field] ? (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={formData[field]}
                                                alt={label}
                                                className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                                            />
                                            <div className="text-[11px] text-stone-500 truncate flex-1">
                                                Cargada correctamente
                                            </div>
                                        </div>
                                    ) : (
                                        <ImageUploader
                                            compact={true}
                                            hideTitle={true}
                                            buttonText="Subir"
                                            bucketName="producto-images"
                                            onUploadSuccess={(url) => handleImageUpload(field, url)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOQUE 5: TALLER Y TÉRMINOS (SECCIÓN COLAPSABLE ELEGANTE) */}
                    <div className="border-t border-stone-200 pt-3">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(prev => !prev)}
                            className="flex items-center justify-between w-full py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            <span>Proceso de Taller y Políticas de Envío (Opcional)</span>
                            {showAdvanced ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                        </button>

                        {showAdvanced && (
                            <div className="mt-3 space-y-4 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50/50 border border-stone-200">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Descripción del Proceso en Taller
                                        </label>
                                        <textarea
                                            name="workshop_desc"
                                            value={formData.workshop_desc || ''}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Ej: Forjado manual del cobre en bruto antes del pulido..."
                                            className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Foto en Taller
                                        </label>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <ImageUploader
                                                    compact={true}
                                                    hideTitle={true}
                                                    buttonText="Subir Foto Taller"
                                                    bucketName="producto-images"
                                                    onUploadSuccess={(url) => handleImageUpload('workshop_image', url)}
                                                />
                                            </div>
                                            {formData.workshop_image && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <img
                                                        src={formData.workshop_image}
                                                        alt="Taller"
                                                        className="w-12 h-12 object-cover rounded-lg border border-stone-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImageUpload('workshop_image', '')}
                                                        className="text-[10px] text-red-500 hover:underline"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Información de Envío
                                        </label>
                                        <input
                                            type="text"
                                            name="shipping_info"
                                            value={formData.shipping_info || ''}
                                            onChange={handleInputChange}
                                            className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Información de Pago
                                        </label>
                                        <input
                                            type="text"
                                            name="payment_info"
                                            value={formData.payment_info || ''}
                                            onChange={handleInputChange}
                                            className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">
                                            Términos de Encargo
                                        </label>
                                        <input
                                            type="text"
                                            name="custom_order_terms"
                                            value={formData.custom_order_terms || ''}
                                            onChange={handleInputChange}
                                            className="w-full text-xs bg-stone-50/50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BOTONES DE ACCIÓN: MINIMALISTAS Y PROPORCIONADOS */}
                    <div className="pt-2 flex items-center justify-end gap-2.5">
                        {editingProducto && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                            >
                                Descartar
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-lg text-xs font-medium text-stone-100 bg-stone-900 hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                            {saving ? (
                                <span>Guardando...</span>
                            ) : (
                                <>
                                    {editingProducto ? <FaEdit className="text-[11px]" /> : <FaPlus className="text-[11px]" />}
                                    <span>{editingProducto ? 'Actualizar Producto' : 'Guardar Producto'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="bg-stone-900 text-stone-200 p-3.5 rounded-xl shadow-xs mb-4">
                <div className="flex flex-col lg:flex-row gap-2.5 items-center justify-between">
                    <div className="relative w-full lg:w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Buscar pieza..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-stone-800 border border-stone-700 text-stone-100 rounded-lg text-xs placeholder-stone-400 focus:outline-none focus:border-stone-500"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                            <option value="">Todas las Categorías</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>

                        <select
                            value={filterMaterial}
                            onChange={(e) => setFilterMaterial(e.target.value)}
                            className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                            <option value="">Todos los Materiales</option>
                            {materiales.map(mat => (
                                <option key={mat.id} value={mat.id}>{mat.nombre}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                            <option value="orden">Orden</option>
                            <option value="titulo">Título</option>
                            <option value="precio">Precio</option>
                        </select>
                    </div>

                    <div className="text-[11px] text-stone-400 ml-auto lg:ml-0">
                        {currentProducts.length} de {sortedProducts.length}
                    </div>
                </div>
            </div>

            {/* TABLA DE PRODUCTOS CON INDICADORES DE STOCK INMEDIATO */}
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200">
                        <thead className="bg-stone-50">
                            <tr>
                                <th className="px-3.5 py-2.5 text-left text-[11px] font-medium text-stone-500 uppercase tracking-wider w-16">Pieza</th>
                                <th className="px-3.5 py-2.5 text-left text-[11px] font-medium text-stone-500 uppercase tracking-wider">Título</th>
                                <th className="px-3.5 py-2.5 text-left text-[11px] font-medium text-stone-500 uppercase tracking-wider hidden md:table-cell">Material</th>
                                <th className="px-3.5 py-2.5 text-left text-[11px] font-medium text-stone-500 uppercase tracking-wider hidden lg:table-cell">Categoría</th>
                                <th className="px-3.5 py-2.5 text-left text-[11px] font-medium text-stone-500 uppercase tracking-wider">Precio</th>
                                <th className="px-3.5 py-2.5 text-center text-[11px] font-medium text-stone-500 uppercase tracking-wider">Stock</th>
                                <th className="px-3.5 py-2.5 text-center text-[11px] font-medium text-stone-500 uppercase tracking-wider w-20">Estado</th>
                                <th className="px-3.5 py-2.5 text-center text-[11px] font-medium text-stone-500 uppercase tracking-wider w-20">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-100">
                            {currentProducts.length > 0 ? (
                                currentProducts.map((producto) => (
                                    <tr key={producto.id} className="hover:bg-stone-50/70 transition-colors">
                                        {/* Miniatura */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                                                {producto.imagen_principal_url ? (
                                                    <img
                                                        src={producto.imagen_principal_url}
                                                        alt={producto.titulo}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-stone-400">Sin foto</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Título & Novedad */}
                                        <td className="px-3.5 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-medium text-stone-800 max-w-xs truncate" title={producto.titulo}>
                                                    {producto.titulo}
                                                </span>
                                                {producto.is_novedoso && (
                                                    <FaStar className="text-amber-400 text-[10px] flex-shrink-0" title="Novedad" />
                                                )}
                                            </div>
                                            {(producto.short_description || producto.descripcion) && (
                                                <p className="text-[10px] text-stone-400 truncate max-w-xs" title={producto.short_description || producto.descripcion}>
                                                    {producto.short_description || producto.descripcion}
                                                </p>
                                            )}
                                        </td>

                                        {/* Material */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap hidden md:table-cell">
                                            <span className="px-2 py-0.5 text-[11px] rounded-md bg-stone-100 text-stone-600">
                                                {getMaterialNombre(producto)}
                                            </span>
                                        </td>

                                        {/* Categoría */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap hidden lg:table-cell">
                                            <span className="text-xs text-stone-500">
                                                {producto.categorias?.nombre || '—'}
                                            </span>
                                        </td>

                                        {/* Precios (precio_local / precio y price_offer) */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xs font-medium text-stone-800">
                                                    {producto.precio_local !== null && producto.precio_local !== undefined
                                                        ? `S/ ${parseFloat(producto.precio_local).toFixed(2)}`
                                                        : (producto.precio !== null && producto.precio !== undefined ? `S/ ${parseFloat(producto.precio).toFixed(2)}` : 'A pedido')}
                                                </span>
                                                {producto.price_offer && (
                                                    <span className="text-[10px] text-emerald-600 font-medium">
                                                        (Oferta: S/ {parseFloat(producto.price_offer).toFixed(2)})
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Stock Inmediato Badge */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap text-center">
                                            {producto.is_ready_to_ship ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Inmediato ({producto.stock_quantity ?? 0})
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500">
                                                    Bajo encargo
                                                </span>
                                            )}
                                        </td>

                                        {/* Switch Activo */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActivo(producto)}
                                                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${producto.activo ? 'bg-emerald-600' : 'bg-stone-300'}`}
                                                title={producto.activo ? 'Visible - Clic para ocultar' : 'Oculto - Clic para activar'}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${producto.activo ? 'translate-x-4' : 'translate-x-0.5'}`}
                                                />
                                            </button>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-3.5 py-2.5 whitespace-nowrap text-center text-xs">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(producto)}
                                                    className="p-1 text-stone-500 hover:text-stone-900 transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(producto.id)}
                                                    className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-xs text-stone-400">
                                        No hay productos que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="bg-stone-50 px-4 py-2.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                        <span>Página {currentPage} de {totalPages}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1 rounded bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductoAdmin;
