import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

// Helper: Generar código único de compra
export const generarCodigoCompra = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `CMP-${year}${month}${day}-${random}`;
};

export const comprasDB = {
    // Crear nueva compra (cabecera)
    async create(data) {
        try {
            const [compra] = await sql`
                INSERT INTO compras (
                    codigo_compra, 
                    fecha_compra, 
                    tipo_compra,
                    tipo_item,
                    proveedor_id,
                    observaciones
                ) VALUES (
                    ${data.codigo_compra},
                    ${data.fecha_compra},
                    ${data.tipo_compra || null},
                    ${data.tipo_item || null},
                    ${data.proveedor_id || null},
                    ${data.observaciones || null}
                )
                RETURNING *
            `;
            return compra;
        } catch (error) {
            console.error("Error creando compra:", error);
            throw error;
        }
    },

    // Obtener todas las compras
    async getAll() {
        try {
            return await sql`
                SELECT * FROM compras 
                ORDER BY fecha_compra DESC
            `;
        } catch (error) {
            console.error("Error obteniendo compras:", error);
            throw error;
        }
    },

    // Obtener por tipo
    async getByTipo(tipo) {
        try {
            return await sql`
                SELECT * FROM compras 
                WHERE tipo_compra = ${tipo}
                ORDER BY fecha_compra DESC
            `;
        } catch (error) {
            console.error("Error obteniendo compras por tipo:", error);
            throw error;
        }
    },

    // Obtener compras con información de productos
    async getWithProducts() {
        try {
            return await sql`
                SELECT 
                    c.*,
                    p.nombre as producto_nombre,
                    p.codigo_usuario as producto_codigo
                FROM compras c
                LEFT JOIN productos_externos p ON p.id::text = c.producto_id::text
                ORDER BY c.fecha_compra DESC
            `;
        } catch (error) {
            console.error("Error obteniendo compras con productos:", error);
            throw error;
        }
    },

    // Obtener por ID
    async getById(id) {
        try {
            const [compra] = await sql`
                SELECT 
                    c.*,
                    p.nombre as producto_nombre,
                    p.codigo_usuario as producto_codigo,
                    p.imagen_url as producto_imagen
                FROM compras c
                LEFT JOIN productos_externos p ON p.id::text = c.producto_id::text
                WHERE c.id = ${id}
            `;
            return compra;
        } catch (error) {
            console.error("Error obteniendo compra por ID:", error);
            throw error;
        }
    },

    // Eliminar compra
    async delete(id) {
        try {
            await sql`DELETE FROM compras WHERE id = ${id}`;
        } catch (error) {
            console.error("Error eliminando compra:", error);
            throw error;
        }
    },

    // Estadísticas
    async getStats() {
        try {
            const [stats] = await sql`
                SELECT 
                    COUNT(*) as total_compras,
                    SUM(CASE WHEN tipo_compra = 'MATERIAL' THEN total ELSE 0 END) as total_materiales,
                    SUM(CASE WHEN tipo_compra = 'PRODUCTO' THEN total ELSE 0 END) as total_productos,
                    SUM(total) as total_general
                FROM compras
                WHERE EXTRACT(MONTH FROM fecha_compra) = EXTRACT(MONTH FROM CURRENT_DATE)
                  AND EXTRACT(YEAR FROM fecha_compra) = EXTRACT(YEAR FROM CURRENT_DATE)
            `;
            return stats;
        } catch (error) {
            console.error("Error obteniendo estadísticas:", error);
            throw error;
        }
    }
};
