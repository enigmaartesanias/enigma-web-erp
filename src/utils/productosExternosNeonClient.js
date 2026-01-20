import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const productosExternosDB = {
  async getAll() {
    // Retorna solo productos activos (2026 en adelante)
    const productos = await sql`
      SELECT * FROM productos_externos 
      WHERE estado_activo = TRUE 
      ORDER BY fecha_registro DESC
    `;
    return productos;
  },

  async getById(id) {
    const [producto] = await sql`SELECT * FROM productos_externos WHERE id = ${id}`;
    return producto;
  },

  async getByCodigo(codigo) {
    const [producto] = await sql`SELECT * FROM productos_externos WHERE codigo_usuario = ${codigo}`;
    return producto;
  },

  async create(data) {
    const [producto] = await sql`
        INSERT INTO productos_externos (
          codigo_usuario,
          nombre,
          categoria,
          descripcion,
          costo,
          precio,
          stock_actual,
          stock_minimo,
          unidad,
          imagen_url,
          precio_adicional,
          origen,
          produccion_id
        ) VALUES (
          ${data.codigo_usuario},
          ${data.nombre},
          ${data.categoria},
          ${data.descripcion || ''},
          ${data.costo || 0},
          ${data.precio || 0},
          ${data.stock_actual || 0},
          ${data.stock_minimo || 5},
          ${data.unidad || 'Unidad'},
          ${data.imagen_url || null},
          ${data.precio_adicional || null},
          ${data.origen || 'COMPRA'},
          ${data.produccion_id || null}
        )
        RETURNING *
      `;
    return producto;
  },

  async update(id, data) {
    const [producto] = await sql`
        UPDATE productos_externos SET
          codigo_usuario = ${data.codigo_usuario},
          nombre = ${data.nombre},
          categoria = ${data.categoria},
          descripcion = ${data.descripcion},
          costo = ${data.costo},
          precio = ${data.precio},
          stock_actual = ${data.stock_actual},
          stock_minimo = ${data.stock_minimo},
          unidad = ${data.unidad},
          imagen_url = ${data.imagen_url}
        WHERE id = ${id}
        RETURNING *
      `;
    return producto;
  },

  async delete(id) {
    const [producto] = await sql`DELETE FROM productos_externos WHERE id = ${id} RETURNING *`;
    return producto;
  },

  // Buscar productos por nombre o código
  async search(query) {
    try {
      const productos = await sql`
        SELECT * FROM productos_externos
        WHERE 
          estado_activo = TRUE AND (
            LOWER(nombre) LIKE ${`%${query.toLowerCase()}%`}
            OR LOWER(codigo_usuario) LIKE ${`%${query.toLowerCase()}%`}
          )
        ORDER BY nombre
        LIMIT 10
      `;
      return productos;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  },

  // Actualizar solo el stock
  async updateStock(id, newStock) {
    try {
      const [producto] = await sql`
        UPDATE productos_externos 
        SET stock_actual = ${newStock}
        WHERE id = ${id}
        RETURNING *
      `;
      return producto;
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  },

  // Incrementar stock
  async incrementStock(id, cantidad) {
    try {
      const [producto] = await sql`
        UPDATE productos_externos 
        SET stock_actual = stock_actual + ${cantidad}
        WHERE id = ${id}
        RETURNING *
      `;
      return producto;
    } catch (error) {
      console.error('Error incrementando stock:', error);
      throw error;
    }
  },

  // Proceso especial: Enviar desde Producción a Stock (Actualiza o Crea)
  async enviarAStock(data) {
    const { codigo, cantidad, precio, precioReferencial, produccionId, tipo_producto } = data;

    // Buscar si ya existe el producto
    const [producto] = await sql`SELECT * FROM productos_externos WHERE codigo_usuario = ${codigo} AND estado_activo = TRUE`;

    if (producto) {
      // CASO A: ACTUALIZAR EXISTENTE (Incrementar stock)
      const [result] = await sql`
        UPDATE productos_externos SET
          stock_actual = stock_actual + ${cantidad},
          fecha_registro = CURRENT_TIMESTAMP,
          origen = 'PRODUCCION',
          produccion_id = ${produccionId},
          precio = COALESCE(${precio}, precio),
          precio_adicional = COALESCE(${precioReferencial}, precio_adicional)
        WHERE id = ${producto.id}
        RETURNING *
      `;
      return result;
    } else {
      // CASO B: CREAR NUEVO (Si el código no existe)
      const [result] = await sql`
        INSERT INTO productos_externos (
          codigo_usuario,
          nombre,
          categoria,
          costo,
          precio,
          stock_actual,
          stock_minimo,
          origen,
          produccion_id,
          precio_adicional,
          fecha_registro,
          estado_activo
        ) VALUES (
          ${codigo},
          ${`${tipo_producto} - ${codigo}`},
          ${tipo_producto.toUpperCase()},
          0,
          ${precio || 0},
          ${cantidad},
          5,
          'PRODUCCION',
          ${produccionId},
          ${precioReferencial || null},
          CURRENT_TIMESTAMP,
          TRUE
        )
        RETURNING *
      `;
      return result;
    }
  }
};

export const CATEGORIAS_EXTERNAS = [
  'Aretes',
  'Pulseras',
  'Collares',
  'Anillos',
  'Juegos',
  'Dijes',
  'Cadenas',
  'Tobilleras',
  'Accesorios',
  'Empaques',
  'Otros'
];

export const UNIDADES = [
  'Unidad',
  'Par',
  'Juego',
  'Docena',
  'Ciento',
  'Metro',
  'Kg',
  'Gramo'
];
