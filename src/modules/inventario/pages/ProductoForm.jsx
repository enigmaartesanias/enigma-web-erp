import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productosExternosDB } from '../../../utils/productosExternosNeonClient';
import { tiposProductoDB } from '../../../utils/tiposProductoDB';
import { materialesDB } from '../../../utils/materialesNeonClient';
import QRCode from 'react-qr-code';
import { FaSave, FaArrowLeft, FaRandom, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NO_UPPERCASE = ['origen', 'tipo_producto', 'material', 'categoria'];

const ProductoForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [metales, setMetales] = useState([]);
    const [codigoGrupalInfo, setCodigoGrupalInfo] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '', costo: '', precio: '', codigo_usuario: '',
        stock_actual: '', categoria: '', material: '',
        descripcion: '', lote: '', origen: 'COMPRA', tipo_producto: 'Único'
    });

    useEffect(() => {
        loadCategorias();
        loadMetales();
    }, []);

    const loadCategorias = async () => {
        try {
            const data = await tiposProductoDB.getAll();
            setCategorias(data);
        } catch (error) { console.error(error); }
    };

    const loadMetales = async () => {
        try {
            const data = await materialesDB.getMetales(false);
            setMetales(data);
        } catch (error) { console.error(error); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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
                toast.error('Ingresa el precio primero.');
                return;
            }
            const prefijo = formData.origen === 'PRODUCCION' ? 'PROD' : 'COMP';
            const cat = formData.categoria.substring(0, 3).toUpperCase();
            const mat = formData.material.substring(0, 3).toUpperCase();
            const nuevoCodigo = `${prefijo}-${cat}-${mat}-${parseFloat(formData.precio)}`;

            setFormData(prev => ({ ...prev, codigo_usuario: nuevoCodigo }));

            try {
                const check = await productosExternosDB.checkCodigo(nuevoCodigo);
                setCodigoGrupalInfo({ ...check, exists: check.exists });
            } catch {
                setCodigoGrupalInfo({ exists: false });
            }
        } else {
            try {
                const data = await productosExternosDB.getNextLote(formData.categoria, formData.material);
                setFormData(prev => ({ ...prev, codigo_usuario: data.codigoUnico, lote: data.nextLote }));
                setCodigoGrupalInfo(null);
            } catch (error) {
                toast.error('Error al generar código');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación obligatoria
        if (!formData.costo || !formData.precio || !formData.codigo_usuario) {
            toast.error('Campos obligatorios: Costo, Precio y Código.');
            return;
        }

        const isExistingGrupal = formData.tipo_producto === 'Grupal' && codigoGrupalInfo?.exists;
        if (!isExistingGrupal && !formData.nombre.trim()) {
            toast.error('El Nombre es obligatorio');
            return;
        }

        try {
            setLoading(true);
            const productData = {
                ...formData,
                costo: parseFloat(formData.costo),
                precio: parseFloat(formData.precio),
                stock_actual: parseInt(formData.stock_actual) || 0,
                tipo_inventario: formData.tipo_producto,
                imagen_url: null
            };

            if (formData.tipo_producto === 'Grupal') {
                await productosExternosDB.upsertGrupal(productData);
            } else {
                await productosExternosDB.create(productData);
            }

            toast.success('✅ Producto guardado correctamente');

            // Limpieza
            setCodigoGrupalInfo(null);
            setFormData({
                nombre: '', costo: '', precio: '', codigo_usuario: '',
                stock_actual: '', categoria: '', material: '',
                descripcion: '', lote: '', origen: 'COMPRA', tipo_producto: 'Único'
            });
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error('Error en base de datos: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <Link to="/inventario-home" className="text-gray-500 text-sm font-semibold"><FaArrowLeft className="inline mr-2" /> Regresar</Link>
                <h1 className="text-lg font-bold">Inventario Inicial</h1>
                <div className="w-16"></div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-6">
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

                    {!(formData.tipo_producto === 'Grupal' && codigoGrupalInfo?.exists) && (
                        <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del producto" className="w-full p-3 border rounded-lg text-sm" />
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} placeholder="Stock" className="p-3 border rounded-lg text-sm" />
                        <input type="number" name="costo" value={formData.costo} onChange={handleChange} placeholder="Costo" className="p-3 border rounded-lg text-sm" />
                        <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="Precio" className="p-3 border rounded-lg text-sm" />
                    </div>

                    <div className="flex gap-2 items-center pt-1">
                        <input name="codigo_usuario" value={formData.codigo_usuario} onChange={handleChange} readOnly={formData.tipo_producto === 'Grupal'} className="flex-1 p-3 border rounded-lg font-mono font-bold text-sm bg-gray-50" />
                        <button type="button" onClick={generarCodigo} className="bg-gray-900 text-white px-4 py-3 rounded-lg"><FaRandom /></button>
                        <div className="w-12 h-12 border rounded-lg flex items-center justify-center bg-white p-1">
                            {formData.codigo_usuario && <QRCode value={formData.codigo_usuario} size={36} />}
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                    {loading ? <FaSpinner className="animate-spin" /> : <><FaSave /> Guardar Producto</>}
                </button>
            </form>
        </div>
    );
};

export default ProductoForm;