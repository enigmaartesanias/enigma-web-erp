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

  async getAllConsolidated() {
    const productos = await this.getAll();
    const map = {};

    productos.forEach(p => {
      const codigo = p.codigo_usuario;
      if (!map[codigo]) {
        map[codigo] = {
          ...p,
          stock_actual: Number(p.stock_actual) || 0,
          costo: Number(p.costo) || 0,
          precio: Number(p.precio) || 0
        };
      } else {
        map[codigo].stock_actual += (Number(p.stock_actual) || 0);
        // Keep most recent info or defaults if needed, logic matches Inventario.jsx
        map[codigo].nombre = p.nombre || map[codigo].nombre;
        map[codigo].categoria = p.categoria || map[codigo].categoria;
        map[codigo].precio = p.precio || map[codigo].precio;
        map[codigo].costo = (Number(p.costo) || map[codigo].costo);
        map[codigo].codigo_produccion_origen = p.codigo_produccion_origen || map[codigo].codigo_produccion_origen;
        map[codigo].material = p.material || map[codigo].material;
        map[codigo].imagen_url = p.imagen_url || map[codigo].imagen_url;
      }
    });
    return Object.values(map);
  },

  async getByCodigoConsolidated(codigo) {
    const productos = await sql`SELECT * FROM productos_externos WHERE codigo_usuario = ${codigo} AND estado_activo = TRUE`;
    if (!productos || productos.length === 0) return null;

    const consolidated = {
      ...productos[0],
      stock_actual: 0,
      costo: Number(productos[0].costo) || 0,
      precio: Number(productos[0].precio) || 0
    };

    productos.forEach(p => {
      consolidated.stock_actual += (Number(p.stock_actual) || 0);
      // Ensure we have valid values usually from the most relevant row? 
      // Current logic takes base from row 0. We can sum or average others if needed but user said "suma total" for quantity.
    });

    return consolidated;
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
          material,
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
          ${data.material || ''},
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
          material = ${data.material || ''},
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
    const { codigo, cantidad, precio, precioReferencial, produccionId, tipo_producto, costo, material, imagen_url } = data;

    // Buscar si ya existe el producto
    const [producto] = await sql`SELECT * FROM productos_externos WHERE codigo_usuario = ${codigo} AND estado_activo = TRUE`;

    if (producto) {
      // CASO A: ACTUALIZAR EXISTENTE (Incrementar stock y actualizar costos/precios)
      const [result] = await sql`
        UPDATE productos_externos SET
          stock_actual = stock_actual + ${cantidad},
          fecha_registro = CURRENT_TIMESTAMP,
          produccion_id = ${produccionId},
          codigo_produccion_origen = COALESCE(${data.codigo_produccion}, codigo_produccion_origen),
          costo = ${costo || 0},
          precio = COALESCE(${precio}, precio),
          precio_adicional = COALESCE(${precioReferencial}, precio_adicional),
          categoria = COALESCE(${tipo_producto?.toUpperCase()}, categoria),
          material = COALESCE(${material}, material),
          imagen_url = COALESCE(${imagen_url}, imagen_url)
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
          material,
          costo,
          precio,
          stock_actual,
          stock_minimo,
          imagen_url,
          origen,
          produccion_id,
          codigo_produccion_origen,
          precio_adicional,
          fecha_registro,
          estado_activo
        ) VALUES (
          ${codigo},
          ${data.nombre || `${tipo_producto} - ${codigo}`},
          ${data.categoria || tipo_producto?.toUpperCase()},
          ${material || ''},
          ${costo || 0},
          ${precio || 0},
          ${cantidad},
          0,
          ${imagen_url || null},
          'PRODUCCION',
          ${produccionId},
          ${data.codigo_produccion || null},
          ${precioReferencial || null},
          CURRENT_TIMESTAMP,
          TRUE
        )
        RETURNING *
      `;
      return result;
    }
  },

  // Verificar si un código ya existe en inventario (para feedback en tiempo real)
  async checkCodigo(codigo) {
    if (!codigo) return { exists: false };
    const [p] = await sql`
      SELECT id, nombre, stock_actual, precio
      FROM productos_externos
      WHERE codigo_usuario = ${codigo.toUpperCase()} AND estado_activo = TRUE
      LIMIT 1
    `;
    return p
      ? { exists: true, stockActual: Number(p.stock_actual) || 0, nombre: p.nombre, precio: Number(p.precio) || 0 }
      : { exists: false };
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
