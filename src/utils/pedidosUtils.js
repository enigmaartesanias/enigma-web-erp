// src/utils/pedidosUtils.js
// Utilidades centrales para cálculos, estados y registro de pagos del módulo de Pedidos
import { pedidosDB } from './pedidosNeonClient';
import { ventasDB } from './ventasClient';
import { getLocalDate } from './dateUtils';

export const TOLERANCIA_SALDO = 0.05;

export const METODOS_PAGO = ['Efectivo', 'Billetera digital', 'Transferencia'];

/**
 * Formatea una fecha ISO o string al formato local dd/mm/yy
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    try {
        let dateStr = typeof dateString === 'string' ? dateString : dateString.toString();
        const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        if (!datePart.includes('-')) {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        }
        const [year, month, day] = datePart.split('-');
        if (!year || !month || !day) return '';
        return `${day}/${month}/${year.slice(-2)}`;
    } catch (error) {
        return '';
    }
};

/**
 * Calcula el saldo restante restando lo pagado al total.
 * Si el saldo resultante es menor o igual que la tolerancia (0.05), retorna 0.
 *
 * @param {number|string} total - Total del pedido
 * @param {number|string} pagado - Monto pagado o a cuenta
 * @returns {number} Saldo pendiente redondeado a 2 decimales (o 0)
 */
export const calcularSaldo = (total, pagado) => {
    const t = parseFloat(total) || 0;
    const p = parseFloat(pagado) || 0;
    const saldo = t - p;
    if (saldo <= TOLERANCIA_SALDO) {
        return 0;
    }
    return parseFloat(saldo.toFixed(2));
};

/**
 * Determina el estado de pago del pedido: 'pendiente' | 'adelanto' | 'pagado'.
 * Utiliza TOLERANCIA_SALDO para considerar un pedido como totalmente pagado.
 *
 * @param {Object} pedido - Objeto con datos del pedido (precio_total/total, monto_a_cuenta/pagado, monto_saldo opcional)
 * @returns {'pendiente' | 'adelanto' | 'pagado'}
 */
export const estadoPago = (pedido) => {
    if (!pedido) return 'pendiente';

    const total = parseFloat(pedido.precio_total ?? pedido.total) || 0;
    const pagado = parseFloat(pedido.monto_a_cuenta ?? pedido.pagado) || 0;

    if (pagado <= 0) {
        return 'pendiente';
    }

    const saldo = (pedido.monto_saldo !== undefined && pedido.monto_saldo !== null && !isNaN(parseFloat(pedido.monto_saldo)))
        ? parseFloat(pedido.monto_saldo)
        : (total - pagado);

    if (saldo <= TOLERANCIA_SALDO) {
        return 'pagado';
    }

    return 'adelanto';
};

/**
 * Registra un pago en la base de datos y actualiza el saldo del pedido de forma consistente.
 * Si el saldo final queda en 0 (<= TOLERANCIA_SALDO), asegura la creación de una sola venta en Ventas (R7).
 *
 * @param {Object} pedido - Pedido completo sobre el que se aplica el pago
 * @param {Object} params - { monto, metodo, fecha_pago }
 * @returns {Promise<Object>} { success, pedido, pago, cancelado, ventaRegistrada, montoPagado, metodo }
 */
export const registrarPago = async (pedido, { monto, metodo = 'Efectivo', fecha_pago = null }) => {
    if (!pedido || !pedido.id_pedido) {
        throw new Error('Pedido inválido para registrar pago.');
    }

    const total = parseFloat(pedido.precio_total ?? pedido.total) || 0;
    const pagadoActual = parseFloat(pedido.monto_a_cuenta ?? pedido.pagado) || 0;
    const saldoActual = (pedido.monto_saldo !== undefined && pedido.monto_saldo !== null && !isNaN(parseFloat(pedido.monto_saldo)))
        ? parseFloat(pedido.monto_saldo)
        : calcularSaldo(total, pagadoActual);

    const montoPago = parseFloat(monto);
    if (isNaN(montoPago) || montoPago <= 0) {
        throw new Error('El monto del pago debe ser mayor a 0.');
    }

    if (montoPago > (saldoActual + TOLERANCIA_SALDO)) {
        throw new Error(`El pago (S/ ${montoPago.toFixed(2)}) no puede exceder el saldo pendiente (S/ ${saldoActual.toFixed(2)}).`);
    }

    const nuevoAcuenta = parseFloat((pagadoActual + montoPago).toFixed(2));
    const saldoBruto = total - nuevoAcuenta;
    const nuevoSaldo = saldoBruto <= TOLERANCIA_SALDO ? 0 : parseFloat(saldoBruto.toFixed(2));
    const cancelado = nuevoSaldo <= TOLERANCIA_SALDO;
    const fechaPagoFinal = fecha_pago || getLocalDate();
    const metodoPagoFinal = metodo || 'Efectivo';

    // 1. Registrar pago y actualizar pedido en Neon
    const { pago, pedido: pedidoActualizado } = await pedidosDB.registrarPagoYActualizarPedido({
        id_pedido: pedido.id_pedido,
        monto: montoPago,
        fecha_pago: fechaPagoFinal,
        metodo_pago: metodoPagoFinal,
        nuevo_monto_a_cuenta: nuevoAcuenta,
        nuevo_monto_saldo: nuevoSaldo,
        cancelado
    });

    // 2. Si el pedido queda cancelado (saldo 0), registrar venta en Ventas una sola vez (R7)
    let ventaRegistrada = false;
    if (cancelado) {
        const codigoPed = `PED-${String(pedido.id_pedido).padStart(4, '0')}`;
        try {
            const ventasExistentes = await ventasDB.getAll();
            const yaRegistrado = ventasExistentes.some(v =>
                v.detalles && v.detalles.some(d => d.producto_codigo === codigoPed)
            );

            if (!yaRegistrado) {
                await ventasDB.createVentaPedido({
                    pedidoId: pedido.id_pedido,
                    clienteNombre: pedido.nombre_cliente,
                    total: total,
                    formaPago: metodoPagoFinal || pedido.forma_pago || 'Efectivo',
                    costo_materiales: 0,
                    detalles: pedido.detalles_pedido || [],
                    observaciones: `Cobro pedido #${pedido.id_pedido}`,
                    fecha_venta: new Date().toISOString()
                });
                ventaRegistrada = true;
            }
        } catch (errorVenta) {
            console.error('Error al registrar venta asociada al pedido:', errorVenta);
        }
    }

    const pagosActualizados = [...(pedido.pagos || []), pago];

    return {
        success: true,
        pedido: {
            ...pedido,
            ...pedidoActualizado,
            monto_a_cuenta: nuevoAcuenta,
            monto_saldo: nuevoSaldo,
            cancelado,
            pagos: pagosActualizados
        },
        pago,
        cancelado,
        ventaRegistrada,
        montoPagado: montoPago,
        metodo: metodoPagoFinal
    };
};
