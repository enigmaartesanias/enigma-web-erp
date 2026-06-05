// src/components/Hero/SimpleImageHero.jsx

import video from '../../assets/images/video.mp4';

const SimpleImageHero = () => {
  return (
    <div className="w-full bg-white">
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        {/* Video de fondo que dicta la altura (sin cortes) */}
        <video
          className="w-full h-auto filter sepia"
          src={video}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Label "De Aldo Magallanes" */}
        <div className="absolute bottom-2 right-4 md:bottom-6 md:right-10 z-10 pointer-events-none">
          <p className="text-black text-xs sm:text-sm md:text-lg font-bold tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
            De Aldo Magallanes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageHero;