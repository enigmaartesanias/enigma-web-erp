import React from 'react';
import SimpleImageHero from '../../components/Hero/SimpleImageHero';
import CategoriaShowcase from '../../components/CategoriaShowcase';
import Galeria from '../../components/Galeria';
import Hero3 from '../../components/Hero/Hero3';
import CelebrityCollaboration from '../../components/CelebrityCollaboration';
import StockGrid from '../../components/StockGrid';
import SocialProof from '../../components/SocialProof';

// El componente de la miniatura gris (HomeVideoShort) ha sido removido de aquí por completo
// PublicCarousel ya no se muestra en el index (el componente y su panel de administración siguen existiendo)

const Home = () => {
  return (
    <>
      <main
        id="inicio"
        className="scroll-mt-16 pt-16 md:scroll-mt-0 md:pt-0"
      >
        <div className="md:hidden">
          <SimpleImageHero />
        </div>

        {/* Colaboración con Andru Donalds */}
        <CelebrityCollaboration />

        {/* Sección Stock Inmediato — debajo de Andru Donalds */}
        <StockGrid />

        {/* Aquí está tu sección principal de la técnica (foto labradorita) */}
        <CategoriaShowcase />

        <Galeria />
        <Hero3 />
        <SocialProof />
      </main>
    </>
  );
};

export default Home;
