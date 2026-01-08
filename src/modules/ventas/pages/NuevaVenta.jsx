import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVentas } from '../hooks/useVentas';
import { ventasDB } from '../../../utils/ventasClient';
import { cuentasPorCobrarDB } from '../../../utils/cuentasPorCobrarClient';
import BuscadorProducto from '../components/BuscadorProducto';
import ItemVenta from '../components/ItemVenta';
import ResumenVenta from '../components/ResumenVenta';
import { Toaster, toast } from 'react-hot-toast';
import { FaArrowLeft, FaHistory, FaShoppingCart } from 'react-icons/fa';
import QRScanner from '../components/QRScanner';
import ClienteSelector from '../components/ClienteSelector';
import ModalCredito from '../components/ModalCredito';
import { getLocalDate } from '../../../utils/dateUtils';


const NuevaVenta = () => {
    const navigate = useNavigate();
    const {
        cart, config, setConfig, totals,
        loadingProducto, scanProduct, addProductToCart,
        updateQuantity, removeFromCart, clearCart
    } = useVentas();

    const [formaPago, setFormaPago] = useState('Efectivo');
    const [fechaVenta, setFechaVenta] = useState(getLocalDate());

    const [processing, setProcessing] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showClienteSelector, setShowClienteSelector] = useState(false);
    const [showModalCredito, setShowModalCredito] = useState(false);


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

    // Seleccionar cliente
    const handleSelectCliente = (cliente) => {
        setConfig({ ...config, cliente });
        setShowClienteSelector(false);
        toast.success(`Cliente: ${cliente.nombre}`, { position: 'bottom-center', duration: 1500 });
    };

    // Procesar Venta
    const handleProcessVenta = async () => {
        if (cart.length === 0) return;

        if (!window.confirm(`¿Confirmar venta por S/ ${totals.total.toFixed(2)}?`)) return;

        setProcessing(true);
        try {
            const ventaData = {
                cliente_nombre: config.cliente ? config.cliente.nombre : null,
                cliente_documento: config.cliente ? config.cliente.documento : null,
                subtotal: totals.subtotal,
                descuento_monto: totals.descuento,
                impuesto_monto: totals.impuesto,
                total: totals.total,
                forma_pago: formaPago, // Usar forma de pago del estado
                fecha_venta: fechaVenta,
                observaciones: '',
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
            const errorMsg = error?.message || 'Error desconocido';
            toast.error(`Error: ${errorMsg}`, { duration: 4000 });
        } finally {
            setProcessing(false);
        }
    };

    // Procesar Venta a Crédito
    const handleProcessVentaCredito = async (datosCredito) => {
        if (cart.length === 0) return;

        setProcessing(true);
        try {
            // Calcular saldo pendiente inicial
            const adelanto = datosCredito.a_cuenta || 0;
            const saldoPendiente = totals.total - adelanto;

            // 1. Crear venta con campos de crédito
            const ventaData = {
                cliente_nombre: config.cliente?.nombre || 'Cliente General',
                cliente_documento: config.cliente?.documento || '',
                subtotal: totals.subtotal,
                descuento_monto: totals.descuento,
                impuesto_monto: totals.impuesto,
                total: totals.total,
                forma_pago: 'Crédito',
                fecha_venta: fechaVenta,
                observaciones: datosCredito.observaciones || '',
                // Campos de crédito
                es_credito: true,
                saldo_pendiente: saldoPendiente,
                fecha_vencimiento: datosCredito.fecha_vencimiento,
                detalles: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    producto_nombre: item.nombre,
                    producto_codigo: item.codigo
                }))
            }; const venta = await ventasDB.createVenta(ventaData);

            // 2. Si hubo adelanto, registrar pago inicial
            if (adelanto > 0) {
                await ventasDB.registrarPago(
                    venta.id,
                    adelanto,
                    'Efectivo',
                    'Pago inicial / Adelanto'
                );
            }

            toast.success('¡Venta a crédito registrada!', {
                duration: 3000,
                icon: '💳'
            });
            clearCart();
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar venta a crédito');
        } finally {
            setProcessing(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
            <Toaster />

            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleScan}
            />

            {/* Cliente Selector Modal */}
            <ClienteSelector
                isOpen={showClienteSelector}
                onClose={() => setShowClienteSelector(false)}
                onSelect={handleSelectCliente}
            />

            {/* Modal Crédito */}
            <ModalCredito
                isOpen={showModalCredito}
                onClose={() => setShowModalCredito(false)}
                total={totals.total}
                cliente={config.cliente}
                detallesProductos={cart}
                onConfirmar={handleProcessVentaCredito}
            />



            {/* Navbar Simple */}
            <header className="bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center shadow-sm z-30 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/inventario-home')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs">POS</span>
                        Punto de Venta
                    </h1>
                </div>

                <div className="flex items-center">
                    <input
                        type="date"
                        value={fechaVenta}
                        onChange={(e) => setFechaVenta(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-blue-500 bg-transparent"
                    />
                </div>
                {/* Espacio para futuros botones si es necesario */}
            </header>

            {/* Main Content - Grid Layout */}
            <main className="flex-1 overflow-hidden flex flex-col md:flex-row">

                {/* Columna Izquierda: Buscador y Carrito */}
                <section className="hidden md:flex flex-1 flex-col h-full md:h-auto relative overflow-hidden order-2 md:order-1">
                    {/* Buscador Fijo - Solo visible en desktop */}
                    <div className="p-3 bg-white border-b border-gray-100 shadow-sm z-20 flex-shrink-0">
                        <BuscadorProducto
                            onScan={handleScan}
                            onSelect={handleSelectProduct}
                            onQRClick={() => setShowQRScanner(true)}
                        />
                    </div>

                    {/* Lista de Items (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
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

                {/* Columna Derecha: Totales */}
                <section className="w-full md:w-80 bg-white border-l border-gray-200 shadow-xl z-30 flex-shrink-0 flex flex-col h-auto md:h-auto order-1 md:order-2">
                    <ResumenVenta
                        totals={totals}
                        config={config}
                        setConfig={setConfig}
                        onProcess={handleProcessVenta}
                        processing={processing}
                        onClienteClick={() => setShowClienteSelector(true)}
                        onScan={handleScan}
                        onSelect={handleSelectProduct}
                        onQRClick={() => setShowQRScanner(true)}
                        cart={cart}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                        formaPago={formaPago}
                        setFormaPago={setFormaPago}
                        onCreditoClick={() => setShowModalCredito(true)}
                    />
                </section>

            </main>
        </div>
    );
};

export default NuevaVenta;
