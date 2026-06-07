import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import ImageModal from './ImageModal';

// ── Constantes de conversión internacional (PEN → divisa final con comisión WU) ──
const FACTOR_AMERICA = 0.4500; // PEN → USD (incluye logística)
const FACTOR_EUROPA = 0.4063; // PEN → EUR (incluye logística)

// ── Traducciones UI por región ──
const UI_TEXT = {
    es: {
        desde: 'DESDE',
        materialBase: 'Material base',
        detallesPieza: 'Detalles de la pieza',
        notaArtesanal: 'Nota artesanal',
        notaImagen: 'Imagen referencial. Cada pieza se elabora de forma artesanal, por lo que puede presentar ligeras variaciones.',
        notaIgv: '* El precio de venta no incluye IGV.',
        envioTitulo: 'Detalles de Envío y Entrega',
        pagoTitulo: 'Métodos de Pago y Ubicación',
        leerMas: 'Leer más...',
        leerMenos: 'Ver menos',
        cotizar: 'Cotizar por WhatsApp',
        compartir: 'Compartir Pieza',
        cargando: 'Cargando producto...',
        noEncontrado: 'Producto no encontrado.',
        inicio: '< Inicio',
        verCatalogo: 'Ver Catálogo >',
        volverA: 'Volver a',
        relacionados: 'Productos relacionados',
        sinRelacionados: 'No hay productos relacionados para mostrar.',
        consultarPrecio: 'Consultar precio',
        precioConsultar: 'Precio a consultar',
    },
    en: {
        desde: 'FROM',
        materialBase: 'Base material',
        detallesPieza: 'Piece Details',
        notaArtesanal: 'Artisan note',
        notaImagen: 'Reference image. Each piece is individually handcrafted and may show slight natural variations.',
        notaIgv: '* Price does not include local taxes.',
        envioTitulo: 'Shipping & Delivery',
        pagoTitulo: 'Payment Methods & Location',
        leerMas: 'Read more...',
        leerMenos: 'Show less',
        cotizar: 'Quote via WhatsApp',
        compartir: 'Share this piece',
        cargando: 'Loading product...',
        noEncontrado: 'Product not found.',
        inicio: '< Home',
        verCatalogo: 'View Catalogue >',
        volverA: 'Back to',
        relacionados: 'Related products',
        sinRelacionados: 'No related products to display.',
        consultarPrecio: 'Request a quote',
        precioConsultar: 'Price on request',
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

// ── Chevron SVG para acordeón (Lucide-style) ──
const ChevronIcono = ({ abierto }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            width: '16px',
            height: '16px',
            color: '#9ca3af',
            transition: 'transform 300ms ease',
            transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
        }}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// ── Mini bandera vía flagcdn.com (evita el problema de emoji en Windows) ──
const FlagImg = ({ code, alt }) => (
    <img
        src={`https://flagcdn.com/20x15/${code}.png`}
        srcSet={`https://flagcdn.com/40x30/${code}.png 2x`}
        width="20"
        height="15"
        alt={alt}
        style={{ display: 'inline-block', borderRadius: '2px', flexShrink: 0 }}
    />
);

// ── Ícono Compartir ──
const ShareIcono = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

const ProductoDetalle = () => {
    const { id } = useParams();

    // ── Estados existentes — NO TOCAR ──
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relacionados, setRelacionados] = useState([]);
    const [categoriaNombre, setCategoriaNombre] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');

    // ── Estados nuevos: internacionalización ──
    const [region, setRegion] = useState('peru'); // 'peru' | 'america' | 'europa'
    const [precioVisible, setPrecioVisible] = useState(true);

    // ── Estados nuevos: acordeones y descripción ──
    const [acordeon1, setAcordeon1] = useState(false);
    const [acordeon2, setAcordeon2] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // ── Helper de idioma: ES para Perú, EN para América/Europa ──
    const lang = region === 'peru' ? 'es' : 'en';
    const t = UI_TEXT[lang];

    // ── Handlers de galería — NO TOCAR ──
    const openModal = (url) => {
        setModalImageUrl(url);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageUrl('');
    };

    // ── Emite evento global con precio+región activos (para Footer) ──
    const emitirPrecioRegion = (reg, prod) => {
        if (!prod) return;
        let precioStr = '';
        const tieneIntlLocal = prod.precio_internacional_base !== null &&
            prod.precio_internacional_base !== undefined &&
            Number(prod.precio_internacional_base) > 0;
        if (reg === 'peru') {
            precioStr = prod.precio ? `S/ ${Number(prod.precio).toFixed(2)} PEN` : '';
        } else if (reg === 'america') {
            precioStr = tieneIntlLocal ? `$ ${Math.round(Number(prod.precio_internacional_base) * FACTOR_AMERICA)} USD` : '';
        } else if (reg === 'europa') {
            precioStr = tieneIntlLocal ? `€ ${Math.round(Number(prod.precio_internacional_base) * FACTOR_EUROPA)} EUR` : '';
        }
        window.dispatchEvent(new CustomEvent('enigma:region-precio', {
            detail: { region: reg, precio: precioStr, titulo: prod.titulo }
        }));
    };

    // ── Cambio de región con fade ──
    const cambiarRegion = (nuevaRegion) => {
        if (nuevaRegion === region) return;
        setPrecioVisible(false);
        setTimeout(() => {
            setRegion(nuevaRegion);
            emitirPrecioRegion(nuevaRegion, producto);
            setPrecioVisible(true);
        }, 180);
    };

    // ── useEffect: fetchProducto — NO TOCAR ──
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
                // Emitir precio inicial (región Perú por defecto)
                emitirPrecioRegion('peru', data);
            }

            setLoading(false);
        };

        fetchProducto();
    }, [id]);

    // ── useEffect: fetchRelacionados — NO TOCAR ──
    useEffect(() => {
        if (producto) {
            const fetchRelacionados = async () => {
                try {
                    const { data, error } = await supabase
                        .from('productos')
                        .select('*')
                        .eq('categoria_id', producto.categoria_id)
                        .eq('activo', true)
                        .neq('id', id)
                        .order('created_at', { ascending: false })
                        .limit(4);

                    if (error) throw error;
                    setRelacionados(data || []);
                } catch (err) {
                    console.error('Error al cargar productos relacionados:', err.message);
                }
            };

            fetchRelacionados();
        }
    }, [producto, id]);

    // ── useEffect: fetchMateriales + fetchCategoria — NO TOCAR ──
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

    // ── useEffect: Open Graph meta tags — NO TOCAR ──
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

            const pageTitle = `${producto.titulo} | Catálogo`;
            document.title = pageTitle;

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

    // ── Estados de carga/error ──
    if (loading) return <div className="p-8 text-center">{UI_TEXT.es.cargando}</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!producto) return <div className="p-8 text-center">{UI_TEXT.es.noEncontrado}</div>;

    // ── Galería — NO TOCAR ──
    const imageUrls = [
        producto.imagen_principal_url,
        producto.imagen2_url,
        producto.imagen3_url,
    ].filter(url => url);

    const totalImages = imageUrls.length;

    // ── Lógica de precio por región (envío incluido en precio internacional) ──
    const tieneIntl = producto.precio_internacional_base !== null &&
        producto.precio_internacional_base !== undefined &&
        Number(producto.precio_internacional_base) > 0;

    const precioUSD = tieneIntl ? Math.round(Number(producto.precio_internacional_base) * FACTOR_AMERICA) : null;
    const precioEUR = tieneIntl ? Math.round(Number(producto.precio_internacional_base) * FACTOR_EUROPA) : null;

    const getPrecioDisplay = () => {
        if (region === 'america') {
            return tieneIntl ? `$ ${precioUSD} USD` : t.consultarPrecio;
        }
        if (region === 'europa') {
            return tieneIntl ? `€ ${precioEUR} EUR` : t.consultarPrecio;
        }
        return producto.precio ? `S/ ${Number(producto.precio).toFixed(2)} PEN` : t.precioConsultar;
    };

    const mostrarDesde = region === 'america' || region === 'europa' ? tieneIntl : !!producto.precio;

    const getMicroDesc = () => {
        if (region === 'america') {
            return tieneIntl
                ? 'Author piece + premium packaging. Includes certified international shipping. Final price may vary depending on wrist size or custom elements.'
                : 'Price to be quoted. Contact us via WhatsApp to get a shipping estimate.';
        }
        if (region === 'europa') {
            return tieneIntl
                ? 'Author piece + premium packaging. Includes certified international shipping. Final price may vary depending on wrist size or custom elements.'
                : 'Price to be quoted. Contact us via WhatsApp to get a shipping estimate.';
        }
        return 'Precio de campaña. No incluye IGV. Envío por cotizar según destino. El costo final puede variar según la medida de tu muñeca o iniciales adicionales.';
    };

    // ── Contenido de acordeón Envío ──
    const getEnvioTexto = () => {
        if (region === 'america' || region === 'europa') {
            return 'Certified international shipping with active tracking code. Estimated delivery: 20 business days. Your piece travels in the brand\'s premium packaging. Shipping cost is included in the displayed price.';
        }
        return 'Enviamos a todo el país vía Olva Courier (Lima: S/ 10.00, provincias según destino) o Shalom (tarifa según agencia destino, pago en destino). También puedes recoger sin costo en nuestro taller en Carabayllo, Lima, previa coordinación.';
    };

    const getPagoTexto = () => {
        if (region === 'america' || region === 'europa') {
            return 'We work on a made-to-order basis. Payment is coordinated manually via Western Union from the agency of your choice. We will send you the exact details once you confirm your order via WhatsApp.';
        }
        return 'Aceptamos Yape, Plin y transferencias bancarias (BCP, Interbank) a nombre de Aldo Magallanes — número 960 282 376. Taller principal en Carabayllo, Lima (atención previa cita).';
    };

    // ── Descripción: usa descripcion_en si existe y región es internacional ──
    const getDescripcion = () => {
        if (region !== 'peru' && producto.descripcion_en) {
            return producto.descripcion_en;
        }
        return producto.descripcion;
    };

    // ── Construcción del mensaje de WhatsApp ──
    const buildWhatsAppMessage = () => {
        const nombre = producto.titulo;
        const url = window.location.href;

        if (region === 'peru') {
            const precioLocal = producto.precio
                ? `S/. ${Number(producto.precio).toFixed(2)} PEN`
                : 'precio por consultar';
            return `Hola Enigma, vi la *${nombre}* (${precioLocal}) en tu web y me gustaría cotizarla.\n\n🔗 ${url}`;
        }

        const divisa = tieneIntl
            ? (region === 'america' ? `$ ${precioUSD} USD` : `€ ${precioEUR} EUR`)
            : '(price on request)';

        return `Hi Enigma, I saw the *${nombre}* (${divisa}) on your website and I'd like to place an order.\n\n🔗 ${url}`;
    };

    // ── Compartir con Web Share API (Apunta al endpoint de Open Graph) ──
    const handleShare = async () => {
        const urlCompartir = `https://artesaniasenigma.com/producto/${producto.id}`;

        let shareText = '';
        if (region === 'peru') {
            const precioLocal = producto.precio
                ? `S/. ${Number(producto.precio).toFixed(2)} PEN`
                : 'precio por consultar';
            shareText = `✨ ${producto.titulo}\nDesde ${precioLocal} (no incluye envío)\nJoyería de autor hecha a pedido.`;
        } else {
            const divisa = tieneIntl
                ? (region === 'america' ? `$ ${precioUSD} USD` : `€ ${precioEUR} EUR`)
                : '(price on request)';
            shareText = `✨ ${producto.titulo}\nFrom ${divisa} (shipping included)\nHandcrafted exclusively to order.`;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${producto.titulo} | Enigma Joyería`,
                    text: shareText,
                    url: urlCompartir   // ← este genera el preview automático
                });
            } catch (error) {
                console.error("Error al compartir:", error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText}\n${urlCompartir}`);
                alert("Enlace copiado al portapapeles");
            } catch (error) {
                console.error("No se pudo copiar", error);
            }
        }
    };

    // ── Botones del segmented control con banderas (flagcdn.com) ──
    const regiones = [
        { key: 'peru', label: 'Perú', flag: 'pe', flagAlt: 'Perú' },
        { key: 'america', label: 'América', flag: 'us', flagAlt: 'EE.UU.' },
        { key: 'europa', label: 'Europa', flag: 'eu', flagAlt: 'Europa' },
    ];

    return (
        <main className="pt-20 pb-12 bg-gray-50 min-h-screen">

            {/* ── Navegación breadcrumb — NO TOCAR ── */}
            <div className="container mx-auto px-8 max-w-3xl flex justify-between items-center">
                <Link to="/" className="text-sm text-gray-600 hover:text-black hover:underline transition-colors">
                    {t.inicio}
                </Link>
                <Link
                    to={producto?.material_principal && categoriaNombre
                        ? `/catalogo/${producto.material_principal}/${categoriaNombre}`
                        : '/catalogo/all/all'}
                    className="text-sm text-gray-600 hover:text-black hover:underline transition-colors"
                >
                    {producto?.material_principal && categoriaNombre
                        ? `${t.volverA} ${producto.material_principal} / ${categoriaNombre} >`
                        : t.verCatalogo}
                </Link>
            </div>

            <div className="container mx-auto p-4 max-w-3xl bg-white shadow-xl rounded-lg">

                {/* ── Galería — NO TOCAR ── */}
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

                {/* ── Detalles del producto ── */}
                <div className="py-2 mb-8 space-y-6">

                    {/* 1. Título — Playfair Display */}
                    <h2
                        className="text-xl md:text-2xl font-semibold text-gray-900 tracking-wide text-left leading-snug"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {producto.titulo}
                    </h2>

                    {/* 1.5. Material Base */}
                    <p className="text-xs text-gray-500 italic tracking-wide mt-1.5 mb-4 text-left">
                        {t.materialBase}: {producto.material_principal || "Cobre puro forjado con pátinas turquesas"}
                    </p>

                    {/* 2+3. Selector de región con precio integrado */}
                    <div
                        className="border border-gray-200 rounded-xl p-1 flex gap-1 bg-gray-50"
                        style={{
                            transition: 'opacity 180ms ease-in-out',
                            opacity: precioVisible ? 1 : 0,
                        }}
                    >
                        {regiones.map(({ key, label, flag, flagAlt }) => {
                            const isActive = region === key;

                            // Calcular precio para esta región
                            let precioBtn = null;
                            if (key === 'peru') {
                                precioBtn = producto.precio
                                    ? `S/ ${Number(producto.precio).toFixed(2)}`
                                    : null;
                            } else if (key === 'america') {
                                precioBtn = tieneIntl ? `$ ${precioUSD} USD` : null;
                            } else if (key === 'europa') {
                                precioBtn = tieneIntl ? `€ ${precioEUR} EUR` : null;
                            }

                            return (
                                <button
                                    key={key}
                                    onClick={() => cambiarRegion(key)}
                                    className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-lg py-2 px-1 transition-all duration-300"
                                    style={
                                        isActive
                                            ? {
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: '0.7rem',
                                                fontWeight: '600',
                                                color: '#ffffff',
                                                backgroundColor: '#1a1a1a',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                                                letterSpacing: '0.02em',
                                            }
                                            : {
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: '0.7rem',
                                                fontWeight: '400',
                                                color: '#9ca3af',
                                                backgroundColor: 'transparent',
                                            }
                                    }
                                >
                                    <span className="flex items-center gap-1">
                                        <FlagImg code={flag} alt={flagAlt} />
                                        <span>{label}</span>
                                    </span>
                                    {isActive && precioBtn && (
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                color: '#ffffff',
                                                letterSpacing: '0.01em',
                                                marginTop: '2px',
                                            }}
                                        >
                                            {precioBtn}
                                        </span>
                                    )}
                                    {isActive && !precioBtn && (
                                        <span
                                            style={{
                                                fontSize: '0.65rem',
                                                fontWeight: '400',
                                                color: 'rgba(255,255,255,0.7)',
                                                marginTop: '2px',
                                            }}
                                        >
                                            {lang === 'es' ? 'a consultar' : 'on request'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 4. Descripción de la pieza */}
                    {getDescripcion() && (
                        <div className="text-left">
                            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-3">
                                {t.detallesPieza}
                            </h3>
                            <div className={`text-zinc-700 font-light leading-relaxed text-sm space-y-2 ${!isExpanded ? 'line-clamp-4' : ''}`}>
                                {getDescripcion().split(/(?:\r?\n)+|(?=Realizado en )/i).map((part, index) => {
                                    if (!part || part.trim() === '') return null;
                                    return (
                                        <p key={index}>
                                            {part.trim()}
                                        </p>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-xs text-gray-500 font-medium mt-2 hover:text-gray-800 underline transition-colors"
                            >
                                {isExpanded ? t.leerMenos : t.leerMas}
                            </button>
                        </div>
                    )}

                    {/* 5. Nota artesanal */}
                    <div className="text-left border-l-2 border-gray-200 pl-4 py-1">
                        <h3 className="text-xs font-medium text-gray-900 mb-1 flex items-center gap-2">
                            🔹 {t.notaArtesanal}
                        </h3>
                        <p className="text-xs text-gray-600 font-light italic">
                            🛠 {t.notaImagen}
                        </p>
                        <p className="text-xs text-gray-600 font-medium mt-2">
                            {t.notaIgv}
                        </p>
                    </div>

                    {/* 6. Acordeón: Detalles de envío */}
                    <div className="border-t border-b border-gray-100">
                        <button
                            className="w-full flex justify-between items-center cursor-pointer py-3.5 text-left bg-transparent border-none"
                            onClick={() => setAcordeon1(!acordeon1)}
                            aria-expanded={acordeon1}
                        >
                            <span
                                className="text-xs font-medium text-gray-600 uppercase tracking-wider"
                                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}
                            >
                                {t.envioTitulo}
                            </span>
                            <ChevronIcono abierto={acordeon1} />
                        </button>
                        <div
                            style={{
                                maxHeight: acordeon1 ? '300px' : '0px',
                                overflow: 'hidden',
                                transition: 'max-height 300ms ease-in-out',
                            }}
                        >
                            <p
                                className="text-xs text-gray-500 font-light leading-relaxed pb-4 pr-2"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {getEnvioTexto()}
                            </p>
                        </div>
                    </div>

                    {/* 7. Acordeón: Métodos de pago */}
                    <div className="border-b border-gray-100">
                        <button
                            className="w-full flex justify-between items-center cursor-pointer py-3.5 text-left bg-transparent border-none"
                            onClick={() => setAcordeon2(!acordeon2)}
                            aria-expanded={acordeon2}
                        >
                            <span
                                className="text-xs font-medium text-gray-600 uppercase tracking-wider"
                                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em' }}
                            >
                                {t.pagoTitulo}
                            </span>
                            <ChevronIcono abierto={acordeon2} />
                        </button>
                        <div
                            style={{
                                maxHeight: acordeon2 ? '300px' : '0px',
                                overflow: 'hidden',
                                transition: 'max-height 300ms ease-in-out',
                            }}
                        >
                            <p
                                className="text-xs text-gray-500 font-light leading-relaxed pb-4 pr-2"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {getPagoTexto()}
                            </p>
                        </div>
                    </div>

                    {/* 8. Botón CTA WhatsApp */}
                    <div className="pt-3">
                        <a
                            href={`https://wa.me/51960282376?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center bg-green-700 hover:bg-green-800 text-white text-sm font-medium tracking-wide rounded-xl py-3.5 px-6 shadow-md hover:shadow-lg transition-all duration-300"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            {t.cotizar}
                        </a>
                    </div>

                    {/* 9. Botón Compartir */}
                    <div className="pt-1 pb-2 border-b border-gray-100">
                        <button
                            onClick={handleShare}
                            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium py-2 rounded-lg transition-colors border border-transparent hover:bg-gray-100"
                        >
                            <ShareIcono /> {t.compartir}
                        </button>
                    </div>

                </div>

                {/* 10. Productos relacionados — NO TOCAR ── */}
                <div className="py-6 mb-2">
                    <h2 className="text-1xl font-bold mb-4 text-left">
                        {t.relacionados}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                        {relacionados.length > 0 ? (
                            relacionados.map((relatedProducto) => (
                                <div key={relatedProducto.id} className="text-center">
                                    <Link to={`/producto/${relatedProducto.id}`}>
                                        <img
                                            src={relatedProducto.imagen_principal_url}
                                            alt={relatedProducto.titulo}
                                            className="w-full h-48 sm:h-56 object-cover rounded hover:shadow-lg transition-shadow"
                                        />
                                        <h3 className="mt-2 text-sm font-semibold text-gray-800">{relatedProducto.titulo}</h3>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">
                                {t.sinRelacionados}
                            </p>
                        )}
                    </div>
                </div>

            </div>

            {/* ── ImageModal — NO TOCAR ── */}
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
