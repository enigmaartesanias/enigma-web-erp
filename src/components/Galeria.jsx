import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// ==========================================
// 1. DATOS Y CONFIGURACIÓN
// ==========================================

const COBRE_CATEGORIES = [
    { name: "Aretes", slug: "Arete", nuevo: false },
    { name: "Pulseras", slug: "Pulsera", nuevo: false },
    { name: "Anillos", slug: "Anillo", nuevo: false },
    { name: "Collares", slug: "Collar", nuevo: false },
    { name: "Vinchas", slug: "VINCHA_TIARA", nuevo: true },
    { name: "Tobilleras", slug: "TOBILLERA", nuevo: true },
];

const ALPAPER_CATEGORIES = [
    { name: "Aretes", slug: "Arete", nuevo: false },
    { name: "Pulseras", slug: "Pulsera", nuevo: false },
    { name: "Anillos", slug: "Anillo", nuevo: false },
    { name: "Collares", slug: "Collar", nuevo: false },
];

const PLATA_CATEGORIES = [
    { name: "Aretes", slug: "Arete", nuevo: false },
    { name: "Pulseras", slug: "Pulsera", nuevo: false },
    { name: "Anillos", slug: "Anillo", nuevo: false },
    { name: "Collares", slug: "Collar", nuevo: false },
];

const MATERIAL_CARDS = [
    {
        name: "Colección Cobre",
        title: "Cobre Artesanal",
        key: "cobre",
        image: "/images/pulsera3.jpg",
        categories: COBRE_CATEGORIES,
        allRoute: "/cobre#coleccion",
        allLabel: "Ver historia de la colección",
    },
    {
        name: "Colección Alpaca",
        title: "Alpaca Forjada",
        key: "alpaca",
        image: "/images/collar23.jpg",
        categories: ALPAPER_CATEGORIES,
        allRoute: "/catalogo/Alpaca/all",
        allLabel: "Ver toda la colección",
    },
    {
        name: "Colección Plata",
        title: "Plata 950",
        key: "plata",
        image: "/images/anillo2.jpg",
        categories: PLATA_CATEGORIES,
        allRoute: "/catalogo/Plata/all",
        allLabel: "Ver toda la colección",
    },
];

// ==========================================
// 2. OVERLAY DE IMAGEN UNIFORME (reutilizable)
// ==========================================
// Mismo tratamiento de gradiente oscuro usado en el hero de /andru-donalds
// (CelebrityCollaboration.jsx). Neutro en color: no tiñe las piezas hacia
// cobre, solo unifica contraste y profundidad entre fotos de fondos distintos.
const IMAGE_OVERLAY_STYLE = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(42,32,24,0.32) 0%, rgba(42,32,24,0.05) 35%, rgba(42,32,24,0.05) 65%, rgba(42,32,24,0.38) 100%)',
    pointerEvents: 'none',
};

// Imagen única a ancho completo, con el overlay de gradiente aplicado de
// forma genérica (no hardcodeado por material) para que las 3 tarjetas
// luzcan consistentes entre sí.
const CollageThumb = ({ src, alt }) => (
    <div
        style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }}
    >
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            style={{ display: 'block' }}
        />
        <div style={IMAGE_OVERLAY_STYLE} />
    </div>
);

// ==========================================
// 3. LISTA DE CATEGORÍAS (texto plano, sin cajas)
// Compartida entre el modo mobile (panel lateral) y el modo
// desktop (acordeón inferior refinado).
// ==========================================
const CategoryList = ({ categories, materialCapitalized, allRoute, allLabel }) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {categories.map((cat, idx) => (
            <Link
                key={cat.slug}
                to={`/catalogo/${materialCapitalized}/${cat.slug}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 2px',
                    borderBottom: idx === categories.length - 1 ? 'none' : '0.5px solid #ede9e4',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    color: '#241508',
                    textDecoration: 'none',
                    transition: 'color 0.18s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#b07d35'}
                onMouseLeave={e => e.currentTarget.style.color = '#241508'}
            >
                <span>{cat.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cat.nuevo && (
                        <span style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            background: '#c8964a',
                            borderRadius: '50%',
                            flexShrink: 0,
                        }} />
                    )}
                    <span style={{ color: '#c8964a', fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>›</span>
                </span>
            </Link>
        ))}

        <Link
            to={allRoute}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '0.5px solid #ede9e4',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#78716c',
                textDecoration: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#c8964a'}
            onMouseLeave={e => e.currentTarget.style.color = '#78716c'}
        >
            {allLabel} &nbsp;→
        </Link>
    </div>
);

// ==========================================
// 4. COMPONENTE ACORDEÓN / SLIDE REUTILIZABLE
// ==========================================

const AccordionCard = ({ card, open, onToggle }) => {
    const [isMobile, setIsMobile] = useState(false);

    const { title, key, image, categories, allRoute, allLabel } = card;

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        setIsMobile(mq.matches);
        const listener = () => setIsMobile(mq.matches);
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);

    // Altura base del collage/panel mobile. Se calcula según el número de
    // categorías para que el salto al abrir sea sutil: cada fila de categoría
    // ocupa ~41px (10px padding arriba+abajo + 14px texto + 0.5px borde),
    // más ~46px para el header "Explorar" y el link final "Ver historia".
    // Con 4 categorías (Alpaca/Plata) ≈ 210px. Con 6 (Cobre) ≈ 292px.
    const categoryRowHeight = 41;
    const panelChrome = 46; // header "Explorar" + link "Ver historia" + paddings
    const calculatedPanelHeight = categories.length * categoryRowHeight + panelChrome;
    const mobileBaseHeight = Math.max(200, calculatedPanelHeight);

    const materialCapitalized = key.charAt(0).toUpperCase() + key.slice(1);

    // Solo hay 1 imagen disponible por colección (Firebase Hosting), no 4.
    // En vez de simular un collage repitiendo la misma foto, se muestra una
    // única imagen a ancho completo con el overlay de gradiente de marca.

    // ──────────────────────────────────────────────
    // MODO MOBILE: collage se comprime lateralmente,
    // panel de texto aparece a la derecha.
    // ──────────────────────────────────────────────
    if (isMobile) {
        return (
            <div className="w-full">
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: open ? 'auto' : `${mobileBaseHeight}px`,
                        minHeight: open ? `${mobileBaseHeight}px` : undefined,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        alignItems: open ? 'stretch' : undefined,
                        transition: 'min-height 0.32s ease-in-out',
                    }}
                >
                    {/* Imagen: se comprime a una franja ancla cuando está abierto.
                        La altura base (mobileBaseHeight) ya contempla el número
                        de categorías de esta tarjeta, así el salto al abrir es
                        sutil en vez de un brinco vertical brusco. */}
                    <div
                        onClick={onToggle}
                        style={{
                            position: 'relative',
                            flex: open ? '0 0 36px' : '1 1 100%',
                            transition: 'flex-basis 0.32s ease-in-out',
                            height: open ? '100%' : `${mobileBaseHeight}px`,
                            minHeight: open ? `${mobileBaseHeight}px` : undefined,
                            overflow: 'hidden',
                        }}
                    >
                        <CollageThumb src={image} alt={title} />

                        {/* Indicador de deslizar/expandir — visible siempre en estado cerrado */}
                        {!open && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                right: '8px',
                                transform: 'translateY(-50%)',
                                width: '24px',
                                height: '40px',
                                background: 'rgba(26,14,6,0.55)',
                                backdropFilter: 'blur(3px)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                            }}>
                                <span style={{ color: '#f5f1ec', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>‹</span>
                            </div>
                        )}
                    </div>

                    {/* Panel de categorías: solo ocupa espacio cuando está abierto.
                        overflow visible (no 'hidden') para que las listas largas
                        como Cobre (6 categorías) no se corten — la fila padre
                        crece con height:'auto' para acomodar el contenido real. */}
                    <div
                        onClick={onToggle}
                        style={{
                            flex: open ? '1 1 auto' : '0 0 0px',
                            opacity: open ? 1 : 0,
                            transition: 'opacity 0.28s ease-in-out 0.06s',
                            padding: open ? '4px 4px 4px 14px' : '0',
                            overflow: open ? 'visible' : 'hidden',
                            cursor: 'pointer',
                        }}
                    >
                        {open && (
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '10px',
                                fontWeight: '600',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: '#78716c',
                                margin: '0 0 8px',
                            }}>
                                Explorar
                            </p>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                            {open && (
                                <CategoryList
                                    categories={categories}
                                    materialCapitalized={materialCapitalized}
                                    allRoute={allRoute}
                                    allLabel={allLabel}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Cabecera de texto */}
                <div className="flex items-center px-1 pt-3 pb-1 cursor-pointer" onClick={onToggle}>
                    <div>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: '#c8964a',
                            margin: '0 0 2px',
                        }}>
                            Colección
                        </p>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '22px',
                            fontWeight: '400',
                            color: '#1a1008',
                            letterSpacing: '0.02em',
                            margin: 0,
                        }}>
                            {title}
                        </p>
                    </div>
                </div>

                {/* Texto invitación cuando está cerrado */}
                {!open && (
                    <div
                        onClick={onToggle}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '6px 0 2px',
                            borderTop: '0.5px solid #f0ede9',
                            marginTop: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#b07d35',
                        }}>
                            Desliza para explorar categorías
                        </span>
                        <span style={{ color: '#b07d35', fontSize: '12px', lineHeight: 1, fontWeight: 'bold' }}>‹</span>
                    </div>
                )}
            </div>
        );
    }

    // ──────────────────────────────────────────────
    // MODO DESKTOP: acordeón vertical refinado.
    // Mismo mecanismo de apertura (maxHeight) que antes,
    // pero la lista de categorías ahora es texto plano
    // (CategoryList) en vez de cajas con fondo y borde.
    // ──────────────────────────────────────────────
    return (
        <div className="w-full">
            {/* Imagen con pill superpuesto */}
            <div
                className="relative w-full rounded-xl overflow-hidden cursor-pointer shadow-sm"
                style={{ height: '260px' }}
                onClick={onToggle}
            >
                <CollageThumb src={image} alt={title} />

                {/* Pill Explorar / Cerrar */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(26,14,6,0.82)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    pointerEvents: 'none',
                }}>
                    <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#f5f1ec',
                    }}>
                        {open ? 'Cerrar' : 'Explorar'}
                    </span>
                    <span style={{
                        fontSize: '12px',
                        color: '#c8964a',
                        transition: 'transform 0.3s ease',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                        lineHeight: 1,
                        fontWeight: 'bold'
                    }}>
                        ⌄
                    </span>
                </div>
            </div>

            {/* Cabecera de texto */}
            <div className="flex items-center px-1 pt-3 pb-1 cursor-pointer" onClick={onToggle}>
                <div>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                        margin: '0 0 2px',
                    }}>
                        Colección
                    </p>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '22px',
                        fontWeight: '400',
                        color: '#1a1008',
                        letterSpacing: '0.02em',
                        margin: 0,
                    }}>
                        {title}
                    </p>
                </div>
            </div>

            {/* Texto invitación cuando está cerrado */}
            {!open && (
                <div
                    onClick={onToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '6px 0 2px',
                        borderTop: '0.5px solid #f0ede9',
                        marginTop: '4px',
                        cursor: 'pointer',
                    }}
                >
                    <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#b07d35',
                    }}>
                        Toca para explorar categorías
                    </span>
                    <span style={{ color: '#b07d35', fontSize: '12px', lineHeight: 1, fontWeight: 'bold' }}>⌄</span>
                </div>
            )}

            {/* Acordeón desplegable: ahora lista de texto plano, sin cajas */}
            <div style={{
                maxHeight: open ? '420px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s ease-in-out',
            }}>
                <div style={{
                    borderTop: '0.5px solid #ede9e4',
                    padding: '12px 2px 16px',
                }}>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#78716c',
                        margin: '0 0 10px',
                    }}>
                        Explorar por categoría
                    </p>

                    <CategoryList
                        categories={categories}
                        materialCapitalized={materialCapitalized}
                        allRoute={allRoute}
                        allLabel={allLabel}
                    />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 5. COMPONENTE PRINCIPAL (GALERIA)
// ==========================================

const Galeria = () => {
    // Controlamos de forma centralizada qué tarjeta está abierta para aplicar el espaciado
    const [activeKey, setActiveKey] = useState(null);

    const toggleCard = (key) => {
        setActiveKey(activeKey === key ? null : key);
    };

    return (
        // Fondo optimizado a un tono hueso/piedra elegante para dar contraste nítido con las tarjetas blancas
        <section className="pt-6 pb-12 lg:py-12 bg-[#f4f1eb] font-sans">
            <div className="container mx-auto px-3">

                {/* Encabezado de sección */}
                <div className="text-center mb-8">
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                        margin: '0 0 6px',
                    }}>
                        Materiales
                    </p>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(26px, 4.5vw, 36px)',
                        fontWeight: '300',
                        color: '#2a2018',
                        letterSpacing: '0.04em',
                        margin: '0 0 8px',
                    }}>
                        Colecciones Artesanales
                    </h2>
                    <div style={{
                        width: '30px',
                        height: '0.5px',
                        background: '#c8964a',
                        opacity: 0.6,
                        margin: '0 auto 10px',
                    }} />
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        fontWeight: '300',
                        color: '#78716c',
                        letterSpacing: '0.04em',
                        margin: 0,
                    }}>
                        Piezas únicas por material y acabado · Hechas a pedido
                    </p>
                </div>

                {/* Grid de tarjetas con espaciado estructural y dinámico */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-6">
                    {MATERIAL_CARDS.map((card) => {
                        const isCardOpen = activeKey === card.key;
                        return (
                            <div
                                key={card.key}
                                // mb-10 inyectado dinámicamente si la tarjeta está abierta para aislarla del bloque inferior
                                className={`flex flex-col bg-white p-4 rounded-xl shadow-md border border-stone-200/40 transition-all duration-300 w-full lg:w-[32%] ${isCardOpen
                                    ? 'mb-10 ring-1 ring-amber-500/20 shadow-xl'
                                    : 'mb-5 lg:mb-0'
                                    }`}
                            >
                                <AccordionCard
                                    card={card}
                                    open={isCardOpen}
                                    onToggle={() => toggleCard(card.key)}
                                />
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default Galeria;
