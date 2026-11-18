// src/components/Hero/SimpleImageHero.jsx
import { Link } from 'react-router-dom';
import video from '../../assets/images/heroindex.mp4';

/* Espacio que hoy deja tu layout arriba para el header fijo (antes 64 px).
   El margen negativo lo cancela para que el video suba por detrás del header.
   Si en tu layout NO existe ese espacio, pon 0. */
const LAYOUT_OFFSET = 64;

const SimpleImageHero = () => (
  <section
    style={{
      position: 'relative',
      width: '100%',
      height: '85svh', // más bajo: se asoma la siguiente sección, como en Monica Varela
      minHeight: 480,
      marginTop: -LAYOUT_OFFSET,
      overflow: 'hidden',
      backgroundColor: '#0b2e33', // color mientras carga el video
    }}
  >
    <video
      src={video}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
      }}
    />

    {/* Degradado arriba: para que se lean el logo y el menú sobre cualquier toma */}
    <div
      aria-hidden
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 170,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))',
        pointerEvents: 'none',
      }}
    />

    {/* Degradado abajo: para que se lea el texto */}
    <div
      aria-hidden
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(to top, rgba(16,10,6,0.88), rgba(16,10,6,0))',
        pointerEvents: 'none',
      }}
    />

    {/* Texto + enlace, aparecen con un fade suave a los 1,2 s */}
    <div
      className="hero-fade"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 32,
        textAlign: 'center', zIndex: 10, padding: '0 24px',
      }}
    >
      <p
        style={{
          margin: 0, color: '#fff', fontFamily: 'Georgia, serif',
          fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase',
        }}
      >
        De Aldo Magallanes
      </p>
      <Link
        to="/cobre#coleccion"
        style={{
          display: 'inline-block', marginTop: 14, paddingBottom: 6,
          color: '#fff', fontSize: 12, letterSpacing: '0.25em',
          textTransform: 'uppercase', textDecoration: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        Ver colección
      </Link>
    </div>

    <style>{`
      @keyframes heroFade {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: none; }
      }
      .hero-fade { opacity: 0; animation: heroFade 1s ease 1.2s forwards; }
    `}</style>
  </section>
);

export default SimpleImageHero;
