import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'react-qr-code';
import { FaCamera, FaSave, FaTimes, FaQrcode } from 'react-icons/fa';
import { compressAndResizeImage, validateImageFile } from '../../../utils/imageOptimizer';

const ProductoEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [processingImage, setProcessingImage] = useState(false);
    const [categorias, setCategorias] = useState([]);

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
        origen: 'COMPRA'
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setFetching(true);
            const [productData, categoriasData] = await Promise.all([
                productosExternosDB.getById(id),
                tiposProductoDB.getAll()
            ]);

            setCategorias(categoriasData);

            if (productData) {
                setFormData({
                    nombre: productData.nombre || '',
                    costo: productData.costo || '',
                    precio: productData.precio || '',
                    codigo_usuario: productData.codigo_usuario || '',
                    stock_actual: productData.stock_actual || 0,
                    stock_minimo: productData.stock_minimo || 0,
                    unidad: productData.unidad || 'UND',
                    categoria: productData.categoria || '',
                    descripcion: productData.descripcion || '',
                    precio_adicional: productData.precio_adicional || '',
                    origen: productData.origen || 'COMPRA'
                });
                setPreviewUrl(productData.imagen_url);
            } else {
                alert('Producto no encontrado');
                navigate('/inventario');
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar el producto');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

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

        if (!formData.nombre || !formData.costo || !formData.precio || !formData.codigo_usuario) {
            alert('Por favor complete los campos obligatorios (*)');
            return;
        }

        try {
            setLoading(true);
            let imageUrl = previewUrl; // Mantener URL actual por defecto

            // 1. Subir nueva imagen si se seleccionó
            if (imageFile) {
                const fileName = `productos_externos/${uuidv4()}_${imageFile.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            // 2. Actualizar en Base de Datos
            const productData = {
                ...formData,
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseInt(formData.stock_actual) || 0,
                stock_minimo: parseInt(formData.stock_minimo) || 0,
                precio_adicional: formData.precio_adicional ? parseFloat(formData.precio_adicional) : null,
                imagen_url: imageUrl,
                origen: formData.origen
            };

            await productosExternosDB.update(id, productData);

            alert('Producto actualizado correctamente');
            navigate('/inventario'); // Volver al reporte

        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar el producto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-500">Cargando producto...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Sticky */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/inventario')}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Editar Producto</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-2xl mx-auto px-4 space-y-6">

                {/* 1. Información Principal */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Costo (S/) *</label>
                            <div>
                                <input
                                    type="number"
                                    name="costo"
                                    value={formData.costo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Precio Venta (S/) *</label>
                            <div>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Imagen Central */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div
                        className="w-48 h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer relative overflow-hidden group hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                <FaCamera size={40} className="mx-auto mb-3" />
                                <span className="text-sm font-medium">Cambiar Foto</span>
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
                    <p className="text-xs text-gray-500 mt-2">Haz clic para cambiar la imagen</p>
                </div>

                {/* 3. Identificación y QR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-start space-x-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código / Clave *</label>
                            <input
                                type="text"
                                name="codigo_usuario"
                                value={formData.codigo_usuario}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-lg uppercase tracking-wider text-gray-900"
                            />
                        </div>

                        {/* QR Preview */}
                        <div className="flex flex-col items-center pt-1">
                            <div className="w-28 h-28 bg-white p-2 border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                                {formData.codigo_usuario ? (
                                    <QRCode value={formData.codigo_usuario} size={100} />
                                ) : (
                                    <FaQrcode className="text-gray-300 text-5xl" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Stock e Inventario */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Actual</label>
                            <input
                                type="number"
                                name="stock_actual"
                                value={formData.stock_actual}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center font-semibold text-lg text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                            <input
                                type="number"
                                name="stock_minimo"
                                value={formData.stock_minimo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Clasificación y Detalles */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">-- Seleccionar --</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Información Adicional</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Origen</label>
                        <div className="flex space-x-3">
                            <label className={`cursor-pointer group relative flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium transition-all ${formData.origen === 'COMPRA' ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="origen"
                                    value="COMPRA"
                                    checked={formData.origen === 'COMPRA'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span>Compra / Externo</span>
                            </label>

                            <label className={`cursor-pointer group relative flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-medium transition-all ${formData.origen === 'PRODUCCION' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}>
                                <input
                                    type="radio"
                                    name="origen"
                                    value="PRODUCCION"
                                    checked={formData.origen === 'PRODUCCION'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span>Producción Taller</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Precios Adicionales (S/) (Liquidación)</label>
                        <div>
                            <input
                                type="number"
                                name="precio_adicional"
                                value={formData.precio_adicional}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Botón Final */}
                <div className="pt-4 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <span>Guardando...</span>
                        ) : (
                            <>
                                <FaSave size={24} />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProductoEdit;
