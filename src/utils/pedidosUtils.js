// src/utils/pedidosUtils.js
// Utilidades centrales para cálculos, estados y registro de pagos del módulo de Pedidos
import { pedidosDB } from './pedidosNeonClient';
import { ventasDB } from './ventasClient';
import { getLocalDate, toTimestampNoon } from './dateUtils';

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
    } catch {
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
 * Asegura que un pedido tenga su venta en Ventas, sin duplicarla (R7).
 * No crea pagos: solo la venta que respalda el pedido en los reportes.
 *
 * @param {Object} pedido - Pedido con id_pedido, nombre_cliente, precio_total y detalles_pedido
 * @param {Object} options - { metodo, fecha }
 * @returns {Promise<{ ventaRegistrada: boolean, ventaError: string|null }>}
 */
export const asegurarVentaPedido = async (pedido, { metodo = 'Efectivo', fecha = null } = {}) => {
    if (!pedido?.id_pedido) {
        return { ventaRegistrada: false, ventaError: 'Pedido inválido.' };
    }

    try {
        const yaExiste = await ventasDB.existeVentaPedido(pedido.id_pedido);
        if (yaExiste) {
            return { ventaRegistrada: false, ventaError: null };
        }

        const total = parseFloat(pedido.precio_total ?? pedido.total) || 0;
        await ventasDB.createVentaPedido({
            pedidoId: pedido.id_pedido,
            clienteNombre: pedido.nombre_cliente,
            total,
            formaPago: metodo || pedido.forma_pago || 'Efectivo',
            costo_materiales: 0,
            detalles: pedido.detalles_pedido || [],
            observaciones: `Cobro pedido #${pedido.id_pedido}`,
            fecha_venta: fecha || new Date().toISOString()
        });

        return { ventaRegistrada: true, ventaError: null };
    } catch (errorVenta) {
        console.error('Error al asegurar venta asociada al pedido:', errorVenta);
        return { ventaRegistrada: false, ventaError: errorVenta.message || 'Error al crear la venta.' };
    }
};

/**
 * Registra un pago en la base de datos y actualiza el saldo del pedido de forma consistente.
 * Si el saldo final queda en 0 (<= TOLERANCIA_SALDO), asegura la creación de una sola venta en Ventas (R7).
 *
 * @param {Object} pedido - Pedido completo sobre el que se aplica el pago
 * @param {Object} params - { monto, metodo, fecha_pago, fecha_venta }
 * @returns {Promise<Object>} { success, pedido, pago, cancelado, ventaRegistrada, ventaError, montoPagado, metodo }
 */
export const registrarPago = async (pedido, { monto, metodo = 'Efectivo', fecha_pago = null, fecha_venta = null }) => {
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
    const fechaVentaFinal = fecha_venta || toTimestampNoon(fechaPagoFinal) || new Date().toISOString();

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

    // 2. Si el pedido queda cancelado (saldo 0), asegurar una sola venta (R7)
    let ventaRegistrada = false;
    let ventaError = null;
    if (cancelado) {
        const resultadoVenta = await asegurarVentaPedido(
            { ...pedido, ...pedidoActualizado, detalles_pedido: pedido.detalles_pedido || [] },
            { metodo: metodoPagoFinal, fecha: fechaVentaFinal }
        );
        ventaRegistrada = resultadoVenta.ventaRegistrada;
        ventaError = resultadoVenta.ventaError;
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
        ventaError,
        montoPagado: montoPago,
        metodo: metodoPagoFinal
    };
};

/**
 * Cierre histórico de un pedido: cobra el saldo si corresponde, asegura la venta
 * y lo marca como entregado con la fecha elegida. No toca producción.
 *
 * @param {Object} pedido - Pedido completo (con monto_a_cuenta y precio_total)
 * @param {Object} options - { fecha, metodo }
 * @returns {Promise<Object>} { success, pedido, pago, ventaRegistrada, ventaError }
 */
export const cerrarPedido = async (pedido, { fecha = null, metodo = 'Efectivo' } = {}) => {
    if (!pedido?.id_pedido) {
        throw new Error('Pedido inválido para cerrar.');
    }

    const total = parseFloat(pedido.precio_total ?? pedido.total) || 0;
    const pagado = parseFloat(pedido.monto_a_cuenta ?? pedido.pagado) || 0;
    const saldo = calcularSaldo(total, pagado);
    const fechaCierre = fecha || getLocalDate();
    const fechaVenta = toTimestampNoon(fechaCierre) || new Date().toISOString();
    const fechaEntrega = toTimestampNoon(fechaCierre) || fechaCierre;

    let pago = null;
    let ventaRegistrada = false;
    let ventaError = null;

    if (saldo > TOLERANCIA_SALDO) {
        const resultado = await registrarPago(
            { ...pedido, monto_saldo: saldo, monto_a_cuenta: pagado },
            { monto: saldo, metodo, fecha_pago: fechaCierre, fecha_venta: fechaVenta }
        );
        pago = resultado.pago;
        ventaRegistrada = resultado.ventaRegistrada;
        ventaError = resultado.ventaError;
    } else {
        const resultadoVenta = await asegurarVentaPedido(pedido, { metodo, fecha: fechaVenta });
        ventaRegistrada = resultadoVenta.ventaRegistrada;
        ventaError = resultadoVenta.ventaError;
    }

    const pedidoActualizado = await pedidosDB.cerrarPedido(pedido.id_pedido, {
        fecha_entrega: fechaEntrega,
        cancelado: true
    });

    return {
        success: true,
        pedido: pedidoActualizado,
        pago,
        ventaRegistrada,
        ventaError
    };
};
