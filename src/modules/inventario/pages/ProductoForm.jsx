import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'react-qr-code';
import { FaCamera, FaSave, FaTimes, FaQrcode } from 'react-icons/fa';

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
    const [categorias, setCategorias] = useState([]);
    const [produccionTerminada, setProduccionTerminada] = useState([]);
    const [selectedProduccion, setSelectedProduccion] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        costo: '',
        precio: '',
        codigo_usuario: '',
        stock_actual: '',
        stock_minimo: '',
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

    useEffect(() => {
        loadCategorias();
        loadProduccionTerminada();
    }, []);

    // Efecto para manejar datos que vienen desde el botón de Producción
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

        // Generar código único basado en el tipo y timestamp
        const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
        const tipoPrefix = item.tipo_producto.substring(0, 3).toUpperCase();
        const codigoUnico = `${tipoPrefix}${timestamp}`;

        setFormData(prev => ({
            ...prev,
            nombre: item.nombre_producto || `${item.tipo_producto} de ${item.metal}`,
            costo: item.costo_total_unitario ? parseFloat(item.costo_total_unitario).toFixed(2) : '',
            stock_actual: item.cantidad,
            categoria: mapTipoToCategoria(item.tipo_producto), // Auto-mapear categoría
            descripcion: `Producto fabricado en taller. Metal: ${item.metal}. Tipo: ${item.tipo_producto}.`,
            origen: 'PRODUCCION',
            codigo_usuario: codigoUnico // Código único autogenerado
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.costo || !formData.precio || !formData.codigo_usuario) {
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
                stock_minimo: parseInt(formData.stock_minimo) || 0,
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Sticky */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>
                <h1 className="text-lg font-semibold text-gray-800">Agregar Producto</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-2xl mx-auto px-4 space-y-4">

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
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    disabled={isFromProduction}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none ${isFromProduction ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="space-y-3">
                                {/* Código con QR */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Código *</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            name="codigo_usuario"
                                            value={formData.codigo_usuario}
                                            onChange={handleChange}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-gray-400 outline-none"
                                        />
                                        {/* QR Code - más pequeño en mobile */}
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white p-1 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {formData.codigo_usuario ? (
                                                <QRCode value={formData.codigo_usuario} size={56} className="w-full h-full" />
                                            ) : (
                                                <FaQrcode className="text-gray-300 text-2xl md:text-3xl" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Categoría */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoría</label>
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
                        </div>

                        {/* 2. Imagen */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-center">
                            <div
                                className="w-32 h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all"
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
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock Inicial *</label>
                                    <input
                                        type="number"
                                        name="stock_actual"
                                        value={formData.stock_actual}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-semibold focus:ring-2 focus:ring-gray-400 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        name="stock_minimo"
                                        value={formData.stock_minimo}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-gray-400 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Costo (S/) *</label>
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
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Precio (S/) *</label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Precio Oferta (S/)</label>
                                <input
                                    type="number"
                                    name="precio_adicional"
                                    value={formData.precio_adicional}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none"
                                    step="0.01"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        {/* 4. Información Adicional (solo para externos) */}
                        {!isFromProduction && (
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Información Adicional</label>
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

                        {/* Botones de Acción */}
                        <div className="space-y-2 pt-2">
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
    );
};

export default ProductoForm;
