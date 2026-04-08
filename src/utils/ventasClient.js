import { neon } from '@neondatabase/serverless';
import { productosExternosDB } from './productosExternosNeonClient';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const ventasDB = {
    // Registrar una nueva venta completa
    async createVenta(ventaData) {
        // ventaData espera: { 
        //   cliente_nombre, cliente_documento, 
        //   subtotal, descuento_monto, impuesto_monto, total, 
        //   forma_pago, observaciones, 
        //   detalles: [{ producto_id, cantidad, precio_unitario, producto_nombre, producto_codigo }] 
        // }

        try {
            // 1. Generar código de venta correlativo
            // Obtener el último código de venta
            const [ultimaVenta] = await sql`
                SELECT codigo_venta 
                FROM ventas 
                WHERE codigo_venta ~ '^[0-9]+$'
                ORDER BY CAST(codigo_venta AS INTEGER) DESC 
                LIMIT 1
            `;

            let nuevoNumero = 1;
            if (ultimaVenta && ultimaVenta.codigo_venta) {
                nuevoNumero = parseInt(ultimaVenta.codigo_venta) + 1;
            }

            // Formatear con ceros a la izquierda (4 dígitos)
            const codigoVenta = nuevoNumero.toString().padStart(4, '0');

            // 2. Insertar cabecera de venta
            const [venta] = await sql`
                INSERT INTO ventas (
                    codigo_venta,
                    cliente_nombre,
                    cliente_documento,
                    subtotal,
                    descuento_monto,
                    impuesto_monto,
                    total,
                    forma_pago,
                    observaciones,
                    es_credito,
                    saldo_pendiente,
                    fecha_vencimiento,
                    fecha_venta
                ) VALUES (
                    ${codigoVenta},
                    ${ventaData.cliente_nombre || 'Cliente General'},
                    ${ventaData.cliente_documento || ''},
                    ${ventaData.subtotal},
                    ${ventaData.descuento_monto || 0},
                    ${ventaData.impuesto_monto || 0},
                    ${ventaData.total},
                    ${ventaData.forma_pago || 'Efectivo'},
                    ${ventaData.observaciones || ''},
                    ${ventaData.es_credito || false},
                    ${ventaData.saldo_pendiente || 0},
                    ${ventaData.fecha_vencimiento || null},
                    ${ventaData.fecha_venta || 'NOW()'}
                )
                RETURNING *
            `;

            // 3. Insertar detalles y actualizar stock
            if (venta && venta.id) {
                for (const detalle of ventaData.detalles) {
                    // 3.1 Obtener producto referencial para sacar el código
                    const [productoRef] = await sql`
                        SELECT codigo_usuario, nombre 
                        FROM productos_externos 
                        WHERE id = ${detalle.producto_id}
                    `;

                    if (!productoRef) {
                        throw new Error(`Producto con ID ${detalle.producto_id} no encontrado`);
                    }

                    // 3.2 Buscar TODOS los registros con ese código (Inventario consolidado)
                    const itemsInventario = await sql`
                        SELECT id, stock_actual, nombre
                        FROM productos_externos
                        WHERE codigo_usuario = ${productoRef.codigo_usuario} 
                          AND estado_activo = TRUE
                        ORDER BY fecha_registro ASC
                    `;

                    // 3.3 Calcular stock total disponible
                    const totalStockDisponible = itemsInventario.reduce((sum, item) => sum + Number(item.stock_actual), 0);

                    if (totalStockDisponible < Number(detalle.cantidad)) {
                        throw new Error(`Stock insuficiente para ${productoRef.nombre} (Consolidado). Disponible: ${totalStockDisponible}, Solicitado: ${detalle.cantidad}`);
                    }

                    // 3.4 Insertar detalle de venta (Vinculado al ID primario seleccionado)
                    await sql`
                        INSERT INTO detalles_venta (
                            venta_id,
                            producto_id,
                            cantidad,
                            precio_unitario,
                            subtotal,
                            producto_nombre,
                            producto_codigo
                        ) VALUES (
                            ${venta.id},
                            ${detalle.producto_id},
                            ${detalle.cantidad},
                            ${detalle.precio_unitario},
                            ${detalle.cantidad * detalle.precio_unitario},
                            ${detalle.producto_nombre},
                            ${detalle.producto_codigo}
                        )
                    `;

                    // 3.5 Descontar stock distribuido (FIFO o disponible)
                    let restantePorDescontar = Number(detalle.cantidad);

                    for (const item of itemsInventario) {
                        if (restantePorDescontar <= 0) break;

                        const stockItem = Number(item.stock_actual);
                        if (stockItem <= 0) continue;

                        const descontar = Math.min(stockItem, restantePorDescontar);

                        await sql`
                            UPDATE productos_externos
                            SET stock_actual = stock_actual - ${descontar}
                            WHERE id = ${item.id}
                        `;

                        restantePorDescontar -= descontar;
                    }
                }
            }

            return venta;
        } catch (error) {
            console.error("Error creando venta:", error);
            throw error;
        }
    },

    async getAll() {
        try {
            // Optimización: Una sola consulta con JOIN y agregación JSON para evitar N+1
            const ventas = await sql`
                SELECT 
                    v.*,
                    COALESCE(
                        (SELECT json_agg(d.*) 
                         FROM detalles_venta d 
                         WHERE d.venta_id = v.id), 
                        '[]'
                    ) as detalles
                FROM ventas v
                ORDER BY v.fecha_venta DESC
            `;
            return ventas;
        } catch (error) {
            console.error("Error al obtener ventas:", error);
            throw error;
        }
    },

    async getById(id) {
        const [venta] = await sql`SELECT * FROM ventas WHERE id = ${id}`;
        if (venta) {
            const detalles = await sql`SELECT * FROM detalles_venta WHERE venta_id = ${id}`;
            venta.detalles = detalles;
        }
        return venta;
    },

    // Anular una venta existente
    async anular(id, data) {
        try {
            const [venta] = await sql`
                UPDATE ventas
                SET 
                    estado = ${data.estado},
                    motivo_anulacion = ${data.motivo_anulacion},
                    fecha_anulacion = ${data.fecha_anulacion}
                WHERE id = ${id}
                RETURNING *
            `;
            return venta;
        } catch (error) {
            console.error("Error anulando venta:", error);
            throw error;
        }
    },

    // Registrar pago a venta a crédito
    async registrarPago(ventaId, montoPago, metodoPago = 'Efectivo', observaciones = '') {
        try {
            // 1. Obtener venta
            const [venta] = await sql`SELECT * FROM ventas WHERE id = ${ventaId}`;

            if (!venta) {
                throw new Error('Venta no encontrada');
            }

            if (!venta.es_credito) {
                throw new Error('Esta venta no es a crédito');
            }

            // 2. Validar monto
            if (montoPago > venta.saldo_pendiente) {
                throw new Error('El monto del pago no puede ser mayor al saldo pendiente');
            }

            if (montoPago <= 0) {
                throw new Error('El monto debe ser mayor a cero');
            }

            // 3. Registrar pago en tabla pagos
            await sql`
                INSERT INTO pagos (venta_id, monto, metodo_pago, observaciones)
                VALUES (${ventaId}, ${montoPago}, ${metodoPago}, ${observaciones})
            `;

            // 4. Calcular nuevo saldo y actualizar fechas
            const nuevoSaldo = Math.max(0, venta.saldo_pendiente - montoPago);
            const ahora = new Date().toISOString();

            if (nuevoSaldo === 0) {
                // Crédito cancelado completamente
                await sql`
                    UPDATE ventas
                    SET saldo_pendiente = ${nuevoSaldo},
                        fecha_ultimo_pago = ${ahora},
                        fecha_cancelacion = ${ahora}
                    WHERE id = ${ventaId}
                `;
            } else {
                // Pago parcial
                await sql`
                    UPDATE ventas
                    SET saldo_pendiente = ${nuevoSaldo},
                        fecha_ultimo_pago = ${ahora}
                    WHERE id = ${ventaId}
                `;
            }

            return nuevoSaldo;
        } catch (error) {
            console.error('Error registrando pago:', error);
            throw error;
        }
    },

    // Obtener historial de pagos de una venta
    async getHistorialPagos(ventaId) {
        try {
            const pagos = await sql`
                SELECT * FROM pagos 
                WHERE venta_id = ${ventaId} 
                ORDER BY fecha_pago ASC
            `;
            return pagos;
        } catch (error) {
            console.error('Error obteniendo historial de pagos:', error);
            throw error;
        }
    }
};
