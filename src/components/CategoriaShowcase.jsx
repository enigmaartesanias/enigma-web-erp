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
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-gray-300 rounded-lg h-56"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </section>
        );
    }

    if (productos.length === 0) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-500">No hay productos destacados en este momento.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 md:py-16 relative overflow-hidden bg-gray-900">
            {/* Fondo "Vintage" Oscuro */}
            <div className="absolute inset-0 z-0">
                {/* Patrón de textura sutil (puntos finos) usando inline style para Tailwind v2 */}
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ 
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', 
                        backgroundSize: '24px 24px' 
                    }}
                ></div>
                {/* Sombra interior para darle profundidad de marco */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none opacity-80"></div>
            </div>

            <div className="container mx-auto px-3 relative z-10">
                {/* Título del showcase */}
                <div className="text-center mb-6 md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-light text-white tracking-widest mb-4" style={{ letterSpacing: '0.25em' }}>
                        NOVEDADES
                    </h2>
                    <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: '#c8964a', boxShadow: '0 0 8px rgba(200,150,74,0.8)' }}></div>
                </div>

                {/* Carrusel */}
                {/* Estilos locales para los dots del carrusel */}
                <style>{`
          .slick-slide {
            height: auto !important;
          }
          .slick-dots-custom {
            margin-top: 1rem;
            display: flex !important;
            justify-content: center;
            align-items: center;
          }
          .slick-dots-custom li {
            margin: 0 4px;
          }
          .slick-dots-custom li button {
            width: 8px !important;
            height: 8px !important;
            border-radius: 50% !important;
            padding: 0 !important;
            background: #374151 !important; /* gray-700 */
            border: none !important;
            box-shadow: none !important;
            font-size: 0 !important;
            color: transparent !important;
            overflow: hidden !important;
            transition: all 0.3s ease !important;
          }
          .slick-dots-custom li.slick-active button {
            background: #c8964a !important; /* gold */
            transform: scale(1.3) !important;
          }
        `}</style>
                <div className="overflow-hidden">
                    <Slider {...settings}>
                        {productos.map((producto) => {
                            // Lógica para formatear la fecha (ELIMINADA)

                            return (
                                <div key={producto.id} className="px-2 md:px-3">
                                    <Link to={`/producto/${producto.id}`} className="block pb-4">
                                        {/* Contenedor de producto */}
                                        <div className="w-full h-[400px] bg-black rounded overflow-hidden flex items-center justify-center" style={{ height: '320px' }}>
                                            <img
                                                src={producto.imagen_principal_url}
                                                alt={producto.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="mt-4 text-sm text-gray-100 font-medium tracking-wide text-left mb-1">
                                            {producto.titulo}
                                        </div>
                                        <div className="mt-1 text-sm text-left mb-2" style={{ color: '#c8964a' }}>
                                            Desde S/ {Number(producto.precio)}
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default CategoriaShowcase;
