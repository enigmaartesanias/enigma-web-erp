import React, { useState, useEffect } from 'react';
import { andruDonaldsDB, andruProductosDB } from '../utils/andruDonaldsClient';
import Slider from 'react-slick';
import { ArrowLeft, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import andruHero from '../assets/images/andru-hero.jpg';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const GOLD = '#c8964a';
const GOLD_DIM = 'rgba(200,150,74,0.18)';
const CREAM = '#f5f1ec';
const CREAM_DIM = 'rgba(245,241,236,0.75)';
const DARK = '#150d05';

const AndruDonaldsCollection = () => {
    const [images, setImages] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchAll = async () => {
            try {
                const [imgs, prods] = await Promise.all([
                    andruDonaldsDB.getActive(),
                    andruProductosDB.getActive()
                ]);
                setImages([...(imgs || [])].reverse());
                setProductos(prods || []);
            } catch (error) {
                console.error('Error al cargar:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const sliderSettings = {
        dots: true,
        infinite: images.length > 3,
        speed: 800,
        slidesToShow: Math.min(images.length, 3) || 1,
        slidesToScroll: 1,
        autoplay: images.length > 1,
        autoplaySpeed: 3500,
        pauseOnHover: true,
        cssEase: 'cubic-bezier(0.87, 0, 0.13, 1)',
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
                    centerMode: false,
                    infinite: images.length > 1
                }
            }
        ]
    };

    return (
        <div style={{ minHeight: '100vh', background: DARK, color: CREAM, fontFamily: "'Inter', sans-serif", overflow: 'hidden', WebkitOverflowScrolling: 'touch' }}>

            {/* ── NAV ── */}
            <nav style={{ padding: '16px 20px', borderBottom: `0.5px solid ${GOLD_DIM}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: CREAM, textDecoration: 'none', fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
                    <ArrowLeft size={16} />
                    Enigma Artesanías
                </Link>
                <span style={{ fontSize: '12px', color: GOLD, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.9, fontWeight: 500 }}>
                    enigma forever
                </span>
            </nav>

            {/* ── SECCIÓN 1: HERO ── */}
            <section style={{ position: 'relative', minHeight: '520px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <img
                    src={andruHero}
                    alt="Andru Donalds luciendo joyas Enigma Artesanías"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        opacity: 0.65, /* Mejorada la opacidad para que no se vea tan oscura */
                    }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(21, 13, 5, 0.4) 0%, rgba(21, 13, 5, 0.65) 60%, rgba(21, 13, 5, 0.95) 100%)'
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(200,150,74,0.08) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '0.5px', background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, opacity: 0.4 }} />

                <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: '40px 20px 44px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD, margin: '0 0 14px', fontWeight: 600 }}>
                        Dos nombres · una esencia
                    </p>
                    <div style={{ width: '32px', height: '1px', background: GOLD, opacity: 0.6, margin: '0 auto 18px' }} />
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 8vw, 56px)', fontWeight: 300, color: CREAM, letterSpacing: '0.04em', lineHeight: 1.1, margin: '0 0 8px' }}>
                        Andru Donalds
                    </h1>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 5vw, 34px)', fontStyle: 'italic', color: GOLD, fontWeight: 300, margin: '0 0 24px' }}>
                        &amp; Enigma
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['Kingston, Jamaica', 'Desde 2022', 'Giras internacionales'].map(b => (
                            <span className="hero-tag" key={b} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(21, 13, 5, 0.6)', border: `1px solid rgba(200,150,74,0.5)`, color: CREAM, letterSpacing: '0.08em', fontWeight: 500 }}>
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECCIÓN 2: HISTORIA ── */}
            <section className="andru-historia" style={{ padding: '40px 20px', maxWidth: '640px', margin: '0 auto' }}>
                <p style={{ fontSize: '12px', letterSpacing: '0.24em', textTransform: 'uppercase', color: GOLD, margin: '0 0 18px', fontWeight: 600 }}>
                    Una coincidencia que no lo era
                </p>

                <p style={{ fontSize: 'clamp(15px, 3.5vw, 16px)', lineHeight: 1.8, color: CREAM, margin: '0 0 16px' }}>
                    Hace más de treinta años, un proyecto musical llamado Enigma redefinió la música electrónica mundial. Andru Donalds es su voz principal.
                </p>
                <p style={{ fontSize: 'clamp(15px, 3.5vw, 16px)', lineHeight: 1.8, color: CREAM, margin: '0 0 16px' }}>
                    Mi marca lleva el mismo nombre desde sus inicios. No fue una estrategia — fue reconocerse.
                </p>
                <p style={{ fontSize: 'clamp(15px, 3.5vw, 16px)', lineHeight: 1.8, color: CREAM, margin: '0 0 28px' }}>
                    Desde 2022, cada pieza que sale de este taller en Lima llega a sus manos. Anillos, collares y pulseras forjados en cobre, plata y alpaca que hoy acompañan al artista en sesiones fotográficas, giras y escenarios internacionales. Una colaboración entre dos expresiones de la misma identidad: la voz y el metal.
                </p>

                {/* Cita 1 — WhatsApp */}
                <div style={{ borderLeft: `3px solid ${GOLD}`, padding: '14px 18px', background: 'rgba(200,150,74,0.08)', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontStyle: 'italic', color: CREAM, margin: '0 0 8px', lineHeight: 1.6 }}>
                        "what a cool combination of jewellery.. I'll show them to the world"
                    </p>
                    <p style={{ fontSize: '11px', color: GOLD, margin: 0, letterSpacing: '0.1em', fontWeight: 500 }}>
                        — Andru Donalds · mayo 2026
                    </p>
                </div>

                {/* Cita 2 — Instagram */}
                <div style={{ borderLeft: `3px solid rgba(200,150,74,0.5)`, padding: '14px 18px', background: 'rgba(200,150,74,0.05)', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', fontStyle: 'italic', color: CREAM, margin: '0 0 8px', lineHeight: 1.6 }}>
                        "Details @enigma_artesanias — love his work. Thanks for the lovely jewellery"
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(200,150,74,0.8)', margin: 0, letterSpacing: '0.1em', fontWeight: 500 }}>
                        — @andrudonalds · Instagram oficial · 385 likes
                    </p>
                </div>
            </section>

            {/* ── DIVISOR ── */}
            <div style={{ height: '0.5px', background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, opacity: 0.3, margin: '0 20px' }} />

            {/* ── SECCIÓN 3: MOMENTOS CARRUSEL ── */}
            <section style={{ padding: '40px 0 32px' }}>
                <div style={{ padding: '0 20px', marginBottom: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', letterSpacing: '0.24em', textTransform: 'uppercase', color: GOLD, margin: '0 0 8px', fontWeight: 600 }}>
                        Momentos &amp; capturas
                    </p>
                    <p style={{ fontSize: 'clamp(13px, 3vw, 14px)', color: 'rgba(245,241,236,0.6)', margin: 0 }}>
                        Reposteos, historias y escenas donde mis creaciones acompañan a Andru
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <div style={{ width: '28px', height: '28px', border: `2px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                ) : images.length > 0 ? (
                    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                        <Slider {...sliderSettings} className="andru-slider">
                            {images.map((img) => (
                                <div key={img.id} style={{ outline: 'none', padding: '0 8px' }}>
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: `0.5px solid rgba(200,150,74,0.3)`, aspectRatio: '4/5', position: 'relative', maxWidth: '280px', margin: '0 auto' }}>
                                        <img
                                            src={img.image_url}
                                            alt="Andru Donalds con joyas Enigma"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                        {img.descripcion && (
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 14px 14px', background: 'linear-gradient(to top, rgba(21,13,5,0.95) 0%, transparent 100%)' }}>
                                                <p style={{ fontSize: '12px', color: '#fff', margin: 0, lineHeight: 1.4, fontWeight: 400 }}>
                                                    {img.descripcion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: 'rgba(245,241,236,0.5)', fontSize: '13px' }}>Próximamente más imágenes.</p>
                )}
            </section>

            {/* ── DIVISOR ── */}
            <div style={{ height: '0.5px', background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, opacity: 0.3, margin: '8px 20px 0' }} />

            {/* ── SECCIÓN 4: PIEZAS FORJADAS ── */}
            {productos.length > 0 && (
                <section style={{ padding: '40px 20px', maxWidth: '720px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <p style={{ fontSize: '12px', letterSpacing: '0.24em', textTransform: 'uppercase', color: GOLD, margin: '0 0 8px', fontWeight: 600 }}>
                            Piezas forjadas para Andru
                        </p>
                        <p style={{ fontSize: '13px', color: 'rgba(245,241,236,0.5)', margin: 0 }}>
                            Anillos · collares · pulseras · cada pieza por encargo exclusivo
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                        {productos.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((prod) => (
                            <div key={prod.id} style={{ border: `0.5px solid rgba(200,150,74,0.3)`, borderRadius: '10px', overflow: 'hidden', background: 'rgba(200,150,74,0.04)' }}>
                                <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                                    <img
                                        src={prod.image_url}
                                        alt={prod.descripcion || 'Pieza artesanal Enigma'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                </div>
                                {prod.descripcion && (
                                    <div style={{ padding: '12px 14px', borderTop: '0.5px solid rgba(200,150,74,0.15)' }}>
                                        <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: CREAM, margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
                                            {prod.descripcion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Frase de cierre */}
                    <div style={{ marginTop: '32px', borderLeft: `3px solid ${GOLD}`, padding: '14px 18px', background: 'rgba(200,150,74,0.07)', borderRadius: '0 8px 8px 0' }}>
                        <p style={{ fontSize: '13px', fontStyle: 'italic', color: CREAM, margin: 0, lineHeight: 1.7 }}>
                            "Cada pieza toma un día entero de taller y más de 25 años de oficio. Ese es el precio."
                        </p>
                    </div>
                </section>
            )}

            {/* ── DIVISOR ── */}
            <div style={{ height: '0.5px', background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, opacity: 0.3, margin: '0 20px' }} />

            {/* ── SECCIÓN 5: VIDEO + REDES ── */}
            <section style={{ padding: '40px 20px 56px', maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '36px', alignItems: 'center' }}>

                    {/* Video */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,241,236,0.5)', margin: '0 0 14px', fontWeight: 500 }}>
                            Detrás de cámaras
                        </p>
                        <div style={{ background: 'rgba(200,150,74,0.06)', border: `0.5px solid rgba(200,150,74,0.25)`, borderRadius: '16px', padding: '12px', maxWidth: '180px', margin: '0 auto' }}>
                            <div style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '9/16', background: '#000' }}>
                                <video
                                    src="/video/andru.mp4"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    controls
                                    playsInline
                                    preload="metadata"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Redes */}
                    <div>
                        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,241,236,0.5)', margin: '0 0 18px', fontWeight: 500 }}>
                            Sigue a Andru
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a
                                href="https://www.instagram.com/andrudonalds/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 16px', borderRadius: '4px', border: `1px solid ${GOLD}`, color: CREAM, textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, background: 'rgba(200,150,74,0.05)' }}
                            >
                                <Instagram size={16} />
                                Instagram
                            </a>
                            <a
                                href="https://www.youtube.com/results?search_query=Andru+Donalds"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 16px', borderRadius: '4px', border: `1px solid ${GOLD}`, color: CREAM, textDecoration: 'none', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, background: 'rgba(200,150,74,0.05)' }}
                            >
                                <Youtube size={16} />
                                YouTube
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CIERRE ENIGMA FOREVER ── */}
            <div style={{ textAlign: 'center', padding: '24px 20px 48px', borderTop: `0.5px solid ${GOLD_DIM}` }}>
                <p style={{ fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,150,74,0.6)', margin: 0, fontWeight: 500 }}>
                    Enigma forever
                </p>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .andru-slider .slick-dots li button:before { color: rgba(200,150,74,0.4); font-size: 8px; }
                .andru-slider .slick-dots li.slick-active button:before { color: #c8964a; }
                .andru-slider .slick-track { display: flex; align-items: center; }
                
                @media (max-width: 640px) {
                    .andru-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
                    .andru-nav-link { font-size: 13px !important; }
                    .andru-historia p { font-size: 15px !important; line-height: 1.8 !important; }
                    .andru-historia .cita p { font-size: 14px !important; }
                    .andru-slider-wrap .slick-slide img { max-width: 100% !important; }
                    .hero-tag { font-size: 11px !important; padding: 5px 10px !important; }
                }
            `}</style>
        </div>
    );
};

export default AndruDonaldsCollection;