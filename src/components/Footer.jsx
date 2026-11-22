import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const css = `
.ft{width:100%;background:#1a1816;padding:36px 0 28px;}
.ft-wrap{max-width:1024px;margin:0 auto;padding:0 24px;}

.ft-grid{display:grid;grid-template-columns:1fr;gap:28px;padding-bottom:28px;border-bottom:1px solid #3d3630;text-align:center;}

/* Marca */
.ft-brand{margin:0 0 6px;font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:400;line-height:1.2;letter-spacing:.02em;color:#f5f1ec;}
.ft-place{margin:0;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;line-height:1.6;color:rgba(245,241,236,0.7);}

/* Títulos de columna */
.ft-heading{margin:0 0 8px;font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:400;line-height:1.2;letter-spacing:.03em;color:#c8964a;}

/* Enlaces */
.ft-links{display:flex;flex-direction:column;align-items:center;}
.ft-link{display:inline-block;padding:5px 0;font-family:'Inter',sans-serif;font-size:14px;font-weight:300;line-height:1.5;letter-spacing:.01em;color:rgba(245,241,236,0.85);text-decoration:none;transition:color .2s ease;}
.ft-link:hover{color:#c8964a;}
.ft-link:focus-visible,.ft-share:focus-visible{outline:2px solid #c8964a;outline-offset:3px;}

/* Compartir página */
.ft-share{margin-top:6px;padding:5px 0;background:transparent;border:0;cursor:pointer;font-family:'Inter',sans-serif;font-size:14px;font-weight:300;line-height:1.5;letter-spacing:.01em;color:#b07d35;transition:color .2s ease;}
.ft-share:hover{color:#c8964a;}

/* Derechos */
.ft-copy{padding-top:20px;text-align:center;font-family:'Inter',sans-serif;font-size:11px;font-weight:300;line-height:1.8;letter-spacing:.02em;color:#a39a90;}
.ft-copy p{margin:0;}

@media (min-width:768px){
  .ft{padding:44px 0 28px;}
  .ft-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:40px;padding-bottom:32px;text-align:left;align-items:start;}
  .ft-brand{font-size:26px;}
  .ft-links{align-items:flex-start;}
  .ft-link,.ft-share{font-size:13px;}
  .ft-place{font-size:13px;}
}
`;

const Footer = () => {
  // Guarda el último precio+título emitido por ProductoDetalle
  const precioRef = useRef({ precio: '', titulo: '', region: 'peru' });

  useEffect(() => {
    const handler = (e) => {
      precioRef.current = e.detail;
    };
    window.addEventListener('enigma:region-precio', handler);
    return () => window.removeEventListener('enigma:region-precio', handler);
  }, []);

  const handleCompartir = async (e) => {
    e.preventDefault();
    const isProductPage = window.location.pathname.startsWith('/producto/');
    const isCatalogoPage = window.location.pathname.startsWith('/catalogo/');
    let shareUrl = window.location.href;

    if (isProductPage) {
      const productId = window.location.pathname.split('/producto/')[1];
      shareUrl = `https://artesaniasenigma.com/producto/${productId}`;
    }

    let shareTitle = document.title || 'Enigma Artesanías';
    let shareText = 'Mira esta página de artesanías y accesorios increíbles.';

    if (isProductPage) {
      const { precio, titulo, region } = precioRef.current;
      if (precio) {
        const esLocal = region === 'peru';
        shareText = titulo
          ? `✨ ${titulo} — ${precio}${esLocal ? ' (no incluye envío)' : ' (shipping included)'}`
          : `Hecha a pedido — ${precio}`;
      } else {
        shareText = 'Hecha a pedido.';
      }
    } else if (isCatalogoPage) {
      const parts = decodeURIComponent(window.location.pathname).split('/');
      const materialUrl = parts[2] || 'all';
      const categoriaUrl = parts[3] || 'all';

      const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      const CATEGORY_PLURALS = {
        'collar': 'Collares',
        'anillo': 'Anillos',
        'arete': 'Aretes',
        'pulsera': 'Pulseras',
        'personalizado': 'Diseños personalizados',
        'vincha_tiara': 'Vinchas y Tiaras',
        'tobillera': 'Tobilleras'
      };

      const matDisplay = materialUrl === 'all' ? 'diversos materiales' : materialUrl.toLowerCase();

      let catDisplay = 'Joyas';
      let catLower = 'joyas';
      if (categoriaUrl !== 'all') {
        catDisplay = CATEGORY_PLURALS[categoriaUrl.toLowerCase()] || toTitleCase(categoriaUrl);
        catLower = catDisplay.toLowerCase();
      }

      if (materialUrl !== 'all' && categoriaUrl !== 'all') {
        shareTitle = `${catDisplay} en ${toTitleCase(materialUrl)} | Orfebrería Enigma`;
      } else if (materialUrl !== 'all') {
        shareTitle = `Colección ${toTitleCase(materialUrl)} | Orfebrería Enigma`;
      } else if (categoriaUrl !== 'all') {
        shareTitle = `${catDisplay} | Orfebrería Enigma`;
      } else {
        shareTitle = `Catálogo de Joyas | Orfebrería Enigma`;
      }

      shareText = `Colección de ${catLower} de diseño forjadas a mano en ${matDisplay}. Explora nuestro portafolio de piezas de autor hechas a pedido.`;
    }

    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al compartir:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('¡Enlace copiado al portapapeles!');
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  return (
    <footer className="ft">
      <style>{css}</style>

      <div className="ft-wrap">

        <div className="ft-grid">

          {/* Columna 1: Marca */}
          <div>
            <h3 className="ft-brand">Enigma Artesanías y Accesorios</h3>
            <p className="ft-place">Lima, Perú</p>
          </div>

          {/* Columna 2: Contacto */}
          <div>
            <h3 className="ft-heading">Contacto</h3>
            <div className="ft-links">
              <a href="mailto:artesaniasenigma@gmail.com" className="ft-link">
                artesaniasenigma@gmail.com
              </a>
              <a href="https://wa.me/51960282376" className="ft-link">
                WhatsApp: +51 960 282 376
              </a>
            </div>
          </div>

          {/* Columna 3: Información */}
          <div>
            <h3 className="ft-heading">Información</h3>
            <div className="ft-links">
              <Link to="/politicasenvios" className="ft-link">
                Políticas de envío
              </Link>
              <Link to="/shippingpolicies" className="ft-link">
                Shipping Policies
              </Link>
              <button type="button" onClick={handleCompartir} className="ft-share">
                Compartir Página
              </button>
            </div>
          </div>

        </div>

        {/* Derechos */}
        <div className="ft-copy">
          <p>© 2007 – 2026 Enigma Artesanías y Accesorios</p>
          <p>Diseñado por Aldo Magallanes</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
