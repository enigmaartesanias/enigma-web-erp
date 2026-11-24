import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// ── Flechas finas (solo escritorio): chevron delgado, sin círculo ni fondo ──
const Arrow = ({ direction, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={direction === 'prev' ? 'Anterior' : 'Siguiente'}
        className={`cs-arrow cs-arrow-${direction}`}
    >
        <svg width="14" height="26" viewBox="0 0 14 26" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {direction === 'prev' ? <path d="M12 2L2 13l10 11" /> : <path d="M2 2l10 11L2 24" />}
        </svg>
    </button>
);

const css = `
.cs-section{position:relative;overflow:hidden;background:#efe8dc;padding:40px 0 32px;}

/* Carrusel */
.cs-slider{position:relative;}
.cs-slider .slick-slide{height:auto !important;transition:opacity .4s ease;}
.cs-slider .slick-list{overflow:hidden;}

/* Foto: vertical 4:5, misma proporción que StockGrid (la imagen completa está en el detalle) */
.cs-img-wrap{width:100%;aspect-ratio:4 / 5;overflow:hidden;border-radius:8px;background:#dfd7c9;box-shadow:0 4px 15px rgba(0,0,0,0.05);}
.cs-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease;}
.cs-card:hover .cs-img{transform:scale(1.04);}

/* Texto bajo la foto: alineado a la izquierda */
.cs-title{margin:12px 0 2px;font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;line-height:1.25;letter-spacing:.02em;color:#2a2018;text-align:left;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cs-price{margin:0;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;letter-spacing:.04em;color:#6b625a;text-align:left;}

/* Flechas: ocultas en móvil */
.cs-arrow{display:none;}

/* Mobile: la foto central destaca y se asoman las vecinas más tenues */
@media (max-width:768px){
  .cs-slider .slick-slide:not(.slick-center){opacity:.55;}
}

@media (min-width:769px){
  .cs-section{padding:48px 0 52px;}
  /* Se reserva el alto de 2 líneas para alinear precios entre las 4 tarjetas */
  .cs-title{min-height:2.5em;}
  .cs-slider-wrap{padding:0 40px;}
  .cs-arrow{display:flex;align-items:center;justify-content:center;position:absolute;top:38%;transform:translateY(-50%);width:32px;height:48px;padding:0;background:transparent;border:0;cursor:pointer;color:#5f5247;transition:color .2s ease;z-index:5;}
  .cs-arrow:hover{color:#c8964a;}
  .cs-arrow-prev{left:-36px;}
  .cs-arrow-next{right:-36px;}
}
`;

const CategoriaShowcase = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch — NO TOCAR ──
    useEffect(() => {
        async function fetchProductos() {
            try {
                setLoading(true);
                setError(null);
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('activo', true)
                    .eq('is_novedoso', true)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setProductos(data || []);
            } catch (err) {
                console.error('Error al cargar productos:', err.message);
                setError('No se pudieron cargar los productos.');
            } finally {
                setLoading(false);
            }
        }
        fetchProductos();
    }, []);

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        draggable: true,
        swipe: true,
        dots: false,
        arrows: true,
        prevArrow: <Arrow direction="prev" />,
        nextArrow: <Arrow direction="next" />,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    draggable: true,
                    swipe: true,
                    arrows: false,
                    dots: false,
                    // Foto central con un pedazo de la anterior y la siguiente
                    centerMode: true,
                    centerPadding: '34px',
                    autoplay: true,
                    autoplaySpeed: 4000,
                },
            },
        ],
    };

    if (loading) {
        return (
            <section className="py-16" style={{ background: '#efe8dc' }}>
                <div className="container mx-auto px-4">
                    <div className="animate-pulse text-center">
                        <div className="h-6 bg-stone-300 rounded w-48 mx-auto mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-stone-200 rounded h-56"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16" style={{ background: '#efe8dc' }}>
                <div className="container mx-auto px-4 text-center">
                    <p style={{ color: '#78716c', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                        {error}
                    </p>
                </div>
            </section>
        );
    }

    if (productos.length === 0) return null;

    return (
        <section className="cs-section">
            <style>{css}</style>

            {/* Sutil textura de puntos oscuros para fondo claro */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="container mx-auto px-3 relative z-10">

                {/* ── Título (mismo estilo que Colecciones Artesanales / Piezas Disponibles) ── */}
                <div className="text-center" style={{ marginBottom: '20px' }}>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(34px, 4.5vw, 34px)',
                        fontWeight: '300',
                        color: '#2a2018',
                        letterSpacing: '0.04em',
                        margin: '0 0 8px',
                    }}>
                        Creaciones del Momento
                    </h2>
                    <div style={{
                        width: '30px',
                        height: '1px',
                        background: '#c8964a',
                        opacity: 0.6,
                        margin: '0 auto',
                    }} />
                </div>

                {/* ── Carrusel ── */}
                <div className="cs-slider-wrap w-full mx-auto">
                    <div className="cs-slider">
                        <Slider {...settings}>
                            {productos.map((producto) => (
                                <div key={producto.id} className="px-1.5 md:px-3">
                                    <Link to={`/producto/${producto.id}`} className="cs-card block pb-1">
                                        <div className="cs-img-wrap">
                                            <img
                                                src={producto.imagen_principal_url}
                                                alt={producto.titulo}
                                                className="cs-img"
                                            />
                                        </div>

                                        <p className="cs-title">{producto.titulo}</p>

                                        <p className="cs-price">
                                            Desde S/ {Number(producto.precio)}
                                        </p>
                                    </Link>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CategoriaShowcase;