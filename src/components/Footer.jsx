import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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
    <footer className="footer-container py-10 w-full">
      {/* Reglas CSS Forzadas para Garantizar Máxima Legibilidad en Celular */}
      <style jsx="true">{`
        .footer-container {
          background-color: #1a1816 !important;
        }
        .footer-title {
          color: #ffffff !important;
          font-weight: 600 !important;
          letter-spacing: 0.12em !important;
        }
        .footer-text, .footer-link {
          color: #f0eae1 !important;
          font-weight: 300 !important;
        }
        .footer-link:hover {
          color: #ffffff !important;
          text-decoration: underline !important;
        }
        .footer-[#38322e] {
          border-color: #3d3630 !important;
        }
        .footer-share-btn {
          color: #eaf2f1ff !important;
          font-weight: 500 !important;
        }
        .footer-copy {
          color: #b5aba0 !important;
        }
      `}</style>

      <div className="container mx-auto px-6">

        {/* Contenido principal — Centrado en móvil / Alineado a la izquierda en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b footer-[#38322e]">

          {/* Columna 1: Información */}
          <div className="text-center md:text-left">
            <h3 className="text-sm uppercase mb-3 footer-title">
              Enigma Artesanías
            </h3>
            <p className="text-xs leading-relaxed footer-text">
              Jr. Madre Selva 544 Tda. 02<br />
              Urb. Santa Isabel - Carabayllo<br />
              Lima - Perú
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div className="text-center md:text-left">
            <h3 className="text-sm uppercase mb-3 footer-title">
              Contacto
            </h3>
            <p className="text-xs mb-1">
              <a href="mailto:artesaniasenigma@gmail.com" className="footer-link transition-colors">
                artesaniasenigma@gmail.com
              </a>
            </p>
            <p className="text-xs">
              <a href="https://wa.me/51960282376" className="footer-link transition-colors">
                WhatsApp: +51 960 282 376
              </a>
            </p>
          </div>

          {/* Columna 3: Enlaces e Información (Totalmente centrado en celular) */}
          <div className="text-center md:text-left">
            <h3 className="text-sm uppercase mb-3 footer-title">
              Información
            </h3>
            <div className="flex flex-col items-center md:items-start space-y-2 text-xs">
              <Link to="/politicasenvios" className="footer-link transition-colors">
                Políticas de envío
              </Link>
              <Link to="/shippingpolicies" className="footer-link transition-colors">
                Shipping Policies
              </Link>
              <button
                onClick={handleCompartir}
                className="mt-2 text-xs footer-share-btn transition-colors focus:outline-none cursor-pointer"
              >
                Compartir Página
              </button>
            </div>
          </div>

        </div>

        {/* Copyright centrado */}
        <div className="pt-6 text-center text-xs footer-copy">
          <p>© 2007 - 2026 Enigma artesanías y accesorios. Todos los derechos reservados.</p>
          <p className="mt-1">Diseñado por Aldo Magallanes</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;