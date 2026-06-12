import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// ==========================================
// 1. DATOS Y CONFIGURACIÓN
// ==========================================

<<<<<<< HEAD
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
=======
const DEFAULT_SUBTITLE = "Explora nuestra colección exclusiva";

const BASE_ROUTES = {
    plata: {
        aretes: "/catalogo/Plata/Arete",
        pulseras: "/catalogo/Plata/Pulsera",
        anillos: "/catalogo/Plata/Anillo",
        collares: "/catalogo/Plata/Collar",
        all: "/catalogo/Plata/all",
    },
    alpaca: {
        aretes: "/catalogo/Alpaca/Arete",
        pulseras: "/catalogo/Alpaca/Pulsera",
        anillos: "/catalogo/Alpaca/Anillo",
        collares: "/catalogo/Alpaca/Collar",
        all: "/catalogo/Alpaca/all",
    },
    cobre: {
        aretes: "/catalogo/Cobre/Arete",
        pulseras: "/catalogo/Cobre/Pulsera",
        anillos: "/catalogo/Cobre/Anillo",
        collares: "/catalogo/Cobre/Collar",
        all: "/cobre#coleccion",
    },
};

const CATEGORIES = [
    { name: "Aretes", slug: "Arete" },
    { name: "Pulseras", slug: "Pulsera" },
    { name: "Anillos", slug: "Anillo" },
    { name: "Collares", slug: "Collar" },
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
];

// ── Categorías extendidas para el acordeón de Cobre ──
const COBRE_CATEGORIES = [
    { name: "Aretes", slug: "Arete", nuevo: false },
    { name: "Pulseras", slug: "Pulsera", nuevo: false },
    { name: "Anillos", slug: "Anillo", nuevo: false },
    { name: "Collares", slug: "Collar", nuevo: false },
    { name: "Vinchas", slug: "VINCHA_TIARA", nuevo: true },
    { name: "Tobilleras", slug: "TOBILLERA", nuevo: true },
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

<<<<<<< HEAD
const AccordionCard = ({ card }) => {
    const [open, setOpen] = useState(false);
=======
const MaterialCard = ({ card, isActive, isAnyCardActive, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { name, description, image, images, key, categories, link, isCustom } = card;
    const navigate = useNavigate();

    const getRoute = (materialKey, categorySlug) => {
        if (isCustom) return link;
        const materialCapitalized = materialKey.charAt(0).toUpperCase() + materialKey.slice(1);
        return `/catalogo/${materialCapitalized}/${categorySlug}`;
    };

>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
    const [isMobile, setIsMobile] = useState(false);

    const { title, key, image, categories, allRoute, allLabel } = card;

    useEffect(() => {
<<<<<<< HEAD
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
=======
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        setIsMobile(mediaQuery.matches);
        const listener = () => setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    // ── TARJETA COBRE: acordeón con categorías directas ──
    if (key === 'cobre') {
        const [cobreOpen, setCobreOpen] = useState(false);

        return (
            <div className="w-full">
                {/* Imagen */}
                <div
                    className="relative w-full rounded-xl overflow-hidden cursor-pointer"
                    style={{ height: isMobile ? '200px' : '260px' }}
                    onClick={() => setCobreOpen(!cobreOpen)}
                >
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{ transform: cobreOpen ? 'scale(1.03)' : 'scale(1)' }}
                    />
                    {/* Overlay sutil siempre presente */}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                </div>

                {/* Cabecera con chevron — toca para expandir */}
                <div
                    className="flex items-center justify-between px-1 pt-3 pb-1 cursor-pointer"
                    onClick={() => setCobreOpen(!cobreOpen)}
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
                            Cobre Artesanal
                        </p>
                    </div>
                    <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '18px',
                        fontWeight: '300',
                        color: '#c8964a',
                        lineHeight: 1,
                        transition: 'transform 0.3s ease',
                        transform: cobreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                        paddingRight: '2px',
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
                    }}>
                        ⌄
                    </span>
                </div>

                {/* Acordeón: grid 2 columnas × 3 filas */}
                <div style={{
                    maxHeight: cobreOpen ? '280px' : '0px',
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
                            gap: '7px',
                        }}>
                            {COBRE_CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    to={`/catalogo/Cobre/${cat.slug}`}
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '11px',
                                        fontWeight: '400',
                                        letterSpacing: '0.1em',
                                        color: '#3a2a1a',
                                        background: '#f7f4f0',
                                        border: '0.5px solid #e8e2da',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
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
                            to="/cobre#coleccion"
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
                            Ver historia de la colección &nbsp;→
                        </Link>
                    </div>
                </div>

                {/* Texto copy cuando está cerrado */}
                {!cobreOpen && (
                    <div className="mt-2 flex justify-center">
                        <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            fontWeight: '300',
                            color: '#a8a29e',
                            letterSpacing: '0.05em',
                        }}>
                            Aretes · Pulseras · Anillos · y más
                        </span>
                    </div>
                )}
            </div>

<<<<<<< HEAD
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
=======
    // ── Helper para agrupar categorías en pares ──
    const chunkedCategories = [];
    if (categories) {
        for (let i = 0; i < categories.length; i += 2) {
            chunkedCategories.push(categories.slice(i, i + 2));
        }
    }

    // En móviles
    if (isMobile) {
        return (
            <div
                className="w-full relative overflow-hidden rounded-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => {
                    if (key === 'cobre') navigate('/cobre#coleccion');
                }}
            >
                <div className="relative w-full h-64 p-3">
                    {images && images.length >= 5 ? (
                        <div className="grid grid-cols-4 grid-rows-2 gap-1 w-full h-full rounded-lg overflow-hidden relative group">
                            <div className="col-span-2 row-span-2 overflow-hidden">
                                <img src={images[0]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                            </div>
                            <div className="col-span-1 row-span-1 overflow-hidden">
                                <img src={images[1]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                            </div>
                            <div className="col-span-1 row-span-1 overflow-hidden">
                                <img src={images[2]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                            </div>
                            <div className="col-span-1 row-span-1 overflow-hidden">
                                <img src={images[3]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                            </div>
                            <div className="col-span-1 row-span-1 overflow-hidden">
                                <img src={images[4]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                <Link to={getRoute(key, "all")} className="pointer-events-auto px-4 py-2 bg-black/60 text-white border border-white/40 rounded-lg hover:bg-black/80 transition-colors backdrop-blur-sm shadow-lg text-sm font-semibold tracking-wide">
                                    Galería Cobre
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover transition-all duration-500 rounded-lg"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    {!(images && images.length >= 5) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div
                                className="backdrop-blur-sm px-4 py-1.5 rounded-lg border border-white/20"
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            >
                                <h3 className="text-lg font-normal text-white tracking-wide text-center">
                                    {name}
                                </h3>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-5 flex flex-col items-center gap-2">
                    {isCustom ? (
                        <Link
                            to={link}
                            className="mt-3 text-sm text-gray-500 hover:text-indigo-600 font-normal transition-colors flex items-center gap-1 group"
                        >
                            Ver algunos diseños
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    ) : (
                        <>
                            {chunkedCategories.map((chunk, i) => (
                                <div key={i} className="flex items-center gap-4 text-gray-700 font-medium text-lg">
                                    {chunk.map((cat, j) => (
                                        <div key={cat.slug} className="flex items-center">
                                            <Link
                                                to={getRoute(key, cat.slug)}
                                                className="hover:text-black hover:underline transition-colors text-sm sm:text-lg"
                                            >
                                                {cat.name}
                                            </Link>
                                            {j < chunk.length - 1 && <span className="text-gray-400 mx-2 sm:mx-4">|</span>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </>
                    )}
                    {!isCustom && (
                        <Link
                            to={getRoute(key, "all")}
                            className="mt-3 text-sm text-gray-500 hover:text-indigo-600 font-normal transition-colors flex items-center gap-1 group"
                        >
                            Ver toda la colección
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    )}
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
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

<<<<<<< HEAD
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
=======
    return (
        <div
            className="w-full relative overflow-hidden rounded-xl transition-shadow duration-300 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                if (key === 'cobre') {
                    navigate('/cobre#coleccion');
                } else {
                    onToggle();
                }
            }}
            style={{ zIndex: 1 }}
        >
            <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-sm">
                {images && images.length >= 5 ? (
                    <div className="grid grid-cols-4 grid-rows-2 gap-1 w-full h-full relative group">
                        <div className="col-span-2 row-span-2 overflow-hidden">
                            <img src={images[0]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                        </div>
                        <div className="col-span-1 row-span-1 overflow-hidden">
                            <img src={images[1]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                        </div>
                        <div className="col-span-1 row-span-1 overflow-hidden">
                            <img src={images[2]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                        </div>
                        <div className="col-span-1 row-span-1 overflow-hidden">
                            <img src={images[3]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                        </div>
                        <div className="col-span-1 row-span-1 overflow-hidden">
                            <img src={images[4]} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <Link to={getRoute(key, "all")} className="pointer-events-auto px-6 py-2.5 bg-black/60 text-white border border-white/40 rounded-lg hover:bg-black/80 transition-all backdrop-blur-sm shadow-xl text-base font-medium tracking-wide hover:scale-105">
                                Galería Cobre
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
                            </Link>
                        ))}
                    </div>
<<<<<<< HEAD

                    {/* Ver toda la colección */}
                    <Link
                        to={allRoute}
=======
                ) : (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: shouldShowOverlay ? "rgba(40, 40, 40, 0.95)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.3s ease",
                        zIndex: 10,
                        pointerEvents: shouldShowOverlay ? "auto" : "none",
                    }}
                >
                    <div
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
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
<<<<<<< HEAD
                        {allLabel} &nbsp;→
                    </Link>
=======
                        <div
                            className="flex flex-col items-center gap-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isCustom ? (
                                <Link
                                    to={link}
                                    className="mt-4 text-sm text-gray-400 hover:text-white font-normal transition-colors flex items-center gap-1 group"
                                >
                                    Ver algunos diseños
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </Link>
                            ) : (
                                <>
                                    {chunkedCategories.map((chunk, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-200 font-medium text-lg">
                                            {chunk.map((cat, j) => (
                                                <div key={cat.slug} className="flex items-center">
                                                    <Link
                                                        to={getRoute(key, cat.slug)}
                                                        className="hover:text-white hover:underline transition-colors text-sm lg:text-base"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                    {j < chunk.length - 1 && <span className="text-gray-500 mx-2 lg:mx-3">|</span>}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    <Link
                                        to={getRoute(key, "all")}
                                        className="mt-4 text-sm text-gray-400 hover:text-white font-normal transition-colors flex items-center gap-1 group"
                                    >
                                        Ver toda la colección
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
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

<<<<<<< HEAD
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
=======
                <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-6">
                    {MATERIAL_CARDS.map((card) => {
                        const isCobre = card.key === 'cobre';
                        const CardContent = (
                            <>
                                <h3 className="hidden lg:block text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight mb-1 text-center group-hover:text-[#c8964a] transition-colors duration-300">
                                    {card.name}
                                </h3>
                                <p className="hidden lg:block text-xs sm:text-sm text-gray-600 mb-3 text-center">
                                    {card.description}
                                </p>
                                <MaterialCard
                                    card={card}
                                    isActive={activeCard === card.key}
                                    isAnyCardActive={activeCard !== null}
                                    onToggle={() => handleCardToggle(card.key)}
                                />
                            </>
                        );

                        // Cobre ya NO es un <Link> wrapper — el acordeón maneja
                        // la navegación internamente
                        if (isCobre) {
                            return (
                                <div
                                    key={card.key}
                                    className="flex flex-col bg-white p-4 rounded-xl shadow-xl border border-gray-200 transition-all duration-300 hover:shadow-2xl w-full lg:w-[32%]"
                                >
                                    {CardContent}
                                </div>
                            );
                        }

                        return (
                            <div
                                key={card.key}
                                className="flex flex-col bg-white p-4 rounded-xl shadow-xl border border-gray-200 transition-shadow duration-300 hover:shadow-2xl w-full lg:w-[32%]"
                            >
                                {CardContent}
                            </div>
                        );
                    })}
>>>>>>> 7e8c8c5afca12689642417031bec1709e848a6a3
                </div>

            </div>
        </section>
    );
};

export default Galeria;
