import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { FaImage } from 'react-icons/fa';

const PoliticasEnvios = () => {
  const pedidosRef = useRef(null);
  const enviosRef = useRef(null);
  const [generatingId, setGeneratingId] = useState(null);
  const navigate = useNavigate();
  const pressTimer = useRef(null);
  const [isPressing, setIsPressing] = useState(false);

  const handleSecretPressStart = () => {
    setIsPressing(false);
    pressTimer.current = setTimeout(() => {
      setIsPressing(true);
      navigate('/admin');
    }, 2500);
  };

  const handleSecretPressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleShareSection = async (ref, fileName, sectionId) => {
    if (ref.current && !generatingId) {
      setGeneratingId(sectionId);
      try {
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(ref.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false
        });

        canvas.toBlob(async (blob) => {
          if (!blob) {
            alert("Error al generar la imagen.");
            setGeneratingId(null);
            return;
          }

          const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: fileName,
                text: `Adjunto información de ${fileName}.`
              });
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error("Error al compartir:", error);
                downloadImage(canvas, fileName);
              }
            }
          } else {
            downloadImage(canvas, fileName);
          }
          setGeneratingId(null);
        }, 'image/jpeg', 0.9);

      } catch (error) {
        console.error("Error al generar la imagen:", error);
        alert("No se pudo generar la imagen.");
        setGeneratingId(null);
      }
    }
  };

  const downloadImage = (canvas, fileName) => {
    const image = canvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement('a');
    link.href = image;
    link.download = `${fileName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto mt-28 mb-10 font-sans px-2 md:px-4 relative">
      
      {/* Cabecera de la Página */}
      <div className="text-center mb-8 border-b border-gray-200 pb-4 relative">
        <div className="w-16 h-1 bg-[#c8964a] mx-auto mb-4 rounded-full"></div>
        <h1 className="text-2xl md:text-3xl font-light text-gray-900 tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
          Políticas de Pedido
        </h1>
        <h2 className="text-lg md:text-xl font-medium text-gray-500 tracking-wide mt-1">
          Y ENVÍO A NIVEL NACIONAL
        </h2>
      </div>

      {/* SECCIÓN 1: Pedidos Personalizados */}
      <div className="text-right mb-3">
        <button
          onClick={() => handleShareSection(pedidosRef, 'Pedidos-Personalizados', 'pedidos')}
          disabled={generatingId !== null}
          className={`inline-flex items-center px-5 py-2 rounded-lg shadow transition-all duration-300 text-sm font-semibold tracking-wide ${
            generatingId === 'pedidos'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#0a0a0c] text-[#c8964a] hover:bg-gray-800 hover:scale-105'
          }`}
        >
          <FaImage className="mr-2" />
          {generatingId === 'pedidos' ? 'Generando...' : 'Descargar Pedidos Personalizados'}
        </button>
      </div>

      <div 
        ref={pedidosRef} 
        className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-4 md:p-6 border border-gray-100 text-left relative overflow-hidden mb-10"
      >
        <section>
          <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
             <div className="bg-gray-900 text-[#c8964a] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg mr-3 shadow-md">1</div>
             <h2 className="text-xl font-semibold text-gray-900 uppercase tracking-wide">Pedidos Personalizados</h2>
          </div>
          
          <div className="pl-0 md:pl-11 mt-2">
            <p className="text-gray-700 text-base md:text-lg leading-snug mb-3">
              Todas nuestras piezas son elaboradas de forma artesanal y personalizada.
            </p>
            <div className="bg-gray-50 border-l-4 border-[#c8964a] p-3 rounded-r-lg mb-3">
              <p className="text-gray-800 text-base md:text-lg font-medium flex items-start gap-2">
                <span className="text-green-600">✅</span> 
                Para iniciar la fabricación es necesario realizar el pago completo del pedido.
              </p>
            </div>
            
            <p className="text-gray-700 text-base md:text-lg leading-snug mb-3">
              Una vez confirmado el pago, se genera una <strong>Nota de Pedido</strong> con las especificaciones acordadas.
            </p>

            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
              <h3 className="text-center font-semibold text-gray-800 uppercase tracking-widest text-sm mb-2">Ejemplo de Nota de Pedido</h3>
              <div className="flex justify-center mb-2">
                <img 
                  src="/images/notadepedido.png" 
                  alt="Ejemplo de Nota de Pedido Enigma" 
                  className="max-w-full h-auto rounded shadow-sm border border-gray-100"
                  style={{ maxHeight: '180px' }}
                />
              </div>
              <p className="text-xs text-center text-gray-500 italic px-4">
                "Cada pedido recibe un número único de seguimiento interno para garantizar un correcto control."
              </p>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-xl p-3 text-center shadow-md">
               <div className="relative z-10">
                  <h3 className="text-gray-900 uppercase tracking-widest text-xs mb-1 font-bold">Métodos de Pago</h3>
                  <p className="text-sm font-medium tracking-wide text-gray-700 mb-1 leading-tight">Yape / Plin <br/> Transferencia</p>
                  <p className="text-xl md:text-2xl font-bold tracking-widest text-gray-900 mb-1">960 282 376</p>
                  <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide font-medium">Titular: Aldo Magallanes</p>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECCIÓN 2: Envíos y Entrega */}
      <div className="text-right mb-3">
        <button
          onClick={() => handleShareSection(enviosRef, 'Envios-y-Entrega', 'envios')}
          disabled={generatingId !== null}
          className={`inline-flex items-center px-5 py-2 rounded-lg shadow transition-all duration-300 text-sm font-semibold tracking-wide ${
            generatingId === 'envios'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#0a0a0c] text-[#c8964a] hover:bg-gray-800 hover:scale-105'
          }`}
        >
          <FaImage className="mr-2" />
          {generatingId === 'envios' ? 'Generando...' : 'Descargar Envíos y Entrega'}
        </button>
      </div>

      <div 
        ref={enviosRef} 
        className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-4 md:p-6 border border-gray-100 text-left relative overflow-hidden"
      >
        <section>
          <div className="flex items-center mb-4 border-b border-gray-100 pb-3">
             <div className="bg-gray-900 text-[#c8964a] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg mr-3 shadow-md">2</div>
             <h2 className="text-xl font-semibold text-gray-900 uppercase tracking-wide">Envíos y Entrega</h2>
          </div>
          
          <div className="pl-0 md:pl-11 mt-2">
            <p className="text-gray-700 text-base md:text-lg mb-3 font-medium">Realizamos envíos a nivel nacional mediante:</p>
            
            <div className="space-y-2">
              <div className="border border-gray-200 rounded-lg p-3 bg-white flex items-center">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg md:text-xl">Olva Courier</h3>
                  <div className="flex flex-col sm:flex-row sm:gap-6 text-sm md:text-base text-gray-600">
                    <p><span className="font-medium text-gray-900">Lima Metropolitana:</span> S/ 10.00</p>
                    <p><span className="font-medium text-gray-900">Provincias:</span> Tarifa según destino</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 bg-white flex items-center">
                <div className="w-1.5 h-10 bg-red-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg md:text-xl">Shalom</h3>
                  <div className="flex flex-col sm:flex-row sm:gap-6 text-sm md:text-base text-gray-600">
                    <p><span className="font-medium text-gray-900">Envíos nacionales</span></p>
                    <p><span className="font-medium text-gray-900">Tarifa según destino</span> (pago en agencia)</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-center">
                <div className="w-1.5 h-10 bg-[#c8964a] rounded-full mr-3"></div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg md:text-xl">Recojo en tienda</h3>
                  <div className="text-sm md:text-base text-gray-600 leading-snug">
                    <p>Disponible sin costo adicional en:</p>
                    <p className="font-medium text-gray-900">Enigma Artesanías y Accesorios - Carabayllo, Lima</p>
                    <p className="italic text-gray-500 text-xs md:text-sm">(Previa coordinación)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer del Flyer (Secrect Login) */}
      <div 
        className="absolute bottom-2 right-2 w-8 h-8 opacity-0"
        onMouseDown={handleSecretPressStart}
        onMouseUp={handleSecretPressEnd}
        onMouseLeave={handleSecretPressEnd}
        onTouchStart={handleSecretPressStart}
        onTouchEnd={handleSecretPressEnd}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      ></div>

    </div>
  );
};

export default PoliticasEnvios;
