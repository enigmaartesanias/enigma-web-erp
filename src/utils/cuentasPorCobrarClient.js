import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const cuentasPorCobrarDB = {
    /**
     * Crear nueva cuenta por cobrar
     * @param {Object} data - { venta_id, cliente_nombre, cliente_documento, total, a_cuenta, fecha_vencimiento, detalle_productos, observaciones }
     * @returns {Object} Cuenta creada
     */
    async create(data) {
        const saldo_deudor = data.total - (data.a_cuenta || 0);

        // Generar código correlativo CXC-0001, CXC-0002, etc.
        const [ultimaCuenta] = await sql`
            SELECT codigo_cuenta FROM cuentas_por_cobrar 
            WHERE codigo_cuenta ~ '^CXC-[0-9]+$'
            ORDER BY id DESC LIMIT 1
        `;

        let numero = 1;
        if (ultimaCuenta && ultimaCuenta.codigo_cuenta) {
            numero = parseInt(ultimaCuenta.codigo_cuenta.split('-')[1]) + 1;
        }
        const codigo_cuenta = `CXC-${numero.toString().padStart(4, '0')}`;

        // Insertar cuenta
        const [cuenta] = await sql`
            INSERT INTO cuentas_por_cobrar (
                codigo_cuenta, venta_id, cliente_nombre, cliente_documento,
                total, a_cuenta, saldo_deudor, fecha_vencimiento,
                detalle_productos, observaciones
            ) VALUES (
                ${codigo_cuenta}, 
                ${data.venta_id}, 
                ${data.cliente_nombre},
                ${data.cliente_documento || ''}, 
                ${data.total}, 
                ${data.a_cuenta || 0},
                ${saldo_deudor}, 
                ${data.fecha_vencimiento}, 
                ${JSON.stringify(data.detalle_productos)}, 
                ${data.observaciones || ''}
            ) RETURNING *
        `;

        // Si hay adelanto, registrar el pago inicial
        if (data.a_cuenta > 0) {
            await sql`
                INSERT INTO pagos_cuenta (cuenta_id, monto, observaciones)
                VALUES (${cuenta.id}, ${data.a_cuenta}, 'Pago inicial')
            `;
        }

        return cuenta;
    },

    /**
     * Registrar pago (abono) a una cuenta
     * @param {number} cuentaId - ID de la cuenta
     * @param {number} montoPago - Monto del pago
     * @param {string} metodoPago - Método de pago (Efectivo, Yape, Plin, Tarjeta)
     * @param {string} observaciones - Observaciones del pago
     * @returns {Object} Cuenta actualizada
     */
    async registrarPago(cuentaId, montoPago, metodoPago = 'Efectivo', observaciones = '') {
        const [cuenta] = await sql`SELECT * FROM cuentas_por_cobrar WHERE id = ${cuentaId}`;

        if (!cuenta) {
            throw new Error('Cuenta no encontrada');
        }

        if (montoPago > cuenta.saldo_deudor) {
            throw new Error('El monto del pago no puede ser mayor al saldo deudor');
        }

        const nuevoSaldo = cuenta.saldo_deudor - montoPago;

        // Registrar pago en historial
        await sql`
            INSERT INTO pagos_cuenta (cuenta_id, monto, metodo_pago, observaciones)
            VALUES (${cuentaId}, ${montoPago}, ${metodoPago}, ${observaciones})
        `;

        // Actualizar saldo y a_cuenta
        const nuevoACuenta = cuenta.a_cuenta + montoPago;
        const estado = nuevoSaldo <= 0 ? 'CANCELADO' : 'PENDIENTE';
        const fechaCancelacion = nuevoSaldo <= 0 ? new Date().toISOString() : null;

        const [cuentaActualizada] = await sql`
            UPDATE cuentas_por_cobrar
            SET 
                a_cuenta = ${nuevoACuenta},
                saldo_deudor = ${Math.max(0, nuevoSaldo)},
                estado = ${estado},
                fecha_cancelacion = ${fechaCancelacion}
            WHERE id = ${cuentaId}
            RETURNING *
        `;

        return cuentaActualizada;
    },

    /**
     * Obtener todas las cuentas con filtros opcionales
     * @param {Object} filtros - { estado: 'PENDIENTE'|'CANCELADO', cliente_documento: string }
     * @returns {Array} Lista de cuentas con historial de pagos
     */
    async getAll(filtros = {}) {
        let query = 'SELECT * FROM cuentas_por_cobrar';
        const conditions = [];

        if (filtros.estado) {
            conditions.push(`estado = '${filtros.estado}'`);
        }
        if (filtros.cliente_documento) {
            conditions.push(`cliente_documento = '${filtros.cliente_documento}'`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY fecha_registro DESC';

        const cuentas = await sql.unsafe(query);

        // Cargar historial de pagos para cada cuenta
        for (const cuenta of cuentas) {
            const pagos = await sql`
                SELECT * FROM pagos_cuenta 
                WHERE cuenta_id = ${cuenta.id} 
                ORDER BY fecha_pago ASC
            `;
            cuenta.pagos = pagos;

            // Parse detalle_productos de JSON
            if (cuenta.detalle_productos) {
                try {
                    cuenta.detalle_productos = JSON.parse(cuenta.detalle_productos);
                } catch (e) {
                    cuenta.detalle_productos = [];
                }
            }
        }

        return cuentas;
    },

    /**
     * Obtener cuenta por ID
     * @param {number} id - ID de la cuenta
     * @returns {Object} Cuenta con historial de pagos
     */
    async getById(id) {
        const [cuenta] = await sql`SELECT * FROM cuentas_por_cobrar WHERE id = ${id}`;

        if (cuenta) {
            const pagos = await sql`
                SELECT * FROM pagos_cuenta 
                WHERE cuenta_id = ${id}
                ORDER BY fecha_pago ASC
            `;
            cuenta.pagos = pagos;

            if (cuenta.detalle_productos) {
                try {
                    cuenta.detalle_productos = JSON.parse(cuenta.detalle_productos);
                } catch (e) {
                    cuenta.detalle_productos = [];
                }
            }
        }

        return cuenta;
    },

    /**
     * Obtener cuentas vencidas (pendientes con fecha de vencimiento pasada)
     * @returns {Array} Lista de cuentas vencidas
     */
    async getCuentasVencidas() {
        const cuentas = await sql`
            SELECT * FROM cuentas_por_cobrar
            WHERE estado = 'PENDIENTE' 
            AND fecha_vencimiento < NOW()
            ORDER BY fecha_vencimiento ASC
        `;

        // Cargar historial de pagos
        for (const cuenta of cuentas) {
            const pagos = await sql`
                SELECT * FROM pagos_cuenta 
                WHERE cuenta_id = ${cuenta.id}
                ORDER BY fecha_pago ASC
            `;
            cuenta.pagos = pagos;

            if (cuenta.detalle_productos) {
                try {
                    cuenta.detalle_productos = JSON.parse(cuenta.detalle_productos);
                } catch (e) {
                    cuenta.detalle_productos = [];
                }
            }
        }

        return cuentas;
    },

    /**
     * Obtener resumen de cuentas por cobrar
     * @returns {Object} { totalPendiente, totalCuentas, cuentasVencidas }
     */
    async getResumen() {
        const [resumen] = await sql`
            SELECT 
                SUM(CASE WHEN estado = 'PENDIENTE' THEN saldo_deudor ELSE 0 END) as total_pendiente,
                COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as total_cuentas,
                COUNT(CASE WHEN estado = 'PENDIENTE' AND fecha_vencimiento < NOW() THEN 1 END) as cuentas_vencidas
            FROM cuentas_por_cobrar
        `;

        return {
            totalPendiente: parseFloat(resumen.total_pendiente || 0),
            totalCuentas: parseInt(resumen.total_cuentas || 0),
            cuentasVencidas: parseInt(resumen.cuentas_vencidas || 0)
        };
    }
};
