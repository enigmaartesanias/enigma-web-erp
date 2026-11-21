// src/components/pedidos/NotaPedido.jsx
import React, { useRef, useState } from 'react';
import { FaShareAlt, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { TOLERANCIA_SALDO, formatLocalDate } from '../../utils/pedidosUtils';

const NotaPedido = ({ isOpen, pedido, ultimoPago = null, variante = null, onClose }) => {
    const voucherRef = useRef(null);
    const [exportando, setExportando] = useState(false);

    if (!isOpen || !pedido) return null;

    const saldo = Number(pedido.monto_saldo) || 0;
    const esCancelado = variante === 'cancelacion' || (variante !== 'adelanto' && saldo <= TOLERANCIA_SALDO);

    // Calcular montos para cancelación
    const totalPedido = Number(pedido.precio_total) || 0;
    const montoACuentaTotal = Number(pedido.monto_a_cuenta) || 0;
    
    // Obtener información del último pago realizado
    const ultimoPagoReal = ultimoPago || (pedido.pagos && pedido.pagos.length > 0
        ? [...pedido.pagos].sort((a, b) => new Date(a.fecha_pago || a.created_at || 0) - new Date(b.fecha_pago || b.created_at || 0)).pop()
        : null);

    const metodoUltimoPago = ultimoPagoReal?.metodo_pago || pedido.forma_pago || 'Efectivo';
    const saldoPagadoHoy = ultimoPagoReal ? Number(ultimoPagoReal.monto) : Math.min(totalPedido, montoACuentaTotal);
    const pagadoAntes = Math.max(0, totalPedido - saldoPagadoHoy);

    // Resumen de productos para nota de cancelación
    const detalles = pedido.detalles_pedido || [];
    const resumenProductos = detalles.length === 0
        ? 'Joyas artesanales'
        : detalles.length === 1
            ? detalles[0].nombre_producto
            : `${detalles[0].nombre_producto} y ${detalles.length - 1} más`;

    // Compartir o descargar JPG
    const handleExportarJPG = async () => {
        if (!voucherRef.current) return;
        setExportando(true);
        try {
            const canvas = await html2canvas(voucherRef.current, {
                scale: 3,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            const fileName = esCancelado
                ? `Pedido_${pedido.id_pedido}_Cancelado.jpg`
                : `Nota_Pedido_${pedido.id_pedido}.jpg`;

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error('Error al generar la imagen');
                    setExportando(false);
                    return;
                }

                const file = new File([blob], fileName, { type: 'image/jpeg' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: `Nota de Pedido #${pedido.id_pedido}`,
                            text: `Comprobante de pedido para ${pedido.nombre_cliente}`
                        });
                        toast.success('Compartido con éxito');
                    } catch (e) {
                        if (e.name !== 'AbortError') {
                            descargarBlob(blob, fileName);
                        }
                    }
                } else {
                    descargarBlob(blob, fileName);
                    toast.success('Imagen descargada');
                }
                setExportando(false);
            }, 'image/jpeg', 1.0);
        } catch (error) {
            console.error('Error exportando imagen:', error);
            toast.error('Error al exportar nota');
            setExportando(false);
        }
    };

    const descargarBlob = (blob, fileName) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const fechaNota = formatLocalDate(pedido.fecha_pedido || new Date());
    const correlativo = String(pedido.id_pedido).padStart(4, '0');

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* BARRA SUPERIOR DE ACCIONES */}
                <div className="px-5 py-3.5 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                        {esCancelado ? 'Nota de Cancelación' : 'Nota de Adelanto'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportarJPG}
                            disabled={exportando}
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                            title="Compartir o Descargar JPG"
                        >
                            <FaShareAlt size={11} />
                            <span>{exportando ? 'Generando...' : 'Compartir'}</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                            <FaTimesCircle size={15} />
                        </button>
                    </div>
                </div>

                {/* CONTENIDO DEL VOUCHER EXPORTABLE */}
                <div className="p-6 bg-white select-none" ref={voucherRef} id="printable-voucher">

                    {/* ENCABEZADO DE MARCA */}
                    <div className="text-center pb-3 border-b border-gray-200">
                        <h2 className="text-xl font-black tracking-widest text-gray-900 font-serif leading-tight">ENIGMA</h2>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mt-0.5">artesanías y accesorios</p>
                    </div>

                    {/* CUERPO SEGÚN VARIANTE */}
                    {!esCancelado ? (
                        /* ─────────────────────────────────────────────────────────────
                           VARIANTE 1: ADELANTO / ABONO PARCIAL
                        ───────────────────────────────────────────────────────────── */
                        <div className="pt-4 space-y-4">
                            {/* Folio, Fecha y Etiqueta */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="inline-block bg-amber-50 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider mb-1">
                                        Adelanto recibido
                                    </div>
                                    <h3 className="text-xs font-bold font-mono tracking-wide text-gray-800 uppercase">
                                        NOTA DE PEDIDO N° {correlativo}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-gray-500">{fechaNota}</span>
                            </div>

                            {/* Nombre Cliente (Sin teléfono) */}
                            <div className="border-b border-gray-100 pb-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cliente</span>
                                <p className="text-sm font-semibold text-gray-900 capitalize">{pedido.nombre_cliente}</p>
                            </div>

                            {/* Lista de Productos */}
                            <div className="space-y-2.5 py-1">
                                {detalles.map((d, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-xs">
                                        <div className="pr-3 leading-snug">
                                            <span className="font-bold text-gray-900">{d.cantidad}x </span>
                                            <span className="text-gray-800">{d.nombre_producto}</span>
                                            {d.metal && <span className="text-[10px] text-gray-400 block font-normal">({d.metal})</span>}
                                        </div>
                                        <span className="font-bold text-gray-900 whitespace-nowrap">
                                            S/ {(Number(d.cantidad) * Number(d.precio_unitario)).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Envío si aplica */}
                            {pedido.requiere_envio && (
                                <div className="border-t border-dashed border-gray-200 pt-2 space-y-1 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal Joyas</span>
                                        <span className="font-semibold text-gray-800">
                                            S/ {Number(pedido.precio_total_sin_igv || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-blue-700">
                                        <span>Envío {pedido.envio_pago_pendiente && Number(pedido.envio_cobrado_al_cliente) === 0 ? '(Pago en destino)' : ''}</span>
                                        <span className="font-semibold">
                                            S/ {Number(pedido.envio_cobrado_al_cliente || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Totales y Balance */}
                            <div className="border-t border-gray-200 pt-3 space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">TOTAL</span>
                                    <span className="text-base font-black text-gray-950">S/ {totalPedido.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>A cuenta ({metodoUltimoPago})</span>
                                    <span className="font-bold text-gray-800">- S/ {montoACuentaTotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center font-black text-sm text-red-600 bg-red-50/80 px-3 py-2 rounded-lg border border-red-100">
                                    <span className="uppercase tracking-wide text-[10px]">SALDO PENDIENTE</span>
                                    <span>S/ {saldo.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Pie */}
                            <div className="pt-2 text-center border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium">Esta nota no es comprobante de pago</p>
                            </div>
                        </div>
                    ) : (
                        /* ─────────────────────────────────────────────────────────────
                           VARIANTE 2: CANCELACIÓN (TOTALMENTE PAGADO)
                        ───────────────────────────────────────────────────────────── */
                        <div className="pt-4 space-y-4">
                            {/* Folio y Fecha */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="inline-block bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider mb-1">
                                        Cancelado
                                    </div>
                                    <h3 className="text-xs font-bold font-mono tracking-wide text-gray-900 uppercase">
                                        PEDIDO CANCELADO · N° {correlativo}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-gray-500">{fechaNota}</span>
                            </div>

                            {/* Cliente y Resumen de Productos */}
                            <div className="border-b border-gray-100 pb-3 space-y-1">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cliente</span>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{pedido.nombre_cliente}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Producto(s)</span>
                                    <p className="text-xs font-medium text-gray-700">{resumenProductos}</p>
                                </div>
                            </div>

                            {/* Desglose de Pagos */}
                            <div className="space-y-2 py-1 text-xs">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total del pedido</span>
                                    <span className="font-bold text-gray-900">S/ {totalPedido.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Pagado antes</span>
                                    <span className="font-medium text-gray-700">S/ {pagadoAntes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-700 font-semibold">
                                    <span>Saldo pagado hoy ({metodoUltimoPago})</span>
                                    <span>S/ {saldoPagadoHoy.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Distintivo Totalmente Pagado */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-center gap-2 text-emerald-800">
                                <FaCheckCircle className="text-emerald-600" size={16} />
                                <span className="font-black text-xs uppercase tracking-widest">✓ TOTALMENTE PAGADO</span>
                            </div>

                            {/* Pie */}
                            <div className="pt-1 text-center border-t border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium">¡Gracias por tu preferencia!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotaPedido;
