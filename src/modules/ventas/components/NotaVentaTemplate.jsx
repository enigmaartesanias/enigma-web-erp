import React from 'react';

const NotaVentaTemplate = ({ ventaData }) => {
    const {
        numeroVenta,
        fecha,
        cliente,
        productos,
        subtotal,
        igv,
        descuento,
        total,
        formaPago
    } = ventaData;

    return (
        <div className="bg-white p-6 max-w-full mx-auto font-sans text-gray-800" style={{ width: '400px', margin: '0 auto' }}>
            {/* Cabecera Estilo Pedido */}
            <div className="text-center mb-6">
                <p className="text-[11px] text-gray-400 font-medium mb-1">Enigma artesanías y accesorios</p>
                <h1 className="text-xl font-bold tracking-tight uppercase">Nota de Venta</h1>
                <p className="text-[11px] text-gray-500 mt-1">{fecha}</p>
                <div className="w-full border-t border-gray-100 mt-4"></div>
            </div>

            {/* Datos del Cliente */}
            <div className="mb-6 px-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-800 text-[12px] mb-1">Cliente</h3>
                        <p className="text-gray-600 text-[12px] uppercase">{cliente?.nombre || 'Cliente General'}</p>
                        {cliente?.telefono && <p className="text-gray-500 text-[11px] mt-0.5">📞 {cliente.telefono}</p>}
                    </div>
                </div>
            </div>

            {/* Listado de Productos Estilo Pedido */}
            <div className="mb-6">
                <h3 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider mb-3 px-1">Productos</h3>
                <div className="space-y-3">
                    {productos?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center gap-3 py-1 px-1 border-b border-gray-50 last:border-0">
                            <div className="flex gap-3 items-start flex-1 min-w-0">
                                <span className="text-gray-200 mt-2 text-[10px]">•</span>
                                <div className="flex flex-col min-w-0 gap-0.5">
                                    <span className="text-[8px] font-mono text-gray-300 uppercase tracking-tighter">{p.codigo || 'S/C'}</span>
                                    <span className="text-[12px] text-gray-500 leading-tight uppercase font-medium line-clamp-2">{p.nombre}</span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <span className="text-[12px] text-gray-500 font-semibold tracking-tighter">
                                    {/* CORRECCIÓN AQUÍ: Asegurar que el cálculo sea un número */}
                                    S/ {Number((p.cantidad || 0) * (p.precioUnitario || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totales Estilo Pedido (Solo una linea de total) */}
            <div className="border-t border-gray-100 pt-3 mt-6 px-1">
                <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-gray-800 uppercase">Total a Pagar:</span>
                    {/* CORRECCIÓN PRINCIPAL AQUÍ: Envolver el total en Number() */}
                    <span className="text-[14px] font-bold text-gray-900">S/ {Number(total || 0).toFixed(2)}</span>
                </div>
                {formaPago && (
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-gray-400 font-medium uppercase italic">Método: {formaPago}</span>
                    </div>
                )}
            </div>

            {/* Espacio final */}
            <div className="h-8"></div>
        </div>
    );
};

export default NotaVentaTemplate;