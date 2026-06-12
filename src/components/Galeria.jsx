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
// 2. COMPONENTE ACORDEÓN REUTILIZABLE
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

    const materialCapitalized = key.charAt(0).toUpperCase() + key.slice(1);

    return (
        <div className="w-full">
            {/* ── Imagen con pill superpuesto ── */}
            <div
                className="relative w-full rounded-xl overflow-hidden cursor-pointer shadow-sm"
                style={{ height: isMobile ? '200px' : '260px' }}
                onClick={onToggle}
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

            {/* ── Cabecera de texto ── */}
            <div
                className="flex items-center px-1 pt-3 pb-1 cursor-pointer"
                onClick={onToggle}
            >
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

            {/* ── Texto invitación cuando está cerrado ── */}
            {!open && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 0 2px',
                    borderTop: '0.5px solid #f0ede9',
                    marginTop: '4px'
                }}>
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

            {/* ── Acordeón desplegable ── */}
            <div style={{
                maxHeight: open ? '400px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s ease-in-out',
            }}>
                {/* pb-4 añadido para que las categorías inferiores respiren y no queden pegadas al borde */}
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

                    {/* Grid 2 columnas */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                    }}>
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                to={`/catalogo/${materialCapitalized}/${cat.slug}`}
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    letterSpacing: '0.02em',
                                    color: '#241508',
                                    background: '#faf8f5',
                                    border: '0.5px solid #dfd9d0',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    textDecoration: 'none',
                                    transition: 'all 0.18s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#f0eae1';
                                    e.currentTarget.style.borderColor = '#c8964a';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = '#faf8f5';
                                    e.currentTarget.style.borderColor = '#dfd9d0';
                                }}
                            >
                                <span className="font-medium">{cat.name}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                    </div>

                    {/* Ver toda la colección */}
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
            </div>

        </div>
    );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (GALERIA)
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