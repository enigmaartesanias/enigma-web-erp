// src/components/PublicCarousel.jsx (o donde tengas tus componentes de UI)
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Asegúrate de que este archivo solo inicializa supabase

const PublicCarousel = () => {
    const [carouselItems, setCarouselItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicCarouselItems = async () => {
            try {
                setLoading(true);
                // Esta llamada no requiere autenticación gracias a tu RLS para el rol 'anon'
                const { data, error } = await supabase
                    .from('carousel_items')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCarouselItems(data);
                setError(null);
            } catch (err) {
                console.error('Error al obtener los ítems del carrusel público:', err.message);
                setError('No se pudieron cargar las imágenes del carrusel.');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicCarouselItems();
    }, []); // Array de dependencias vacío para que se ejecute solo una vez al montar

    // Scroll automático
    useEffect(() => {
        if (carouselItems.length === 0) return;

        const interval = setInterval(() => {
            const container = document.getElementById('carousel-container');
            if (container) {
                const scrollAmount = container.clientWidth;

                // Si llegamos al final, volvemos al principio
                if (Math.round(container.scrollLeft + container.clientWidth) >= container.scrollWidth - 10) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [carouselItems]);

    if (loading) {
        // Muestra un placeholder o un spinner, NO un mensaje de autenticación.
        return <div className="p-4 text-center text-gray-700">Cargando imágenes...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">¡Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    if (carouselItems.length === 0) {
        return <div className="p-4 text-center text-gray-500">No hay imágenes en el carrusel.</div>;
    }

    return (
        <section className="py-10 md:py-16 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-2 md:px-8 lg:px-16">

                {/* Título de la sección */}
                <div className="text-center mb-8 md:mb-10">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
                        Joyas con historia
                    </h2>
                    <div className="w-16 h-0.5 bg-yellow-500 mx-auto"></div>
                </div>

                {/* Contenedor del Carrusel con Scroll Horizontal */}
                <div
                    id="carousel-container"
                    className="flex overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
                >
                    {carouselItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex-shrink-0 w-1/3 lg:w-1/6 px-1 md:px-2 aspect-[3/4] snap-center"
                        >
                            <div className="group relative h-full w-full overflow-hidden rounded-lg shadow-md transition-all duration-500 hover:shadow-xl">
                                <img
                                    src={item.image_url}
                                    alt={item.description}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay con descripción (opcional, aparece al hover) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-2 md:p-3">
                                    <p className="text-white text-[8px] md:text-[10px] lg:text-xs font-normal leading-tight">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>

            {/* Estilos locales para ocultar scrollbar */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default PublicCarousel;