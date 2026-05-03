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
    async createVentaPedido(ventaData) {
        const { pedidoId, clienteNombre, total, formaPago, costo_materiales, observaciones, fecha_venta } = ventaData;
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

            // 4. Insertar detalles del pedido para trazabilidad completa
            if (venta && venta.id && ventaData.detalles && ventaData.detalles.length > 0) {
                for (const d of ventaData.detalles) {
                    await sql`
                        INSERT INTO detalles_venta (
                            venta_id, producto_id, cantidad, precio_unitario,
                            subtotal, producto_nombre, producto_codigo
                        ) VALUES (
                            ${venta.id}, null, ${d.cantidad || 1}, ${d.precio_unitario || d.subtotal || 0}, 
                            ${d.subtotal || 0},
                            ${d.nombre_producto || 'Producto Pedido'}, 
                            ${d.producto_codigo || `PED-${String(pedidoId).padStart(4, '0')}`}
                        )
                    `;
                }
            } else if (venta && venta.id) {
                // Fallback: un solo detalle si no hay lista
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
                        (
                            -- Lógica inteligente: Si solo hay un detalle y es un placeholder de pedido (PED-XXXX),
                            -- traemos los detalles reales del pedido. Si no, usamos detalles_venta.
                            SELECT json_agg(json_build_object(
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
                            FROM (
                                SELECT 
                                    dv.id, dv.producto_id, dv.cantidad, dv.precio_unitario, dv.subtotal, 
                                    dv.producto_nombre, dv.producto_codigo
                                FROM detalles_venta dv 
                                WHERE dv.venta_id = v.id 
                                AND NOT (
                                    v.origen_venta = 'pedido' 
                                    AND dv.producto_codigo LIKE 'PED-%'
                                    AND (SELECT COUNT(*) FROM detalles_venta WHERE venta_id = v.id) = 1
                                    AND EXISTS (SELECT 1 FROM detalles_pedido WHERE id_pedido = CAST(SUBSTRING(dv.producto_codigo FROM '[0-9]+') AS INTEGER))
                                )
                                UNION ALL
                                SELECT 
                                    dp.id_detalle as id, NULL as producto_id, dp.cantidad, dp.precio_unitario, 
                                    (dp.cantidad * dp.precio_unitario) as subtotal, 
                                    dp.nombre_producto as producto_nombre, 
                                    ('PED-' || LPAD(dp.id_pedido::text, 4, '0')) as producto_codigo
                                FROM detalles_pedido dp
                                JOIN detalles_venta dv ON dv.venta_id = v.id
                                WHERE v.origen_venta = 'pedido'
                                  AND dv.producto_codigo LIKE 'PED-%'
                                  AND (SELECT COUNT(*) FROM detalles_venta WHERE venta_id = v.id) = 1
                                  AND dp.id_pedido = CAST(SUBSTRING(dv.producto_codigo FROM '[0-9]+') AS INTEGER)
                            ) d
                            LEFT JOIN productos_externos p ON d.producto_id = p.id
                            LEFT JOIN produccion_taller pr ON d.producto_id IS NOT NULL AND CAST(NULLIF(p.produccion_id, '') AS INTEGER) = pr.id_produccion
                        ),
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
    // ─────────────────────────────────────────────────────────────
    // REPORTE DE POPULARIDAD (ranking calculado unificando Pedidos y Stock)
    // ─────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────
    // REPORTE DE POPULARIDAD v2 (Jerárquico y Limpio)
    // ─────────────────────────────────────────────────────────────
    async getPopularidadRanking(fechaInicio, fechaFin) {
        try {
            const rows = await sql`
                -- FUENTE 1: Pedidos (Producción Terminada)
                SELECT
                    COALESCE(NULLIF(TRIM(UPPER(pt.tipo_producto)), ''), 'SIN CLASIFICAR') AS tipo,
                    COALESCE(NULLIF(TRIM(UPPER(pt.metal)), ''), 'OTROS') AS metal,
                    SUM(pt.cantidad) AS unidades,
                    SUM(COALESCE(p.precio_total, 0)) AS ingreso,
                    SUM((COALESCE(pt.costo_materiales, 0) + COALESCE(pt.mano_de_obra, 0) + COALESCE(pt.costo_herramientas, 0) + COALESCE(pt.otros_gastos, 0)) * pt.cantidad) AS costo,
                    'pedido' AS origen
                FROM produccion_taller pt
                LEFT JOIN pedidos p ON pt.pedido_id = p.id_pedido
                WHERE pt.tipo_produccion = 'PEDIDO'
                  AND pt.estado_produccion = 'terminado'
                  AND pt.fecha_produccion::date BETWEEN ${fechaInicio}::date AND ${fechaFin}::date
                GROUP BY 1, 2

                UNION ALL

                -- FUENTE 2: Stock (Ventas Completadas)
                SELECT
                    COALESCE(NULLIF(TRIM(UPPER(pe.categoria)), ''), 'SIN CLASIFICAR') AS tipo,
                    COALESCE(NULLIF(TRIM(UPPER(pe.material)), ''), 'OTROS') AS metal,
                    SUM(dv.cantidad) AS unidades,
                    SUM(dv.subtotal::numeric) AS ingreso,
                    0 AS costo,
                    'stock' AS origen
                FROM detalles_venta dv
                JOIN ventas v ON v.id = dv.venta_id
                JOIN productos_externos pe ON pe.id = dv.producto_id
                WHERE v.estado = 'COMPLETADO'
                  AND v.origen_venta = 'stock'
                  AND v.fecha_venta::date BETWEEN ${fechaInicio}::date AND ${fechaFin}::date
                GROUP BY 1, 2
            `;

            const cleanMetal = (m) => {
                const val = m.toUpperCase();
                if (val === 'SIN METAL' || val === 'BISUTERÍA' || val === 'BISUTERIA' || val === 'OTROS') return 'OTROS';
                return m;
            };

            // Agrupación Jerárquica por TIPO
            const mapaTipos = {};
            for (const row of rows) {
                const tipo = row.tipo;
                const metal = cleanMetal(row.metal);
                
                if (!mapaTipos[tipo]) {
                    mapaTipos[tipo] = {
                        tipo_producto: tipo,
                        unidades: 0,
                        ingreso: 0,
                        costo: 0,
                        detalles: {} // Agrupado por metal
                    };
                }

                const t = mapaTipos[tipo];
                t.unidades += Number(row.unidades) || 0;
                t.ingreso  += Number(row.ingreso)  || 0;
                t.costo    += Number(row.costo)    || 0;

                if (!t.detalles[metal]) {
                    t.detalles[metal] = { metal: metal, unidades: 0, ingreso: 0, und_pedido: 0, und_stock: 0 };
                }
                const d = t.detalles[metal];
                d.unidades += Number(row.unidades) || 0;
                d.ingreso  += Number(row.ingreso)  || 0;
                if (row.origen === 'pedido') d.und_pedido += Number(row.unidades) || 0;
                if (row.origen === 'stock')  d.und_stock  += Number(row.unidades) || 0;
            }

            // Convertir a array y ordenar
            return Object.values(mapaTipos)
                .map(t => ({
                    ...t,
                    detalles: Object.values(t.detalles).sort((a, b) => b.unidades - a.unidades),
                    ganancia: t.ingreso - t.costo
                }))
                .sort((a, b) => b.unidades - a.unidades);

        } catch (error) {
            console.error('Error en getPopularidadRanking:', error);
            throw error;
        }
    }
};
