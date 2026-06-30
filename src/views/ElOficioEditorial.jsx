import React from 'react';
import sobremi1 from '../assets/images/sobremi1.jpg';

// Video formato horizontal (16:9) — reportaje televisivo de archivo.
// Va en la Sección III, dentro del contenedor 16:9.
const VIDEO_REPORTAJE_ID = '_KdRykr7pbc';

// Video formato vertical (9:16) — short del proceso en el taller.
// Va en la Sección II, dentro del contenedor 9:16.
// (Antes estaban cruzados: el reportaje horizontal quedaba forzado en un
// contenedor vertical y viceversa — por eso se veían mal encajados.)
const VIDEO_PROCESO_ID = 'JDaL-2bRYYw';

// Paleta de marca compartida con el resto del sitio (Galeria.jsx, Hero3.jsx)
const COLOR_TEXT = '#2a2018';
const COLOR_TEXT_SOFT = '#5c5346';
const COLOR_GOLD = '#c8964a';
const COLOR_BG = '#f5f1ec';

const FONT_DISPLAY = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";

const ElOficioEditorial = () => {
  return (
    <main className="min-h-screen pt-16 select-none" style={{ background: COLOR_BG }}>

      {/* ─── ENCABEZADO DE AUTOR ─── */}
      <header className="max-w-2xl mx-auto px-6 pt-10 pb-2 text-center">
        <p
          className="text-[10px] tracking-[0.32em] uppercase mb-2 font-semibold"
          style={{ fontFamily: FONT_BODY, color: COLOR_GOLD }}
        >
          Artesano · Orfebre · Lima, Perú
        </p>
        <h1
          className="text-2xl md:text-3xl font-light tracking-[0.02em] leading-snug"
          style={{ fontFamily: FONT_DISPLAY, color: COLOR_TEXT }}
        >
          Aldo Magallanes
        </h1>
        <p
          className="text-[11px] tracking-[0.18em] uppercase mt-1"
          style={{ fontFamily: FONT_BODY, color: COLOR_TEXT_SOFT }}
        >
          Enigma Orfebreria de Autor
        </p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <span className="block h-px w-10" style={{ background: '#e4ddd1' }} />
          <span className="block w-1.5 h-1.5 rounded-full" style={{ background: COLOR_GOLD }} />
          <span className="block h-px w-10" style={{ background: '#e4ddd1' }} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-16 space-y-6 md:space-y-8">

        {/* ════════════════════════════════════════
            I — EL ORFEBRE INTUITIVO
        ════════════════════════════════════════ */}
        <section
          className="rounded-2xl bg-white border p-6 md:p-9"
          style={{ borderColor: 'rgba(42,32,24,0.06)', boxShadow: '0 2px 16px rgba(42,32,24,0.04)' }}
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">

            {/* Imagen de Taller — más pequeña, envuelta en su propio div */}
            <div className="w-full md:w-auto flex-shrink-0 flex justify-center">
              <div className="relative p-1" style={{ width: '180px' }}>
                <div className="absolute inset-0 translate-x-2 translate-y-2 border rounded-sm" style={{ borderColor: '#e4ddd1' }} />
                <img
                  src={sobremi1}
                  alt="Aldo Magallanes en su taller de orfebrería, Lima"
                  className="relative w-full object-cover rounded-sm border"
                  style={{ aspectRatio: '4/5', borderColor: '#e4ddd1' }}
                />
              </div>
            </div>

            {/* Texto de Historia */}
            <div className="w-full md:flex-1">
              <span
                className="block text-[10px] tracking-[0.22em] uppercase mb-3 font-semibold"
                style={{ fontFamily: FONT_BODY, color: COLOR_GOLD }}
              >
                I · El orfebre intuitivo
              </span>
              <div className="space-y-4 text-sm leading-relaxed font-normal" style={{ fontFamily: FONT_BODY, color: COLOR_TEXT_SOFT }}>
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

              <blockquote className="mt-5 pl-4 border-l" style={{ borderColor: COLOR_GOLD }}>
                <p className="text-xs leading-relaxed italic" style={{ fontFamily: FONT_DISPLAY, fontSize: '15px', color: COLOR_TEXT_SOFT }}>
                  "Cada relieve texturizado nace de la misma pregunta de siempre:
                  ¿qué quiere decir este metal hoy?"
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            II — EL OFICIO Y LA HONESTIDAD
        ════════════════════════════════════════ */}
        <section
          className="rounded-2xl bg-white border p-6 md:p-9"
          style={{ borderColor: 'rgba(42,32,24,0.06)', boxShadow: '0 2px 16px rgba(42,32,24,0.04)' }}
        >
          <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-10 items-center">

            {/* Video del proceso — formato vertical (short) */}
            <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center">
              <div
                className="relative overflow-hidden rounded-sm border bg-stone-100"
                style={{ width: 180, aspectRatio: '9/16', borderColor: '#e4ddd1' }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_PROCESO_ID}?rel=0&modestbranding=1`}
                  title="El proceso del taller — Enigma Joyas de Autor"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
              <p className="text-center text-[11px] mt-2 tracking-wide" style={{ fontFamily: FONT_BODY, color: COLOR_TEXT_SOFT }}>
                El proceso · Registro en el taller
              </p>
            </div>

            {/* Texto de Filosofía */}
            <div className="w-full md:flex-1">
              <span
                className="block text-[10px] tracking-[0.22em] uppercase mb-3 font-semibold"
                style={{ fontFamily: FONT_BODY, color: COLOR_GOLD }}
              >
                II · El oficio y la honestidad
              </span>
              <div className="space-y-4 text-sm leading-relaxed font-normal" style={{ fontFamily: FONT_BODY, color: COLOR_TEXT_SOFT }}>
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

        {/* ════════════════════════════════════════
            III — PIONERO DIGITAL
        ════════════════════════════════════════ */}
        <section
          className="rounded-2xl bg-white border p-6 md:p-9"
          style={{ borderColor: 'rgba(42,32,24,0.06)', boxShadow: '0 2px 16px rgba(42,32,24,0.04)' }}
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">

            {/* Video entrevista — formato horizontal (reportaje TV) */}
            <div className="w-full md:w-5/12 flex-shrink-0">
              <div
                className="relative w-full overflow-hidden rounded-sm border bg-stone-100"
                style={{ aspectRatio: '16/9', borderColor: '#e4ddd1' }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_REPORTAJE_ID}?rel=0&modestbranding=1`}
                  title="Entrevista — Enigma, pionero digital en el Perú"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="block h-px flex-1" style={{ background: '#e4ddd1' }} />
                <span
                  className="text-[10px] tracking-widest uppercase whitespace-nowrap font-semibold"
                  style={{ fontFamily: FONT_BODY, color: COLOR_TEXT_SOFT }}
                >
                  Archivo Histórico
                </span>
                <span className="block h-px flex-1" style={{ background: '#e4ddd1' }} />
              </div>
            </div>

            {/* Texto de Innovación */}
            <div className="w-full md:flex-1">
              <span
                className="block text-[10px] tracking-[0.22em] uppercase mb-3 font-semibold"
                style={{ fontFamily: FONT_BODY, color: COLOR_GOLD }}
              >
                III · Pionero digital
              </span>
              <div className="space-y-4 text-sm leading-relaxed font-normal" style={{ fontFamily: FONT_BODY, color: COLOR_TEXT_SOFT }}>
                <p>
                  A inicios de los dos mil, cuando la presencia en internet era un privilegio inalcanzable para muchos,
                  construí de forma totalmente autodidacta nuestra primera plataforma web. El hecho llamó la atención
                  de los medios televisivos, quienes dedicaron un reportaje no solo a las piezas de la época, sino al
                  hecho insólito: un artesano independiente rompiendo esquemas para crear su propia vitrina global sin
                  agencias ni presupuestos corporativos.
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

      </div>

      {/* ─── CIERRE EDITORIAL ─── */}
      <footer className="max-w-xl mx-auto px-6 text-center pt-2 pb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="block h-px w-10" style={{ background: '#e4ddd1' }} />
          <span className="block w-1.5 h-1.5 rounded-full" style={{ background: COLOR_GOLD }} />
          <span className="block h-px w-10" style={{ background: '#e4ddd1' }} />
        </div>
        <p
          className="text-xs leading-relaxed tracking-wide italic"
          style={{ fontFamily: FONT_DISPLAY, fontSize: '16px', color: COLOR_TEXT_SOFT }}
        >
          "Cada pieza es única. Cada encargo, una conversación."
        </p>
        <a
          href="https://wa.me/51960282376"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-5 px-7 py-3 border text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 rounded-sm"
          style={{ fontFamily: FONT_BODY, borderColor: '#d8cfc0', color: COLOR_TEXT_SOFT }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR_GOLD; e.currentTarget.style.color = COLOR_GOLD; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d8cfc0'; e.currentTarget.style.color = COLOR_TEXT_SOFT; }}
        >
          Hablar con el orfebre
        </a>
      </footer>

    </main>
  );
};

export default ElOficioEditorial;
