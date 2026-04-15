import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'react-qr-code';
import { FaCamera, FaSave, FaTimes, FaQrcode, FaArrowLeft, FaDownload, FaPrint, FaRandom, FaStore, FaTools } from 'react-icons/fa';
import { compressAndResizeImage, validateImageFile } from '../../../utils/imageOptimizer';

const METALES = ['Plata', 'Alpaca', 'Cobre', 'Bronce', 'Bisutería'];

// Helper para mapear tipo de producto a categoría aproximada si fuera necesario
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
    const fileInputRef = useRef(null);
    const qrRef = useRef(null);
    const [loading, setLoading] = useState(false);
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
        lote: '',
        origen: 'INV_COMPRA' // 'INV_COMPRA' O 'INV_TALLER'
    });

    useEffect(() => {
        loadCategorias();
    }, []);

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
        let updateData = { [name]: value };

        if (name === 'codigo_usuario') {
            updateData[name] = value.toUpperCase();
            if (value.includes('-L')) {
                const parts = value.split('-L');
                if (parts.length > 1) {
                    updateData.lote = 'L' + parts[parts.length - 1].split('-')[0].toUpperCase();
                }
            }
        }
        
        if (name === 'lote') {
            updateData[name] = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, ...updateData }));
    };

    const generarCodigoUnico = async () => {
        if (!formData.categoria || !formData.material) {
            alert('Por favor selecciona Categoría y Material primero para calcular el lote correcto.');
            return;
        }
        
        try {
            const data = await productosExternosDB.getNextLote(formData.categoria, formData.material);
            setFormData(prev => ({
                ...prev,
                codigo_usuario: data.codigoUnico,
                lote: data.nextLote
            }));
        } catch (error) {
            console.error('Error obteniendo lote:', error);
            alert('Error al generar el código.');
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
                maxWidth: 1200,
                maxHeight: 1200,
                quality: 0.95
            });

            setImageFile(optimizedFile);

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

    const downloadQR = () => {
        const svg = qrRef.current.querySelector("svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 20, 20);
            
            const pngFile = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.download = `QR_${formData.codigo_usuario || 'Producto'}.png`;
            a.href = pngFile;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const printQR = () => {
        const svg = qrRef.current.querySelector("svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        
        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir QR - ${formData.codigo_usuario}</title>
                    <style>
                        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fff; }
                        .qr-container { width: 3cm; height: 3cm; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #ccc; padding: 0.2cm; box-sizing: border-box; }
                        .qr-code { width: 2.2cm; height: 2.2cm; }
                        .qr-text { font-family: monospace; font-size: 8px; font-weight: bold; margin-top: 2px; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <div class="qr-code">
                            ${svgData}
                        </div>
                        <div class="qr-text">${formData.codigo_usuario || 'SIN-COD'}</div>
                    </div>
                    <script>
                        // Ajustar viewBox del SVG para que se escale
                        const svgElement = document.querySelector('svg');
                        if(svgElement) {
                            svgElement.style.width = '100%';
                            svgElement.style.height = '100%';
                        }
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.costo || !formData.precio || !formData.codigo_usuario) {
            alert('Por favor complete los campos obligatorios (*). El código es obligatorio.');
            return;
        }

        try {
            setLoading(true);
            let imageUrl = null;

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
                imagen_url: imageUrl,
                lote: formData.lote || null
            };

            await productosExternosDB.create(productData);

            alert('Producto de Inventario Inicial guardado correctamente.');
            navigate('/inventario-home');

        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el producto. Verifique que el código no esté duplicado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Nav de Regreso */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <Link to="/inventario-home" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                    <FaArrowLeft className="mr-2" size={14} />
                    <span className="font-semibold text-sm">Regresar</span>
                </Link>
                <h1 className="text-lg font-bold text-gray-800">Inventario Inicial</h1>
                <div className="w-20"></div> {/* Spacer for centering */}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto pb-24">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                    
                    {/* Header Info */}
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-black text-gray-900">Registrar Producto</h2>
                        <p className="text-sm text-gray-500 mt-1">Añade stock directamente al inventario general</p>
                    </div>

                    {/* SECCIÓN: PROCEDENCIA */}
                    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Origen del Producto</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`
                                relative p-4 border-2 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all
                                ${formData.origen === 'INV_TALLER' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}
                            `}>
                                <input 
                                    type="radio" 
                                    name="origen" 
                                    value="INV_TALLER" 
                                    checked={formData.origen === 'INV_TALLER'}
                                    onChange={handleChange}
                                    className="hidden" 
                                />
                                <FaTools className={`text-2xl mb-2 ${formData.origen === 'INV_TALLER' ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className={`font-semibold text-sm ${formData.origen === 'INV_TALLER' ? 'text-blue-900' : 'text-gray-600'}`}>Taller / Producción</span>
                                <span className="text-[10px] text-gray-500 mt-1">Fabricado interno pero nunca ingresado al sistema</span>
                            </label>
                            
                            <label className={`
                                relative p-4 border-2 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all
                                ${formData.origen === 'INV_COMPRA' ? 'border-green-600 bg-green-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}
                            `}>
                                <input 
                                    type="radio" 
                                    name="origen" 
                                    value="INV_COMPRA" 
                                    checked={formData.origen === 'INV_COMPRA'}
                                    onChange={handleChange}
                                    className="hidden" 
                                />
                                <FaStore className={`text-2xl mb-2 ${formData.origen === 'INV_COMPRA' ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={`font-semibold text-sm ${formData.origen === 'INV_COMPRA' ? 'text-green-900' : 'text-gray-600'}`}>Mercadería Externa</span>
                                <span className="text-[10px] text-gray-500 mt-1">Comprado directamente a proveedores</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* COLUMNA IZQUIERDA: FOTO, QR */}
                        <div className="md:col-span-4 space-y-4">
                            {/* IMAGEN */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 w-full text-center">Fotografía</h3>
                                <div
                                    className="w-48 h-48 sm:w-full sm:h-56 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden relative group"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaCamera className="text-white text-2xl mb-2" />
                                                <span className="text-white text-xs font-medium">Cambiar foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400 group-hover:text-blue-500 flex flex-col items-center">
                                            {processingImage ? (
                                                <span className="text-sm font-medium animate-pulse">Procesando...</span>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                                                        <FaCamera size={20} />
                                                    </div>
                                                    <span className="text-xs font-semibold uppercase tracking-wider">Subir Foto</span>
                                                </>
                                            )}
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

                            {/* QR CODE */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 w-full text-center">Código QR</h3>
                                <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-inner max-w-fit" ref={qrRef}>
                                    {formData.codigo_usuario ? (
                                        <QRCode value={formData.codigo_usuario} size={150} level="M" />
                                    ) : (
                                        <div className="w-[150px] h-[150px] flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                                            <FaQrcode className="text-gray-300 text-4xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 text-center w-full">
                                    <p className="font-mono font-bold text-gray-800 text-sm tracking-wider">
                                        {formData.codigo_usuario || 'AÚN NO DEFINIDO'}
                                    </p>
                                </div>
                                
                                {formData.codigo_usuario && (
                                    <div className="grid grid-cols-2 gap-2 w-full mt-4">
                                        <button 
                                            type="button"
                                            onClick={downloadQR}
                                            className="py-2 flex justify-center items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            <FaDownload size={12} /> Descargar
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={printQR}
                                            className="py-2 flex justify-center items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            <FaPrint size={12} /> Imprimir 3x3
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: DATOS */}
                        <div className="md:col-span-8 space-y-5">
                            
                            {/* CODIGO Y NOMBRE */}
                            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Identificación</h3>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Código SKU *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="codigo_usuario"
                                            value={formData.codigo_usuario}
                                            onChange={handleChange}
                                            placeholder="Ej: AN-ALP-L001"
                                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={generarCodigoUnico}
                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                                            title="Autogenerar código de lote"
                                        >
                                            <FaRandom /> Auto Lote
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Opcional. Ej: Aretes con Piedra Luna"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Categoría</label>
                                        <select
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Material / Metal</label>
                                        <select
                                            name="material"
                                            value={formData.material}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {METALES.map(metal => (
                                                <option key={metal} value={metal}>{metal}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2 pt-2 border-t border-gray-100/50">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Lote (Opcional, manual si no autogeneras)</label>
                                        <input
                                            type="text"
                                            name="lote"
                                            value={formData.lote}
                                            onChange={handleChange}
                                            placeholder="Ej: L001"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* CANTIDADES Y PRECIOS */}
                            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Stock y Finanzas</h3>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Stock Inicial *</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="stock_actual"
                                                value={formData.stock_actual}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-lg text-center font-black focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-2 hidden sm:block"></div> {/* Espaciador visible solo en desktop */}

                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-1.5">Costo Unit. <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">S/</span>
                                            <input
                                                type="number"
                                                name="costo"
                                                value={formData.costo}
                                                onChange={handleChange}
                                                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none font-semibold text-gray-700"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="flex items-center gap-1 text-xs font-bold text-blue-700 mb-1.5">Venta <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-blue-500 font-bold">S/</span>
                                            <input
                                                type="number"
                                                name="precio"
                                                value={formData.precio}
                                                onChange={handleChange}
                                                className="w-full pl-8 pr-3 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none font-bold text-blue-800"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 sm:col-span-2">
                                        <label className="flex items-center gap-1 text-xs font-bold text-orange-600 mb-1.5">Precio Oferta / Liq.</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-orange-500 font-bold">S/</span>
                                            <input
                                                type="number"
                                                name="precio_adicional"
                                                value={formData.precio_adicional}
                                                onChange={handleChange}
                                                className="w-full pl-8 pr-3 py-2.5 bg-orange-50/30 border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors outline-none text-orange-800"
                                                step="0.01"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* NOTAS */}
                            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Notas / Características</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors outline-none resize-none"
                                    placeholder="Describe detalles extra, variaciones, etc."
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BAR STICKY BOTTOM */}
            <div className="fixed bottom-0 left-0 right-0 md:pl-64 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20">
                <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="w-full sm:w-1/3 text-center px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full sm:w-2/3 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98]"
                    >
                        {loading ? (
                            <span>Guardando e iniciando stock...</span>
                        ) : (
                            <>
                                <FaSave size={16} /> Incorporar al Inventario
                            </>
                        )}
                    </button>
                </div>
            </div>
            
        </div>
    );
};

export default ProductoForm;
