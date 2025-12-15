// Cliente unificado de Neon DB para todas las tablas
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ VITE_DATABASE_URL no está configurada');
}

const sql = neon(DATABASE_URL);

// Helper para parsear valores numéricos
const parseNumeric = (value) => parseFloat(value) || 0;
const parseInt = (value) => parseInt(value) || 0;

// ========================================
// PRODUCTOS
// ========================================
export const productosDB = {
    async getAll() {
        const productos = await sql`SELECT * FROM productos ORDER BY id DESC`;
        return productos.map(p => ({
            ...p,
            precio: parseNumeric(p.precio),
            precio_oferta: p.precio_oferta ? parseNumeric(p.precio_oferta) : null,
            precio_mayorista: p.precio_mayorista ? parseNumeric(p.precio_mayorista) : null,
            stock: parseInt(p.stock)
        }));
    },

    async getById(id) {
        const [producto] = await sql`SELECT * FROM productos WHERE id = ${id}`;
        if (!producto) return null;
        return {
            ...producto,
            precio: parseNumeric(producto.precio),
            precio_oferta: producto.precio_oferta ? parseNumeric(producto.precio_oferta) : null,
            precio_mayorista: producto.precio_mayorista ? parseNumeric(producto.precio_mayorista) : null,
            stock: parseInt(producto.stock)
        };
    },

    async getByCategoria(categoriaId) {
        const productos = await sql`
      SELECT * FROM productos 
      WHERE categoria_id = ${categoriaId} AND activo = true
      ORDER BY id DESC
    `;
        return productos.map(p => ({
            ...p,
            precio: parseNumeric(p.precio),
            precio_oferta: p.precio_oferta ? parseNumeric(p.precio_oferta) : null,
            precio_mayorista: p.precio_mayorista ? parseNumeric(p.precio_mayorista) : null,
            stock: parseInt(p.stock)
        }));
    },

    async create(data) {
        const [producto] = await sql`
      INSERT INTO productos (
        nombre, categoria_id, precio, descripcion, imagen_url,
        material, stock, precio_oferta, precio_mayorista, activo, destacado
      ) VALUES (
        ${data.nombre}, ${data.categoria_id}, ${data.precio}, ${data.descripcion || ''},
        ${data.imagen_url || ''}, ${data.material || ''}, ${data.stock || 0},
        ${data.precio_oferta || null}, ${data.precio_mayorista || null},
        ${data.activo !== undefined ? data.activo : true},
        ${data.destacado || false}
      )
      RETURNING *
    `;
        return producto;
    },

    async update(id, data) {
        const [producto] = await sql`
      UPDATE productos SET
        nombre = ${data.nombre},
        categoria_id = ${data.categoria_id},
        precio = ${data.precio},
        descripcion = ${data.descripcion || ''},
        imagen_url = ${data.imagen_url || ''},
        material = ${data.material || ''},
        stock = ${data.stock || 0},
        precio_oferta = ${data.precio_oferta || null},
        precio_mayorista = ${data.precio_mayorista || null},
        activo = ${data.activo !== undefined ? data.activo : true},
        destacado = ${data.destacado || false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
        return producto;
    },

    async delete(id) {
        await sql`DELETE FROM productos WHERE id = ${id}`;
    }
};

// ========================================
// CATEGORÍAS
// ========================================
export const categoriasDB = {
    async getAll() {
        return await sql`SELECT * FROM categorias ORDER BY orden, id`;
    },

    async getById(id) {
        const [categoria] = await sql`SELECT * FROM categorias WHERE id = ${id}`;
        return categoria;
    },

    async create(data) {
        const [categoria] = await sql`
      INSERT INTO categorias (nombre, descripcion, imagen_url, orden, activo)
      VALUES (${data.nombre}, ${data.descripcion || ''}, ${data.imagen_url || ''}, 
              ${data.orden || 0}, ${data.activo !== undefined ? data.activo : true})
      RETURNING *
    `;
        return categoria;
    },

    async update(id, data) {
        const [categoria] = await sql`
      UPDATE categorias SET
        nombre = ${data.nombre},
        descripcion = ${data.descripcion || ''},
        imagen_url = ${data.imagen_url || ''},
        orden = ${data.orden || 0},
        activo = ${data.activo !== undefined ? data.activo : true}
      WHERE id = ${id}
      RETURNING *
    `;
        return categoria;
    },

    async delete(id) {
        await sql`DELETE FROM categorias WHERE id = ${id}`;
    }
};

// ========================================
// STOCK
// ========================================
export const stockDB = {
    async getAll() {
        const stock = await sql`
      SELECT s.*, p.nombre as producto_nombre
      FROM stock_tienda s
      LEFT JOIN productos p ON s.producto_id = p.id
      ORDER BY s.ultima_actualizacion DESC
    `;
        return stock.map(s => ({
            ...s,
            cantidad: parseInt(s.cantidad)
        }));
    },

    async getByProducto(producto_id) {
        const [stock] = await sql`
      SELECT * FROM stock_tienda WHERE producto_id = ${producto_id}
    `;
        return stock;
    },

    async create(data) {
        const [stock] = await sql`
      INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion)
      VALUES (${data.producto_id}, ${data.cantidad}, CURRENT_TIMESTAMP)
      RETURNING *
    `;
        return stock;
    },

    async update(id, data) {
        const [stock] = await sql`
      UPDATE stock_tienda SET
        cantidad = ${data.cantidad},
        ultima_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
        return stock;
    },

    async delete(id) {
        await sql`DELETE FROM stock_tienda WHERE id = ${id}`;
    }
};

// ========================================
// CAROUSEL
// ========================================
export const carouselDB = {
    async getAll() {
        return await sql`SELECT * FROM carousel_items ORDER BY orden, id`;
    },

    async getActive() {
        return await sql`SELECT * FROM carousel_items WHERE activo = true ORDER BY orden`;
    },

    async create(data) {
        const [item] = await sql`
      INSERT INTO carousel_items (imagen_url, titulo, descripcion, orden, activo, link)
      VALUES (${data.imagen_url}, ${data.titulo || ''}, ${data.descripcion || ''}, 
              ${data.orden || 0}, ${data.activo !== undefined ? data.activo : true}, ${data.link || ''})
      RETURNING *
    `;
        return item;
    },

    async update(id, data) {
        const [item] = await sql`
      UPDATE carousel_items SET
        imagen_url = ${data.imagen_url},
        titulo = ${data.titulo || ''},
        descripcion = ${data.descripcion || ''},
        orden = ${data.orden || 0},
        activo = ${data.activo !== undefined ? data.activo : true},
        link = ${data.link || ''}
      WHERE id = ${id}
      RETURNING *
    `;
        return item;
    },

    async delete(id) {
        await sql`DELETE FROM carousel_items WHERE id = ${id}`;
    }
};

// ========================================
// MATERIALES
// ========================================
export const materialesDB = {
    async getAll() {
        return await sql`SELECT * FROM materiales WHERE activo = true ORDER BY nombre`;
    }
};

// Exportar cliente SQL base
export default sql;
