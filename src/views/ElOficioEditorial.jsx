import React from 'react';
import sobremi1 from '../assets/images/sobremi1.jpg';

// IDs corregidos e invertidos según su sección correspondiente
const VIDEO_TALLER_ID = '_KdRykr7pbc'; // Formato Horizontal (Reportaje TV)
const VIDEO_ENTREVISTA_ID = 'JDaL-2bRYYw'; // Formato Vertical (Short)

const ElOficioEditorial = () => {
  return (
    <main className="bg-stone-50 min-h-screen pt-20 select-none">

      {/* ─── ENCABEZADO DE AUTOR ─── */}
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-4 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stone-400 mb-3 font-medium">
          Artesano · Orfebre · Lima, Perú
        </p>
        <h1 className="text-2xl md:text-3xl font-light tracking-[0.05em] text-stone-800 leading-snug">
          Aldo Magallanes
        </h1>
        <p className="text-[11px] tracking-[0.2em] uppercase text-stone-400 mt-2">
          Enigma Joyas de Autor
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className="block h-px w-12 bg-stone-200" />
          <span className="block w-1.5 h-1.5 rounded-full bg-[#c8964a]" />
          <span className="block h-px w-12 bg-stone-200" />
        </div>
      </header>

      {/* ════════════════════════════════════════
          I — EL ORFEBRE INTUITIVO
      ════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

          {/* Imagen de Taller */}
          <div className="w-full md:w-5/12 flex-shrink-0">
            <div className="relative p-1">
              <div className="absolute inset-0 translate-x-2 translate-y-2 border border-stone-200 rounded-sm" />
              <img
                src={sobremi1}
                alt="Aldo Magallanes en su taller de orfebrería, Lima"
                className="relative w-full object-cover rounded-sm border border-stone-200"
                style={{ aspectRatio: '4/5' }}
              />
            </div>
          </div>

          {/* Texto de Historia */}
          <div className="w-full md:w-7/12">
            <span className="block text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-4 font-medium">
              I · El orfebre intuitivo
            </span>
            <div className="space-y-5 text-sm leading-relaxed text-stone-500 font-normal">
              <p>
                Enigma nació en las primeras ferias artesanales de Lima, bautizada bajo la mística
                de la música en casete que acompañaba las largas noches de creación en el banco de trabajo.
                Rompiendo con un entorno de profesiones tradicionales de escritorio, decidí apostar por
                la libertad del taller y el magnetismo natural del metal.
              </p>
              <p>
                Mi camino ha sido una evolución orgánica de décadas dedicadas a la exploración de materiales:
                desde la delicadeza inicial del alambrismo y el juego con las resinas, hasta encontrar en el
                forjado directo del cobre mi lenguaje más personal. Sin moldes industriales ni medidas
                rígidas, cada pieza es un ensayo único de fuego, perseverancia y carácter.
              </p>
            </div>

            <blockquote className="mt-8 pl-4 border-l border-[#c8964a]">
              <p className="text-xs leading-relaxed text-stone-400 italic">
                "Cada relieve texturizado nace de la misma pregunta de siempre:
                ¿qué quiere decir este metal hoy?"
              </p>
            </blockquote >
          </div>
        </div>
      </section>

      {/* ─── SEPARADOR INTERMEDIO ─── */}
      <div className="flex items-center justify-center gap-4 max-w-xs mx-auto my-4">
        <span className="block h-px flex-1 bg-stone-200" />
        <span className="text-stone-300 text-xs font-light">✦</span>
        <span className="block h-px flex-1 bg-stone-200" />
      </div>

      {/* ════════════════════════════════════════
          II — EL OFICIO Y LA HONESTIDAD
      ════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="flex flex-col md:flex-row-reverse gap-10 md:gap-16 items-center">

          {/* Video taller — Formato Vertical (Short) */}
          <div className="w-full md:w-5/12 flex-shrink-0 flex flex-col items-center">
            <div
              className="relative w-full overflow-hidden rounded-sm border border-stone-200 bg-stone-100"
              style={{ maxWidth: 280, aspectRatio: '9/16' }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_TALLER_ID}?rel=0&modestbranding=1`}
                title="El proceso del taller — Enigma Joyas de Autor"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
            <p className="text-center text-[11px] text-stone-400 mt-3 tracking-wide">
              El proceso · Registro en el taller
            </p>
          </div>

          {/* Texto de Filosofía */}
          <div className="w-full md:w-7/12">
            <span className="block text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-4 font-medium">
              II · El oficio y la honestidad
            </span>
            <div className="space-y-5 text-sm leading-relaxed text-stone-500 font-normal">
              <p>
                Compartir el proceso abiertamente en plataformas digitales nace de una convicción honesta:
                a mí nadie me cobró un sol por aprender, y creo profundamente en el valor de transmitir
                el conocimiento de forma transparente. Hoy, nuestra comunidad digital respalda con cientos
                de miles de reproducciones este viaje diario entre el metal y el yunque.
              </p>
              <p>
                Este oficio es un acto de confianza mutua. Muchos coleccionistas y clientes nos entregan
                sus propias piedras naturales para que las transformemos con total libertad creativa,
                sabiendo que cada engaste y relieve texturizado nacerá de forma exclusiva para la naturaleza
                específica de esa gema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEPARADOR INTERMEDIO ─── */}
      <div className="flex items-center justify-center gap-4 max-w-xs mx-auto my-4">
        <span className="block h-px flex-1 bg-stone-200" />
        <span className="text-stone-300 text-xs font-light">✦</span>
        <span className="block h-px flex-1 bg-stone-200" />
      </div>

      {/* ════════════════════════════════════════
          III — PIONERO DIGITAL
      ════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">

          {/* Video entrevista — Formato Horizontal (Reportaje TV) */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <div
              className="relative w-full overflow-hidden rounded-sm border border-stone-200 bg-stone-100"
              style={{ aspectRatio: '16/9' }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ENTREVISTA_ID}?rel=0&modestbranding=1`}
                title="Entrevista — Enigma, pionero digital en el Perú"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="block h-px flex-1 bg-stone-200" />
              <span className="text-[10px] text-stone-400 tracking-widest uppercase whitespace-nowrap font-medium">
                Archivo Histórico
              </span>
              <span className="block h-px flex-1 bg-stone-200" />
            </div>
          </div>

          {/* Texto de Innovación */}
          <div className="w-full md:w-1/2">
            <span className="block text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-4 font-medium">
              III · Pionero digital
            </span>
            <div className="space-y-5 text-sm leading-relaxed text-stone-500 font-normal">
              <p>
                A inicios de los dos mil, cuando la presencia en internet era un privilegio inalcanzable para muchos,
                construí de forma totalmente autodidacta nuestra primera plataforma web. El hecho llamó la atención
                de los medios televisivos, quienes dedicaron un reportaje no solo a las piezas de la época, sino al
                hecho insólito: un artesano independiente rompiendo esquemas para crear su propia vitrina global sin agencias
                ni presupuestos corporativos.
              </p>
              <p>
                Hoy, con casi dos décadas de constancia ininterrumpida en la red, esa vitrina inicial ha evolucionado
                hacia un ecosistema digital integrado, capaz de gestionar un catálogo internacional en tres monedas
                sin perder la esencia humana y cercana que define a la alta joyería de autor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CIERRE EDITORIAL ─── */}
      <footer className="max-w-xl mx-auto px-6 text-center pt-8 pb-24">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="block h-px w-12 bg-stone-200" />
          <span className="block w-1.5 h-1.5 rounded-full bg-[#c8964a]" />
          <span className="block h-px w-12 bg-stone-200" />
        </div>
        <p className="text-xs leading-relaxed text-stone-400 tracking-wide italic">
          "Cada pieza es única. Cada encargo, una conversación."
        </p>
        <a
          href="https://wa.me/51960282376"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-7 py-3 border border-stone-300 text-[11px] tracking-[0.2em] uppercase text-stone-500 hover:border-[#c8964a] hover:text-[#c8964a] transition-colors duration-300 rounded-sm"
        >
          Hablar con el orfebre
        </a>
      </footer>

    </main>
  );
};

export default ElOficioEditorial;