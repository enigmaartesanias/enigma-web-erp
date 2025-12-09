import React from 'react';

const PoliticasEnvios = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-10 mt-16 mb-12 font-sans border border-gray-100">

      {/* Título Principal - Compacto */}
      <h1 className="text-xl md:text-2xl font-light text-center text-gray-800 mb-8 tracking-wide uppercase border-b border-gray-200 pb-3">
        Políticas de Envío y Tarifas
      </h1>

      {/* 1. Condiciones Generales */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 text-gray-800 flex items-center tracking-tight uppercase">
          <span className="bg-gray-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">1</span>
          Condiciones Generales
        </h2>
        <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-800 text-gray-700 text-sm leading-snug space-y-2">
          <p>
            <strong className="text-gray-900">Pago Anticipado:</strong> Se requiere la <strong>cancelación total previa</strong> del pedido para su elaboración.
          </p>
          <p>
            <strong className="text-gray-900">Costo de Envío:</strong> Es <strong>adicional e independiente</strong> del valor del producto.
          </p>
          <p>
            <strong className="text-gray-900">Pagos:</strong> Transferencias y billeteras digitales (<span className="font-medium text-emerald-600">Yape</span> y <span className="font-medium text-blue-600">Plin</span>).
          </p>
          <p>
            <strong className="text-gray-900">Seguimiento:</strong> Recibirá un número de rastreo al enviarse su pedido.
          </p>
        </div>
      </section>

      {/* 2. Envíos Nacionales */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 text-gray-800 flex items-center tracking-tight uppercase">
          <span className="bg-gray-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">2</span>
          Envíos Nacionales (Perú)
        </h2>

        <div className="overflow-hidden border border-gray-200 rounded mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Servicio</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Cobertura</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Tarifa</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Tiempo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-600">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Olva Courier</td>
                <td className="px-4 py-3 whitespace-nowrap">Todo Lima</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-bold">S/ 10.00</td>
                <td className="px-4 py-3 whitespace-nowrap">2 días hábiles</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Olva Courier</td>
                <td className="px-4 py-3 whitespace-nowrap">Provincias</td>
                <td className="px-4 py-3 whitespace-nowrap italic text-gray-500">Se cotiza</td>
                <td className="px-4 py-3 whitespace-nowrap">Variable</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Agencia Shalom</td>
                <td className="px-4 py-3 whitespace-nowrap">Nacional</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-red-600">Pago en Destino</td>
                <td className="px-4 py-3 whitespace-nowrap">Variable</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-xs text-gray-600 space-y-1 px-1">
          <p>
            <span className="font-bold text-gray-800">Nota Shalom:</span> El envío se paga en la agencia al recoger.
          </p>
          <p>
            <span className="font-bold text-gray-800">Recojo en Tienda:</span> Gratis en <span className="font-medium">Carabayllo, Lima</span> (previa coordinación).
          </p>
        </div>

      </section>

      {/* 3. Envíos Internacionales */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-3 text-gray-800 flex items-center tracking-tight uppercase">
          <span className="bg-gray-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">3</span>
          Envíos Internacionales
        </h2>
        <div className="bg-white p-4 border border-gray-200 rounded text-sm text-gray-600 leading-snug shadow-sm">
          <p className="mb-2">
            Envíos a todo el mundo vía <strong>Serpost</strong> (aprox. 20 días hábiles).
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>
              <strong>Pago:</strong> Western Union o transferencia móvil.
            </li>
            <li>
              <strong>Tarifa:</strong> Se cotiza según peso y país tras confirmar pedido.
            </li>
          </ul>
        </div>
      </section>

      {/* 4. Contacto */}
      <section className="text-center pt-6 border-t border-gray-100">
        <p className="text-gray-400 uppercase tracking-widest text-[10px] mb-3">¿Dudas?</p>
        <div className="inline-block px-6 py-2 bg-gray-900 text-white rounded-full shadow hover:bg-gray-800 transition-colors cursor-pointer">
          <p className="font-medium text-sm">
            WhatsApp: <span className="font-bold tracking-wide">960 282 376</span>
          </p>
        </div>
      </section>

    </div>
  );
};

export default PoliticasEnvios;