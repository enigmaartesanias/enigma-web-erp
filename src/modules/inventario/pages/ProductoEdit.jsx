import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { produccionDB } from '../../../utils/produccionNeonClient';
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
        unidad: 'UND',
        categoria: '',
        material: '',
        descripcion: '',
        precio_adicional: '',
        origen: 'COMPRA',
        produccion_id: null
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
                let currentMaterial = productData.material || '';

                // Si es de producción y no tiene material, intentar recuperarlo del registro original
                if (productData.origen === 'PRODUCCION' && !currentMaterial && productData.produccion_id) {
                    try {
                        const originalProd = await produccionDB.getById(productData.produccion_id);
                        if (originalProd && originalProd.metal) {
                            currentMaterial = originalProd.metal;
                        }
                    } catch (err) {
                        console.error('Error recuperando metal de producción:', err);
                    }
                }

                setFormData({
                    nombre: productData.nombre || '',
                    costo: productData.costo || '',
                    precio: productData.precio || '',
                    codigo_usuario: productData.codigo_usuario || '',
                    stock_actual: productData.stock_actual || 0,
                    unidad: productData.unidad || 'UND',
                    categoria: productData.categoria || '',
                    material: currentMaterial,
                    descripcion: productData.descripcion || '',
                    precio_adicional: productData.precio_adicional || '',
                    origen: productData.origen || 'COMPRA',
                    produccion_id: productData.produccion_id || null
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

        const validation = validateImageFile(file, 5);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setProcessingImage(true);

        try {
            const optimizedFile = await compressAndResizeImage(file, {
                maxSizeMB: 1,
                maxWidth: 1000,
                maxHeight: 1000,
                quality: 0.8
            });

            setImageFile(optimizedFile);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(optimizedFile);
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            alert('Error al procesar la imagen.');
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
            let imageUrl = previewUrl;

            if (imageFile) {
                const fileName = `productos_externos/${uuidv4()}_${imageFile.name}`;
                const storageRef = ref(storage, fileName);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const productData = {
                ...formData,
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseInt(formData.stock_actual) || 0,
                stock_minimo: 0,
                precio_adicional: formData.precio_adicional ? parseFloat(formData.precio_adicional) : null,
                imagen_url: imageUrl,
                material: formData.material
            };

            await productosExternosDB.update(id, productData);

            // Si es de producción, actualizar también la imagen en el registro original
            if (formData.origen === 'PRODUCCION' && formData.produccion_id && imageUrl !== previewUrl) {
                try {
                    const prodRecord = await produccionDB.getById(formData.produccion_id);
                    if (prodRecord) {
                        await produccionDB.update(formData.produccion_id, {
                            ...prodRecord,
                            imagen_url: imageUrl
                        });
                    }
                } catch (err) {
                    console.error('Error sincronizando con producción:', err);
                }
            }

            alert('Producto actualizado correctamente');
            navigate('/inventario');

        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar el producto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadQR = () => {
        const svgElement = document.getElementById('qr-svg-component');
        if (!svgElement) return;

        const canvas = document.createElement('canvas');
        const size = 354; // Equivalente aprox a 3x3 cm a 300 DPI
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        // Convertir el SVG generado
        const xml = new XMLSerializer().serializeToString(svgElement);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const image64 = 'data:image/svg+xml;base64,' + svg64;

        const img = new Image();
        img.onload = () => {
            const qrSize = 250;
            const x = (size - qrSize) / 2;
            const y = 30;

            ctx.drawImage(img, x, y, qrSize, qrSize);

            // Añadir texto SKU en la zona inferior
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(formData.codigo_usuario, size / 2, size - 40);

            // Ejecutar la descarga
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `QR_${formData.codigo_usuario}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        img.src = image64;
    };


    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-500 italic">Cargando información...</div>
            </div>
        );
    }

    const isFromProduction = formData.origen === 'PRODUCCION';

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate('/inventario')}
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>
                <h1 className="text-lg font-bold text-gray-800">
                    {isFromProduction ? 'Ficha de Producción' : 'Editar Producto'}
                </h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-xl mx-auto px-4 space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
                        <div
                            className="w-32 h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-blue-400"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <FaCamera size={30} className="text-gray-300" />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] py-1 text-center font-bold">EDITAR FOTO</div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        <span className="text-[10px] text-gray-400 mt-2 font-medium">REPRESENTATIVO</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-white p-2 border border-blue-50 rounded-lg flex items-center justify-center flex-col shadow-sm">
                            {formData.codigo_usuario ? (
                                <div id="qr-svg-wrapper">
                                    <QRCode id="qr-svg-component" value={formData.codigo_usuario} size={100} />
                                </div>
                            ) : (
                                <FaQrcode className="text-gray-200 text-5xl" />
                            )}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-2 font-mono font-bold uppercase tracking-widest">{formData.codigo_usuario}</span>
                        
                        {formData.codigo_usuario && (
                            <div className="flex gap-2 mt-3">
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleDownloadQR(); }} 
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-[10px] font-bold rounded flex items-center transition"
                                >
                                    Descargar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre del Producto</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                disabled={isFromProduction}
                                className={`w-full px-3 py-2 border rounded-lg text-sm transition-all outline-none ${isFromProduction ? 'bg-gray-50 text-gray-600 border-gray-100 font-medium' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'}`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de Producto</label>
                            {isFromProduction ? (
                                <div className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-600 font-medium uppercase">
                                    {formData.categoria}
                                </div>
                            ) : (
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {categorias.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Material / Metal</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                disabled={isFromProduction}
                                placeholder=""
                                className={`w-full px-3 py-2 border rounded-lg text-sm transition-all outline-none ${isFromProduction ? 'bg-gray-50 text-gray-600 border-gray-100 font-medium' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Código SKU</label>
                            <input
                                type="text"
                                name="codigo_usuario"
                                value={formData.codigo_usuario}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg text-sm font-mono transition-all outline-none border-gray-300 focus:ring-1 focus:ring-blue-500 uppercase`}
                                placeholder="Escribe el código..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stock Actual</label>
                            <input
                                type="number"
                                name="stock_actual"
                                value={formData.stock_actual}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-center focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Costo Total (S/)</label>
                            <input
                                type="number"
                                name="costo"
                                value={formData.costo}
                                onChange={handleChange}
                                disabled={isFromProduction}
                                className={`w-full px-3 py-2 border rounded-lg text-center text-sm transition-all outline-none ${isFromProduction ? 'bg-gray-50 text-gray-500 border-gray-100 font-mono' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Precio Venta</label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-blue-200 bg-blue-50/30 rounded-lg text-center text-sm font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio Miembro / Liq. (S/)</label>
                        <input
                            type="number"
                            name="precio_adicional"
                            value={formData.precio_adicional}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Información Adicional</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        disabled={isFromProduction}
                        rows="2"
                        className={`w-full px-3 py-2 border rounded-lg text-xs transition-all outline-none resize-none ${isFromProduction ? 'bg-gray-50 text-gray-500 border-gray-100 italic' : 'border-gray-300 focus:ring-1 focus:ring-blue-500'}`}
                        placeholder="Sin notas añadidas..."
                    />
                </div>

                <div className="pt-4 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-blue-200"
                    >
                        {loading ? (
                            <span>Actualizando...</span>
                        ) : (
                            <>
                                <FaSave size={24} />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                    {isFromProduction && (
                        <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-tighter">
                            * Los cambios de imagen se reflejarán también en el reporte de producción
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProductoEdit;
