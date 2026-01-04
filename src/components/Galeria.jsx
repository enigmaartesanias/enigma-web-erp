import { Link } from "react-router-dom";
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
        all: "/catalogo/Cobre/all",
    },
};

const CATEGORIES = [
    { name: "Aretes", slug: "aretes" },
    { name: "Pulseras", slug: "pulseras" },
    { name: "Anillos", slug: "anillos" },
    { name: "Collares", slug: "collares" },
];

const MATERIAL_CARDS = [
    {
        name: "Colección Cobre",
        key: "cobre",

        // ---------------------------------------------------------
        // CAMBIA LA RUTA DE LA IMAGEN AQUÍ PARA LA COLECCIÓN COBRE
        // ---------------------------------------------------------
        image: "/images/pulsera3.jpg",
        categories: CATEGORIES,
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
    },
    {
        name: "Diseños Personalizados",
        key: "custom",

        // ---------------------------------------------------------
        // CAMBIA LA RUTA DE LA IMAGEN AQUÍ PARA PERSONALIZADOS
        // ---------------------------------------------------------
        image: "/images/per10.jpg",
        link: "/catalogo/all/PERSONALIZADO",
        isCustom: true,
    },
];

// ==========================================
// 2. COMPONENTE DE TARJETA INDIVIDUAL
// ==========================================

const MaterialCard = ({ card, isActive, isAnyCardActive, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { name, description, image, key, categories, link, isCustom } = card;

    const getRoute = (materialKey, categorySlug) => {
        return BASE_ROUTES[materialKey]?.[categorySlug] || "#";
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
            <div className="w-full relative overflow-hidden rounded-xl transition-shadow duration-300 cursor-pointer">
                {/* Imagen Estática */}
                <div className="relative w-full h-80">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-all duration-500"
                    />
                    {/* Overlay suave para móvil */}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                </div>

                {/* Enlaces debajo de la imagen (solo en móvil) */}
                <div className="mt-5 flex flex-col items-center gap-2">
                    {isCustom ? (
                        <Link
                            to={link}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
                        >
                            Cotizar Diseño
                        </Link>
                    ) : (
                        <>
                            {chunkedCategories.map((chunk, i) => (
                                <div key={i} className="flex items-center gap-2 text-gray-700 font-medium text-base">
                                    {chunk.map((cat, j) => (
                                        <div key={cat.slug} className="flex items-center">
                                            <Link
                                                to={getRoute(key, cat.slug)}
                                                className="hover:text-black hover:underline transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                            {j < chunk.length - 1 && <span className="text-gray-400 mx-2">|</span>}
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
                onToggle();
            }}
            style={{ zIndex: 1 }}
        >
            {/* Contenedor de la Imagen Estática */}
            <div className="relative w-full h-80">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out transform hover:scale-105"
                />

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
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-sm font-bold shadow-md transition-colors"
                                >
                                    Cotizar Diseño
                                </Link>
                            ) : (
                                <>
                                    {chunkedCategories.map((chunk, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-200 font-medium text-lg">
                                            {chunk.map((cat, j) => (
                                                <div key={cat.slug} className="flex items-center">
                                                    <Link
                                                        to={getRoute(key, cat.slug)}
                                                        className="hover:text-white hover:underline transition-colors"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                    {j < chunk.length - 1 && <span className="text-gray-500 mx-3">|</span>}
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
            className="py-8 bg-gray-100 font-sans"
            onClick={() => setActiveCard(null)}
        >
            <div className="container mx-auto px-3">
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        Colecciones Artesanales
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Explora nuestras piezas únicas por material y acabado
                    </p>
                </div>

                {/* Flex row en desktop, column en móvil */}
                <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-6">
                    {MATERIAL_CARDS.map((card) => (
                        <div
                            key={card.key}
                            className="flex flex-col bg-white p-4 rounded-xl shadow-xl border border-gray-200 transition-shadow duration-300 hover:shadow-2xl w-full lg:w-[23.5%]"
                        >
                            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-tight mb-1 text-center">
                                {card.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 text-center">
                                {card.description}
                            </p>

                            <MaterialCard
                                card={card}
                                isActive={activeCard === card.key}
                                isAnyCardActive={activeCard !== null}
                                onToggle={() => handleCardToggle(card.key)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Galeria;