import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const productosExternosDB = {
  async getAll() {
    // Retorna todos los productos ordenados por fecha creación
    const productos = await sql`SELECT * FROM productos_externos ORDER BY fecha_registro DESC`;
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
          imagen_url
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
          ${data.imagen_url || null}
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
          LOWER(nombre) LIKE ${`%${query.toLowerCase()}%`}
          OR LOWER(codigo_usuario) LIKE ${`%${query.toLowerCase()}%`}
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
