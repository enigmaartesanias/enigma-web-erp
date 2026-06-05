import React from 'react';
import { Link } from 'react-router-dom';

const ColeccionCobre = () => {
  // 6 Categorías para el Grid de cards
  const categories = [
    { name: 'Aretes', image: '/images/aretecobre.png', path: '/catalogo/Cobre/ARETE', isNew: false },
    { name: 'Pulseras', image: '/images/pulseracobre.png', path: '/catalogo/Cobre/PULSERA', isNew: false },
    { name: 'Anillos', image: '/images/anillocobre.png', path: '/catalogo/Cobre/ANILLO', isNew: false },
    { name: 'Collares', image: '/images/collarcobre.png', path: '/catalogo/Cobre/COLLAR', isNew: false },
    { name: 'Vinchas', image: '/images/vinchacobre.png', path: '/catalogo/Cobre/VINCHA_TIARA', isNew: true },
    { name: 'Tobilleras', image: '/images/tobilleracobre.png', path: '/catalogo/Cobre/TOBILLERA', isNew: true }
  ];

  return (
    <div className="bg-[#faf9f7] font-sans min-h-screen text-[#2a2018] pt-[64px] md:pt-[72px]">

      {/* [1] HERO COMPACTO */}
      <div className="relative w-full bg-[#2a2018] flex flex-col
              items-center justify-center text-center px-6
              min-h-[220px] md:min-h-[320px] overflow-hidden">

        {/* Imagen de fondo — object-position ajustado para mobile */}
        <img
          src="/images/tecnica.jpg"
          alt="Taller trabajando cobre"
          className="absolute inset-0 w-full h-full
                  object-cover object-center
                  opacity-50 mix-blend-luminosity"
        />

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-[#1a0e06]/50" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center max-w-2xl py-10 md:py-16">
          <p className="text-[#c8964a] uppercase text-[10px] md:text-xs
                  tracking-[0.22em] mb-3 font-medium">
            Colección
          </p>
          <h1 className="text-3xl md:text-5xl text-[#faf9f7]
                  font-serif font-light mb-3 leading-tight tracking-wide">
            Cobre Artesanal
          </h1>
          <div className="w-8 h-px bg-[#c8964a] opacity-70 mb-3" />
          <p className="text-[#faf9f7]/60 text-xs md:text-base
                  font-light tracking-widest">
            Metal vivo · forjado a mano en Lima
          </p>
        </div>
      </div>

      {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-12">

        {/* [2] HISTORIA (VISIBLE DIRECTAMENTE) */}
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

        {/* [3] MÍSTICA Y PROCESO (ACORDEONES CERRADOS POR DEFECTO) */}
        <section className="space-y-3">
          {/* Mística */}
          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 transition-all duration-300 shadow-sm">
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

          {/* Proceso */}
          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 transition-all duration-300 shadow-sm">
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
                <div className="w-full md:w-1/3 h-32 md:h-36 rounded overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-[#e8e4de]">
                  <img src="/images/img2.jpg" alt="Proceso de trabajo" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* [4] GRID DE CATEGORÍAS */}
        <section id="coleccion" className="scroll-mt-24">
          <div className="text-center mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c8964a] mb-2 font-medium">
              Colección
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-[#2a2018] tracking-wide">
              Explora piezas en cobre
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 px-1 md:px-0">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={cat.path}
                className="group flex flex-col bg-white border border-[#e0d8ce]
                          rounded-3xl overflow-hidden shadow-sm hover:shadow-md
                          hover:border-[#c8964a] transition-all duration-300 h-full"
              >
                {/* Imagen con overlay y proporción fija */}
                <div className="relative w-full h-28 md:h-40 overflow-hidden bg-[#e8e0d4] flex-shrink-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover
                              group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay degradado sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t
                            from-[#2a2018]/30 via-transparent to-transparent" />

                  {/* Badge nuevo — solo para Vinchas y Tobilleras */}
                  {cat.isNew && (
                    <span className="absolute top-2 left-2
                              text-[9px] tracking-wider uppercase
                              bg-[#fdf0e0] text-[#a07030]
                              px-2 py-0.5 rounded-full font-medium">
                      nuevo
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="flex items-center justify-center px-2 py-3 border-t border-[#f0ebe1] bg-[#fdfdfc] flex-grow">
                  <span className="text-xs md:text-sm text-[#2a2018] font-serif font-light tracking-widest uppercase text-center group-hover:text-[#c8964a] transition-colors duration-300">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* [5] CUIDADO DEL COBRE */}
        <section className="pt-4">
          <details className="group border border-[#e8e4de] bg-white rounded-lg p-4 transition-all duration-300 shadow-sm">
            <summary className="flex justify-between items-center text-sm md:text-base font-medium text-[#2a2018] cursor-pointer hover:text-[#c8964a] list-none select-none [&::-webkit-details-marker]:hidden">
              <span className="tracking-wide font-medium">Cuidado y Limpieza</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-open:rotate-180 transition-transform duration-300 text-[#c8964a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 border-t border-[#e8e4de]/40 pt-4">
              <ol className="space-y-3 text-[#6a5a4a] text-sm md:text-base font-light list-decimal pl-5 marker:text-[#c8964a] marker:font-medium">
                <li className="pl-1">
                  <span className="text-[#2a2018] font-medium">Limpieza natural</span> — Limón y sal devuelven el brillo. Frota suave y enjuaga.
                </li>
                <li className="pl-1">
                  <span className="text-[#2a2018] font-medium">Evita humedad</span> — Retírala antes de bañarte o nadar.
                </li>
                <li className="pl-1">
                  <span className="text-[#2a2018] font-medium">Almacenamiento</span> — Bolsitas de tela individual, lugar seco.
                </li>
              </ol>
            </div>
          </details>
        </section>

      </div>
    </div>
  );
};

export default ColeccionCobre;
