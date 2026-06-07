import React from 'react';
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
          <h1 className="text-3xl md:text-5xl text-[#faf9f7] font-serif font-light mb-3 leading-tight tracking-wide">Cobre Artesanal</h1>
          <div className="w-8 h-px bg-[#c8964a] opacity-70 mb-3" />
          <p className="text-[#faf9f7]/60 text-xs md:text-base font-light tracking-widest">Metal vivo · forjado a mano en Lima</p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-12">

        {/* [2] HISTORIA */}
        <section className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c8964a] font-medium">Historia del Cobre</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center bg-white border border-[#e8e4de] rounded-lg p-5 shadow-sm">
            <p className="flex-1 text-[#6a5a4a] leading-relaxed text-sm md:text-base font-light">
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
            <summary className="flex justify-between items-center text-sm md:text-base font-medium text-[#2a2018] cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span className="tracking-wide font-medium">Mística y Propiedades</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4">
              <p className="text-[#6a5a4a] leading-relaxed text-sm md:text-base font-light">
                Más allá de su belleza cálida, el cobre es conocido como un excelente conductor de energía. Históricamente se le atribuyen propiedades sanadoras, ayudando a equilibrar las energías del cuerpo, aliviar dolencias articulares y fomentar la vitalidad física y espiritual de quien lo porta.
              </p>
            </div>
          </details>

          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 shadow-sm">
            <summary className="flex justify-between items-center text-sm md:text-base font-medium text-[#2a2018] cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span className="tracking-wide font-medium">Proceso de Creación</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4">
              <div className="flex flex-col md:flex-row-reverse gap-6 items-center">
                <p className="flex-1 text-[#6a5a4a] leading-relaxed text-sm md:text-base font-light">
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
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c8964a] mb-2 font-medium">Colección</p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-[#2a2018] tracking-wide">Explora piezas en cobre</h2>
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
                    backgroundColor: '#15803d',
                    color: 'white',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                  }}>
                    {categoria.badge}
                  </span>
                )}

                {/* Banda inferior tono cobre/rosado */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  background: 'linear-gradient(to right, #c49a7a, #b8836a)',
                  color: '#3a1a08',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '7px 4px',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {categoria.nombre}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* [5] CUIDADO DEL COBRE */}
        <section className="pt-4">
          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 shadow-sm">
            <summary className="flex justify-between items-center text-sm md:text-base font-medium text-[#2a2018] cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span className="tracking-wide font-medium">Cuidado y Limpieza</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4">
              <ol className="space-y-3 text-[#6a5a4a] text-sm md:text-base font-light list-decimal pl-5 marker:text-[#c8964a] marker:font-medium">
                <li className="pl-1"><span className="text-[#2a2018] font-medium">Limpieza natural</span> — Limón y sal devuelven el brillo. Frota suave y enjuaga.</li>
                <li className="pl-1"><span className="text-[#2a2018] font-medium">Evita humedad</span> — Retírala antes de bañarte o nadar.</li>
                <li className="pl-1"><span className="text-[#2a2018] font-medium">Almacenamiento</span> — Bolsitas de tela individual, lugar seco.</li>
              </ol>
            </div>
          </details>
        </section>

      </div>
    </div>
  );
};

export default ColeccionCobre;
