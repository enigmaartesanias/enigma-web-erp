// src/components/Hero/SimpleImageHero.jsx

import video from '../../assets/images/video.mp4';

const SimpleImageHero = () => {
  return (
    <div className="w-full flex justify-center bg-gray-100 mt-2">
      <div
        className="relative w-full container mx-auto px-3 flex items-center justify-center overflow-hidden"
        style={{ minHeight: '25vh' }} // Altura para móvil
      >
        {/* Contenedor para desktop con mayor altura */}
        <div className="hidden md:block absolute inset-0" style={{ minHeight: '70vh' }}></div>

        {/* Video de fondo */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover filter sepia"
          src={video}
          autoPlay
          loop
          muted
          playsInline
          style={{ minHeight: '100%', objectPosition: 'center' }} // Centrado para mejor visibilidad
        />

        {/* Label "De Aldo Magallanes" */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-6 py-2 md:px-8 md:py-3 rounded-lg border border-white/20">
            <p className="text-black text-sm md:text-base font-light tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
              De Aldo Magallanes
            </p>
          </div>
        </div>

        {/* Espaciador invisible para forzar altura */}
        <div className="w-full h-[25vh] md:h-[70vh] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default SimpleImageHero;