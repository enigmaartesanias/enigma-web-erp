import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import QRCode from 'react-qr-code';
import { FaSave, FaArrowLeft, FaRandom, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const METALES = ['Plata', 'Alpaca', 'Cobre', 'Bronce', 'Bisutería'];

// Campos que NO deben convertirse a mayúsculas
const NO_UPPERCASE = ['origen', 'tipo_producto', 'material', 'categoria'];

const ProductoForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);

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

    useEffect(() => { loadCategorias(); }, []);

    const loadCategorias = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setCategorias(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            setFormData(prev => ({ ...prev, codigo_usuario: nuevoCodigo }));
            toast.success(`Código grupal: ${nuevoCodigo}`);
        } else {
            try {
                const data = await productosExternosDB.getNextLote(formData.categoria, formData.material);
                setFormData(prev => ({ ...prev, codigo_usuario: data.codigoUnico, lote: data.nextLote }));
                toast.success('Código de lote autogenerado');
            } catch (error) {
                toast.error('Error al generar código');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.costo || !formData.precio || !formData.codigo_usuario) {
            toast.error('Faltan campos obligatorios');
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

            toast.success('Producto registrado exitosamente');
            navigate('/inventario-home');
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

                    {/* Código + botón generar + QR preview */}
                    <div className="flex gap-2 items-center">
                        <input
                            name="codigo_usuario"
                            value={formData.codigo_usuario}
                            onChange={handleChange}
                            placeholder="CÓDIGO"
                            readOnly={formData.tipo_producto === 'Grupal'}
                            className={`flex-1 p-3 border rounded-lg font-mono font-bold text-sm ${formData.tipo_producto === 'Grupal' ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
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

                    <div className="grid grid-cols-2 gap-4">
                        <select name="categoria" value={formData.categoria} onChange={handleChange} className="p-3 border rounded-lg text-sm">
                            <option value="">Categoría</option>
                            {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                        <select name="material" value={formData.material} onChange={handleChange} className="p-3 border rounded-lg text-sm">
                            <option value="">Material</option>
                            {METALES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre Producto"
                        className="w-full p-3 border rounded-lg text-sm"
                    />

                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} placeholder="Stock" className="p-3 border rounded-lg text-sm" />
                        <input type="number" name="costo" value={formData.costo} onChange={handleChange} placeholder="Costo" className="p-3 border rounded-lg text-sm" />
                        <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="Precio" className="p-3 border rounded-lg text-sm" />
                    </div>

                    {formData.tipo_producto === 'Grupal' && (
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                            📦 Código grupal: <strong>{formData.codigo_usuario || 'genera con el botón →'}</strong>
                            <br />El stock se sumará si el código ya existe en inventario.
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
