import React, { useState, useEffect } from 'react';
import { FaTimes, FaQrcode, FaDice } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { productosExternosDB } from '../utils/productosExternosNeonClient';
import { produccionDB } from '../utils/produccionNeonClient';

const IngresarAlmacenModal = ({ isOpen, onClose, produccionData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        codigo: '',
        stockMinimo: '1',
        precioVenta: '',
        precioOferta: '',
        stockInicial: '1',
        notas: ''
    });

    // Resetear formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen && produccionData) {
            // Sugerir precio de venta (costo × 2.5)
            const costoProduccion = parseFloat(produccionData.costo_total_unitario) || 0;
            const precioSugerido = (costoProduccion * 2.5).toFixed(2);

            setFormData({
                codigo: '',
                stockMinimo: '1',
                precioVenta: precioSugerido,
                precioOferta: '',
                stockInicial: '1',
                notas: ''
            });
        }
    }, [isOpen, produccionData]);

    if (!isOpen || !produccionData) return null;

    const costoProduccion = parseFloat(produccionData.costo_total_unitario) || 0;
    const precioVenta = parseFloat(formData.precioVenta) || 0;
    const ganancia = precioVenta - costoProduccion;
    const margenPorcentaje = costoProduccion > 0 ? ((ganancia / costoProduccion) * 100).toFixed(0) : 0;

    // Determinar color del margen
    let margenColor = 'text-gray-400';
    if (precioVenta < costoProduccion) {
        margenColor = 'text-red-600';
    } else if (margenPorcentaje < 50) {
        margenColor = 'text-yellow-600';
    } else {
        margenColor = 'text-green-600';
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Convertir código a MAYÚSCULAS automáticamente
        if (name === 'codigo') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const generarCodigoAutomatico = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        const codigo = `PROD-${year}-${random}`;
        setFormData(prev => ({ ...prev, codigo }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!formData.codigo.trim()) {
            toast.error('Por favor ingrese un código para el producto');
            return;
        }

        if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
            toast.error('Por favor ingrese un precio de venta válido');
            return;
        }

        // Warning si precio < costo (no bloqueante)
        if (precioVenta < costoProduccion) {
            const confirmar = confirm(
                `⚠️ ADVERTENCIA: El precio de venta (S/ ${precioVenta.toFixed(2)}) es menor que el costo de producción (S/ ${costoProduccion.toFixed(2)}).\n\n¿Desea continuar de todos modos?`
            );
            if (!confirmar) return;
        }

        // Validar precio oferta
        if (formData.precioOferta && parseFloat(formData.precioOferta) >= precioVenta) {
            toast.error('El precio de oferta debe ser menor que el precio de venta');
            return;
        }

        try {
            setLoading(true);

            // Crear producto en inventario (sin validar código único)
            const productoData = {
                codigo_usuario: formData.codigo,
                nombre: produccionData.nombre_producto,
                categoria: mapTipoToCategoria(produccionData.tipo_producto),
                descripcion: formData.notas || `Producto fabricado en taller. Metal: ${produccionData.metal}. Tipo: ${produccionData.tipo_producto}.`,
                costo: costoProduccion,
                precio: parseFloat(formData.precioVenta),
                precio_adicional: formData.precioOferta && formData.precioOferta.trim() !== '' ? parseFloat(formData.precioOferta) : null,
                stock_actual: parseInt(formData.stockInicial) || 1,
                stock_minimo: parseInt(formData.stockMinimo) || 1,
                unidad: 'UND',
                imagen_url: produccionData.imagen_url || null,
                origen: 'PRODUCCION',
                produccion_id: produccionData.id_produccion
            };

            console.log('📦 Datos a enviar:', productoData);

            const nuevoProducto = await productosExternosDB.create(productoData);
            console.log('✅ Producto creado:', nuevoProducto);

            // 3. Actualizar producción como transferida
            await produccionDB.markAsTransferred(produccionData.id_produccion, nuevoProducto.id);
            console.log('✅ Producción marcada como transferida');

            // 4. Notificar éxito
            toast.success(`✅ Producto "${formData.codigo}" ingresado al inventario`, {
                duration: 4000,
                icon: '📦'
            });

            // 5. Llamar callback de éxito y cerrar modal
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error('❌ Error completo:', error);
            console.error('❌ Mensaje:', error.message);
            console.error('❌ Stack:', error.stack);
            toast.error(`Error: ${error.message || 'No se pudo transferir el producto'}`, {
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">📦 Ingresar Producto a Almacén</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Datos Pre-cargados (Solo lectura) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                        <div className="flex gap-3">
                            {produccionData.imagen_url && (
                                <img
                                    src={produccionData.imagen_url}
                                    alt={produccionData.nombre_producto}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{produccionData.nombre_producto}</h3>
                                <p className="text-xs text-gray-600">Metal: {produccionData.metal} | Tipo: {produccionData.tipo_producto}</p>
                                <p className="text-sm font-medium text-gray-700 mt-1">Costo de Producción: S/ {costoProduccion.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* Información Comercial y Logística */}
                    <h3 className="text-sm font-semibold text-gray-700">Información Comercial y Logística</h3>

                    {/* Código / QR */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Código / QR *</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-400 outline-none"
                                placeholder="Ej: PROD-2025-0001"
                                required
                            />
                            <button
                                type="button"
                                onClick={generarCodigoAutomatico}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1 text-sm"
                                title="Generar código automático"
                            >
                                <FaDice size={14} />
                                Auto
                            </button>
                            {/* QR Preview */}
                            <div className="w-16 h-16 bg-white p-1 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                {formData.codigo ? (
                                    <QRCode value={formData.codigo} size={56} />
                                ) : (
                                    <FaQrcode className="text-gray-300 text-2xl" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stock Mínimo */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Stock Mínimo *
                            <span className="text-gray-500 font-normal ml-1">(Para alertas)</span>
                        </label>
                        <input
                            type="number"
                            name="stockMinimo"
                            value={formData.stockMinimo}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />
                    </div>

                    {/* Precio de Venta */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Precio de Venta (S/) *</label>
                        <input
                            type="number"
                            name="precioVenta"
                            value={formData.precioVenta}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />
                        {/* Indicador de Margen */}
                        {formData.precioVenta && (
                            <p className={`text-xs mt-1.5 font-medium ${margenColor}`}>
                                💡 Margen: {margenPorcentaje > 0 ? '+' : ''}{margenPorcentaje}% (S/ {ganancia.toFixed(2)} ganancia)
                            </p>
                        )}
                    </div>

                    {/* Precio Oferta */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Precio Oferta (S/)
                            <span className="text-gray-500 font-normal ml-1">(Opcional)</span>
                        </label>
                        <input
                            type="number"
                            name="precioOferta"
                            value={formData.precioOferta}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            placeholder="Opcional"
                        />
                    </div>

                    {/* Stock Inicial */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Stock Inicial</label>
                        <input
                            type="number"
                            name="stockInicial"
                            value={formData.stockInicial}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Notas Adicionales */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Notas Adicionales</label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                            placeholder="Ej: Edición limitada, incluye caja de regalo..."
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Ingresar a Almacén'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper para mapear tipo de producto a categoría
const mapTipoToCategoria = (tipoProducto) => {
    if (!tipoProducto) return '';
    const tipo = tipoProducto.toLowerCase();
    if (tipo.includes('arete')) return 'ARETE';
    if (tipo.includes('pulsera')) return 'PULSERA';
    if (tipo.includes('anillo')) return 'ANILLO';
    if (tipo.includes('collar')) return 'COLLAR';
    return '';
};

export default IngresarAlmacenModal;
