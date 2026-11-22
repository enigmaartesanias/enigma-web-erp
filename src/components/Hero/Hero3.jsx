import tecnica from '../../assets/images/tecnica.jpg';
import { Link } from 'react-router-dom';

// Fondo crema (mismo tono que Galeria.jsx). Esta sección queda entre
// "Colecciones Artesanales" (claro) arriba y "Joyas con Historia" (oscuro)
// abajo: al ser clara, se fusiona con Colecciones y deja que Joyas con
// Historia sea el único bloque oscuro de esa zona.

const css = `
.h3-section{position:relative;overflow:hidden;background:#f5f1ec;padding:40px 0 32px;}
.h3-wrap{max-width:880px;margin:0 auto;padding:0 16px;display:flex;flex-direction:row;align-items:center;gap:16px;}

/* Foto: proporción equilibrada en mobile, apaisada en escritorio */
.h3-photo{flex:0 0 45%;min-width:0;}
.h3-img{display:block;width:100%;aspect-ratio:1 / 1;object-fit:cover;border-radius:10px;box-shadow:0 2px 10px rgba(42,32,24,0.10);}

/* Texto: alineado a la izquierda */
.h3-content{flex:1;min-width:0;text-align:left;}
.h3-title{margin:0 0 8px;font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;line-height:1.15;letter-spacing:.04em;color:#2a2018;}
.h3-rule{display:block;width:30px;height:1px;background:#c8964a;opacity:.6;margin:0 0 12px;}
.h3-text{margin:0;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;line-height:1.65;color:#6b625a;}
.h3-link{display:inline-block;margin-top:14px;font-family:'Inter',sans-serif;font-size:10px;font-weight:400;letter-spacing:.22em;text-transform:uppercase;text-decoration:none;color:#b07d35;transition:color .2s ease;}
.h3-link:hover{color:#c8964a;}

@media (min-width:768px){
  .h3-section{padding:48px 0 52px;}
  .h3-wrap{padding:0 32px;gap:48px;}
  .h3-photo{flex:0 0 360px;}
  .h3-img{aspect-ratio:4 / 3;}
  .h3-title{font-size:34px;}
  .h3-text{font-size:15px;max-width:360px;}
  .h3-link{margin-top:18px;}
}
`;

const Hero3 = () => {
  return (
    <section className="h3-section">
      <style>{css}</style>

      <div className="h3-wrap">
        {/* Foto */}
        <div className="h3-photo">
          <img
            src={tecnica}
            alt="Orfebre trabajando con técnicas artesanales"
            className="h3-img"
          />
        </div>

        {/* Texto */}
        <div className="h3-content">
          <h2 className="h3-title">La Técnica</h2>
          <span className="h3-rule" />
          <p className="h3-text">
            Varias técnicas de orfebrería, trabajadas a mano y combinadas en cada pieza para darle carácter propio.
          </p>
          <Link to="/el-oficio" className="h3-link">
            Ver el taller →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero3;