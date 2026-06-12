import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ColeccionCobre = () => {
  const categories = [
    { nombre: 'Aretes', imagen: '/images/aretecobre.png', ruta: '/catalogo/Cobre/ARETE', badge: null },
    { nombre: 'Pulseras', imagen: '/images/pulseracobre.png', ruta: '/catalogo/Cobre/PULSERA', badge: null },
    { nombre: 'Anillos', imagen: '/images/anillocobre.png', ruta: '/catalogo/Cobre/ANILLO', badge: null },
    { nombre: 'Collares', imagen: '/images/collarcobre.png', ruta: '/catalogo/Cobre/COLLAR', badge: null },
    { nombre: 'Vinchas', imagen: '/images/vinchacobre.png', ruta: '/catalogo/Cobre/VINCHA_TIARA', badge: 'NUEVO' },
    { nombre: 'Tobilleras', imagen: '/images/tobilleracobre.png', ruta: '/catalogo/Cobre/TOBILLERA', badge: 'NUEVOS' },
  ];

  useEffect(() => {
    if (window.location.hash === '#coleccion') {
      const el = document.getElementById('coleccion');
      if (el) {
        // Calcular offset manual: posición del elemento - header (64px) - margen extra (16px)
        setTimeout(() => {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  return (
    <div className="bg-[#f2eeea] font-sans min-h-screen text-[#2a2018] pt-[64px] md:pt-[72px]">

      {/* [1] HERO COMPACTO */}
      <div className="relative w-full bg-[#2a2018] flex flex-col items-center justify-center text-center px-6 min-h-[220px] md:min-h-[320px] overflow-hidden">
        <img
          src="/images/tecnica.jpg"
          alt="Taller trabajando cobre"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-[#1a0e06]/50" />
        <div className="relative z-10 flex flex-col items-center max-w-2xl py-10 md:py-16">
          <p className="text-[#c8964a] uppercase text-[10px] md:text-xs tracking-[0.22em] mb-3 font-medium">Colección</p>
          <h1
            className="text-[2.8rem] md:text-[4rem] text-[#faf9f7] mb-3 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: '300', letterSpacing: '0.04em' }}
          >Cobre Artesanal</h1>
          <div className="w-8 h-px bg-[#c8964a] opacity-70 mb-3" />
          <p
            style={{ fontSize: '11px', fontWeight: '300', letterSpacing: '0.28em', color: 'rgba(250,249,247,0.5)' }}
          >Metal vivo · forjado a mano en Lima</p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-12">

        {/* [2] HISTORIA */}
        <section className="space-y-4">
          <div className="text-center mb-4">
            <p style={{ fontSize: '9px', fontWeight: '500', letterSpacing: '0.22em', color: '#c8964a', textTransform: 'uppercase' }}>Historia del Cobre</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center bg-white border border-[#e8e4de] rounded-lg p-5 shadow-sm">
            <p className="flex-1" style={{ textAlign: 'left', fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: '300', fontStyle: 'italic', color: '#6a5a4a', lineHeight: '1.85' }}>
              El cobre ha sido parte de la humanidad desde los albores de la civilización. En Enigma, retomamos esta herencia milenaria para forjar joyas que no solo adornan, sino que conectan con nuestras raíces. Cada martillazo y cada doblez es un tributo a las técnicas ancestrales que mantenemos vivas en nuestro taller.
            </p>
            <div className="w-full md:w-1/3 h-48 md:h-64 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-[#e8e4de]">
              <img src="/images/historia.png" alt="Pieza de cobre terminada" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </section>

        {/* [3] ACORDEONES */}
        <section className="space-y-3">
          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '400', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2a2018' }}>Mística y Propiedades</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '300', color: '#6a5a4a', lineHeight: '1.75' }}>
                Más allá de su belleza cálida, el cobre es conocido como un excelente conductor de energía. Históricamente se le atribuyen propiedades sanadoras, ayudando a equilibrar las energías del cuerpo, aliviar dolencias articulares y fomentar la vitalidad física y espiritual de quien lo porta.
              </p>
            </div>
          </details>

          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '400', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2a2018' }}>Proceso de Creación</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4">
              <div className="flex flex-col md:flex-row-reverse gap-6 items-center">
                <p className="flex-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '300', color: '#6a5a4a', lineHeight: '1.75' }}>
                  Todo comienza con un trozo de cobre crudo. Mediante el fuego, el martillo y la paciencia, moldeamos cada curva. No usamos moldes; cada pieza es esculpida a mano, garantizando que tu joya sea única.
                </p>
                <div className="w-full md:w-1/3 h-48 md:h-64 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-[#e8e4de]">
                  <img src="https://qwvhrtdddpmaovnyarhr.supabase.co/storage/v1/object/public/producto-images/8eac9868-28b7-4fed-9fd7-8c9c8c0dcf6d.jpg" alt="Proceso de trabajo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* [4] GRID DE CATEGORÍAS — botones separados, fondo transparente, banda cobre */}
        <section id="coleccion" className="scroll-mt-24">
          <div className="text-center mb-6">
            <p style={{ fontSize: '9px', fontWeight: '500', letterSpacing: '0.24em', color: '#c8964a', textTransform: 'uppercase' }}>Colección</p>
            <div style={{ width: '20px', height: '0.5px', background: '#c8964a', opacity: 0.6, margin: '6px auto 10px' }} />
            <h2 className="text-[26px] md:text-[32px]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: '300', color: '#2a2018', letterSpacing: '0.05em' }}>Explora piezas en cobre</h2>
          </div>

          {/* Grid sin marco contenedor — cada botón flota separado */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}>
            {categories.map(categoria => (
              <Link
                key={categoria.nombre}
                to={categoria.ruta}
                style={{
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                  background: '#e8e0d8',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)';
                }}
                onTouchStart={e => {
                  e.currentTarget.style.transform = 'scale(0.97)';
                }}
                onTouchEnd={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Imagen ocupa todo el botón menos la banda */}
                <img
                  src={categoria.imagen}
                  alt={categoria.nombre}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />

                {/* Badge NUEVO/NUEVOS */}
                {categoria.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    zIndex: 10,
                    backgroundColor: '#2a2018',
                    color: '#c8964a',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    border: '0.5px solid rgba(200,150,74,0.35)',
                  }}>
                    {categoria.badge}
                  </span>
                )}

                {/* Banda inferior refinada */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0, zIndex: 10,
                  background: 'rgba(242,238,234,0.93)',
                  borderTop: '0.5px solid rgba(200,150,74,0.25)',
                  padding: '9px 12px 10px',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '14px',
                    fontWeight: '300',
                    color: '#2a2018',
                    letterSpacing: '0.08em',
                  }}>
                    {categoria.nombre}
                  </span>
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: '300',
                    color: '#c8964a',
                    letterSpacing: '0.05em',
                  }}>
                    ver →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* [5] CUIDADO DEL COBRE */}
        <section className="pt-4">
          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '400', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2a2018' }}>Cuidado y Limpieza</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4 space-y-2">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '300', color: '#6a5a4a', lineHeight: '1.75' }}>
                — Limpieza natural. Limón y sal devuelven el brillo; frota suave y enjuaga.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '300', color: '#6a5a4a', lineHeight: '1.75' }}>
                — Evita la humedad. Retírala antes de bañarte o nadar.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '300', color: '#6a5a4a', lineHeight: '1.75' }}>
                — Almacenamiento. Guárdala en bolsita de tela individual en lugar seco.
              </p>
            </div>
          </details>
        </section>

      </div>
    </div>
  );
};

export default ColeccionCobre;
