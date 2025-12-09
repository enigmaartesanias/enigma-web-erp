import React, { useRef, useState } from "react";
import html2canvas from 'html2canvas';
import { FaImage } from 'react-icons/fa';

const Contacto = () => {
  const contentRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShareImage = async () => {
    if (contentRef.current && !isGenerating) {
      setIsGenerating(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(contentRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          ignoreElements: (element) => element.tagName === 'IFRAME' // Ignorar iframe para evitar problemas de CORS/blanco
        });

        // NOTA: Html2Canvas no puede capturar iframes de Google Maps. 
        // Se capturará el resto del contenido.

        canvas.toBlob(async (blob) => {
          if (!blob) {
            alert("Error al generar la imagen.");
            setIsGenerating(false);
            return;
          }

          const file = new File([blob], 'Contacto-Enigma.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'Contacto Enigma Artesanías',
                text: 'Aquí tienes los datos de contacto y ubicación.'
              });
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error("Error al compartir:", error);
                downloadImage(canvas);
              }
            }
          } else {
            downloadImage(canvas);
          }
          setIsGenerating(false);
        }, 'image/png');

      } catch (error) {
        console.error("Error al generar la imagen:", error);
        alert("No se pudo generar la imagen.");
        setIsGenerating(false);
      }
    }
  };

  const downloadImage = (canvas) => {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = 'Contacto-Enigma.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="w-full min-h-[500px] flex flex-col items-center bg-gray-100 py-10">
      <div ref={contentRef} className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-6 max-w-4xl">
        {/* Columna izquierda: Solo Mapa */}
        <div className="flex items-center justify-center">
          <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow mt-7 bg-gray-200 flex items-center justify-center relative">
            {/* Placeholder visual para la captura ya que el iframe no saldrá */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-4">
              (Mapa Interactivo)
            </div>
            <iframe
              title="Ubicación Enigma Artesanías"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3904.083331966378!2d-77.04030232489461!3d-11.899285688326085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105d1948bd0e4d3%3A0xef0d54b8aee7da93!2senigma%20artesanias%20y%20accesorios!5e0!3m2!1ses!2spe!4v1751147953182!5m2!1ses!2spe"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'relative', zIndex: 10 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        {/* Columna derecha: Texto */}
        <div className="flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Enigma Artesanías y Accesorios
          </h2>
          <p className="text-gray-600 space-y-2">
            <span className="block">Dirección: Jr. Madre Selva 544 Tda. 02 - Urb. Santa Isabel - Carabayllo</span>
            <span className="block">Lima - Perú</span>
            <span className="block">
              Whatsapp: <a href="https://wa.me/51960282376" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">+51 960282376</a>
            </span>
            <span className="block">Email: artesaniasenigma@gmail.com</span>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleShareImage}
          disabled={isGenerating}
          className={`inline-flex items-center px-6 py-2 rounded-full shadow transition-colors text-sm font-medium ${isGenerating
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
            }`}
        >
          <FaImage className="mr-2" />
          {isGenerating ? 'Generando...' : 'Compartir Imagen'}
        </button>
      </div>
    </section>
  );
};

export default Contacto;