import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ColeccionCobre = () => {
  const [activeTab, setActiveTab] = useState(0);

  const chapters = [
    {
      numero: 'I',
      nombre: 'El Fuego',
      subtitulo: 'El dominio térmico del artesano',
      titulo: 'El Velo del Fuego: Domar lo Indomable',
      texto1:
        'El cobre es un metal noble pero indomable. Posee una conductividad térmica tan sublime que desafía al fuego mismo, disipando el calor casi tan rápido como el soplete intenta acariciarlo. Dominar su soldadura exige una llama voraz, un fundente líquido invisible y una paciencia templada en el taller.',
      texto2:
        'No es un oficio mecánico; es un duelo de precisión absoluta donde un milímetro de soldadura delgada define la eternidad de la pieza. Donde otros metales ceden de inmediato, el cobre exige meses de obsesión y maestría.',
      rutaFutura: '/assets/images/cobre/fuego-soldadura.mp4',
      tipoMedia: 'video',
    },
    {
      numero: 'II',
      nombre: 'Texturas',
      subtitulo: 'Forjado, pliegues y texturas fundidas',
      titulo: 'La Piel del Metal: Relieves e Identidad',
      texto1:
        'Cada relieve que refracta la luz en nuestras piezas es un diálogo honesto entre el metal y el martillo. Forjamos el cobre directamente o mediante técnicas complejas sobre tubo para generar pliegues orgánicos y texturas semi-fundidas que parecen extraídas de la tierra.',
      texto2:
        'Es la identidad esculpida enteramente a mano: una topografía de accidentes perfectos que asegura que ninguna joya sea igual a otra. Su superficie cuenta la historia de su propia transformación física.',
      rutaFutura: '/assets/images/cobre/texturas-forjado.jpg',
      tipoMedia: 'imagen',
    },
    {
      numero: 'III',
      nombre: 'Alquimia',
      subtitulo: 'El tiempo controlado y el grabado profundo',
      titulo: 'Alquimia Ancestral: Pátinas y Ácido',
      texto1:
        "No buscamos el brillo efímero. Mediante la preparación artesanal de pátinas de azufre, aceleramos el susurro del tiempo sobre el metal para vestirlo con matices oscuros y profundos. Complementamos este misticismo con el 'etching' o grabado al ácido férrico.",
      texto2:
        'Esta técnica muerde el metal de manera irreversible, dibujando patrones ancestrales en su superficie. Es el encanto de lo antiguo, una joya que parece rescatada de la historia para adaptarse a tu presente.',
      rutaFutura: '/assets/images/cobre/patinas-etching.jpg',
      tipoMedia: 'imagen',
    },
    {
      numero: 'IV',
      nombre: 'Armado',
      subtitulo: 'Estructuras tejidas y encapsulados minerales',
      titulo: 'Arquitectura Textil: Alambrismo y Resina',
      texto1:
        'El armado de nuestras piezas desafía lo convencional. Tejemos filamentos de alambre artesanalmente para estructurar el alma de la joya, creando un encaje metálico rígido. Sobre este lienzo, diseñamos cajas caladas en formas icónicas como lunas o corazones.',
      texto2:
        'En su interior, trituramos minerales de cuarzo y piedras naturales, encapsulándolos con resina UV para fusionar el color eterno y la luz directamente sobre el metal. Una ingeniería artesanal única.',
      rutaFutura: '/assets/images/cobre/alambrismo-resina.jpg',
      tipoMedia: 'imagen',
    },
    {
      numero: 'V',
      nombre: 'El Acabado',
      subtitulo: 'La misma alma, las mismas herramientas',
      titulo: 'El Rigor de la Joyería: Pulido y Engaste',
      texto1:
        'Una pieza de cobre de autor no tiene nada que envidiarle a la plata o al oro. En nuestro taller, el cobre se trabaja bajo los estándares más estrictos de la alta joyería. Usamos las mismas herramientas de precisión para lograr acabados espejo impecables.',
      texto2:
        'Cada piedra preciosa o mineral es engastado con el rigor técnico necesario para asegurar su permanencia. El valor real no reside en la etiqueta del metal, sino en la destreza técnica de la mano que lo consagra.',
      rutaFutura: '/assets/images/cobre/joya-final-pulido.jpg',
      tipoMedia: 'imagen',
    },
  ];

  const activeChapter = chapters[activeTab];
  const isEven = activeTab % 2 === 0;

  return (
    <div className="bg-stone-950 min-h-screen pt-[64px] md:pt-[72px]">
      <div className="max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-stone-200 font-sans">

        {/* ENCABEZADO */}
        <div className="text-center mb-12">
          <p className="font-serif italic text-amber-600/80 text-sm md:text-base mb-2">
            El Manifiesto del Artesano
          </p>
          <h1 className="font-serif text-stone-100 tracking-wide text-4xl md:text-6xl">
            El Universo del Cobre
          </h1>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS — móvil: columna apilada / escritorio: línea horizontal */}
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-center sm:gap-4 sm:border-b sm:border-stone-900 sm:pb-4 mb-12">
          {chapters.map((chapter, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={chapter.numero}
                onClick={() => setActiveTab(index)}
                className={`w-full sm:w-auto text-center px-4 py-3 sm:py-2 border transition-colors duration-300 ${
                  isActive
                    ? 'text-amber-500 font-medium border-amber-500 bg-stone-900/40 sm:bg-transparent sm:border-transparent sm:border-b-2'
                    : 'text-stone-500 hover:text-stone-300 border-transparent'
                }`}
              >
                <span className="font-serif text-xs sm:text-sm tracking-wide">
                  Capítulo {chapter.numero}. {chapter.nombre}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DEL CAPÍTULO ACTIVO — ZIG-ZAG */}
        <section
          key={activeTab}
          className={`flex flex-col gap-10 items-center lg:gap-16 lg:items-stretch ${
            isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
          }`}
        >
          {/* COLUMNA DE TEXTO */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <p className="font-serif italic text-amber-600/80 text-sm md:text-base mb-2">
              {activeChapter.subtitulo}
            </p>
            <h2 className="font-serif text-stone-100 tracking-wide text-3xl md:text-4xl mb-6">
              {activeChapter.titulo}
            </h2>
            <p className="font-sans text-stone-400 font-light leading-relaxed text-base md:text-lg mb-5">
              {activeChapter.texto1}
            </p>
            <p className="font-sans text-stone-400 font-light leading-relaxed text-base md:text-lg">
              {activeChapter.texto2}
            </p>
          </div>

          {/* COLUMNA MULTIMEDIA — PLACEHOLDER TEMPORAL */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            {/*
              TODO: Reemplazar este div placeholder por la etiqueta real
              cuando el archivo exista en /public${activeChapter.rutaFutura}:

              Si tipoMedia === 'video':
                <video
                  src={activeChapter.rutaFutura}
                  className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] w-full object-cover rounded-sm shadow-2xl"
                  autoPlay loop muted playsInline
                />

              Si tipoMedia === 'imagen':
                <img
                  src={activeChapter.rutaFutura}
                  alt={activeChapter.titulo}
                  className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] w-full object-cover rounded-sm shadow-2xl"
                />
            */}
            <div className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] w-full bg-stone-900 rounded-sm border border-stone-800/60 shadow-2xl flex flex-col items-center justify-center p-6 animate-pulse">
              <span className="font-serif text-xs uppercase tracking-widest text-stone-500 text-center">
                [ Marcador: /public{activeChapter.rutaFutura} ]
              </span>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <div className="text-center mt-20">
          <Link
            to="/catalogo/Cobre"
            className="inline-block font-serif text-sm uppercase tracking-widest text-amber-500 border border-amber-600/40 px-8 py-3 hover:bg-amber-600/10 hover:border-amber-500 transition-colors duration-300"
          >
            Descubrir Joyas de Autor en Cobre
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ColeccionCobre;
