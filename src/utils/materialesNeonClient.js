import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const materialesDB = {
    // Crear compra de materiales
    async create(data) {
        try {
            const [compra] = await sql`
                INSERT INTO materiales_compras (
                    codigo_compra, fecha_compra, proveedor_id, total, observaciones
                ) VALUES (
                    ${data.codigo_compra},
                    ${data.fecha_compra},
                    ${data.proveedor_id || null},
                    ${data.total},
                    ${data.observaciones || null}
                )
                RETURNING *
            `;
            return compra;
        } catch (error) {
            console.error('Error creando compra de materiales:', error);
            throw error;
        }
    },

    // Obtener todas las compras
    async getAll() {
        try {
            const compras = await sql`
                SELECT *
                FROM materiales_compras
                ORDER BY fecha_compra DESC, fecha_registro DESC
            `;
            return compras;
        } catch (error) {
            console.error('Error obteniendo compras de materiales:', error);
            throw error;
        }
    },

    // Obtener por ID
    async getById(id) {
        try {
            const [compra] = await sql`
                SELECT 
                    mc.*,
                    p.nombre as proveedor_nombre
                FROM materiales_compras mc
                LEFT JOIN proveedores p ON mc.proveedor_id = p.id
                WHERE mc.id = ${id}
            `;
            return compra;
        } catch (error) {
            console.error('Error obteniendo compra de materiales:', error);
            throw error;
        }
    },

    // Obtener por rango de fechas
    async getByDateRange(startDate, endDate) {
        try {
            const compras = await sql`
                SELECT 
                    mc.*,
                    p.nombre as proveedor_nombre
                FROM materiales_compras mc
                LEFT JOIN proveedores p ON mc.proveedor_id = p.id
                WHERE mc.fecha_compra BETWEEN ${startDate} AND ${endDate}
                ORDER BY mc.fecha_compra DESC
            `;
            return compras;
        } catch (error) {
            console.error('Error obteniendo compras por rango:', error);
            throw error;
        }
    },

    // Eliminar compra
    async delete(id) {
        try {
            await sql`DELETE FROM materiales_compras WHERE id = ${id}`;
        } catch (error) {
            console.error('Error eliminando compra de materiales:', error);
            throw error;
        }
    }
};

export const materialesItemsDB = {
    // Crear items en batch
    async createBatch(compraId, items) {
        try {
            const values = items.map(item => ({
                compra_id: compraId,
                nombre_material: item.nombre_material,
                cantidad: item.cantidad,
                unidad: item.unidad || 'Unidad',
                costo_unitario: item.costo_unitario,
                subtotal: item.subtotal
            }));

            for (const item of values) {
                await sql`
                    INSERT INTO materiales_items (
                        compra_id, nombre_material, cantidad, unidad, costo_unitario, subtotal
                    ) VALUES (
                        ${item.compra_id},
                        ${item.nombre_material},
                        ${item.cantidad},
                        ${item.unidad},
                        ${item.costo_unitario},
                        ${item.subtotal}
                    )
                `;
            }
        } catch (error) {
            console.error('Error creando items de materiales:', error);
            throw error;
        }
    },

    // Obtener items de una compra
    async getByCompraId(compraId) {
        try {
            const items = await sql`
                SELECT * FROM materiales_items
                WHERE compra_id = ${compraId}
                ORDER BY fecha_registro
            `;
            return items;
        } catch (error) {
            console.error('Error obteniendo items de materiales:', error);
            throw error;
        }
    },

    // Eliminar items de una compra
    async deleteByCompraId(compraId) {
        try {
            await sql`DELETE FROM materiales_items WHERE compra_id = ${compraId}`;
        } catch (error) {
            console.error('Error eliminando items de materiales:', error);
            throw error;
        }
    }
};

// Función auxiliar para generar código de compra
export function generarCodigoMaterial() {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MAT-${año}${mes}${dia}-${random}`;
}
