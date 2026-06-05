import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ==========================================
// 1. DATOS Y CONFIGURACIÓN
// ==========================================



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

        all: "/cobre",
    },
};

const CATEGORIES = [
    { name: "Aretes", slug: "Arete" },
    { name: "Pulseras", slug: "Pulsera" },
    { name: "Anillos", slug: "Anillo" },
    { name: "Collares", slug: "Collar" },
];

const MATERIAL_CARDS = [
    {
        name: "Colección Cobre",
        key: "cobre",

        // ---------------------------------------------------------
        // CAMBIA LA RUTA DE LA IMAGEN AQUÍ PARA LA COLECCIÓN COBRE
        // ---------------------------------------------------------
        image: "/images/pulsera3.jpg",
        categories: [],
        isCustom: false,
    },
    {
        name: "Colección Alpaca",
        key: "alpaca",

        // ---------------------------------------------------------
        // CAMBIA LA RUTA DE LA IMAGEN AQUÍ PARA LA COLECCIÓN ALPACA
        // ---------------------------------------------------------
        image: "/images/collar23.jpg",
        categories: CATEGORIES,
        isCustom: false,
    },
    {
        name: "Colección Plata",
        key: "plata",

        // ---------------------------------------------------------
        // CAMBIA LA RUTA DE LA IMAGEN AQUÍ PARA LA COLECCIÓN PLATA
        // ---------------------------------------------------------
        image: "/images/anillo2.jpg",
        categories: CATEGORIES,
        isCustom: false,
    }
];

// ==========================================
// 2. COMPONENTE DE TARJETA INDIVIDUAL
// ==========================================

const MaterialCard = ({ card, isActive, isAnyCardActive, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { name, description, image, images, key, categories, link, isCustom } = card;
    const navigate = useNavigate();

    const getRoute = (materialKey, categorySlug) => {
        if (isCustom) return link;
        const materialCapitalized = materialKey.charAt(0).toUpperCase() + materialKey.slice(1);
        return `/catalogo/${materialCapitalized}/${categorySlug}`;
    };

    // Detectar si estamos en modo móvil
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        setIsMobile(mediaQuery.matches);

        const listener = () => setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener("change", listener);

        return () => mediaQuery.removeEventListener("change", listener);
    }, []);

    if (key === 'cobre') {
        return (
            <div className="w-full">
                {/* Contenedor de la Imagen Estática */}
                <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-sm">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform group-hover:scale-105"
                    />

                    {/* Título centrado (tipo fade Alpaca) */}
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

                    {/* Filtro/overlay sutil */}
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                </div>

                {/* Texto copy decorativo debajo de la imagen */}
                <div className="mt-4 flex justify-center">
                    <span className="text-sm text-gray-500 font-medium tracking-wide text-center group-hover:text-[#c8964a] transition-colors duration-300">
                        Aretes · Pulseras · Anillos · y más →
                    </span>
                </div>
            </div>
        );
    }

    // Helper para agrupar categorías en pares
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
                    if (key === 'cobre') navigate('/cobre');
                }}
            >
                {/* Imagen Estática / Grid */}
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
                            {/* Botón Central Colección Cobre (Mobile) */}
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
                    {/* Overlay suave para móvil */}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />



                    {/* Título centrado sobre la imagen (solo en móvil, excepto Cobre que ya tiene su botón) */}
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

                {/* Enlaces debajo de la imagen (solo en móvil) */}
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

                    {/* Botón Ver Todo para Móvil */}
                    {!isCustom && (
                        <Link
                            to={getRoute(key, "all")}
                            className="mt-3 text-sm text-gray-500 hover:text-indigo-600 font-normal transition-colors flex items-center gap-1 group"
                        >
                            Ver toda la colección
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // En desktop
    const shouldShowOverlay = isActive || isHovered;

    return (
        <div
            className="w-full relative overflow-hidden rounded-xl transition-shadow duration-300 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                if (key === 'cobre') {
                    navigate('/cobre');
                } else {
                    onToggle();
                }
            }}
            style={{ zIndex: 1 }}
        >
            {/* Contenedor de la Imagen Estática / Grid */}
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
                        {/* Botón Central Colección Cobre (Desktop) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <Link to={getRoute(key, "all")} className="pointer-events-auto px-6 py-2.5 bg-black/60 text-white border border-white/40 rounded-lg hover:bg-black/80 transition-all backdrop-blur-sm shadow-xl text-base font-medium tracking-wide hover:scale-105">
                                Galería Cobre
                            </Link>
                        </div>
                    </div>
                ) : (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform hover:scale-105"
                    />
                )}

                {/* Fondo base suave (gris/negro al 10-15%) para contexto, sin oscurecer demasiado */}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                {/* Overlay de categorías (aparece al activar o hacer hover) */}
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
                        style={{
                            opacity: shouldShowOverlay ? 1 : 0,
                            transition: "opacity 0.3s ease",
                            width: "100%",
                            height: "100%",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            pointerEvents: shouldShowOverlay ? "auto" : "none",
                        }}
                    >
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

                                    {/* Botón Ver Todo para Desktop */}
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
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (GALERIA)
// ==========================================

const Galeria = () => {
    const [activeCard, setActiveCard] = useState(null);

    const handleCardToggle = (key) => {
        if (activeCard === key) {
            setActiveCard(null);
        } else {
            setActiveCard(key);
        }
    };

    return (
        <section
            className="pt-2 pb-8 lg:py-8 bg-gray-100 font-sans"
            onClick={() => setActiveCard(null)}
        >
            <div className="container mx-auto px-3">
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-normal text-gray-900 tracking-tight">
                        Colecciones Artesanales
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Explora nuestras piezas únicas por material y acabado
                    </p>
                </div>

                {/* Flex row en desktop, column en móvil */}
                <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-6">
                    {MATERIAL_CARDS.map((card) => {
                        const isCobre = card.key === 'cobre';
                        const CardContent = (
                            <>
                                {/* Título y descripción solo visibles en desktop */}
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

                        if (isCobre) {
                            return (
                                <Link
                                    key={card.key}
                                    to="/cobre"
                                    className="flex flex-col bg-white p-4 rounded-xl shadow-xl border border-gray-200 transition-all duration-300 hover:shadow-2xl w-full lg:w-[32%] cursor-pointer group hover:border-[#c8964a]/50"
                                >
                                    {CardContent}
                                </Link>
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
                </div>
            </div>
        </section>
    );
};

export default Galeria;