import tecnica from '../../assets/images/tecnica.jpg';
import { Link } from 'react-router-dom';

const Hero3 = () => {
  return (
    <section className="bg-white py-8 md:py-16 relative overflow-hidden">
      {/* Textura sutil en el fondo de la sección */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none opacity-80"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-center gap-6 md:gap-12">
            {/* Columna de la imagen */}
            <div className="w-full md:col-span-1 lg:col-span-1 flex justify-center md:justify-start">
              <img
                src={tecnica}
                alt="Orfebre trabajando con técnicas artesanales"
                className="w-full max-w-[200px] md:max-w-full h-auto rounded-xl object-cover"
                style={{ boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}
              />
            </div>

            {/* Columna del texto y contenido */}
            <div className="w-full md:col-span-2 lg:col-span-3 flex flex-col justify-center text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-light text-white mb-3 uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
                La Técnica
              </h2>
              <div className="w-12 h-0.5 mb-4 mx-auo md:mx-0" style={{ backgroundColor: '#c8964a', boxShadow: '0 0 8px rgba(200,150,74,0.8)' }}></div>

              {/* Cita */}
              <blockquote className="text-center md:text-left text-sm md:text-base lg:text-lg text-gray-300 pl-0 mb-4 leading-relaxed font-light">
                En Enigma joyas de autor, combinamos técnicas ancestrales como el alambrismo y el martillado con acabados envejecidos que otorgan carácter y autenticidad.
              </blockquote>

              <div>
                <Link
                  to="/el-oficio"
                  className="inline-block hover:text-white font-medium transition-colors text-sm"
                  style={{ color: '#c8964a' }}
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