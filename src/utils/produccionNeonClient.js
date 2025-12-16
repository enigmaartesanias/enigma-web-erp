// Cliente de Neon DB para Producción (Rediseñado)
// Producción = Solo costos, NO precios ni ganancias
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL no está configurada');
}

const sql = neon(DATABASE_URL);

// Constantes
const METALES = ['Plata', 'Alpaca', 'Cobre', 'Bronce'];
const TIPOS_PRODUCTO = ['Anillo', 'Arete', 'Collar', 'Pulsera'];

// Helper para queries de producción
export const produccionDB = {
  // ========================================
  // PRODUCCIÓN
  // ========================================

  async getAll() {
    const produccion = await sql`
      SELECT * FROM v_produccion_con_precios
      ORDER BY fecha_produccion DESC, created_at DESC
    `;

    // Convertir fechas y números
    return produccion.map(p => ({
      ...p,
      fecha_produccion: p.fecha_produccion ?
        (typeof p.fecha_produccion === 'string' ? p.fecha_produccion : new Date(p.fecha_produccion).toISOString().split('T')[0])
        : null,
      cantidad: parseInt(p.cantidad) || 0,
      costo_materiales: parseFloat(p.costo_materiales) || 0,
      horas_trabajo: parseFloat(p.horas_trabajo) || 0,
      costo_hora: parseFloat(p.costo_hora) || 0,
      costo_herramientas: parseFloat(p.costo_herramientas) || 0,
      otros_gastos: parseFloat(p.otros_gastos) || 0,
      costo_mano_obra: parseFloat(p.costo_mano_obra) || 0,
      costo_total_unitario: parseFloat(p.costo_total_unitario) || 0,
      costo_total_produccion: parseFloat(p.costo_total_produccion) || 0,
      ganancia_estimada_pedido: p.ganancia_estimada_pedido ? parseFloat(p.ganancia_estimada_pedido) : null
    }));
  },

  async getById(id) {
    const [produccion] = await sql`
      SELECT * FROM v_produccion_con_precios
      WHERE id_produccion = ${id}
    `;
    return produccion;
  },

  // Crear producción desde pedido
  async createFromPedido(pedidoId, costos = {}) {
    // Obtener datos del pedido
    const [pedido] = await sql`
      SELECT metal, tipo_producto, nombre_cliente FROM pedidos
      WHERE id_pedido = ${pedidoId}
    `;

    if (!pedido) throw new Error('Pedido no encontrado');

    const [produccion] = await sql`
      INSERT INTO produccion_taller (
        pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto,
        cantidad, costo_materiales, horas_trabajo, costo_hora,
        costo_herramientas, otros_gastos, estado_produccion, observaciones
      ) VALUES (
        ${pedidoId},
        'PEDIDO',
        ${pedido.metal || 'Plata'},
        ${pedido.tipo_producto || 'Anillo'},
        ${pedido.nombre_cliente + ' - Pedido ' + pedidoId},
        ${costos.cantidad || 1},
        ${costos.costo_materiales || 0},
        ${costos.horas_trabajo || 0},
        ${costos.costo_hora || 0},
        ${costos.costo_herramientas || 0},

        'pendiente',
        ${costos.observaciones || 'Producción creada desde pedido'}
      )
      RETURNING *
    `;
    return produccion;
  },

  // Crear producción para stock
  async create(produccionData) {
    const [produccion] = await sql`
      INSERT INTO produccion_taller (
        pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto,
        cantidad, costo_materiales, horas_trabajo, costo_hora,
        costo_herramientas, otros_gastos, estado_produccion, observaciones, fecha_produccion
      ) VALUES (
        ${produccionData.pedido_id || null},
        ${produccionData.tipo_produccion || 'STOCK'},
        ${produccionData.metal},
        ${produccionData.tipo_producto},
        ${produccionData.nombre_producto || ''},
        ${produccionData.cantidad || 1},
        ${produccionData.costo_materiales || 0},
        ${produccionData.horas_trabajo || 0},
        ${produccionData.costo_hora || 0},
        ${produccionData.costo_herramientas || 0},
        ${produccionData.otros_gastos || 0},
        ${produccionData.estado_produccion || 'pendiente'},
        ${produccionData.observaciones || ''},
        ${produccionData.fecha_produccion || new Date().toISOString().split('T')[0]}
      )
      RETURNING *
    `;
    return produccion;
  },

  async update(id, produccionData) {
    const [produccion] = await sql`
      UPDATE produccion_taller SET
        metal = ${produccionData.metal},
        tipo_producto = ${produccionData.tipo_producto},
        nombre_producto = ${produccionData.nombre_producto},
        cantidad = ${produccionData.cantidad},
        costo_materiales = ${produccionData.costo_materiales || 0},
        horas_trabajo = ${produccionData.horas_trabajo || 0},
        costo_hora = ${produccionData.costo_hora || 0},
        costo_herramientas = ${produccionData.costo_herramientas || 0},
        otros_gastos = ${produccionData.otros_gastos || 0},
        estado_produccion = ${produccionData.estado_produccion},
        observaciones = ${produccionData.observaciones || ''}
      WHERE id_produccion = ${id}
      RETURNING *
    `;
    return produccion;
  },

  async updateEstado(id, nuevoEstado) {
    const [produccion] = await sql`
      UPDATE produccion_taller SET
        estado_produccion = ${nuevoEstado}
      WHERE id_produccion = ${id}
      RETURNING *
    `;
    return produccion;
  },

  async delete(id) {
    await sql`DELETE FROM produccion_taller WHERE id_produccion = ${id}`;
  },

  // ========================================
  // PEDIDOS PENDIENTES (para selector)
  // ========================================

  async getPedidosPendientes() {
    const productos = await sql`
      SELECT 
        p.id_pedido,
        p.nombre_cliente,
        p.telefono,
        p.metal,
        p.tipo_producto,
        p.fecha_pedido,
        d.id_detalle,
        d.nombre_producto,
        d.cantidad,
        d.precio_unitario
      FROM pedidos p
      INNER JOIN detalles_pedido d ON p.id_pedido = d.id_pedido
      LEFT JOIN produccion_taller pr ON pr.pedido_id = p.id_pedido 
        AND pr.nombre_producto LIKE '%' || d.nombre_producto || '%'
      WHERE p.cancelado = false
        AND pr.id_produccion IS NULL
      ORDER BY p.fecha_pedido DESC, d.id_detalle
    `;

    return productos.map(prod => ({
      ...prod,
      cantidad: parseInt(prod.cantidad) || 1,
      precio_unitario: parseFloat(prod.precio_unitario) || 0
    }));
  },

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  async getStats() {
    const [stats] = await sql`
      SELECT
        COUNT(*) as total_registros,
        COUNT(*) FILTER (WHERE estado_produccion = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado_produccion = 'en_proceso') as en_proceso,
        COUNT(*) FILTER (WHERE estado_produccion = 'terminado') as terminados
      FROM v_produccion_con_precios
      WHERE fecha_produccion >= CURRENT_DATE - INTERVAL '30 days'
    `;

    return {
      total_registros: parseInt(stats.total_registros) || 0,
      pendientes: parseInt(stats.pendientes) || 0,
      en_proceso: parseInt(stats.en_proceso) || 0,
      terminados: parseInt(stats.terminados) || 0
    };
  }
};

// Exportar constantes
export { METALES, TIPOS_PRODUCTO };
export default sql;
