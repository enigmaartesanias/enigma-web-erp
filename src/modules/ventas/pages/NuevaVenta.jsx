import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVentas } from '../hooks/useVentas';
import { ventasDB } from '../../../utils/ventasClient';
import BuscadorProducto from '../components/BuscadorProducto';
import ItemVenta from '../components/ItemVenta';
import ResumenVenta from '../components/ResumenVenta';
import { Toaster, toast } from 'react-hot-toast';
import { FaArrowLeft, FaShoppingCart, FaHistory } from 'react-icons/fa';

const NuevaVenta = () => {
    const navigate = useNavigate();
    const {
        cart, config, setConfig, totals,
        loadingProducto, scanProduct, addProductToCart,
        updateQuantity, removeFromCart, clearCart
    } = useVentas();

    const [processing, setProcessing] = useState(false);

    // Manejo de escaneo (Input manual o búsqueda exacta)
    const handleScan = async (codigo) => {
        const found = await scanProduct(codigo);
        if (found) {
            toast.success('Producto agregado', { position: 'bottom-center', duration: 1500 });
        } else {
            toast.error('Producto no encontrado', { position: 'bottom-center' });
        }
        return found;
    };

    // Agregar desde selección manual (Dropdown)
    const handleSelectProduct = (product) => {
        addProductToCart(product);
        toast.success(`Agregado: ${product.nombre}`, { position: 'bottom-center' });
    };

    // Procesar Venta
    const handleProcessVenta = async () => {
        if (cart.length === 0) return;

        if (!window.confirm(`¿Confirmar venta por S/ ${totals.total.toFixed(2)}?`)) return;

        setProcessing(true);
        try {
            const ventaData = {
                cliente_nombre: config.cliente,
                cliente_documento: config.documento,
                subtotal: totals.subtotal,
                descuento_monto: totals.descuento,
                impuesto_monto: totals.impuesto,
                total: totals.total,
                metodo_pago: 'Efectivo', // Podría ser dinámico si agregamos selector
                detalles: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    producto_nombre: item.nombre,
                    producto_codigo: item.codigo
                }))
            };

            await ventasDB.createVenta(ventaData);

            toast.success('¡Venta registrada con éxito!', {
                duration: 3000,
                icon: '🎉'
            });
            clearCart();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar la venta. Verifica el stock e intenta de nuevo.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            <Toaster />

            {/* Navbar Simple */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-indigo-600 text-white p-1.5 rounded-lg text-sm">POS</span>
                        Punto de Venta
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                        <FaHistory />
                        <span className="hidden sm:inline">Historial</span>
                    </button>
                </div>
            </header>

            {/* Main Content - Grid Layout */}
            <main className="flex-1 overflow-hidden flex flex-col md:flex-row">

                {/* Columna Izquierda: Buscador y Carrito */}
                <section className="flex-1 flex flex-col h-full relative">
                    {/* Buscador Fijo */}
                    <div className="p-4 bg-white border-b border-gray-100 shadow-sm z-20">
                        <BuscadorProducto onScan={handleScan} onSelect={handleSelectProduct} />
                    </div>

                    {/* Lista de Items (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 pb-24 md:pb-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <FaShoppingCart size={64} className="mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Carrito Vacío</p>
                                <p className="text-sm">Escanea un código o busca un producto</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <ItemVenta
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* Columna Derecha: Totales (Fijo en desktop, bottom sheet en mobile) */}
                <section className="w-full md:w-96 bg-white border-l border-gray-200 shadow-xl z-30 flex-shrink-0">
                    <ResumenVenta
                        totals={totals}
                        config={config}
                        setConfig={setConfig}
                        onProcess={handleProcessVenta}
                        processing={processing}
                    />
                </section>

            </main>
        </div>
    );
};

export default NuevaVenta;
