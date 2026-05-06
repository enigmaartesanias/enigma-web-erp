import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

/**
 * Cliente para Gestión de Deudas (Cuentas por Cobrar)
 * Basado exclusivamente en la tabla 'ventas' para asegurar integridad con el Reporte de Ventas.
 */
export const cuentasPorCobrarDB = {
    /**
     * Obtener todas las deudas vigentes desde la tabla ventas
     * @param {Object} filtros - { estado: 'PENDIENTE'|'CANCELADO' }
     * @returns {Array} Lista de ventas a crédito
     */
    async getAll(filtros = {}) {
        try {
            const deudas = await sql`
                SELECT 
                    id, 
                    codigo_venta as codigo_cuenta, 
                    cliente_nombre, 
                    cliente_documento,
                    total, 
                    (total - saldo_pendiente) as a_cuenta, 
                    saldo_pendiente as saldo_deudor, 
                    fecha_vencimiento, 
                    fecha_venta as fecha_registro,
                    CASE 
                        WHEN saldo_pendiente <= 0 THEN 'CANCELADO' 
                        ELSE 'PENDIENTE' 
                    END as estado
                FROM ventas
                WHERE es_credito = true 
                AND (${filtros.estado || 'TODOS'} = 'TODOS' 
                    OR (CASE WHEN saldo_pendiente <= 0 THEN 'CANCELADO' ELSE 'PENDIENTE' END) = ${filtros.estado})
                ORDER BY fecha_venta DESC
            `;

            // Cargar historial de pagos para cada deuda desde la tabla 'pagos'
            for (const deuda of deudas) {
                // Normalizar campos numéricos
                deuda.total = parseFloat(deuda.total || 0);
                deuda.a_cuenta = parseFloat(deuda.a_cuenta || 0);
                deuda.saldo_deudor = parseFloat(deuda.saldo_deudor || 0);

                const pagos = await sql`
                    SELECT * FROM pagos 
                    WHERE venta_id = ${deuda.id} 
                    ORDER BY fecha_pago ASC
                `;
                deuda.pagos = pagos.map(p => ({
                    ...p,
                    monto: parseFloat(p.monto || 0)
                }));
            }

            return deudas || [];
        } catch (error) {
            console.error('Error en cuentasPorCobrarDB.getAll:', error);
            return [];
        }
    },

    /**
     * Registrar un pago (abono) a una venta
     * @param {number} ventaId - ID de la venta
     * @param {number} montoPago - Monto del abono
     * @param {string} metodoPago - Método de pago
     * @param {string} observaciones - Notas
     */
    async registrarPago(ventaId, montoPago, metodoPago = 'Efectivo', observaciones = '') {
        try {
            const [venta] = await sql`SELECT * FROM ventas WHERE id = ${ventaId}`;
            if (!venta) throw new Error('Venta no encontrada');
            
            const monto = parseFloat(montoPago);
            const saldoActual = parseFloat(venta.saldo_pendiente || 0);

            if (monto > saldoActual) {
                throw new Error('El monto del pago no puede ser mayor al saldo pendiente');
            }

            // 1. Insertar el pago en la tabla 'pagos'
            await sql`
                INSERT INTO pagos (venta_id, monto, metodo_pago, observaciones)
                VALUES (${ventaId}, ${monto}, ${metodoPago}, ${observaciones})
            `;

            // 2. Actualizar el saldo en la tabla 'ventas'
            const nuevoSaldo = Math.max(0, saldoActual - monto);
            const ahora = new Date().toISOString();

            await sql`
                UPDATE ventas
                SET 
                    saldo_pendiente = ${nuevoSaldo},
                    fecha_ultimo_pago = ${ahora},
                    fecha_cancelacion = ${nuevoSaldo === 0 ? ahora : null}
                WHERE id = ${ventaId}
            `;

            return nuevoSaldo;
        } catch (error) {
            console.error('Error registrando pago en ventas:', error);
            throw error;
        }
    },

    /**
     * Obtener resumen global de deudas basado en ventas
     */
    async getResumen() {
        try {
            const [resumen] = await sql`
                SELECT 
                    SUM(saldo_pendiente) as total_pendiente,
                    COUNT(*) as total_cuentas,
                    COUNT(CASE WHEN fecha_vencimiento < NOW() AND saldo_pendiente > 0 THEN 1 END) as cuentas_vencidas
                FROM ventas
                WHERE es_credito = true AND saldo_pendiente > 0
            `;

            return {
                totalPendiente: parseFloat(resumen.total_pendiente || 0),
                totalCuentas: parseInt(resumen.total_cuentas || 0),
                cuentasVencidas: parseInt(resumen.cuentas_vencidas || 0)
            };
        } catch (error) {
            console.error('Error en getResumen de deudas:', error);
            return { totalPendiente: 0, totalCuentas: 0, cuentasVencidas: 0 };
        }
    }
};
