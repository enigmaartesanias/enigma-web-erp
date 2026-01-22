// Cliente de Neon DB para el sistema de pedidos
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL no está configurada');
}

const sql = neon(DATABASE_URL);

// Helper para queries de pedidos
export const pedidosDB = {
  // Obtener todos los pedidos con sus relaciones
  async getAll() {
    console.log('🔄 DEBUG: Iniciando getAll() en Neon Client...');
    try {
      const pedidos = await sql`

      SELECT 
        p.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id_detalle', d.id_detalle,
            'nombre_producto', d.nombre_producto,
            'cantidad', d.cantidad,
            'precio_unitario', d.precio_unitario,
            'tipo_producto', d.tipo_producto,
            'metal', d.metal
          )) FILTER (WHERE d.id_detalle IS NOT NULL),
          '[]'::json
        ) as detalles_pedido,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', pa.id,
            'monto', pa.monto,
            'fecha_pago', pa.fecha_pago,
            'metodo_pago', pa.metodo_pago,
            'referencia', pa.referencia
          )) FILTER (WHERE pa.id IS NOT NULL),
          '[]'::json
        ) as pagos,
        EXISTS (
          SELECT 1 FROM produccion_taller pt 
          WHERE pt.pedido_id = p.id_pedido 
          AND pt.estado_produccion != 'terminado'
        ) as en_produccion,
        -- NUEVO: Calcular estado de producción dinámicamente
        CASE
          WHEN NOT EXISTS (
            SELECT 1 FROM produccion_taller pt WHERE pt.pedido_id = p.id_pedido
          ) THEN COALESCE(p.estado_produccion, 'no_iniciado')
          WHEN NOT EXISTS (
            SELECT 1 FROM produccion_taller pt 
            WHERE pt.pedido_id = p.id_pedido 
            AND pt.estado_produccion != 'terminado'
          ) THEN 'terminado'
          WHEN NOT EXISTS (
            SELECT 1 FROM produccion_taller pt 
            WHERE pt.pedido_id = p.id_pedido 
            AND pt.estado_produccion IN ('en_proceso', 'terminado')
          ) THEN 'no_iniciado'
          ELSE 'en_proceso'
        END as estado_produccion_calculado,
        -- Verificar si hay productos del pedido que aún no están en producción
        EXISTS (
          SELECT 1 
          FROM detalles_pedido dp
          LEFT JOIN produccion_taller pt ON pt.pedido_id = p.id_pedido 
            AND pt.nombre_producto LIKE '%' || dp.nombre_producto || '%'
          WHERE dp.id_pedido = p.id_pedido
            AND pt.id_produccion IS NULL
        ) as tiene_productos_pendientes
      FROM pedidos p
      LEFT JOIN detalles_pedido d ON p.id_pedido = d.id_pedido
      LEFT JOIN pagos pa ON p.id_pedido = pa.id_pedido 
      GROUP BY p.id_pedido
      ORDER BY p.fecha_pedido DESC
    `;

      // Convertir strings numéricos a números
      return pedidos.map(p => ({
        ...p,
        en_produccion: p.en_produccion || false,
        estado_pedido: p.estado_pedido || 'aceptado',
        estado_produccion: p.estado_produccion_calculado || p.estado_produccion || 'no_iniciado',
        precio_total_sin_igv: parseFloat(p.precio_total_sin_igv) || 0,
        precio_total: parseFloat(p.precio_total) || 0,
        monto_a_cuenta: parseFloat(p.monto_a_cuenta) || 0,
        monto_igv: parseFloat(p.monto_igv) || 0,
        monto_saldo: parseFloat(p.monto_saldo) || 0,
        envio_cobrado_al_cliente: parseFloat(p.envio_cobrado_al_cliente) || 0,
        envio_referencia: parseFloat(p.envio_referencia) || 0,
        detalles_pedido: p.detalles_pedido?.map(d => ({
          ...d,
          cantidad: parseInt(d.cantidad) || 0,
          precio_unitario: parseFloat(d.precio_unitario) || 0
        })) || [],
        pagos: p.pagos?.map(pg => ({
          ...pg,
          monto: parseFloat(pg.monto) || 0
        })) || []
      }));
    } catch (error) {
      console.error('❌ ERROR CRÍTICO en getAll:', error);
      console.error('URL Env:', import.meta.env.VITE_DATABASE_URL ? 'DEFINIDA' : 'FALTANTE');
      return [];
    }
  },

  // Crear nuevo pedido
  async create(pedidoData) {
    const [pedido] = await sql`
      INSERT INTO pedidos (
        nombre_cliente, telefono, dni_ruc, direccion_entrega,
        metal, tipo_producto,
        forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
        envio_cobrado_al_cliente, envio_referencia,
        precio_total_sin_igv, precio_total, monto_a_cuenta,
        monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
        estado_pedido, estado_produccion
      ) VALUES (
        ${pedidoData.nombre_cliente}, ${pedidoData.telefono}, ${pedidoData.dni_ruc},
        ${pedidoData.direccion_entrega},
        ${pedidoData.metal}, ${pedidoData.tipo_producto},
        ${pedidoData.forma_pago}, ${pedidoData.comprobante_pago},
        ${pedidoData.requiere_envio}, ${pedidoData.modalidad_envio},
        ${pedidoData.envio_cobrado_al_cliente}, ${pedidoData.envio_referencia || 0},
        ${pedidoData.precio_total_sin_igv}, ${pedidoData.precio_total}, ${pedidoData.monto_a_cuenta},
        ${pedidoData.monto_igv}, ${pedidoData.monto_saldo}, ${pedidoData.entregado || false},
        ${pedidoData.cancelado}, ${pedidoData.incluye_igv},
        ${pedidoData.estado_pedido || 'aceptado'}, ${pedidoData.estado_produccion || 'no_iniciado'}
      )
      RETURNING *
    `;
    return pedido;
  },

  // Actualizar pedido
  async update(id, pedidoData) {
    const [pedido] = await sql`
      UPDATE pedidos SET
        nombre_cliente = ${pedidoData.nombre_cliente},
        telefono = ${pedidoData.telefono},
        dni_ruc = ${pedidoData.dni_ruc},
        direccion_entrega = ${pedidoData.direccion_entrega},
        metal = ${pedidoData.metal},
        tipo_producto = ${pedidoData.tipo_producto},
        forma_pago = ${pedidoData.forma_pago},
        comprobante_pago = ${pedidoData.comprobante_pago},
        requiere_envio = ${pedidoData.requiere_envio},
        modalidad_envio = ${pedidoData.modalidad_envio},
        envio_cobrado_al_cliente = ${pedidoData.envio_cobrado_al_cliente},
        envio_referencia = ${pedidoData.envio_referencia || 0},
        precio_total_sin_igv = ${pedidoData.precio_total_sin_igv},
        precio_total = ${pedidoData.precio_total},
        monto_a_cuenta = ${pedidoData.monto_a_cuenta},
        monto_igv = ${pedidoData.monto_igv},
        monto_saldo = ${pedidoData.monto_saldo},
        entregado = ${pedidoData.entregado || false},
        cancelado = ${pedidoData.cancelado},
        incluye_igv = ${pedidoData.incluye_igv},
        estado_pedido = ${pedidoData.estado_pedido},
        estado_produccion = ${pedidoData.estado_produccion},
        updated_at = CURRENT_TIMESTAMP
      WHERE id_pedido = ${id}
      RETURNING *
    `;
    return pedido;
  },

  // Eliminar pedido
  async delete(id) {
    // Los detalles y pagos se eliminan automáticamente por CASCADE
    await sql`DELETE FROM pedidos WHERE id_pedido = ${id}`;
  },

  // Crear detalles de pedido
  async createDetalles(pedidoId, detalles) {
    for (const detalle of detalles) {
      await sql`
        INSERT INTO detalles_pedido (
          id_pedido, 
          nombre_producto, 
          cantidad, 
          precio_unitario,
          metal,
          tipo_producto
        )
        VALUES (
          ${pedidoId}, 
          ${detalle.nombre_producto}, 
          ${detalle.cantidad}, 
          ${detalle.precio_unitario},
          ${detalle.metal || null},
          ${detalle.tipo_producto || null}
        )
      `;
    }
  },

  // Eliminar todos los detalles de un pedido
  async deleteDetalles(pedidoId) {
    await sql`DELETE FROM detalles_pedido WHERE id_pedido = ${pedidoId}`;
  },

  // Obtener detalles (productos) de un pedido
  async getDetalles(pedidoId) {
    const detalles = await sql`
      SELECT * FROM detalles_pedido 
      WHERE id_pedido = ${pedidoId}
      ORDER BY id_detalle
    `;
    return detalles.map(d => ({
      ...d,
      cantidad: parseInt(d.cantidad) || 0,
      precio_unitario: parseFloat(d.precio_unitario) || 0
    }));
  },

  // Crear pago
  async createPago(pagoData) {
    const [pago] = await sql`
      INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
      VALUES (${pagoData.id_pedido}, ${pagoData.monto}, ${pagoData.fecha_pago}, 
              ${pagoData.metodo_pago}, ${pagoData.referencia || ''})
      RETURNING *
    `;
    return pago;
  },

  // Actualizar estado del pedido
  async updateEstadoPedido(id, nuevoEstado, fechaEntrega = null) {
    const [pedido] = await sql`
      UPDATE pedidos 
      SET estado_pedido = ${nuevoEstado},
          fecha_entrega = ${nuevoEstado === 'entregado' && fechaEntrega ? fechaEntrega : sql`fecha_entrega`}
      WHERE id_pedido = ${id}
      RETURNING *
    `;
    return pedido;
  },

  // ELIMINACIÓN DE PEDIDO COMPLETO (SOLO DESDE PRODUCCIÓN)
  async eliminarPedidoCompleto(id) {
    console.log(`⚠️ Iniciando eliminación total del pedido #${id}`);
    try {
      // 1. Eliminar de produccion_taller
      await sql`DELETE FROM produccion_taller WHERE pedido_id = ${id}`;
      console.log('✅ Registros de producción eliminados');

      // 2. Eliminar pagos
      await sql`DELETE FROM pagos WHERE id_pedido = ${id}`;
      console.log('✅ Registros de pagos eliminados');

      // 3. Eliminar detalles del pedido (por si acaso no hay CASCADE)
      await sql`DELETE FROM detalles_pedido WHERE id_pedido = ${id}`;
      console.log('✅ Detalles del pedido eliminados');

      // 4. Eliminar el pedido
      const [deleted] = await sql`DELETE FROM pedidos WHERE id_pedido = ${id} RETURNING id_pedido`;
      console.log('✅ Registro del pedido eliminado definitivamente');

      return deleted;
    } catch (error) {
      console.error('❌ Error en eliminación total:', error);
      throw error;
    }
  }
};

export default sql;
