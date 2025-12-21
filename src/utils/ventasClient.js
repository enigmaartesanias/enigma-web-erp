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
            // 1. Generar código de venta (Simple: V-TIMESTAMP)
            const codigoVenta = `V-${Date.now()}`;

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
                    observaciones
                ) VALUES (
                    ${codigoVenta},
                    ${ventaData.cliente_nombre || 'Cliente General'},
                    ${ventaData.cliente_documento || ''},
                    ${ventaData.subtotal},
                    ${ventaData.descuento_monto || 0},
                    ${ventaData.impuesto_monto || 0},
                    ${ventaData.total},
                    ${ventaData.forma_pago || 'Efectivo'},
                    ${ventaData.observaciones || ''}
                )
                RETURNING *
            `;

            // 3. Insertar detalles y actualizar stock
            if (venta && venta.id) {
                for (const detalle of ventaData.detalles) {
                    // Insertar detalle
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

                    // Actualizar stock del producto
                    // Nota: Esto asume que hay stock suficiente. En producción debería validarse antes.
                    await sql`
                        UPDATE productos_externos
                        SET stock_actual = stock_actual - ${detalle.cantidad}
                        WHERE id = ${detalle.producto_id}
                    `;
                }
            }

            return venta;
        } catch (error) {
            console.error("Error creando venta:", error);
            throw error;
        }
    },

    async getAll() {
        return await sql`SELECT * FROM ventas ORDER BY fecha_venta DESC`;
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
    }
};
