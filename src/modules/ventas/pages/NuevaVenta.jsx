import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import NotaVentaModal from '../components/NotaVentaModal';
import { getLocalDate } from '../../../utils/dateUtils';


const NuevaVenta = () => {
    const navigate = useNavigate();
    const {
        cart, config, setConfig, totals,
        loadingProducto, scanProduct, addProductToCart,
        updateItem, removeFromCart, clearCart
    } = useVentas();

    const [formaPago, setFormaPago] = useState('Efectivo');
    const [fechaVenta, setFechaVenta] = useState(getLocalDate());

    const [processing, setProcessing] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showClienteSelector, setShowClienteSelector] = useState(false);
    const [showModalCredito, setShowModalCredito] = useState(false);

    // Estado para el modal de nota de venta
    const [showNotaVenta, setShowNotaVenta] = useState(false);
    const [ventaRegistrada, setVentaRegistrada] = useState(null);


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
                    precio_unitario: item.precio_venta,
                    descuento_unitario: item.descuento,
                    producto_nombre: item.nombre,
                    producto_codigo: item.codigo
                }))
            };

            const venta = await ventasDB.createVenta(ventaData);

            toast.success('¡Venta registrada con éxito!', {
                duration: 3000,
                icon: '🎉'
            });


            // Abrir modal automáticamente con los datos de la venta
            setVentaRegistrada({
                numeroVenta: venta.codigo_venta,
                fecha: new Date(venta.fecha_venta).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                cliente: venta.cliente_nombre || 'Cliente General',
                productos: cart.map(item => ({
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio_venta
                })),
                subtotal: venta.subtotal,
                igv: venta.impuesto_monto || 0,
                descuento: venta.descuento_monto || 0,
                total: venta.total,
                formaPago: venta.forma_pago
            });
            setShowNotaVenta(true);

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
                    precio_unitario: item.precio_venta,
                    descuento_unitario: item.descuento,
                    producto_nombre: item.nombre,
                    producto_codigo: item.codigo
                }))
            };

            const venta = await ventasDB.createVenta(ventaData);

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

            // Preparar datos para el modal de nota de venta
            const ventaConDetalles = {
                ...venta,
                detalles: cart.map(item => ({
                    producto_nombre: item.nombre,
                    producto_codigo: item.codigo,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_venta,
                    subtotal: item.cantidad * item.precio_venta
                }))
            };

            // Abrir modal automáticamente con los datos de la venta a crédito
            setVentaRegistrada({
                numeroVenta: venta.codigo_venta,
                fecha: new Date(venta.fecha_venta).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                cliente: venta.cliente_nombre || 'Cliente General',
                productos: cart.map(item => ({
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio_venta
                })),
                subtotal: venta.subtotal,
                igv: venta.impuesto_monto || 0,
                descuento: venta.descuento_monto || 0,
                total: venta.total,
                formaPago: venta.forma_pago
            });
            setShowNotaVenta(true);

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

            {/* Header / Nav de Regreso */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <Link to="/inventario-home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
                    <FaArrowLeft className="mr-2" size={14} />
                    <span className="font-semibold text-sm">Enigma Sistema ERP</span>
                </Link>
            </div>

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

            {/* Modal Nota de Venta - Se abre automáticamente al registrar */}
            <NotaVentaModal
                isOpen={showNotaVenta}
                onClose={() => setShowNotaVenta(false)}
                ventaData={ventaRegistrada}
            />

            {/* Main Content - Grid Layout */}
            <main className="flex-1 overflow-hidden flex flex-col md:flex-row">

                {/* Columna Izquierda (Desktop): Buscador y Lista de Items */}
                <section className="hidden md:flex flex-1 flex-col h-full bg-white relative overflow-hidden order-2 md:order-1 border-r border-gray-100">
                    <div className="p-4 bg-white border-b border-gray-100 z-20 flex-shrink-0">
                        <BuscadorProducto
                            onScan={handleScan}
                            onSelect={handleSelectProduct}
                            onQRClick={() => setShowQRScanner(true)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50/10">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-200 opacity-50">
                                <FaShoppingCart size={48} className="mb-3 opacity-10" />
                                <p className="text-[11px] uppercase tracking-[0.2em] font-light">Esperando productos...</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {cart.map(item => (
                                    <ItemVenta
                                        key={item.id}
                                        item={item}
                                        onUpdateItem={updateItem}
                                        onRemove={removeFromCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Columna Derecha (Mobile & Desktop): Resumen y Totales */}
                {/* En Mobile ocupa 100%. En Desktop ocupa 320px (w-80) */}
                <section className="w-full md:w-80 bg-white shadow-xl z-30 flex-shrink-0 flex flex-col h-full order-1 md:order-2">
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
                        onUpdateItem={updateItem}
                        onRemove={removeFromCart}
                        formaPago={formaPago}
                        setFormaPago={setFormaPago}
                        onCreditoClick={() => setShowModalCredito(true)}
                        onCancel={clearCart}
                        fechaVenta={fechaVenta}
                        setFechaVenta={setFechaVenta}
                        // En desktop pasamos false implícitamente si quisiéramos controlar, pero aquí pasamos true.
                        // El truco es que ResumenVenta oculte la lista en MD.
                        showCartList={true}
                    />
                </section>

            </main>
        </div>
    );
};

export default NuevaVenta;
