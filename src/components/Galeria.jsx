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
    { name: "Vinchas", slug: "VINCHA_TIARA", nuevo: false },
    { name: "Tobilleras", slug: "TOBILLERA", nuevo: false },
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
        // Antes faltaba: el enlace del panel mostraba solo la flecha "→"
        allLabel: "Ver toda la colección",
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

// Texto de la fila que invita a abrir el menú (tarjeta cerrada)
const OPEN_LABEL = "Ver toda la colección";

// ==========================================
// 2. OVERLAY DE IMAGEN UNIFORME (reutilizable)
// ==========================================
// Mismo tratamiento de gradiente oscuro usado en el hero de /andru-donalds
// (CelebrityCollaboration.jsx). Neutro en color: no tiñe las piezas hacia
// cobre, solo unifica contraste y profundidad entre fotos de fondos distintos.
const IMAGE_OVERLAY_STYLE = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(42,32,24,0.55) 0%, rgba(42,32,24,0.18) 35%, rgba(42,32,24,0.18) 65%, rgba(42,32,24,0.6) 100%)',
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
// 2.b TÍTULO DE TARJETA (arriba de la imagen, alineado a la izquierda)
// Se usa igual en mobile y desktop. Es clickeable para abrir/cerrar.
// ==========================================
const CardTitle = ({ title, onToggle }) => (
    <div
        onClick={onToggle}
        style={{
            padding: '0 2px 10px',
            cursor: 'pointer',
            textAlign: 'left',
        }}
    >
        <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '24px',
            fontWeight: '400',
            color: '#1a1008',
            letterSpacing: '0.02em',
            lineHeight: 1.15,
            margin: 0,
        }}>
            {title}
        </p>
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
                    padding: '8px 2px',
                    borderBottom: idx === categories.length - 1 ? 'none' : '0.5px solid rgba(237,233,228,0.7)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '22px',
                    fontWeight: '500',
                    lineHeight: '1.3',
                    letterSpacing: '0.02em',
                    color: '#2a2018',
                    textDecoration: 'none',
                    transition: 'color 0.18s ease, transform 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c8964a'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#2a2018'; e.currentTarget.style.transform = 'translateX(0)'; }}
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
                </span>
            </Link>
        ))}

        {allLabel && (
            <Link
                to={allRoute}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '0.5px solid rgba(237,233,228,0.7)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: '600',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#b07d35',
                    textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#c8964a'}
                onMouseLeave={e => e.currentTarget.style.color = '#b07d35'}
            >
                {allLabel} &nbsp;→
            </Link>
        )}
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

    // Altura base del panel mobile. Se calcula según el número de categorías
    // para que el salto al abrir sea sutil. Cada fila ocupa ~45px
    // (8px padding arriba+abajo + ~29px texto a 22px/1.3 + 0.5px borde),
    // más ~74px para el botón cerrar (X) y el pie compacto
    // (solo el enlace "Ver toda la colección").
    const categoryRowHeight = 45;
    const panelChrome = 74;
    const calculatedPanelHeight = categories.length * categoryRowHeight + panelChrome;
    const mobileBaseHeight = Math.max(200, calculatedPanelHeight);

    const materialCapitalized = key.charAt(0).toUpperCase() + key.slice(1);

    // ──────────────────────────────────────────────
    // MODO MOBILE: título arriba, collage se comprime
    // lateralmente, panel de texto aparece a la derecha.
    // ──────────────────────────────────────────────
    if (isMobile) {
        return (
            <div className="w-full">
                {/* Título arriba, alineado a la izquierda */}
                <CardTitle title={title} onToggle={onToggle} />

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
                    {/* Imagen: se comprime a una franja ancla cuando está abierto. */}
                    <div
                        onClick={onToggle}
                        style={{
                            position: 'relative',
                            flex: open ? '0 0 40px' : '1 1 100%',
                            transition: 'flex-basis 0.32s ease-in-out',
                            height: open ? '100%' : `${mobileBaseHeight}px`,
                            minHeight: open ? `${mobileBaseHeight}px` : undefined,
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0 }}>
                            <CollageThumb src={image} alt={title} />
                        </div>

                        {/* Indicador de deslizar/expandir — visible en estado cerrado */}
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
                        overflow visible para que listas largas (Cobre, 6 categorías)
                        no se corten. */}
                    <div
                        onClick={onToggle}
                        style={{
                            flex: open ? '1 1 auto' : '0 0 0px',
                            minWidth: 0,
                            opacity: open ? 1 : 0,
                            transition: 'opacity 0.28s ease-in-out 0.06s',
                            padding: open ? '4px 4px 4px 14px' : '0',
                            overflow: open ? 'visible' : 'hidden',
                            cursor: 'pointer',
                        }}
                    >
                        {open && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                marginBottom: '2px',
                            }}>
                                {/* Botón de cierre: X fina, área de toque de 30px */}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                                    aria-label="Cerrar categorías"
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        background: 'transparent',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        padding: 0,
                                        color: '#8a7f73',
                                        transition: 'color 0.18s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#c8964a'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#8a7f73'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
                                        <path d="M3 3l10 10M13 3L3 13" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                            {open && (
                                <CategoryList
                                    categories={categories}
                                    materialCapitalized={materialCapitalized}
                                    allRoute={allRoute}
                                    allLabel={null}
                                />
                            )}
                        </div>

                        {/* Pie compacto del panel abierto: solo el enlace a la
                            colección completa (el título ya está arriba). */}
                        {open && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    marginTop: '8px',
                                    paddingTop: '10px',
                                    borderTop: '0.5px solid #ede9e4',
                                }}
                            >
                                <Link
                                    to={allRoute}
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: '#b07d35',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {allLabel || OPEN_LABEL} →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invitación para abrir el menú: solo cuando está cerrado */}
                {!open && (
                    <div
                        onClick={onToggle}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 0 2px',
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            fontWeight: '600',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#b07d35',
                        }}>
                            {OPEN_LABEL}
                        </span>
                        <span style={{ color: '#b07d35', fontSize: '11px', lineHeight: 1, fontWeight: 'bold' }}>‹</span>
                    </div>
                )}
            </div>
        );
    }

    // ──────────────────────────────────────────────
    // MODO DESKTOP: título arriba, imagen, fila con
    // "Ver toda la colección" y acordeón vertical.
    // Se eliminó la pill "Explorar" de la imagen.
    // ──────────────────────────────────────────────
    return (
        <div className="w-full">
            {/* Título arriba, alineado a la izquierda */}
            <CardTitle title={title} onToggle={onToggle} />

            {/* Imagen */}
            <div
                className="relative w-full rounded-xl overflow-hidden cursor-pointer shadow-sm"
                style={{ height: '220px' }}
                onClick={onToggle}
            >
                <CollageThumb src={image} alt={title} />
            </div>

            {/* Fila de invitación: el chevron rota al abrir */}
            <div
                onClick={onToggle}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 0 2px',
                    cursor: 'pointer',
                }}
            >
                <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: '600',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#b07d35',
                }}>
                    {OPEN_LABEL}
                </span>
                <span style={{
                    color: '#b07d35',
                    fontSize: '11px',
                    lineHeight: 1,
                    fontWeight: 'bold',
                    display: 'inline-block',
                    transition: 'transform 0.3s ease',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                    ⌄
                </span>
            </div>

            {/* Acordeón desplegable: lista de texto plano, sin cajas */}
            <div style={{
                maxHeight: open ? '420px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s ease-in-out',
            }}>
                <div style={{
                    borderTop: '0.5px solid #ede9e4',
                    padding: '8px 2px 14px',
                    marginTop: '6px',
                }}>
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
        // Zona marfil/taller — resalta las galerías fotográficas de colecciones de materiales
        <section className="pt-10 pb-10 lg:py-10 bg-[#fdfbf7] font-sans">
            <div className="container mx-auto px-3">

                {/* Encabezado de sección (se eliminó "MATERIALES") */}
                <div className="text-center mb-5">
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(34px, 4.5vw, 34px)',
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
                        margin: '0 auto',
                    }} />
                </div>

                {/* Grid de tarjetas con espaciado compacto */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-6">
                    {MATERIAL_CARDS.map((card) => {
                        const isCardOpen = activeKey === card.key;
                        return (
                            <div
                                key={card.key}
                                // mb-8 solo si la tarjeta está abierta para aislarla del bloque inferior
                                className={`flex flex-col bg-white p-3 rounded-xl shadow-md border border-stone-200/40 transition-all duration-300 w-full lg:w-[32%] ${isCardOpen
                                    ? 'mb-8 ring-1 ring-amber-500/20 shadow-xl'
                                    : 'mb-6 lg:mb-0'
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