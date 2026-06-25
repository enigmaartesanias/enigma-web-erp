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
    <footer className="bg-black text-white py-8 w-full">
      <div className="container mx-auto px-8">

        {/* Contenido principal - más compacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-800">

          {/* Columna 1: Información */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold mb-2">Enigma Artesanías</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Jr. Madre Selva 544 Tda. 02<br />
              Urb. Santa Isabel - Carabayllo<br />
              Lima - Perú
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold mb-2">Contacto</h3>
            <p className="text-sm text-gray-400">
              <a href="mailto:artesaniasenigma@gmail.com" className="hover:text-white transition-colors">
                artesaniasenigma@gmail.com
              </a>
            </p>
            <p className="text-sm text-gray-400">
              <a href="https://wa.me/51960282376" className="hover:text-white transition-colors">
                WhatsApp: +51 960 282 376
              </a>
            </p>
          </div>

          {/* Columna 3: Enlaces */}
          <div className="text-center md:text-left">
            <h3 className="text-base font-semibold mb-2">Información</h3>
            <div className="flex flex-col space-y-1 text-sm text-gray-400">
              <Link to="/politicasenvios" className="hover:text-white transition-colors">
                Políticas de envío
              </Link>
              <Link to="/shippingpolicies" className="hover:text-white transition-colors">
                Shipping Policies
              </Link>
              <button
                onClick={handleCompartir}
                className="hover:text-teal-400 text-teal-600 font-medium transition-colors focus:outline-none mt-2 md:mt-0"
              >
                Compartir Página
              </button>
            </div>
          </div>
        </div>

        {/* Copyright - más compacto */}
        <div className="pt-4 text-center text-xs text-gray-500">
          <p>© 2007 - 2026 Enigma artesanías y accesorios. Todos los derechos reservados.</p>
          <p className="mt-1">Diseñado por Aldo Magallanes</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;