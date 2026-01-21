import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'react-qr-code';
import { FaCamera, FaSave, FaTimes, FaQrcode, FaArrowLeft } from 'react-icons/fa';
import { compressAndResizeImage, validateImageFile } from '../../../utils/imageOptimizer';

// Helper para mapear tipo de producto a categoría
const mapTipoToCategoria = (tipoProducto) => {
    if (!tipoProducto) return '';

    const tipo = tipoProducto.toLowerCase();

    if (tipo.includes('arete') || tipo.includes('aretes')) return 'ARETE';
    if (tipo.includes('pulsera') || tipo.includes('pulseras')) return 'PULSERA';
    if (tipo.includes('anillo') || tipo.includes('anillos')) return 'ANILLO';
    if (tipo.includes('collar') || tipo.includes('collares')) return 'COLLAR';

    return '';
};

const ProductoForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [processingImage, setProcessingImage] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [produccionTerminada, setProduccionTerminada] = useState([]);
    const [selectedProduccion, setSelectedProduccion] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        costo: '',
        precio: '',
        codigo_usuario: '',
        stock_actual: '',
        unidad: 'UND',
        categoria: '',
        descripcion: '',
        precio_adicional: '',
        origen: 'COMPRA' // Default para manuales
    });

    // Estados para progressive disclosure
    const [isFromProduction, setIsFromProduction] = useState(false);
    const [showExternalForm, setShowExternalForm] = useState(true); // Mostrar formulario directo
    const [produccionInfo, setProduccionInfo] = useState(null);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        loadCategorias();
        loadProduccionTerminada();

        // Detectar produccion_id desde URL
        const produccionId = searchParams.get('produccion_id');
        if (produccionId) {
            loadProduccionById(produccionId);
        }
    }, [searchParams]);

    // Cargar producción específica por ID
    const loadProduccionById = async (id) => {
        try {
            const data = await produccionDB.getAll();
            const item = data.find(p => p.id_produccion === parseInt(id));

            if (item) {
                setIsFromProduction(true);
                setShowExternalForm(true);
                setProduccionInfo({
                    id: item.id_produccion,
                    fecha: item.fecha_registro,
                    metal: item.metal,
                    tipo: item.tipo_producto
                });
                applyProduccionData(item);
            } else {
                alert('Producción no encontrada');
                navigate('/produccion');
            }
        } catch (error) {
            console.error('Error cargando producción:', error);
            alert('Error al cargar datos de producción');
        }
    };

    // Efecto para manejar datos que vienen desde el botón de Producción (legacy)
    useEffect(() => {
        if (location.state?.prefill) {
            const item = location.state.prefill;
            setIsFromProduction(true);
            setShowExternalForm(true); // Auto-expandir si es producción
            setProduccionInfo({
                id: item.id_produccion,
                fecha: item.fecha_terminado,
                metal: item.metal,
                tipo: item.tipo_producto
            });
            applyProduccionData(item);
        }
    }, [location.state]);

    const loadProduccionTerminada = async () => {
        try {
            const data = await produccionDB.getAll();
            // Filtrar solo terminados y de stock
            const terminados = data.filter(p => p.estado_produccion === 'terminado' && p.tipo_produccion === 'STOCK');
            setProduccionTerminada(terminados);
        } catch (error) {
            console.error('Error cargando producción:', error);
        }
    };

    const applyProduccionData = (item) => {
        setSelectedProduccion(item.id_produccion);

        // Generar código vacío para ingreso manual
        // const timestamp = Date.now().toString().slice(-6); 
        // const tipoPrefix = item.tipo_producto.substring(0, 3).toUpperCase();
        // const codigoUnico = `${tipoPrefix}${timestamp}`;

        setFormData(prev => ({
            ...prev,
            nombre: item.nombre_producto || `${item.tipo_producto} de ${item.metal}`,
            costo: item.costo_total_unitario ? parseFloat(item.costo_total_unitario).toFixed(2) : '',
            stock_actual: item.cantidad,
            categoria: mapTipoToCategoria(item.tipo_producto), // Auto-mapear categoría
            descripcion: `Producto fabricado en taller. Metal: ${item.metal}. Tipo: ${item.tipo_producto}.`,
            origen: 'PRODUCCION',
            codigo_usuario: '' // Código vacío para ingreso manual
        }));
        if (item.imagen_url) {
            setPreviewUrl(item.imagen_url);
            // Nota: No podemos setear imageFile porque es una URL remota, 
            // pero el submit manejará esto si no hay nuevo archivo
        }
    };

    const handleProduccionSelect = (e) => {
        const id = e.target.value;
        setSelectedProduccion(id);
        if (id) {
            const item = produccionTerminada.find(p => p.id_produccion === parseInt(id));
            if (item) {
                applyProduccionData(item);
            }
        }
    };

    const loadCategorias = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setCategorias(data);
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-capitalizar código
        if (name === 'codigo_usuario') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar archivo
        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setProcessingImage(true);

        try {
            // Comprimir y redimensionar imagen
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 1,
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.95
            });

            setImageFile(optimizedFile);

            // Mostrar preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(optimizedFile);
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            alert('Error al procesar la imagen. Intente con otra imagen.');
        } finally {
            setProcessingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.costo || !formData.precio || !formData.codigo_usuario) {
            alert('Por favor complete los campos obligatorios (*)');
            return;
        }

        try {
            setLoading(true);
            let imageUrl = null;

            // 1. Subir imagen si existe nueva
            if (imageFile) {
                const fileName = `productos_externos/${uuidv4()}_${imageFile.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            } else if (previewUrl && previewUrl.startsWith('http')) {
                // Si ya hay una URL (venida de producción) y no se cambió
                imageUrl = previewUrl;
            }

            // 2. Guardar en Base de Datos
            const productData = {
                ...formData,
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseInt(formData.stock_actual) || 0,
                stock_minimo: 0,
                imagen_url: imageUrl
            };

            await productosExternosDB.create(productData);

            alert('Producto guardado correctamente');
            navigate('/inventario-home');

        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el producto. Verifique que el código no esté duplicado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Nav de Regreso */}
            <div className="bg-white px-4 py-3 border-b border-gray-100">
                <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                    <FaArrowLeft className="mr-2" size={14} />
                    <span className="font-semibold text-sm">Enigma Sistema ERP</span>
                </Link>
            </div>

            {/* Header Sticky */}
            <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>
                <h1 className="text-lg font-semibold text-gray-800">Agregar producto - Stock</h1>
                <div className="w-10"></div>
            </div>

            {/* Scrollable Content */}
            <div className="pb-20">
                <div className="max-w-xl mx-auto px-4 py-3 space-y-3">

                    {/* Botón Nuevo Producto (solo si NO es de producción) */}
                    {!isFromProduction && !showExternalForm && (
                        <div className="flex justify-center py-8">
                            <button
                                onClick={() => setShowExternalForm(true)}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition"
                            >
                                + Nuevo Producto Externo
                            </button>
                        </div>
                    )}

                    {/* Formulario expandido */}
                    {showExternalForm && (
                        <>
                            {/* Badge indicador - Solo mostrar si es de producción */}
                            {isFromProduction && (
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium">
                                        📦 Producto de Producción
                                    </span>
                                </div>
                            )}

                            <div className="h-px bg-gray-200"></div>

                            {/* Info de Producción (si aplica) */}
                            {isFromProduction && produccionInfo && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <h3 className="text-xs font-semibold text-gray-600 mb-2">ℹ️ Origen: Producción Taller</h3>
                                    <div className="text-xs text-gray-600 space-y-0.5">
                                        <p>• ID Producción: #{produccionInfo.id}</p>
                                        <p>• Metal: {produccionInfo.metal}</p>
                                        <p>• Tipo: {produccionInfo.tipo}</p>
                                    </div>
                                </div>
                            )}

                            {/* 1. Información Principal */}
                            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 space-y-2 md:space-y-3">

                                {/* Código con QR */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Código *</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            name="codigo_usuario"
                                            value={formData.codigo_usuario}
                                            onChange={handleChange}
                                            placeholder="Código único"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-gray-400 outline-none"
                                        />
                                        {/* QR Code - más pequeño en mobile */}
                                        <div className="w-12 h-12 md:w-20 md:h-20 bg-white p-1 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {formData.codigo_usuario ? (
                                                <QRCode value={formData.codigo_usuario} size={40} className="w-full h-full" />
                                            ) : (
                                                <FaQrcode className="text-gray-300 text-2xl md:text-3xl" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Nombre */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        disabled={isFromProduction}
                                        placeholder="Descripción o nombre"
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none ${isFromProduction ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                                    />
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                        disabled={isFromProduction}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none ${isFromProduction ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 2. Imagen */}
                            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex justify-center">
                                <div
                                    className="w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <FaCamera size={24} className="mx-auto mb-1" />
                                            <span className="text-xs">Foto</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {/* 3. Stock y Precios */}
                            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Stock Inicial *</label>
                                        <input
                                            type="number"
                                            name="stock_actual"
                                            value={formData.stock_actual}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-semibold focus:ring-2 focus:ring-gray-400 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Costo (S/) *</label>
                                        <input
                                            type="number"
                                            name="costo"
                                            value={formData.costo}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Precio (S/) *</label>
                                        <input
                                            type="number"
                                            name="precio"
                                            value={formData.precio}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none font-bold text-gray-900"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1 text-blue-600">Precio Oferta (S/)</label>
                                        <input
                                            type="number"
                                            name="precio_adicional"
                                            value={formData.precio_adicional}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-blue-200 bg-blue-50/30 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                            step="0.01"
                                            placeholder="Opcional"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Información Adicional (solo para externos) */}
                            {!isFromProduction && (
                                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Información Adicional</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none resize-none"
                                        placeholder="Notas, características, etc."
                                    />
                                </div>
                            )}

                            {/* Botones de Acción - Sticky en mobile */}
                            <div className="sticky bottom-0 bg-gray-50 pt-3 pb-2 space-y-2 -mx-4 px-4 md:static md:bg-transparent md:mx-0 md:px-0">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full bg-gray-600 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm hover:bg-gray-700 transition flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span>Guardando...</span>
                                    ) : (
                                        <>
                                            <FaSave size={14} />
                                            <span>Agregar Producto</span>
                                        </>
                                    )}
                                </button>
                                {!isFromProduction && (
                                    <button
                                        onClick={() => setShowExternalForm(false)}
                                        className="w-full bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProductoForm;
