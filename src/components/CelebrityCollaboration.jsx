import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import andruDonalds from '../assets/images/andru.jpg';

// ── Tema de la sección ──
// 'oscuro' = café cálido con dorado (recomendado) | 'crema' = fondo crema claro
const TEMA = 'oscuro';

const TEMAS = {
    oscuro: {
        '--cc-bg': '#2a2018',
        '--cc-title': '#f5f1ec',
        '--cc-accent': '#c8964a',
        '--cc-quote': 'rgba(245,241,236,0.82)',
        '--cc-btn-text': '#f5f1ec',
        '--cc-btn-border': '#c8964a',
        '--cc-btn-hover-bg': '#c8964a',
        '--cc-btn-hover-text': '#2a2018',
    },
    crema: {
        '--cc-bg': '#efe8dc',
        '--cc-title': '#2a2018',
        '--cc-accent': '#9a6b27',
        '--cc-quote': '#57534e',
        '--cc-btn-text': '#2a2018',
        '--cc-btn-border': '#9a6b27',
        '--cc-btn-hover-bg': '#2a2018',
        '--cc-btn-hover-text': '#f5f1ec',
    },
};

const css = `
.cc-section{position:relative;overflow:hidden;background:var(--cc-bg);padding:44px 20px 48px;}
.cc-inner{max-width:820px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px;}

/* Foto circular con aro dorado separado, como marco de joyería */
.cc-ring{flex-shrink:0;padding:5px;border:1px solid var(--cc-accent);border-radius:50%;}
.cc-photo{display:block;width:120px;height:120px;border-radius:50%;object-fit:cover;object-position:center top;}

.cc-content{min-width:0;}
.cc-title{margin:0;font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;line-height:1.1;letter-spacing:.04em;color:var(--cc-title);}
.cc-title-sub{display:block;margin-top:2px;font-style:italic;color:var(--cc-accent);}

.cc-quote{margin:14px auto 0;max-width:310px;font-family:'Cormorant Garamond',serif;font-size:20px;font-style:italic;font-weight:400;line-height:1.4;color:var(--cc-quote);}
.cc-quote-desktop{display:none;}

.cc-btn{margin-top:22px;display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border:1px solid var(--cc-btn-border);border-radius:0;background:transparent;color:var(--cc-btn-text);font-family:'Inter',sans-serif;font-size:10px;font-weight:400;letter-spacing:.22em;text-indent:.1em;text-transform:uppercase;text-decoration:none;transition:background .3s ease,color .3s ease;}
.cc-btn:hover{background:var(--cc-btn-hover-bg);color:var(--cc-btn-hover-text);}
.cc-btn:focus-visible{outline:2px solid var(--cc-accent);outline-offset:3px;}

@media (min-width:768px){
  .cc-section{padding:64px 32px;}
  .cc-inner{flex-direction:row;text-align:left;gap:56px;}
  .cc-photo{width:160px;height:160px;}
  .cc-title{font-size:46px;}
  .cc-quote-mobile{display:none;}
  .cc-quote-desktop{display:block;margin:18px 0 0;max-width:440px;font-size:21px;}
  .cc-btn{margin-top:26px;}
}
`;

const CelebrityCollaboration = () => {
    return (
        <section
            aria-labelledby="andru-title"
            className="cc-section"
            style={TEMAS[TEMA]}
        >
            <style>{css}</style>

            <div className="cc-inner">

                {/* ── Foto circular ── */}
                <div className="cc-ring">
                    <img
                        src={andruDonalds}
                        alt="Andru Donalds luciendo joyas de Enigma Artesanías"
                        loading="lazy"
                        className="cc-photo"
                    />
                </div>

                {/* ── Contenido ── */}
                <div className="cc-content">
                    <h2 id="andru-title" className="cc-title">
                        Andru Donalds
                        <span className="cc-title-sub">&amp; Enigma</span>
                    </h2>

                    {/* Cita en móvil */}
                    <p className="cc-quote cc-quote-mobile">
                        "La voz de Enigma luce nuestras piezas en sus giras internacionales desde 2022."
                    </p>

                    {/* Cita en desktop */}
                    <p className="cc-quote cc-quote-desktop">
                        "Andru Donalds, la voz icónica de los grandes éxitos de Enigma.
                        Desde 2022, cada pieza que luce en sus giras internacionales
                        nace en este mismo taller en Lima. Dos nombres, una misma identidad."
                    </p>

                    <Link to="/andru-donalds" className="cc-btn">
                        Ver colección
                        <ChevronRight size={12} aria-hidden="true" />
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default CelebrityCollaboration;
