import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import ImageModal from './ImageModal';

// ── Constantes de conversión internacional ──
const FACTOR_AMERICA = 0.4500;
const FACTOR_EUROPA = 0.4063;

// ── Textos UI ──
const UI_TEXT = {
    es: {
        desde: 'Desde',
        detallesPieza: 'Detalles de la pieza',
        notaIgv: '* No incluye IGV',
        cargando: 'Cargando producto...',
        noEncontrado: 'Producto no encontrado.',
        inicio: '< Inicio',
        verCatalogo: 'Ver Catálogo >',
        volverA: 'Volver a',
        relacionados: 'Otras Piezas de Autor',
        sinRelacionados: 'No hay productos relacionados para mostrar.',
        precioConsultar: 'Precio a consultar',
    },
};

// ── Ícono de lupa para la galería ──
const LupaIcono = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-white"
    >
        <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
            clipRule="evenodd"
        />
    </svg>
);

const ProductoDetalle = () => {
    const { id } = useParams();

    // ── Estados ──
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relacionados, setRelacionados] = useState([]);
    const [categoriaNombre, setCategoriaNombre] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');

    const t = UI_TEXT.es;

    const openModal = (url) => {
        setModalImageUrl(url);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageUrl('');
    };

    const emitirPrecioRegion = (reg, prod) => {
        if (!prod) return;
        const precioStr = prod.precio ? `S/ ${Number(prod.precio).toFixed(2)} PEN` : '';
        window.dispatchEvent(new CustomEvent('enigma:region-precio', {
            detail: { region: 'peru', precio: precioStr, titulo: prod.titulo }
        }));
    };

    // ── Fetch Producto ──
    useEffect(() => {
        const fetchProducto = async () => {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('productos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error(error);
                setError('No se pudo cargar el producto.');
            } else {
                setProducto(data);
                setCurrentSlide(0);
                emitirPrecioRegion('peru', data);
            }

            setLoading(false);
        };

        fetchProducto();
    }, [id]);

    // ── Fetch Relacionados ──
    useEffect(() => {
        if (!producto?.id || !producto?.categoria_id) return;

        let cancelled = false;
        const fetchRelacionados = async () => {
            try {
                const { data, error } = await supabase
                    .from('productos')
                    .select('id, titulo, imagen_principal_url, categoria_id')
                    .eq('activo', true)
                    .neq('id', producto.id)
                    .neq('categoria_id', producto.categoria_id)
                    .limit(40);

                if (error) throw error;
                if (cancelled) return;

                const pool = [...(data || [])];
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }
                setRelacionados(pool.slice(0, 4));
            } catch (err) {
                console.error('Error al cargar productos relacionados:', err.message);
            }
        };

        fetchRelacionados();
        return () => { cancelled = true; };
    }, [producto?.id, producto?.categoria_id]);

    // ── Fetch Materiales y Categoría ──
    useEffect(() => {
        if (producto) {
            const fetchMateriales = async () => {
                try {
                    const { data: materialsData, error: materialsError } = await supabase
                        .from('producto_material')
                        .select('material_id')
                        .eq('producto_id', id);

                    if (materialsError) throw materialsError;

                    const materialsPromises = materialsData.map(async (materialData) => {
                        const { data: materialName, error: materialError } = await supabase
                            .from('materiales')
                            .select('nombre')
                            .eq('id', materialData.material_id)
                            .single();

                        if (materialError) throw materialError;

                        return materialName.nombre;
                    });

                    const materiales = await Promise.all(materialsPromises);
                    const materialPrincipal = materiales[0] || 'No especificado';

                    setProducto((prevProducto) => ({
                        ...prevProducto,
                        material_principal: materialPrincipal,
                    }));
                } catch (err) {
                    console.error('Error al cargar materiales:', err.message);
                }
            };

            const fetchCategoria = async () => {
                try {
                    const { data, error } = await supabase
                        .from('categorias')
                        .select('nombre')
                        .eq('id', producto.categoria_id)
                        .single();

                    if (error) throw error;
                    if (data) setCategoriaNombre(data.nombre);
                } catch (err) {
                    console.error('Error al cargar categoría:', err.message);
                }
            };

            fetchCategoria();
            fetchMateriales();
        }
    }, [producto, id]);

    // ── Open Graph ──
    useEffect(() => {
        if (producto) {
            const setMetaTag = (property, content) => {
                if (!content) return;
                let element = document.querySelector(`meta[property="${property}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute('property', property);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            };

            document.title = `${producto.titulo} | Catálogo`;

            setMetaTag('og:title', producto.titulo);
            const descLimpia = producto.descripcion
                ? producto.descripcion
                    .replace(/Desde\s+S\/\.?\s*[\d.,]+\s*PEN\.?/gi, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim()
                    .substring(0, 150) + '...'
                : 'Joyería de autor hecha a pedido | Enigma Artesanías';
            setMetaTag('og:description', descLimpia);
            setMetaTag('og:url', window.location.href);
            setMetaTag('og:type', 'product');

            if (producto.imagen_principal_url) {
                const imageUrl = producto.imagen_principal_url.startsWith('http')
                    ? producto.imagen_principal_url
                    : `${window.location.origin}${producto.imagen_principal_url.startsWith('/') ? '' : '/'}${producto.imagen_principal_url}`;

                setMetaTag('og:image', imageUrl);
                setMetaTag('og:image:secure_url', imageUrl);
                setMetaTag('og:image:width', '800');
                setMetaTag('og:image:height', '800');
                setMetaTag('og:image:alt', producto.titulo);

                const isPng = imageUrl.toLowerCase().includes('.png');
                setMetaTag('og:image:type', isPng ? 'image/png' : 'image/jpeg');
            }

            return () => {
                ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:secure_url', 'og:image:width', 'og:image:height', 'og:image:alt', 'og:image:type', 'og:type'].forEach(property => {
                    const element = document.querySelector(`meta[property="${property}"]`);
                    if (element) {
                        document.head.removeChild(element);
                    }
                });
            };
        }
    }, [producto, id]);

    if (loading) return <div className="p-8 text-center">{UI_TEXT.es.cargando}</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!producto) return <div className="p-8 text-center">{UI_TEXT.es.noEncontrado}</div>;

    const imageUrls = [
        producto.imagen_principal_url,
        producto.imagen2_url,
        producto.imagen3_url,
    ].filter(Boolean);

    const totalImages = imageUrls.length;

    const getDescripcion = () => producto.descripcion;

    const buildWhatsAppMessage = () => {
        const nombre = producto.titulo;
        const url = window.location.href;
        const precioLocal = producto.precio
            ? `S/. ${Number(producto.precio).toFixed(2)} PEN`
            : 'precio por consultar';
        return `Hola Enigma, vi la *${nombre}* (${precioLocal}) en tu web y me gustaría cotizarla.\n\n🔗 ${url}`;
    };

    // Condición para saber si existen especificaciones técnicas
    const tieneEspecificaciones = Boolean(
        producto.dimensions ||
        (producto.weight_grams && Number(producto.weight_grams) > 0)
    );

    return (
        <main className="pt-20 pb-12 bg-gray-50 min-h-screen">

            {/* ── Breadcrumbs ── */}
            <div className="container mx-auto px-4 sm:px-8 max-w-3xl flex justify-between items-center mb-3">
                <Link to="/" className="text-xs sm:text-sm text-gray-500 hover:text-black transition-colors">
                    {t.inicio}
                </Link>
                <Link
                    to={producto?.material_principal && categoriaNombre
                        ? `/catalogo/${producto.material_principal}/${categoriaNombre}`
                        : '/catalogo/all/all'}
                    className="text-xs sm:text-sm text-gray-500 hover:text-black transition-colors"
                >
                    {producto?.material_principal && categoriaNombre
                        ? `${t.volverA} ${producto.material_principal} / ${categoriaNombre} >`
                        : t.verCatalogo}
                </Link>
            </div>

            <div className="container mx-auto p-4 sm:p-6 max-w-3xl bg-white shadow-xl rounded-lg">

                {/* ── Galería de imágenes ── */}
                <div className="mb-6 producto-detalle-galeria">
                    <div className="relative galeria-main-container">
                        <img
                            key={currentSlide}
                            src={imageUrls[currentSlide]}
                            alt={`${producto.titulo} — imagen ${currentSlide + 1}`}
                            className="galeria-imagen-principal"
                            onClick={() => openModal(imageUrls[currentSlide])}
                        />
                        <div
                            className="absolute bottom-4 right-4 p-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg"
                            onClick={() => openModal(imageUrls[currentSlide])}
                            title="Ampliar imagen"
                        >
                            <LupaIcono />
                        </div>
                    </div>

                    {totalImages > 1 && (
                        <div className="galeria-thumbs-row">
                            {imageUrls.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`galeria-thumb-btn${currentSlide === index ? ' galeria-thumb-activo' : ''}`}
                                    aria-label={`Ver imagen ${index + 1}`}
                                    title={`Imagen ${index + 1}`}
                                >
                                    <img
                                        src={url}
                                        alt={`Miniatura ${index + 1}`}
                                        className="galeria-thumb-img"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Información del producto ── */}
                <div className="py-2 mb-8 space-y-6 text-left">

                    {/* 1. Título */}
                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(28px, 6vw, 36px)',
                            fontWeight: '400',
                            color: '#1c1917',
                            lineHeight: '1.2',
                            margin: '0',
                        }}
                    >
                        {producto.titulo}
                    </h1>

                    {/* 2. Bloque de Precio (Limpio y alineado a la izquierda) */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            {producto.precio && (
                                <span className="text-xs font-light text-stone-500">
                                    {t.desde}
                                </span>
                            )}
                            <span
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: 'clamp(28px, 6.5vw, 34px)',
                                    fontWeight: '400',
                                    color: '#1c1917',
                                    letterSpacing: '0.01em',
                                    lineHeight: '1',
                                }}
                            >
                                {producto.precio
                                    ? `S/ ${Number(producto.precio).toFixed(2)}`
                                    : t.precioConsultar}
                            </span>
                            {producto.precio && (
                                <span className="text-[11px] font-light text-stone-400 uppercase tracking-widest ml-0.5">
                                    PEN
                                </span>
                            )}
                        </div>

                        {/* Texto aclaratorio pequeño y no invasivo */}
                        <p className="text-[10px] text-stone-400 font-light tracking-wide">
                            {t.notaIgv}
                        </p>
                    </div>

                    {/* 3. Detalles de la pieza y Ficha Técnica */}
                    {getDescripcion() && (
                        <div className="space-y-3.5">
                            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                {t.detallesPieza}
                            </h3>

                            {/* Párrafo narrativo */}
                            <div className="text-zinc-700 font-light leading-relaxed text-sm md:text-base space-y-2">
                                {getDescripcion().split(/(?:\r?\n)+|(?=Realizado en )/i).map((part, index) => {
                                    if (!part || part.trim() === '') return null;
                                    return (
                                        <p key={index}>
                                            {part.trim()}
                                        </p>
                                    );
                                })}
                            </div>

                            {/* Ficha Técnica: Tamaño y Peso en una sola columna sutil */}
                            {tieneEspecificaciones && (
                                <div className="pt-3 border-t border-stone-100 space-y-1 text-xs font-light">
                                    {producto.dimensions && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-stone-400">
                                                Dimensiones:
                                            </span>
                                            <span className="text-stone-600">
                                                {producto.dimensions}
                                            </span>
                                        </div>
                                    )}

                                    {producto.weight_grams && Number(producto.weight_grams) > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-stone-400">
                                                Peso aprox.:
                                            </span>
                                            <span className="text-stone-600">
                                                {Number(producto.weight_grams)} gr.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. Proceso de Taller (si aplica) */}
                    {(producto.workshop_image || producto.workshop_desc) && (
                        <div style={{
                            borderTop: '1px solid #f0ede8',
                            paddingTop: '20px',
                            marginTop: '24px',
                        }}>
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '10px',
                                fontWeight: '600',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: '#a8a29e',
                                margin: '0',
                                textAlign: 'center',
                            }}>
                                Del taller a tus manos
                            </p>

                            {producto.workshop_image && (
                                <img
                                    src={producto.workshop_image}
                                    alt="Proceso de elaboración en taller"
                                    className="w-full object-cover block rounded-lg mt-3 shadow-lg"
                                    style={{
                                        height: 'clamp(180px, 45vw, 260px)',
                                        border: '1px solid rgba(200,150,74,0.20)',
                                    }}
                                />
                            )}

                            {producto.workshop_desc && (
                                <p style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '13px',
                                    fontWeight: '300',
                                    fontStyle: 'italic',
                                    color: '#52525b',
                                    lineHeight: '1.7',
                                    textAlign: 'center',
                                    marginTop: '10px',
                                    padding: '0 8px',
                                    maxWidth: '380px',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}>
                                    {producto.workshop_desc}
                                </p>
                            )}
                        </div>
                    )}

                    {/* 5. Botón CTA */}
                    <div className="pt-2">
                        <a
                            href={`https://wa.me/51960282376?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'center',
                                background: '#2c2420',
                                color: '#f5f3ef',
                                border: 'none',
                                borderRadius: '2px',
                                padding: '14px 20px',
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '12px',
                                fontWeight: '500',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Solicitar esta pieza
                        </a>
                    </div>

                </div>

                {/* 6. Otras Piezas de Autor */}
                <div className="py-6 mb-2 text-left">
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(18px, 4.5vw, 22px)',
                        fontWeight: '400',
                        color: '#1c1917',
                        letterSpacing: '0.02em',
                        marginBottom: '16px',
                    }}>
                        {t.relacionados}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {relacionados.length > 0 ? (
                            relacionados.map((relatedProducto) => (
                                <div key={relatedProducto.id}>
                                    <Link to={`/producto/${relatedProducto.id}`} onClick={() => window.scrollTo(0, 0)}>
                                        <img
                                            src={relatedProducto.imagen_principal_url}
                                            alt={relatedProducto.titulo}
                                            className="w-full h-44 sm:h-52 object-cover rounded-lg hover:opacity-90 transition-opacity"
                                            style={{ border: '1px solid #f0ede8' }}
                                        />
                                        <p style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: '11px',
                                            fontWeight: '400',
                                            color: '#78716c',
                                            marginTop: '6px',
                                            lineHeight: '1.4',
                                            letterSpacing: '0.01em',
                                        }}>
                                            {relatedProducto.titulo}
                                        </p>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-2 text-center text-gray-400 text-sm">
                                {t.sinRelacionados}
                            </p>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Modal de Imagen ── */}
            <ImageModal
                isOpen={isModalOpen}
                onClose={closeModal}
                imageUrl={modalImageUrl}
                productUrl={window.location.href}
            />

        </main>
    );
};

export default ProductoDetalle;