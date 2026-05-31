import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import { materialesDB } from '../../../utils/materialesNeonClient';
import QRCode from 'react-qr-code';
import { FaSave, FaArrowLeft, FaRandom, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Campos que NO deben convertirse a mayúsculas
const NO_UPPERCASE = ['origen', 'tipo_producto', 'material', 'categoria'];

const ProductoForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [metales, setMetales] = useState([]);
    // Estado para verificación de código grupal existente
    const [codigoGrupalInfo, setCodigoGrupalInfo] = useState(null); // null | { exists, stockActual, nombre }

    const [formData, setFormData] = useState({
        nombre: '',
        costo: '',
        precio: '',
        codigo_usuario: '',
        stock_actual: '',
        categoria: '',
        material: '',
        descripcion: '',
        lote: '',
        origen: 'COMPRA',
        tipo_producto: 'Único'
    });

    useEffect(() => {
        loadCategorias();
        loadMetales();
    }, []);

    const loadCategorias = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setCategorias(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadMetales = async () => {
        try {
            // Incluir inactivos=false para solo activos; igual que TiposMateriales y RegistroMateriales
            const data = await materialesDB.getMetales(false);
            setMetales(data);
        } catch (error) {
            console.error('Error al cargar materiales:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Al cambiar tipo_producto, resetear info de código grupal
        if (name === 'tipo_producto') {
            setCodigoGrupalInfo(null);
            setFormData(prev => ({ ...prev, codigo_usuario: '', nombre: '', [name]: value }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: NO_UPPERCASE.includes(name) ? value : value.toUpperCase()
        }));
    };

    const generarCodigo = async () => {
        if (!formData.categoria || !formData.material) {
            toast.error('Selecciona Categoría y Material primero.');
            return;
        }

        if (formData.tipo_producto === 'Grupal') {
            if (!formData.precio) {
                toast.error('Ingresa el precio primero para generar el código grupal.');
                return;
            }
            const prefijo = formData.origen === 'PRODUCCION' ? 'PROD' : 'COMP';
            const cat = formData.categoria.substring(0, 3).toUpperCase();
            const mat = formData.material.substring(0, 3).toUpperCase();
            const prc = parseFloat(formData.precio);
            const nuevoCodigo = `${prefijo}-${cat}-${mat}-${prc}`;
            setFormData(prev => ({ ...prev, codigo_usuario: nuevoCodigo, nombre: '' }));

            // Verificar si el código ya existe en inventario
            try {
                const check = await productosExternosDB.checkCodigo(nuevoCodigo);
                setCodigoGrupalInfo({ ...check, codigo: nuevoCodigo });
                if (check.exists) {
                    toast('📦 Código existente. Solo se sumará el stock.', {
                        icon: 'ℹ️',
                        style: { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' },
                        duration: 4000
                    });
                } else {
                    toast.success(`Código nuevo: ${nuevoCodigo}`);
                }
            } catch {
                setCodigoGrupalInfo({ exists: false, codigo: nuevoCodigo });
                toast.success(`Código grupal: ${nuevoCodigo}`);
            }
        } else {
            try {
                const data = await productosExternosDB.getNextLote(formData.categoria, formData.material);
                setFormData(prev => ({ ...prev, codigo_usuario: data.codigoUnico, lote: data.nextLote }));
                setCodigoGrupalInfo(null);
                toast.success('Código de lote autogenerado');
            } catch (error) {
                toast.error('Error al generar código');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.costo || !formData.precio || !formData.codigo_usuario) {
            toast.error('Faltan campos obligatorios: Costo, Precio y Código son requeridos');
            return;
        }
        // En modo Grupal con código NUEVO sí se requiere nombre
        const esGrupalNuevo = formData.tipo_producto === 'Grupal' && codigoGrupalInfo && !codigoGrupalInfo.exists;
        const esUnico = formData.tipo_producto === 'Único';
        if ((esGrupalNuevo || esUnico) && !formData.nombre.trim()) {
            toast.error('El Nombre del Producto es obligatorio');
            return;
        }

        try {
            setLoading(true);
            const productData = {
                ...formData,
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseInt(formData.stock_actual) || 0,
                imagen_url: null, // REGLA DE ORO: siempre null
                tipo_inventario: formData.tipo_producto
            };

            if (formData.tipo_producto === 'Grupal') {
                await productosExternosDB.upsertGrupal(productData);
            } else {
                await productosExternosDB.create(productData);
            }

            toast.success('✅ Producto guardado correctamente', { duration: 3000 });

            // Resetear form para ingresar otro producto
            setCodigoGrupalInfo(null);
            setFormData({
                nombre: '',
                costo: '',
                precio: '',
                codigo_usuario: '',
                stock_actual: '',
                categoria: '',
                material: '',
                descripcion: '',
                lote: '',
                origen: 'COMPRA',
                tipo_producto: 'Único'
            });
        } catch (error) {
            toast.error('Error al guardar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // QR preview dinámico
    const qrValue = formData.codigo_usuario.trim();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <Link to="/inventario-home" className="flex items-center text-gray-500 text-sm font-semibold">
                    <FaArrowLeft className="mr-2" /> Regresar
                </Link>
                <h1 className="text-lg font-bold">Inventario Inicial</h1>
                <div className="w-16"></div>
            </div>

            <div className="max-w-xl mx-auto p-4 space-y-6">

                {/* SELECTORES ORIGEN Y TIPO */}
                <div className="grid grid-cols-2 gap-4">
                    <select name="origen" value={formData.origen} onChange={handleChange} className="p-3 border rounded-xl text-xs font-bold">
                        <option value="COMPRA">COMPRA</option>
                        <option value="PRODUCCION">PRODUCCIÓN</option>
                    </select>
                    <select name="tipo_producto" value={formData.tipo_producto} onChange={handleChange} className="p-3 border rounded-xl text-xs font-bold">
                        <option value="Único">Único</option>
                        <option value="Grupal">Grupal</option>
                    </select>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">

                    {/* Categoria + Material */}
                    <div className="grid grid-cols-2 gap-4">
                        <select name="categoria" value={formData.categoria} onChange={handleChange} className="p-3 border rounded-lg text-sm">
                            <option value="">Categoría</option>
                            {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                        <select name="material" value={formData.material} onChange={handleChange} className="p-3 border rounded-lg text-sm">
                            <option value="">Material</option>
                            {metales.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                        </select>
                    </div>

                    {/* Banner informativo cuando el código grupal YA existe */}
                    {formData.tipo_producto === 'Grupal' && codigoGrupalInfo?.exists && (
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <span className="text-blue-500 text-lg flex-shrink-0">ℹ️</span>
                            <div>
                                <p className="text-xs font-bold text-blue-800">Código ya registrado en inventario</p>
                                <p className="text-[11px] text-blue-600 mt-0.5">
                                    Stock actual: <strong>{codigoGrupalInfo.stockActual} uds.</strong> — al guardar se sumará el stock ingresado.
                                </p>
                                <p className="text-[10px] text-blue-400 mt-0.5">El nombre del producto no se modifica.</p>
                            </div>
                        </div>
                    )}

                    {/* Campo Nombre: oculto si es Grupal con código existente */}
                    {!(formData.tipo_producto === 'Grupal' && codigoGrupalInfo?.exists) && (
                        <input
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder={formData.tipo_producto === 'Grupal' ? 'Nombre del grupo de productos' : 'Nombre Producto'}
                            className="w-full p-3 border rounded-lg text-sm"
                        />
                    )}

                    {/* Stock / Costo / Precio */}
                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} placeholder="Stock" className="p-3 border rounded-lg text-sm" />
                        <input type="number" name="costo" value={formData.costo} onChange={handleChange} placeholder="Costo" className="p-3 border rounded-lg text-sm" />
                        <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="Precio" className="p-3 border rounded-lg text-sm" />
                    </div>

                    {/* Código + botón generar + QR preview — al final */}
                    <div className="flex gap-2 items-center pt-1">
                        <input
                            name="codigo_usuario"
                            value={formData.codigo_usuario}
                            onChange={handleChange}
                            placeholder="CÓDIGO"
                            readOnly={formData.tipo_producto === 'Grupal'}
                            className={`flex-1 p-3 border rounded-lg font-mono font-bold text-sm ${
                                formData.tipo_producto === 'Grupal' ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                            }`}
                        />
                        <button
                            type="button"
                            onClick={generarCodigo}
                            className="bg-gray-900 text-white px-4 py-3 rounded-lg font-bold text-xs"
                        >
                            <FaRandom />
                        </button>
                        <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center bg-white p-1 flex-shrink-0">
                            {qrValue
                                ? <QRCode value={qrValue} size={36} />
                                : <div className="w-full h-full bg-gray-100 rounded" />
                            }
                        </div>
                    </div>

                    {formData.tipo_producto === 'Grupal' && codigoGrupalInfo && !codigoGrupalInfo.exists && (
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                            📦 Código nuevo: <strong>{formData.codigo_usuario}</strong>
                            <br />Se creará un nuevo grupo en inventario.
                        </p>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <><FaSave /> Guardar Producto</>}
                </button>
            </div>
        </div>
    );
};

export default ProductoForm;
