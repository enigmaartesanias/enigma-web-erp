import { neon } from '@neondatabase/serverless';
import { productosExternosDB } from './productosExternosNeonClient';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const ventasDB = {
    // ─────────────────────────────────────────────────────────────
    // VENTA DESDE STOCK (flujo POS — descuenta inventario) 
    // ─────────────────────────────────────────────────────────────
    async createVenta(ventaData) {
        try {
            // 1. Generar código correlativo
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
            const codigoVenta = nuevoNumero.toString().padStart(4, '0');

            // 2. Calcular fondos automáticos
            const totalNum = parseFloat(ventaData.total) || 0;
            const montoAlquiler = parseFloat((totalNum * 0.10).toFixed(2));
            const costoMaterial = parseFloat(ventaData.costo_material_reposicion || 0);

            // 3. Insertar cabecera de venta
            const [venta] = await sql`
                INSERT INTO ventas (
                    codigo_venta, cliente_nombre, cliente_documento,
                    subtotal, descuento_monto, impuesto_monto, total,
                    forma_pago, observaciones, es_credito, saldo_pendiente,
                    fecha_vencimiento, fecha_venta,
                    origen_venta, costo_material_reposicion, monto_alquiler_retencion
                ) VALUES (
                    ${codigoVenta},
                    ${ventaData.cliente_nombre || 'Cliente General'},
                    ${ventaData.cliente_documento || ''},
                    ${ventaData.subtotal},
                    ${ventaData.descuento_monto || 0},
                    ${ventaData.impuesto_monto || 0},
                    ${totalNum},
                    ${ventaData.forma_pago || 'Efectivo'},
                    ${ventaData.observaciones || ''},
                    ${ventaData.es_credito || false},
                    ${ventaData.saldo_pendiente || 0},
                    ${ventaData.fecha_vencimiento || null},
                    ${ventaData.fecha_venta || 'NOW()'},
                    'stock',
                    ${costoMaterial},
                    ${montoAlquiler}
                )
                RETURNING *
            `;

            // 4. Insertar detalles y descontar stock
            if (venta && venta.id) {
                for (const detalle of ventaData.detalles) {
                    const [productoRef] = await sql`
                        SELECT codigo_usuario, nombre 
                        FROM productos_externos 
                        WHERE id = ${detalle.producto_id}
                    `;
                    if (!productoRef) {
                        throw new Error(`Producto con ID ${detalle.producto_id} no encontrado`);
                    }

                    const itemsInventario = await sql`
                        SELECT id, stock_actual, nombre
                        FROM productos_externos
                        WHERE codigo_usuario = ${productoRef.codigo_usuario} 
                          AND estado_activo = TRUE
                        ORDER BY fecha_registro ASC
                    `;

                    const totalStockDisponible = itemsInventario.reduce((sum, item) => sum + Number(item.stock_actual), 0);
                    if (totalStockDisponible < Number(detalle.cantidad)) {
                        throw new Error(`Stock insuficiente para ${productoRef.nombre}. Disponible: ${totalStockDisponible}, Solicitado: ${detalle.cantidad}`);
                    }

                    await sql`
                        INSERT INTO detalles_venta (
                            venta_id, producto_id, cantidad, precio_unitario,
                            subtotal, producto_nombre, producto_codigo
                        ) VALUES (
                            ${venta.id}, ${detalle.producto_id}, ${detalle.cantidad},
                            ${detalle.precio_unitario},
                            ${detalle.cantidad * detalle.precio_unitario},
                            ${detalle.producto_nombre}, ${detalle.producto_codigo}
                        )
                    `;

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

    // ─────────────────────────────────────────────────────────────
    // VENTA DESDE PEDIDO (cobro a medida — NO descuenta inventario)
    // Se llama desde el módulo de Pedidos al marcar un pedido como cobrado/entregado.
    // ─────────────────────────────────────────────────────────────
    async createVentaPedido({ pedidoId, clienteNombre, total, formaPago, costo_materiales, observaciones, fecha_venta }) {
        try {
            // 1. Código correlativo
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
            const codigoVenta = nuevoNumero.toString().padStart(4, '0');

            // 2. Calcular fondos
            const totalNum = parseFloat(total) || 0;
            const montoAlquiler = parseFloat((totalNum * 0.10).toFixed(2));
            const costoMaterial = parseFloat(costo_materiales || 0);

            // 3. Insertar venta con origen 'pedido' (sin tocar inventario)
            const [venta] = await sql`
                INSERT INTO ventas (
                    codigo_venta, cliente_nombre, cliente_documento,
                    subtotal, descuento_monto, impuesto_monto, total,
                    forma_pago, observaciones, es_credito, saldo_pendiente,
                    fecha_venta,
                    origen_venta, costo_material_reposicion, monto_alquiler_retencion
                ) VALUES (
                    ${codigoVenta},
                    ${clienteNombre || 'Cliente Pedido'},
                    '',
                    ${totalNum},
                    0, 0,
                    ${totalNum},
                    ${formaPago || 'Efectivo'},
                    ${observaciones || `Cobro pedido #${pedidoId}`},
                    false, 0,
                    ${fecha_venta || new Date().toISOString()},
                    'pedido',
                    ${costoMaterial},
                    ${montoAlquiler}
                )
                RETURNING *
            `;

            // 4. Insertar detalle de trazabilidad (referencia al pedido)
            if (venta && venta.id) {
                await sql`
                    INSERT INTO detalles_venta (
                        venta_id, producto_id, cantidad, precio_unitario,
                        subtotal, producto_nombre, producto_codigo
                    ) VALUES (
                        ${venta.id}, null, 1, ${totalNum}, ${totalNum},
                        ${`Pedido #${pedidoId}`},
                        ${`PED-${String(pedidoId).padStart(4, '0')}`}
                    )
                `;
            }

            return venta;
        } catch (error) {
            console.error("Error creando venta de pedido:", error);
            throw error;
        }
    },

    async getAll() {
        try {
            const ventas = await sql`
                SELECT 
                    v.*,
                    COALESCE(
                        (SELECT json_agg(json_build_object(
                            'id', d.id,
                            'producto_id', d.producto_id,
                            'cantidad', d.cantidad,
                            'precio_unitario', d.precio_unitario,
                            'subtotal', d.subtotal,
                            'producto_nombre', d.producto_nombre,
                            'producto_codigo', d.producto_codigo,
                            'costo_actual', p.costo,
                            'mano_de_obra_actual', CASE WHEN pr.cantidad > 0 THEN (pr.mano_de_obra / pr.cantidad) ELSE 0 END
                        )) 
                         FROM detalles_venta d 
                         LEFT JOIN productos_externos p ON d.producto_id = p.id
                         LEFT JOIN produccion_taller pr ON CAST(NULLIF(p.produccion_id, '') AS INTEGER) = pr.id_produccion
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
            const [venta] = await sql`SELECT * FROM ventas WHERE id = ${ventaId}`;
            if (!venta) throw new Error('Venta no encontrada');
            if (!venta.es_credito) throw new Error('Esta venta no es a crédito');
            if (montoPago > venta.saldo_pendiente) throw new Error('El monto del pago no puede ser mayor al saldo pendiente');
            if (montoPago <= 0) throw new Error('El monto debe ser mayor a cero');

            await sql`
                INSERT INTO pagos (venta_id, monto, metodo_pago, observaciones)
                VALUES (${ventaId}, ${montoPago}, ${metodoPago}, ${observaciones})
            `;

            const nuevoSaldo = Math.max(0, venta.saldo_pendiente - montoPago);
            const ahora = new Date().toISOString();

            if (nuevoSaldo === 0) {
                await sql`
                    UPDATE ventas
                    SET saldo_pendiente = ${nuevoSaldo},
                        fecha_ultimo_pago = ${ahora},
                        fecha_cancelacion = ${ahora}
                    WHERE id = ${ventaId}
                `;
            } else {
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

    // Eliminar venta vinculada a un pedido (cuando el pedido es eliminado)
    async deleteByPedidoId(pedidoId) {
        try {
            const codigoPed = `PED-${String(pedidoId).padStart(4, '0')}`;
            
            // Buscar la venta que tenga este código de pedido en sus detalles
            const ventas = await sql`
                SELECT v.id 
                FROM ventas v
                JOIN detalles_venta d ON d.venta_id = v.id
                WHERE d.producto_codigo = ${codigoPed}
                AND v.origen_venta = 'pedido'
            `;

            for (const v of ventas) {
                await sql`DELETE FROM detalles_venta WHERE venta_id = ${v.id}`;
                await sql`DELETE FROM ventas WHERE id = ${v.id}`;
            }
            
            return true;
        } catch (error) {
            console.error("Error al eliminar venta por pedido ID:", error);
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
    },

    // ─────────────────────────────────────────────────────────────
    // REPORTE DE POPULARIDAD (ranking calculado en la DB)
    // Recibe fechaInicio y fechaFin en formato 'YYYY-MM-DD'
    // Devuelve: [{ nombre, tipo, metal, und_stock, und_pedido, total_unidades, total_dinero }]
    // ─────────────────────────────────────────────────────────────
    async getPopularidadRanking(fechaInicio, fechaFin) {
        try {
            const rows = await sql`
                WITH pedidos_lineas AS (
                    SELECT
                        COALESCE(NULLIF(TRIM(dp.tipo_producto), ''), 'Varios') AS tipo,
                        COALESCE(NULLIF(TRIM(dp.metal), ''), 'Sin metal')       AS metal,
                        COALESCE(dp.cantidad, 1)                                AS cantidad,
                        -- Valor total de esta línea
                        COALESCE(dp.precio_unitario::DECIMAL * dp.cantidad::DECIMAL, 0) AS monto_total,
                        -- Recaudado: Proporción del pago a cuenta según el peso de esta línea en el total del pedido
                        CASE 
                            WHEN COALESCE(p.precio_total, 0) > 0 
                            THEN ( (COALESCE(dp.precio_unitario, 0) * COALESCE(dp.cantidad, 0)) / p.precio_total::DECIMAL ) * COALESCE(p.monto_a_cuenta, 0)
                            ELSE 0 
                        END AS monto_recaudado,
                        'pedido' AS origen
                    FROM detalles_pedido dp
                    JOIN pedidos p ON p.id_pedido = dp.id_pedido
                    WHERE DATE(p.fecha_pedido) >= ${fechaInicio}::date
                      AND DATE(p.fecha_pedido) <= ${fechaFin}::date
                ),
                ventas_lineas AS (
                    SELECT
                        COALESCE(NULLIF(TRIM(dv.producto_nombre), ''), 'Producto') AS tipo,
                        '—'                                                         AS metal,
                        COALESCE(dv.cantidad, 1)                                   AS cantidad,
                        COALESCE(dv.subtotal::DECIMAL, 0)                          AS monto_total,
                        COALESCE(dv.subtotal::DECIMAL, 0)                          AS monto_recaudado, -- En stock se recauda el 100%
                        'stock' AS origen
                    FROM detalles_venta dv
                    JOIN ventas v ON v.id = dv.venta_id
                    WHERE (v.estado IS NULL OR v.estado != 'ANULADA')
                      AND v.origen_venta = 'stock'
                      AND DATE(v.fecha_venta) >= ${fechaInicio}::date
                      AND DATE(v.fecha_venta) <= ${fechaFin}::date
                )
                SELECT
                    tipo AS nombre,
                    tipo,
                    metal,
                    SUM(CASE WHEN origen = 'stock'  THEN cantidad ELSE 0 END)::INTEGER      AS und_stock,
                    SUM(CASE WHEN origen = 'pedido' THEN cantidad ELSE 0 END)::INTEGER      AS und_pedido,
                    SUM(cantidad)::INTEGER                                                  AS total_unidades,
                    SUM(monto_total)::DECIMAL(10,2)                                         AS total_dinero,
                    SUM(monto_recaudado)::DECIMAL(10,2)                                     AS total_recaudado
                FROM (
                    SELECT * FROM pedidos_lineas
                    UNION ALL
                    SELECT * FROM ventas_lineas
                ) unificado
                GROUP BY tipo, metal
                ORDER BY total_unidades DESC, total_dinero DESC
            `;
            return rows.map(r => ({
                ...r,
                und_stock:      Number(r.und_stock),
                und_pedido:     Number(r.und_pedido),
                total_unidades: Number(r.total_unidades),
                total_dinero:   parseFloat(r.total_dinero) || 0,
                total_recaudado: parseFloat(r.total_recaudado) || 0
            }));
        } catch (error) {
            console.error('Error en getPopularidadRanking:', error);
            throw error;
        }
    }
};
