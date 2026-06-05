import React, { useState, useEffect } from 'react';
import { andruDonaldsDB } from '../utils/andruDonaldsClient';
import Slider from 'react-slick';
import { ArrowLeft, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AndruDonaldsCollection = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchImages = async () => {
            try {
                const data = await andruDonaldsDB.getActive();
                setImages(data || []);
            } catch (error) {
                console.error("Error al cargar imágenes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    // Configuración del carrusel (inspirado en el aura enigmática)
    const sliderSettings = {
        dots: true,
        infinite: images.length > 3,
        speed: 800,
        slidesToShow: Math.min(images.length, 3) || 1,
        slidesToScroll: 1,
        autoplay: images.length > 1,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
        responsive: [
            {
                breakpoint: 1024,
                settings: { 
                    slidesToShow: Math.min(images.length, 2) || 1,
                    infinite: images.length > 2
                }
            },
            {
                breakpoint: 640,
                settings: { 
                    slidesToShow: 1,
                    centerMode: images.length > 1,
                    centerPadding: '10px',
                    infinite: images.length > 1
                }
            }
        ]
    };

    return (
        <div className="min-h-screen text-white overflow-hidden font-sans" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            
            {/* Nav transparente */}
            <nav className="absolute top-0 w-full z-50 p-4 md:p-8 flex items-center justify-between">
                <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-gray-200 transition-colors uppercase text-xs font-bold bg-black bg-opacity-20 px-4 py-2 rounded-full border border-gray-600 hover:border-gray-400" style={{ backdropFilter: 'blur(12px)' }}>
                    <ArrowLeft size={16} /> Volver a Enigma
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-8 md:pt-32 md:pb-16 px-6">
                <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-600 rounded-full pointer-events-none opacity-20" style={{ filter: 'blur(100px)', transform: 'translate(-20%, -20%)' }} />
                <div className="absolute top-1/4 right-0 w-64 h-64 bg-blue-600 rounded-full pointer-events-none opacity-20" style={{ filter: 'blur(100px)', transform: 'translate(20%, -10%)' }} />
                
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <p className="text-yellow-500 font-medium uppercase text-[10px] md:text-sm mb-3 animate-fade-in" style={{ letterSpacing: '0.3em' }}>
                        Colaboración Exclusiva
                    </p>
                    <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
                            Andru Donalds
                        </span>
                        <br />
                        <span className="text-2xl md:text-5xl font-light italic text-gray-400">
                            & Enigma
                        </span>
                    </h1>
                </div>
            </section>

            {/* Historia / Texto */}
            <section className="container mx-auto max-w-3xl px-4 md:px-6 relative z-10 mb-16">
                <div className="border border-gray-700 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
                    
                    <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed font-light">
                        <p className="text-base md:text-xl text-gray-100 font-medium leading-relaxed">
                            Andru Donalds (Kingston, Jamaica, 1974) es un reconocido cantante jamaicano y una de las icónicas voces del proyecto musical Enigma.
                        </p>
                        
                        <p>
                            Desde el 2022 tengo el honor de crear joyería artesanal personalizada para Andru. Hasta la fecha he forjado piezas exclusivas para él, acompañándolo en sesiones fotográficas y giras internacionales.
                        </p>

                        <p>
                            Su confianza en mi trabajo ha sido un puente invaluable para llevar la esencia de Enigma Artesanías a escenarios mundiales.
                        </p>
                    </div>
                </div>
            </section>

            {/* Galería */}
            <section className="pb-16 md:pb-24 relative z-10 w-full overflow-hidden">
                <div className="container mx-auto px-6 mb-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-2 text-white">Momentos & Capturas</h2>
                    <p className="text-gray-400 font-light text-xs md:text-sm max-w-xl mx-auto">
                        Historias, reposteos y momentos donde mis creaciones acompañan a Andru.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="w-8 h-8 border-2 border-t-amber-500 border-white/10 rounded-full animate-spin"></div>
                    </div>
                ) : images.length > 0 ? (
                    <div className="w-full max-w-7xl mx-auto cursor-grab active:cursor-grabbing">
                        <Slider {...sliderSettings} className="andru-slider w-full">
                            {images.map((img) => (
                                <div key={img.id} className="px-2 md:p-4 outline-none">
                                    <div className={`mx-auto rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-gray-700 group relative max-w-[240px] md:max-w-none`} style={{ aspectRatio: '4/5', backgroundColor: 'rgba(255,255,255,0.05)', maxWidth: images.length < 3 ? '350px' : undefined }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500 z-10" />
                                        <img 
                                            src={img.image_url} 
                                            alt="Andru Donalds Historia" 
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        Próximamente más imágenes.
                    </div>
                )}
            </section>

            {/* Sección Final: Video y Redes (Grid en Escritorio) */}
            <section className="container mx-auto px-6 pt-12 pb-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center max-w-4xl mx-auto">
                    
                    {/* Columna Izquierda: Video TikTok / Corto */}
                    <div className="text-center">
                        <h2 className="text-[10px] md:text-xs text-gray-400 uppercase mb-8" style={{ letterSpacing: '0.2em' }}>Detrás de Cámaras</h2>
                        
                        {/* Contenedor Especial tipo "Marco" */}
                        <div className="mx-auto max-w-[220px] md:max-w-[260px] bg-gradient-to-b from-gray-800 to-[#0f172a] p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-gray-600 relative">
                            {/* Resplandor suave detrás del marco */}
                            <div className="absolute inset-0 bg-amber-500/10 rounded-[2rem] blur-lg" />
                            
                            {/* Contenedor del video */}
                            <div className="rounded-2xl overflow-hidden bg-black aspect-[9/16] relative z-10 shadow-inner">
                                <video 
                                    src="/video/andru.mp4" 
                                    className="w-full h-full object-cover"
                                    controls
                                    playsInline
                                    preload="metadata"
                                >
                                    Tu navegador no soporta videos nativos.
                                </video>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Redes Oficiales */}
                    <div className="text-center md:text-left">
                        <h2 className="text-[10px] md:text-xs text-gray-500 uppercase mb-8" style={{ letterSpacing: '0.2em' }}>
                            Sigue a Andru Donalds
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                            <a 
                                href="https://www.instagram.com/andrudonalds/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto md:w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white text-sm font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Instagram className="w-5 h-5" />
                                Instagram Oficial
                            </a>

                            <a 
                                href="https://www.youtube.com/results?search_query=Andru+Donalds" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto md:w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Youtube className="w-5 h-5" />
                                YouTube Oficial
                            </a>
                        </div>
                    </div>

                </div>
            </section>
            
            <style>{`
                .andru-slider .slick-dots li button:before {
                    color: rgba(255, 255, 255, 0.3);
                }
                .andru-slider .slick-dots li.slick-active button:before {
                    color: #f59e0b;
                }
            `}</style>
        </div>
    );
};

export default AndruDonaldsCollection;
