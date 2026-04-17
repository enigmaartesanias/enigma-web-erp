import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { ArrowLeft, Share2, Calculator, X, Info } from 'lucide-react';

const CotizadorAutor = () => {
    const previewRef = useRef(null);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        nombreCliente: '',
        tipoProducto: 'Anillo',
        detallesDiseno: '',
        piedrasGemas: '',
        costoMateriales: 0,
        costoManoObra: 0,
        dificultad: 'Media',
        tiempoEstimado: '10 a 15 días hábiles',
        costoEnvio: 0,
        precioFinal: 0,
        margenDeseado: 2.5 // Multiplicador base (ej. Costo x 2.5)
    });

    // Lógica de Negocio: Cálculo de Precio Sugerido
    const calcularSugerido = () => {
        const base = (Number(formData.costoMateriales) + Number(formData.costoManoObra));
        const factorDificultad = formData.dificultad === 'Alta' ? 1.20 : 1.0;
        const sugerido = (base * formData.margenDeseado * factorDificultad) + Number(formData.costoEnvio);
        return Math.ceil(sugerido);
    };

    // Actualizar precio final automáticamente cuando cambien los costos
    useEffect(() => {
        const sugerido = calcularSugerido();
        setFormData(prev => ({ ...prev, precioFinal: sugerido }));
    }, [formData.costoMateriales, formData.costoManoObra, formData.dificultad, formData.costoEnvio]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['costoMateriales', 'costoManoObra', 'costoEnvio', 'precioFinal', 'margenDeseado'].includes(name)
                ? (value === '' ? 0 : parseFloat(value))
                : value
        }));
    };

    // Cálculos Internos de "Hombre Orquesta" (No se muestran al cliente)
    const reposicionMaterial = (formData.costoMateriales * 1.1).toFixed(2); // +10% merma
    const fondoAlquiler = (formData.precioFinal * 0.10).toFixed(2); // 10% para el activo/tienda

    const captureImage = async () => {
        if (!previewRef.current) return;
        try {
            const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], `Cotizacion_${formData.nombreCliente.replace(/\s+/g, '_') || 'Cliente'}.jpg`, { type: 'image/jpeg' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `Cotización - ${formData.tipoProducto}`,
                        text: `Hola ${formData.nombreCliente}, aquí tienes el detalle de tu pieza de autor.`
                    });
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = file.name;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            }, 'image/jpeg', 1.0);
        } catch (error) {
            console.error('Error generando imagen:', error);
        }
    };

    const fechaActual = new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

    return (
        <div className="min-h-screen bg-[#F9F8F6] p-4 lg:p-8 font-sans pb-24 text-gray-800">
            <div className="max-w-2xl mx-auto">
                <Link to="/inventario-home" className="inline-flex items-center text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 mb-6 transition-colors font-semibold">
                    <ArrowLeft size={14} className="mr-2" /> Volver al Panel
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-light tracking-tight text-gray-900">Cotizador de <span className="font-semibold text-indigo-600">Autor</span></h2>
                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">Gestión de piezas únicas v2.0</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-2xl">
                                <Calculator size={24} className="text-stone-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Sección Cliente */}
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-indigo-500 transition-colors">Cliente Destino</label>
                                    <input type="text" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} className="w-full bg-stone-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" placeholder="Nombre completo..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Joya</label>
                                        <select name="tipoProducto" value={formData.tipoProducto} onChange={handleChange} className="w-full bg-stone-50 border-none rounded-xl p-3 text-sm outline-none">
                                            <option>Anillo</option>
                                            <option>Collar</option>
                                            <option>Pulsera</option>
                                            <option>Aretes</option>
                                            <option>Dije</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Complejidad</label>
                                        <select name="dificultad" value={formData.dificultad} onChange={handleChange} className="w-full bg-stone-50 border-none rounded-xl p-3 text-sm outline-none">
                                            <option value="Media">Media (Estándar)</option>
                                            <option value="Alta">Alta (+20% Tiempo)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Especificaciones de Diseño</label>
                                    <textarea name="detallesDiseno" value={formData.detallesDiseno} onChange={handleChange} rows="2" className="w-full bg-stone-50 border-none rounded-xl p-3 text-sm outline-none resize-none" placeholder="Talla, acabados, texturizados..."></textarea>
                                </div>

                                {/* Sección Costos Internos */}
                                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                                    <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <Info size={12} /> Análisis de Costos (Interno)
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <span className="block text-[9px] text-indigo-400 mb-1">Materiales</span>
                                            <input type="number" name="costoMateriales" value={formData.costoMateriales || ''} onChange={handleChange} className="w-full bg-white border-none rounded-lg p-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-200" />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-indigo-400 mb-1">Mano Obra</span>
                                            <input type="number" name="costoManoObra" value={formData.costoManoObra || ''} onChange={handleChange} className="w-full bg-white border-none rounded-lg p-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-200" />
                                        </div>
                                        <div>
                                            <span className="block text-[9px] text-indigo-400 mb-1">Margen (x)</span>
                                            <input type="number" step="0.1" name="margenDeseado" value={formData.margenDeseado} onChange={handleChange} className="w-full bg-white border-none rounded-lg p-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-200" />
                                        </div>
                                    </div>

                                    {/* Resultados de Salud Financiera */}
                                    <div className="mt-3 pt-3 border-t border-indigo-100 grid grid-cols-2 gap-4">
                                        <div className="text-[10px]">
                                            <p className="text-indigo-400">Separar p/ Material:</p>
                                            <p className="font-bold text-indigo-700 font-mono">S/ {reposicionMaterial}</p>
                                        </div>
                                        <div className="text-[10px]">
                                            <p className="text-indigo-400">Fondo Alquiler (10%):</p>
                                            <p className="font-bold text-indigo-700 font-mono">S/ {fondoAlquiler}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Precio Final editable */}
                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2 text-center">Valor Final de Venta</label>
                                    <div className="relative max-w-[200px] mx-auto">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-indigo-300">S/</span>
                                        <input
                                            type="number"
                                            name="precioFinal"
                                            value={formData.precioFinal || ''}
                                            onChange={handleChange}
                                            className="w-full bg-indigo-600 border-none rounded-2xl p-4 pl-10 text-xl font-black text-white text-center shadow-xl shadow-indigo-100 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BOTÓN ACTUALIZADO: Color Índigo de alto contraste */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-2xl transition-all uppercase tracking-[0.3em] mt-4 shadow-xl shadow-indigo-200 active:scale-[0.98]"
                            >
                                Generar Tarjeta de Cotización
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL VISTA PREVIA (ESTILO BOUTIQUE) */}
            {showModal && (
                <div className="fixed inset-0 bg-stone-900/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#FCFBFA] rounded-3xl shadow-2xl w-full max-w-[380px] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-stone-100">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-stone-400">PREVIEW</span>
                            <button onClick={() => setShowModal(false)} className="text-stone-300 hover:text-stone-900"><X size={20} /></button>
                        </div>

                        <div className="p-4 bg-stone-50 flex justify-center">
                            {/* AREA DE CAPTURA */}
                            <div ref={previewRef} className="bg-white w-full p-8 font-sans shadow-sm border border-stone-100" style={{ maxWidth: '340px' }}>
                                <div className="text-center mb-10">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-stone-300 mb-2">Cotización de Autor</h2>
                                    <p className="text-lg font-light tracking-widest text-stone-900 uppercase">Joyeria Vidarte</p>
                                    <div className="w-6 h-[1px] bg-indigo-600 mx-auto mt-4"></div>
                                </div>

                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between items-baseline border-b border-stone-50 pb-2">
                                        <span className="text-[9px] text-stone-400 uppercase tracking-widest">Cliente</span>
                                        <span className="text-xs font-semibold text-stone-800 uppercase tracking-tighter">{formData.nombreCliente || '---'}</span>
                                    </div>

                                    <div>
                                        <span className="text-[9px] text-stone-400 uppercase tracking-widest block mb-2">Descripción de la Obra</span>
                                        <p className="text-sm text-stone-800 leading-relaxed italic">
                                            {formData.tipoProducto} artesanal en Plata 950. {formData.detallesDiseno}
                                        </p>
                                    </div>

                                    {formData.piedrasGemas && (
                                        <div className="flex justify-between items-baseline border-b border-stone-50 pb-2">
                                            <span className="text-[9px] text-stone-400 uppercase tracking-widest">Gemas</span>
                                            <span className="text-xs font-medium text-stone-800">{formData.piedrasGemas}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-baseline border-b border-stone-50 pb-2">
                                        <span className="text-[9px] text-stone-400 uppercase tracking-widest">Entrega</span>
                                        <span className="text-xs font-medium text-stone-800">{formData.tiempoEstimado}</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-stone-900 flex justify-between items-center">
                                    <span className="text-[10px] font-black tracking-[0.2em]">TOTAL INVERSIÓN</span>
                                    <span className="text-2xl font-light text-stone-900">S/ {Number(formData.precioFinal).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="mt-12 text-center">
                                    <p className="text-[7px] text-stone-400 uppercase tracking-[0.2em] leading-loose">
                                        Piezas únicas trabajadas a mano<br />
                                        Lima, Perú • {fechaActual}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white">
                            <button onClick={captureImage} className="w-full flex justify-center items-center gap-3 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black text-white tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                <Share2 size={16} /> ENVIAR AL CLIENTE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CotizadorAutor;