import React from 'react';

const shortsData = [
  {
    id: 1,
    iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/UI1cGnz4MDA" title="Un trabajo en alpaca y resina WhatsApp 51960282376, espero les sirva de ayuda gracias atte Aldo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    title: 'Un trabajo en alpaca y resina',
    description: 'WhatsApp 51960282376, espero les sirva de ayuda gracias atte Aldo',
  },
  {
    id: 2,
    iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/D-3vNj5mzWg" title="Acabo de finalizar una versión mejorada de mi cruz en alpaca, fusionando técnicas resina alambrismo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    title: 'Cruz en alpaca mejorada',
    description: 'Versión mejorada de cruz en alpaca, fusionando técnicas de resina y alambrismo.',
  },
  {
    id: 3,
    iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/TOBRyWtBlBU" title="Les comparto en video el proceso de acabado de un pendiente en plata, que incluye una delicada flor" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    title: 'Pendiente en plata con flor',
    description: 'Proceso de acabado de un pendiente en plata con una delicada flor.',
  },
  {
    id: 4,
    iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/AHlLPAz2eoo" title="preparando un broche soldado de alpaca para una pulsera de cuero,  resistente, WhatsApp 51960282376" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    title: 'Broche soldado de alpaca',
    description: 'Preparando un broche soldado de alpaca para una pulsera de cuero.',
  },
  {
    id: 5,
    iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/i9mXVLT3Ujk" title="trabajando una cadena para un collar tipo pectoral #joyeriaartesanal #handmade #jewelry" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    title: 'Cadena para collar pectoral',
    description: 'Trabajando una cadena para un collar tipo pectoral.',
  },
  {
    id: 6,
    iframe: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/TTnLEZeym5k" title="&quot;¡Descubre el proceso detrás de mis últimas creaciones en joyería artesanal! Utilicé piedras molidas" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
    title: 'Proceso de joyería artesanal',
    description: 'Descubre el proceso detrás de mis últimas creaciones en joyería artesanal.',
  },
];

const VideoShorts = () => {
  return (
    <main className="bg-white py-8 md:py-10 pt-8 md:pt-16 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <h1 className="mt-6 text-1xl md:text-3xl lg:text-4xl font-semibold text-center text-gray-900 mt-14 mb-4">
          Video Shorts – Inspiración en Joyería Artesanal
        </h1>
        <p className="text-sm md:text-lg text-center text-gray-700 mb-10 max-w-3xl mx-auto">
          Disfruta de nuestros videos cortos en formato vertical y descubre el arte, la técnica y la inspiración detrás de cada pieza. ¡Síguenos en YouTube para más contenido exclusivo!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shortsData.map((video, idx) => (
            <div key={video.id} className="flex flex-col items-center mb-8">
              {/* Número de VideoShorts */}
              <span className="mb-2 text-xs md:text-sm text-gray-500 font-semibold">
                VideoShorts {idx + 1} de {shortsData.length}
              </span>
              <div
                className="rounded-lg overflow-hidden shadow-lg bg-black flex justify-center w-full"
                style={{
                  aspectRatio: '371/659',
                  maxWidth: 371,
                  margin: '0 auto',
                }}
                dangerouslySetInnerHTML={{ __html: video.iframe }}
              />
              <div className="mt-3 text-center">
                <h3 className="text-base font-semibold text-gray-800">{video.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default VideoShorts;