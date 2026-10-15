import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

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
        autoplaySpeed: 3000,
        draggable: true,
        swipe: true,
        dots: true,
        dotsClass: "slick-dots-custom",
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    draggable: true,
                    swipe: true,
                    dots: true,
                    autoplay: true,
                    autoplaySpeed: 3000,
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
        <section className="relative overflow-hidden" style={{ background: '#efe8dc', padding: '2.5rem 0 3rem' }}>

            {/* Sutil textura de puntos oscuros para fondo claro */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="container mx-auto px-3 relative z-10">

                {/* ── Título rediseñado para fondo claro ── */}
                <div className="text-center mb-6">
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: '#9a6b27',
                        margin: '0 0 6px',
                    }}>
                        Del taller a tus manos
                    </p>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(24px, 4.5vw, 32px)',
                        fontWeight: '400',
                        color: '#1c1917',
                        letterSpacing: '0.06em',
                        margin: '0 0 10px',
                    }}>
                        Creaciones del Momento
                    </h2>
                    <div style={{
                        width: '30px',
                        height: '1px',
                        background: '#9a6b27',
                        margin: '0 auto',
                        opacity: 0.6,
                    }} />
                </div>

                {/* Estilos del Carrusel para fondo claro */}
                <style>{`
                    .slick-slide { height: auto !important; }
                    .slick-dots-custom {
                        margin-top: 1.25rem;
                        display: flex !important;
                        justify-content: center;
                        align-items: center;
                    }
                    .slick-dots-custom li { margin: 0 5px; }
                    .slick-dots-custom li button {
                        width: 8px !important;
                        height: 8px !important;
                        border-radius: 50% !important;
                        padding: 0 !important;
                        background: #a8a29e !important;
                        border: none !important;
                        font-size: 0 !important;
                        color: transparent !important;
                        overflow: hidden !important;
                        transition: all 0.3s ease !important;
                    }
                    .slick-dots-custom li.slick-active button {
                        background: #9a6b27 !important;
                        transform: scale(1.3) !important;
                    }
                `}</style>

                {/* ── Contenedor Padre del Carrusel ── */}
                <div className="w-[92%] md:max-w-full mx-auto overflow-hidden">
                    <Slider {...settings}>
                        {productos.map((producto) => (
                            <div key={producto.id} className="px-2 md:px-3">
                                <Link to={`/producto/${producto.id}`} className="block pb-2 text-center md:text-left">
                                    {/* Imagen */}
                                    <div style={{
                                        width: '100%',
                                        height: '340px',
                                        overflow: 'hidden',
                                        borderRadius: '8px',
                                        background: '#dfd7c9',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    }}>
                                        <img
                                            src={producto.imagen_principal_url}
                                            alt={producto.titulo}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>

                                    {/* Nombre — Oscuro y legible sobre #efe8dc */}
                                    <p style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '20px',
                                        color: '#1c1917',
                                        fontWeight: '400',
                                        margin: '14px 0 4px',
                                        lineHeight: '1.2',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {producto.titulo}
                                    </p>

                                    {/* Precio — Tono sobrio */}
                                    <p style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '13px',
                                        color: '#57534e',
                                        fontWeight: '400',
                                        margin: '0',
                                        letterSpacing: '0.06em'
                                    }}>
                                        Desde S/ {Number(producto.precio)}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>

            </div>
        </section>
    );
};

export default CategoriaShowcase;