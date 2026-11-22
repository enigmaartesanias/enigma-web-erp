import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PublicCarousel = () => {
    const [carouselItems, setCarouselItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicCarouselItems = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('carousel_items')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCarouselItems(data || []);
                setError(null);
            } catch (err) {
                console.error('Error al obtener los ítems del carrusel público:', err.message);
                setError('No se pudieron cargar las imágenes del carrusel.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicCarouselItems();
    }, []);

    useEffect(() => {
        if (carouselItems.length === 0) return;

        const interval = setInterval(() => {
            const container = document.getElementById('carousel-container');
            if (container) {
                const scrollAmount = container.clientWidth;
                if (Math.round(container.scrollLeft + container.clientWidth) >= container.scrollWidth - 10) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [carouselItems]);

    if (loading) return <div className="p-4 text-center text-stone-500 bg-white">Cargando imágenes...</div>;

    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 mx-4" role="alert">
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
    );

    if (carouselItems.length === 0) return null;

    return (
        <section className="py-12 md:py-20 bg-white relative overflow-hidden">
            {/* Textura suave de puntos para fondo claro */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                ></div>
            </div>

            <div className="container mx-auto px-2 md:px-8 lg:px-16 relative z-10">
                {/* Encabezado adaptado para fondo blanco */}
                <div className="text-center mb-8 md:mb-12">
                    <h2
                        className="text-xl md:text-2xl font-light text-[#1c1917] mb-3 tracking-widest uppercase"
                        style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.15em' }}
                    >
                        Joyas con historia
                    </h2>
                    <div
                        className="w-12 h-[1px] mx-auto"
                        style={{ backgroundColor: '#9a6b27', opacity: 0.6 }}
                    ></div>
                </div>

                {/* Carrusel horizontal */}
                <div id="carousel-container" className="flex overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing">
                    {carouselItems.map((item) => (
                        <div key={item.id} className="flex-shrink-0 w-1/3 lg:w-1/6 px-1 md:px-2 snap-center" style={{ aspectRatio: '3/4' }}>
                            <div className="group relative h-full w-full overflow-hidden rounded-xl bg-stone-100 shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all duration-500 hover:shadow-lg">
                                <img src={item.image_url} alt={item.description || 'Joya con historia'} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                {item.description && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-2 md:p-3">
                                        <p className="text-white text-[8px] md:text-[10px] lg:text-xs font-normal leading-tight">{item.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx="true">{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
};

export default PublicCarousel;