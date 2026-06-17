import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { andruDonaldsDB, andruProductosDB } from '../utils/andruDonaldsClient';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, MoveUp, MoveDown, Save } from 'lucide-react';

const AndruDonaldsAdmin = () => {
    const { user } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [productos, setProductos] = useState([]);
    const [uploadingProducto, setUploadingProducto] = useState(false);

    useEffect(() => {
        if (user) {
            fetchImages();
            fetchProductos();
        }
    }, [user]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const data = await andruDonaldsDB.getAll();
            setImages(data || []);
        } catch (err) {
            console.error(err);
            setError('Error al cargar imágenes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductos = async () => {
        try {
            const data = await andruProductosDB.getAll();
            setProductos(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            // Comprimir imagen
            const compressedBlob = await imageCompression(file, {
                maxSizeMB: 1,
                useWebWorker: true
            });

            // Subir a Firebase Storage
            const ext = file.name.split('.').pop();
            const fileName = `andru_${uuidv4()}.${ext}`;
            const storageRef = ref(storage, `andru-donalds/${fileName}`);
            
            await uploadBytes(storageRef, compressedBlob);
            const downloadUrl = await getDownloadURL(storageRef);

            // Guardar en Neon
            const order_index = images.length > 0 ? Math.max(...images.map(img => img.order_index || 0)) + 1 : 0;
            await andruDonaldsDB.create({
                image_url: downloadUrl,
                order_index,
                is_active: true
            });

            await fetchImages();
            alert('Imagen subida con éxito');
        } catch (err) {
            setError(`Error al subir imagen: ${err.message}`);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleProductoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingProducto(true);
        setError(null);
        try {
            const compressedBlob = await imageCompression(file, {
                maxSizeMB: 1,
                useWebWorker: true
            });
            const ext = file.name.split('.').pop();
            const fileName = `producto_${uuidv4()}.${ext}`;
            const storageRef = ref(storage, `andru-productos/${fileName}`);
            await uploadBytes(storageRef, compressedBlob);
            const downloadUrl = await getDownloadURL(storageRef);
            const order_index = productos.length > 0
                ? Math.max(...productos.map(p => p.order_index || 0)) + 1
                : 0;
            await andruProductosDB.create({
                image_url: downloadUrl,
                descripcion: '',
                order_index,
                is_active: true
            });
            await fetchProductos();
            alert('Imagen de producto subida con éxito');
        } catch (err) {
            setError(`Error al subir producto: ${err.message}`);
        } finally {
            setUploadingProducto(false);
            e.target.value = '';
        }
    };

    const handleProductoDescripcion = async (id, descripcion) => {
        try {
            const producto = productos.find(p => p.id === id);
            if (!producto) return;
            await andruProductosDB.update(id, {
                ...producto,
                descripcion
            });
            setProductos(prev => prev.map(p =>
                p.id === id ? { ...p, descripcion } : p
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const handleProductoDelete = async (id, url) => {
        if (!window.confirm('¿Eliminar esta imagen de producto?')) return;
        try {
            await andruProductosDB.delete(id);
            try {
                const pathParts = url.split('?')[0].split('%2F');
                if (pathParts.length > 1) {
                    const fileName = pathParts[pathParts.length - 1];
                    const storageRef = ref(storage, `andru-productos/${fileName}`);
                    await deleteObject(storageRef);
                }
            } catch (fbErr) {
                console.warn('Firebase delete error:', fbErr);
            }
            await fetchProductos();
        } catch (err) {
            setError(`Error al eliminar: ${err.message}`);
        }
    };

    const handleDelete = async (id, url) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta imagen?')) return;
        setLoading(true);
        try {
            // Eliminar de Neon
            await andruDonaldsDB.delete(id);

            // Intentar eliminar de Firebase (opcional pero recomendado)
            try {
                // url es algo como https://firebasestorage.googleapis.com/.../andru-donalds%2Fandru_123.jpg?...
                // Hay que extraer la ruta "andru-donalds/andru_123.jpg"
                const pathParts = url.split('?')[0].split('%2F');
                if (pathParts.length > 1) {
                    const fileName = pathParts[pathParts.length - 1];
                    const storageRef = ref(storage, `andru-donalds/${fileName}`);
                    await deleteObject(storageRef);
                }
            } catch (fbErr) {
                console.warn('No se pudo borrar de firebase (puede que no exista):', fbErr);
            }

            await fetchImages();
        } catch (err) {
            setError(`Error al eliminar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (image) => {
        try {
            await andruDonaldsDB.update(image.id, {
                order_index: image.order_index,
                is_active: !image.is_active
            });
            await fetchImages();
        } catch (err) {
            console.error(err);
            setError('Error al actualizar visibilidad.');
        }
    };

    const handleMove = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const current = newImages[index];
        const swapWith = newImages[direction === 'up' ? index - 1 : index + 1];

        // Intercambiar en BD
        try {
            await Promise.all([
                andruDonaldsDB.update(current.id, { ...current, order_index: swapWith.order_index }),
                andruDonaldsDB.update(swapWith.id, { ...swapWith, order_index: current.order_index })
            ]);
            await fetchImages();
        } catch (err) {
            console.error(err);
            setError('Error al reordenar.');
        }
    };

    if (!user) {
        return <div className="p-8 text-center">Debes iniciar sesión.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-16">
            <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center shadow-sm">
                <Link to="/admin" className="text-gray-500 hover:text-gray-800 transition mr-4 p-2 bg-gray-50 rounded-full">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">Galería de Andru Donalds</h1>
                    <p className="text-xs text-gray-500">Sube y ordena las fotos de la colección (Neon + Firebase)</p>
                </div>
            </header>

            <main className="container mx-auto px-4 mt-6 max-w-4xl">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                {/* Zona de subida */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 text-center">
                    <h2 className="font-semibold text-gray-700 mb-2">Añadir nueva imagen</h2>
                    <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                        {uploading ? <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
                        {uploading ? 'Subiendo y optimizando...' : 'Seleccionar Foto'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>

                {/* Lista de imágenes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 text-sm">Imágenes subidas ({images.length})</h3>
                    </div>

                    {loading && images.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Cargando galería...</div>
                    ) : images.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Aún no hay imágenes. Sube la primera foto.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {images.sort((a,b) => (a.order_index || 0) - (b.order_index || 0)).map((img, idx) => (
                                <div key={img.id} className={`p-4 flex items-center justify-between gap-4 ${!img.is_active ? 'opacity-50 bg-gray-50/50' : 'hover:bg-gray-50/30'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                                            <img src={img.image_url} alt="Andru" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <button 
                                                onClick={() => toggleActive(img)}
                                                className={`text-xs font-semibold px-2 py-1 rounded-md border ${img.is_active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
                                            >
                                                {img.is_active ? 'Visible' : 'Oculto'}
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Descripción breve (lugar, año, pieza...)"
                                                defaultValue={img.descripcion || ''}
                                                onBlur={async (e) => {
                                                    await andruDonaldsDB.update(img.id, {
                                                        ...img,
                                                        descripcion: e.target.value
                                                    });
                                                }}
                                                style={{
                                                    fontSize: '11px',
                                                    padding: '4px 8px',
                                                    border: '0.5px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    width: '100%',
                                                    marginTop: '4px',
                                                    color: '#374151',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 bg-gray-50 rounded-lg"><MoveUp size={16} /></button>
                                        <button onClick={() => handleMove(idx, 'down')} disabled={idx === images.length - 1} className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 bg-gray-50 rounded-lg"><MoveDown size={16} /></button>
                                        <button onClick={() => handleDelete(img.id, img.image_url)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg ml-2"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-700 text-sm">
                            Piezas forjadas para Andru ({productos.length})
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Fotos de tus productos enviados — máximo 8 imágenes
                        </p>
                    </div>

                    <div className="p-4 border-b border-gray-100 text-center">
                        <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors ${uploadingProducto ? 'bg-gray-100 text-gray-400' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
                            {uploadingProducto
                                ? <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                : <Upload size={18} />}
                            {uploadingProducto ? 'Subiendo...' : 'Agregar pieza'}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleProductoUpload}
                                disabled={uploadingProducto}
                            />
                        </label>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {productos.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Aún no hay piezas. Sube la primera foto de producto.
                            </div>
                        ) : (
                            productos.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((prod) => (
                                <div key={prod.id} className="p-4 flex gap-3 items-start">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img src={prod.image_url} alt="Pieza" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <textarea
                                            placeholder="Nombre y descripción de la pieza (ej: Collar turquesa · plata · enviado mar 2025)"
                                            defaultValue={prod.descripcion || ''}
                                            onBlur={async (e) => {
                                                await handleProductoDescripcion(prod.id, e.target.value);
                                            }}
                                            rows={2}
                                            style={{
                                                fontSize: '11px',
                                                padding: '6px 8px',
                                                border: '0.5px solid #e5e7eb',
                                                borderRadius: '6px',
                                                width: '100%',
                                                resize: 'none',
                                                color: '#374151',
                                                background: '#f9fafb',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleProductoDelete(prod.id, prod.image_url)}
                                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex-shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AndruDonaldsAdmin;
