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
            <section className="py-16 bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="animate-pulse text-center">
                        <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-gray-800 rounded h-56"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <p style={{ color: '#a8a29e', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                        {error}
                    </p>
                </div>
            </section>
        );
    }

    if (productos.length === 0) return null;

    return (
        <section className="relative overflow-hidden" style={{ background: '#111009', padding: '2.5rem 0 3rem' }}>

            {/* Textura de fondo */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Degradado superior e inferior */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none opacity-70" />

            <div className="container mx-auto px-3 relative z-10">

                {/* ── Título rediseñado ── */}
                <div className="text-center mb-8">
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '9px',
                        fontWeight: '500',
                        letterSpacing: '0.26em',
                        textTransform: 'uppercase',
                        color: '#c8964a',
                        margin: '0 0 10px',
                    }}>
                        Del taller a tus manos
                    </p>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(22px, 4vw, 30px)',
                        fontWeight: '300',
                        color: '#f5f1ec',
                        letterSpacing: '0.08em',
                        margin: '0 0 12px',
                    }}>
                        Creaciones del Momento
                    </h2>
                    <div style={{
                        width: '20px',
                        height: '0.5px',
                        background: '#c8964a',
                        margin: '0 auto',
                        opacity: 0.7,
                        boxShadow: '0 0 8px rgba(200,150,74,0.6)',
                    }} />
                </div>

                {/* ── Carrusel — lógica NO TOCADA ── */}
                <style>{`
                    .slick-slide { height: auto !important; }
                    .slick-dots-custom {
                        margin-top: 1rem;
                        display: flex !important;
                        justify-content: center;
                        align-items: center;
                    }
                    .slick-dots-custom li { margin: 0 4px; }
                    .slick-dots-custom li button {
                        width: 7px !important;
                        height: 7px !important;
                        border-radius: 50% !important;
                        padding: 0 !important;
                        background: #374151 !important;
                        border: none !important;
                        font-size: 0 !important;
                        color: transparent !important;
                        overflow: hidden !important;
                        transition: all 0.3s ease !important;
                    }
                    .slick-dots-custom li.slick-active button {
                        background: #c8964a !important;
                        transform: scale(1.3) !important;
                    }
                `}</style>

                <div className="overflow-hidden">
                    <Slider {...settings}>
                        {productos.map((producto) => (
                            <div key={producto.id} className="px-2 md:px-3">
                                <Link to={`/producto/${producto.id}`} className="block pb-4">

                                    {/* Imagen */}
                                    <div style={{
                                        width: '100%',
                                        height: '300px',
                                        overflow: 'hidden',
                                        borderRadius: '4px',
                                        background: '#1a1208',
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

                                    {/* Nombre */}
                                    <p style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '14px',
                                        fontWeight: '300',
                                        color: '#f5f1ec',
                                        letterSpacing: '0.04em',
                                        margin: '10px 0 3px',
                                    }}>
                                        {producto.titulo}
                                    </p>

                                    {/* Precio — tono más suave, no naranja brillante */}
                                    <p style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: '11px',
                                        fontWeight: '300',
                                        color: 'rgba(200,150,74,0.75)',
                                        letterSpacing: '0.06em',
                                        margin: 0,
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
