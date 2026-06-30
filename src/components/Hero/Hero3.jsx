import tecnica from '../../assets/images/tecnica.jpg';
import { Link } from 'react-router-dom';

const Hero3 = () => {
  return (
    // Fondo claro (crema, mismo tono que Galeria.jsx) en vez de oscuro.
    // Esta sección queda entre "Colecciones Artesanales" (claro) arriba y
    // "Joyas con Historia" (oscuro) abajo. Al ser clara, se fusiona con
    // Colecciones formando un solo "capítulo claro", y deja que Joyas con
    // Historia sea el único bloque oscuro de esa zona — evita la costura
    // de dos oscuros distintos pegados que se veía en la captura anterior.
    <section className="py-6 md:py-10 relative overflow-hidden" style={{ background: '#f5f1ec' }}>
      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center gap-5 md:gap-10">
            {/* Columna de la imagen */}
            <div className="w-full md:col-span-1 lg:col-span-1 flex justify-center md:justify-start">
              <img
                src={tecnica}
                alt="Orfebre trabajando con técnicas artesanales"
                className="w-full max-w-[160px] md:max-w-full h-auto rounded-xl object-cover"
                style={{ boxShadow: '0 4px 16px rgba(42,32,24,0.18)' }}
              />
            </div>

            {/* Columna del texto y contenido */}
            <div className="w-full md:col-span-2 lg:col-span-3 flex flex-col justify-center text-center md:text-left">
              <h2
                className="text-lg md:text-xl font-light mb-2 uppercase tracking-widest"
                style={{ letterSpacing: '0.15em', color: '#2a2018' }}
              >
                La Técnica
              </h2>
              <div className="w-12 h-0.5 mb-3 mx-auto md:mx-0" style={{ backgroundColor: '#c8964a' }}></div>

              {/* Cita */}
              <blockquote
                className="text-center md:text-left text-sm md:text-base pl-0 mb-3 leading-relaxed font-light"
                style={{ color: '#5c5346' }}
              >
                En Enigma joyas de autor, combinamos técnicas ancestrales como el alambrismo y el martillado con acabados envejecidos que otorgan carácter y autenticidad.
              </blockquote>

              <div>
                <Link
                  to="/el-oficio"
                  className="inline-block font-medium transition-colors text-sm"
                  style={{ color: '#b07d35' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c8964a'}
                  onMouseLeave={e => e.currentTarget.style.color = '#b07d35'}
                >
                  Ver más detalles del taller →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero3;
