import React, { useState, useEffect, useRef } from 'react';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { produccionDB } from '../../../utils/produccionNeonClient';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressAndResizeImage, validateImageFile } from '../../../utils/imageOptimizer';
import QRCode from 'react-qr-code';
import { FaTimes, FaCamera, FaBoxOpen, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * StockIngressModal
 * Se muestra SOLO cuando tipo_produccion === 'STOCK' al marcar como terminado.
 *
 * Campos pre-llenados (read-only): nombre, tipo, metal, cantidad, costo.
 * Imagen: si producción ya tiene imagen → se incluye automáticamente (sin campo de subida).
 *         si no tiene → campo opcional de subida.
 * Campos que llena el usuario: código agrupado (PUL020), precio venta, precio oferta.
 */
const StockIngressModal = ({ item, onSuccess, onCancel }) => {
    const [codigo, setCodigo] = useState('');
    const [precio, setPrecio] = useState('');
    const [precioOferta, setPrecioOferta] = useState('');
    const [codigoCheck, setCodigoCheck] = useState(null); // null | 'checking' | { exists, stockActual, nombre, precio }
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [localImageUrl, setLocalImageUrl] = useState(null);
    const fileInputRef = useRef(null);
    const debounceRef = useRef(null);

    const hasProductionImage = !!item?.imagen_url;

    // Auto-uppercase + sin espacios
    const handleCodigoChange = (e) => {
        setCodigo(e.target.value.toUpperCase().replace(/\s/g, ''));
    };

    // Validación en tiempo real del código (debounce 500ms)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!codigo.trim()) { setCodigoCheck(null); return; }

        setCodigoCheck('checking');
        debounceRef.current = setTimeout(async () => {
            try {
                const result = await productosExternosDB.checkCodigo(codigo.trim());
                setCodigoCheck(result);
                // Pre-llenar precio si el grupo ya existe y el campo está vacío
                if (result.exists && result.precio && !precio) {
                    setPrecio(String(parseFloat(result.precio).toFixed(2)));
                }
            } catch {
                setCodigoCheck(null);
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [codigo]);

    // Subida de imagen opcional (solo cuando producción no tiene imagen)
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validation = validateImageFile(file, 5);
        if (!validation.valid) { toast.error(validation.error); return; }

        setUploadingImg(true);
        try {
            const optimized = await compressAndResizeImage(file, { maxSizeMB: 0.5, maxWidth: 1024, quality: 0.8 });
            const fileName = `produccion/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, optimized);
            const url = await getDownloadURL(storageRef);
            setLocalImageUrl(url);
            toast.success('Imagen lista');
        } catch {
            toast.error('Error al subir imagen');
        } finally {
            setUploadingImg(false);
        }
    };

    // Badge de feedback del código
    const renderCodigoFeedback = () => {
        if (!codigo) return null;
        if (codigoCheck === 'checking') return (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                <FaSpinner className="animate-spin" size={10} />
                <span>Verificando...</span>
            </div>
        );
        if (!codigoCheck || codigoCheck === null) return null;
        if (codigoCheck.exists) return (
            <div className="mt-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-start gap-1.5">
                <span className="font-bold flex-shrink-0 mt-0.5">✅</span>
                <span>
                    Grupo <strong>{codigo}</strong> existe · Stock actual: <strong>{codigoCheck.stockActual}u</strong>
                    {' '}→ sumará <strong>{item.cantidad}u</strong> → Total: <strong>{codigoCheck.stockActual + item.cantidad}u</strong>
                </span>
            </div>
        );
        return (
            <div className="mt-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-1.5">
                <span className="flex-shrink-0">🆕</span>
                <span>Código nuevo · se creará el grupo <strong>{codigo}</strong></span>
            </div>
        );
    };

    const handleSubmit = async () => {
        if (!codigo.trim()) { toast.error('El código es obligatorio'); return; }
        if (!precio) { toast.error('El precio de venta es obligatorio'); return; }

        setLoading(true);
        try {
            // 1. Marcar producción como terminada
            await produccionDB.updateEstado(item.id_produccion, 'terminado');

            // 2. Enviar a stock (suma si existe, crea si no)
            const finalImageUrl = item.imagen_url || localImageUrl || null;
            const result = await productosExternosDB.enviarAStock({
                codigo: codigo.trim(),
                cantidad: item.cantidad,
                precio: parseFloat(precio),
                precioReferencial: precioOferta ? parseFloat(precioOferta) : null,
                produccionId: item.id_produccion,
                tipo_producto: item.tipo_producto,
                nombre: item.nombre_producto || `${item.tipo_producto} de ${item.metal}`,
                material: item.metal || '', 
                imagen_url: finalImageUrl,
                costo: parseFloat(item.costo_total_unitario || item.costo_materiales || 0) // Pasar el costo
            });

            // 3. Marcar como transferido en producción
            if (result) {
                await produccionDB.markAsTransferred(item.id_produccion, result.id);
            }

            toast.success(
                `✅ ${codigo} · ${item.tipo_producto || 'Producto'} ingresado al stock`,
                { duration: 4000 }
            );
            onSuccess();
        } catch (error) {
            console.error('Error al ingresar al stock:', error);
            toast.error('Error al ingresar: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    // Solo marcar como terminado, sin pasar al inventario ahora
    const handleTerminarSinStock = async () => {
        setLoading(true);
        try {
            await produccionDB.updateEstado(item.id_produccion, 'terminado');
            toast('Producción terminada. Podés ingresarlo al stock más tarde.', { icon: '📋' });
            onSuccess();
        } catch (error) {
            toast.error('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

                {/* Header con gradiente */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <FaBoxOpen className="text-white/80" size={15} />
                            <span className="text-sm font-semibold text-white tracking-wide">Ingresar al Stock</span>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        >
                            <FaTimes size={15} />
                        </button>
                    </div>
                    {/* Info del producto — pre-llenada */}
                    <p className="text-white font-bold text-base leading-tight">
                        {item.nombre_producto || `${item.tipo_producto} de ${item.metal}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/70 text-xs">
                            {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="text-white/70 text-xs">
                            Costo: S/ {parseFloat(item.costo_total_unitario || item.costo_materiales || 0).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="p-5 space-y-4">

                    {/* IMAGEN: si producción ya tiene → badge informativo, sin campo de subida */}
                    {hasProductionImage ? (
                        <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                                src={item.imagen_url}
                                alt="Producto"
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                            />
                            <div>
                                <p className="text-xs font-medium text-gray-600">Imagen incluida</p>
                                <p className="text-[10px] text-gray-400">Viene automáticamente de producción</p>
                            </div>
                        </div>
                    ) : (
                        /* Sin imagen de producción → campo opcional de subida */
                        <div className="flex items-center gap-3">
                            <div
                                onClick={() => !uploadingImg && fileInputRef.current?.click()}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all flex-shrink-0"
                            >
                                {uploadingImg ? (
                                    <FaSpinner className="animate-spin text-purple-500" size={18} />
                                ) : localImageUrl ? (
                                    <img src={localImageUrl} alt="preview" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <>
                                        <FaCamera size={18} className="text-gray-400 mb-0.5" />
                                        <span className="text-[9px] text-gray-400">Foto</span>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Foto opcional.<br />
                                <span className="text-gray-300">Se usará en el catálogo de inventario.</span>
                            </p>
                        </div>
                    )}

                    {/* Código agrupado + QR */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                            Código agrupado <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-2 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={handleCodigoChange}
                                    placeholder="Ej: PUL020"
                                    autoFocus
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-mono font-bold uppercase tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                                {renderCodigoFeedback()}
                            </div>
                            {/* QR preview reactivo */}
                            <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 p-1.5">
                                {codigo ? (
                                    <QRCode value={codigo} size={40} />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 rounded-lg" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                                Precio venta <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">S/</span>
                                <input
                                    type="number"
                                    value={precio}
                                    onChange={e => setPrecio(e.target.value)}
                                    placeholder="0.00"
                                    step="0.50"
                                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-blue-400 mb-1.5 uppercase tracking-wider">
                                Precio oferta
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">S/</span>
                                <input
                                    type="number"
                                    value={precioOferta}
                                    onChange={e => setPrecioOferta(e.target.value)}
                                    placeholder="Opcional"
                                    step="0.50"
                                    className="w-full pl-7 pr-3 py-2.5 border border-blue-200 bg-blue-50/40 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-2 pt-1">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !codigo.trim() || !precio}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-200 hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <><FaSpinner className="animate-spin" size={13} /> Ingresando...</>
                                : <><FaBoxOpen size={13} /> Ingresar al Stock</>
                            }
                        </button>
                        <button
                            onClick={handleTerminarSinStock}
                            disabled={loading}
                            className="w-full py-2 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Solo marcar como terminado · ingresar al stock después
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockIngressModal;
