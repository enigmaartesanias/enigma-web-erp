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

const ALPACA_CATEGORIES = [
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
        categories: ALPACA_CATEGORIES,
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
// 2. COMPONENTE ACORDEÓN REUTILIZABLE
// ==========================================

const AccordionCard = ({ card }) => {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { title, key, image, categories, allRoute, allLabel } = card;

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        setIsMobile(mq.matches);
        const listener = () => setIsMobile(mq.matches);
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);

    const materialCapitalized = key.charAt(0).toUpperCase() + key.slice(1);

    return (
        <div className="w-full">
            {/* ── Imagen con pill superpuesto ── */}
            <div
                className="relative w-full rounded-xl overflow-hidden cursor-pointer"
                style={{ height: isMobile ? '200px' : '260px' }}
                onClick={() => setOpen(!open)}
            >
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700"
                    style={{ transform: open ? 'scale(1.03)' : 'scale(1)' }}
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                {/* Pill Explorar / Cerrar */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(26,14,6,0.72)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    pointerEvents: 'none',
                }}>
                    <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '9px',
                        fontWeight: '500',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#f5f1ec',
                    }}>
                        {open ? 'Cerrar' : 'Explorar'}
                    </span>
                    <span style={{
                        fontSize: '11px',
                        color: '#c8964a',
                        transition: 'transform 0.3s ease',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                        lineHeight: 1,
                    }}>
                        ⌄
                    </span>
                </div>
            </div>

            {/* ── Cabecera de texto ── */}
            <div
                className="flex items-center px-1 pt-3 pb-1 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <div>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '9px',
                        fontWeight: '500',
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                        margin: '0 0 2px',
                    }}>
                        Colección
                    </p>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px',
                        fontWeight: '300',
                        color: '#2a2018',
                        letterSpacing: '0.04em',
                        margin: 0,
                    }}>
                        {title}
                    </p>
                </div>
            </div>

            {/* ── Texto invitación cuando está cerrado ── */}
            {!open && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    paddingBottom: '4px',
                }}>
                    <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '9px',
                        fontWeight: '400',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                    }}>
                        Toca para explorar categorías
                    </span>
                    <span style={{ color: '#c8964a', fontSize: '11px', lineHeight: 1 }}>⌄</span>
                </div>
            )}

            {/* ── Acordeón desplegable ── */}
            <div style={{
                maxHeight: open ? '320px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s ease-in-out',
            }}>
                <div style={{
                    borderTop: '0.5px solid #ede9e4',
                    padding: '12px 2px 4px',
                }}>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '8px',
                        fontWeight: '500',
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: '#a8a29e',
                        margin: '0 0 10px',
                    }}>
                        Explorar por categoría
                    </p>

                    {/* Grid 2 columnas */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '5px',
                    }}>
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                to={`/catalogo/${materialCapitalized}/${cat.slug}`}
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '10px',
                                    fontWeight: '400',
                                    letterSpacing: '0.1em',
                                    color: '#3a2a1a',
                                    background: '#f7f4f0',
                                    border: '0.5px solid #e8e2da',
                                    borderRadius: '8px',
                                    padding: '7px 10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    textDecoration: 'none',
                                    transition: 'background 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#ede6dc'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f7f4f0'}
                            >
                                <span>{cat.name}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                    <span style={{ color: '#c8964a', fontSize: '13px', fontWeight: '300' }}>›</span>
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Ver toda la colección */}
                    <Link
                        to={allRoute}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '0.5px solid #ede9e4',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '9px',
                            fontWeight: '400',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: '#a8a29e',
                            textDecoration: 'none',
                        }}
                    >
                        {allLabel} &nbsp;→
                    </Link>
                </div>
            </div>

        </div>
    );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (GALERIA)
// ==========================================

const Galeria = () => {
    return (
        <section className="pt-2 pb-8 lg:py-8 bg-gray-100 font-sans">
            <div className="container mx-auto px-3">

                {/* Encabezado de sección */}
                <div className="text-center mb-10">
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '9px',
                        fontWeight: '500',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                        margin: '0 0 8px',
                    }}>
                        Materiales
                    </p>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(24px, 4vw, 34px)',
                        fontWeight: '300',
                        color: '#2a2018',
                        letterSpacing: '0.04em',
                        margin: '0 0 8px',
                    }}>
                        Colecciones Artesanales
                    </h2>
                    <div style={{
                        width: '24px',
                        height: '0.5px',
                        background: '#c8964a',
                        opacity: 0.6,
                        margin: '0 auto 10px',
                    }} />
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '300',
                        color: '#a8a29e',
                        letterSpacing: '0.06em',
                        margin: 0,
                    }}>
                        Piezas únicas por material y acabado · Hechas a pedido
                    </p>
                </div>

                {/* Grid de tarjetas */}
                <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-6">
                    {MATERIAL_CARDS.map((card) => (
                        <div
                            key={card.key}
                            className="flex flex-col bg-white p-4 rounded-xl shadow-xl border border-gray-200 transition-all duration-300 hover:shadow-2xl w-full lg:w-[32%]"
                        >
                            <AccordionCard card={card} />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Galeria;

