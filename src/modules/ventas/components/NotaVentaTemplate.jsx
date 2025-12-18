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
        <div className="bg-white p-6 max-w-md mx-auto font-sans" style={{ width: '400px' }}>
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                <h1 className="text-xl font-bold text-gray-800">Enigma artesanías y accesorios</h1>
                <h2 className="text-lg font-semibold text-gray-700 mt-2">NOTA DE VENTA</h2>
                <p className="text-sm text-gray-600 mt-1">{fecha}</p>
                <p className="text-xs text-gray-500">N° {numeroVenta}</p>
            </div>

            {/* Cliente (si existe) */}
            {cliente && cliente.nombre && (
                <div className="mb-4 text-sm">
                    <h3 className="font-semibold text-gray-700 mb-1">Cliente</h3>
                    <p className="text-gray-800">{cliente.nombre}</p>
                    {cliente.telefono && (
                        <p className="text-gray-600">📞 {cliente.telefono}</p>
                    )}
                </div>
            )}

            {/* Tabla de Productos */}
            <div className="mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="text-left py-2 text-gray-700 font-semibold">Producto</th>
                            <th className="text-center py-2 text-gray-700 font-semibold w-16">Cant.</th>
                            <th className="text-right py-2 text-gray-700 font-semibold w-20">P.Unit</th>
                            <th className="text-right py-2 text-gray-700 font-semibold w-20">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 text-gray-800">{producto.nombre}</td>
                                <td className="text-center py-2 text-gray-700">{producto.cantidad}</td>
                                <td className="text-right py-2 text-gray-700">S/ {producto.precioUnitario.toFixed(2)}</td>
                                <td className="text-right py-2 text-gray-800 font-medium">S/ {(producto.cantidad * producto.precioUnitario).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totales */}
            <div className="bg-gray-100 rounded-lg p-3 mb-4 text-sm space-y-1">
                <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                {igv > 0 && (
                    <div className="flex justify-between text-gray-700">
                        <span>IGV (18%):</span>
                        <span>S/ {igv.toFixed(2)}</span>
                    </div>
                )}
                {descuento > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Descuento:</span>
                        <span>- S/ {descuento.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-300">
                    <span>TOTAL A PAGAR:</span>
                    <span>S/ {total.toFixed(2)}</span>
                </div>
            </div>

            {/* Forma de Pago */}
            <div className="mb-4 text-sm">
                <div className="flex justify-between text-gray-700 bg-blue-50 p-2 rounded">
                    <span className="font-semibold">Método de Pago:</span>
                    <span className="font-medium">{formaPago}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-3 text-center text-xs text-gray-500">
                <p className="italic mb-2">
                    Esta Nota de Venta no tiene validez como comprobante de pago o factura.
                </p>
                <p className="font-semibold text-gray-700">¡Gracias por tu compra!</p>
            </div>
        </div>
    );
};

export default NotaVentaTemplate;
