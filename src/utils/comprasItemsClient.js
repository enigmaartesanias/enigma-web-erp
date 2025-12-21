import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const comprasItemsDB = {
    // Crear múltiples items para una compra
    async createBatch(compraId, items) {
        try {
            const results = [];
            for (const item of items) {
                const [createdItem] = await sql`
                    INSERT INTO compras_items (
                        compra_id,
                        nombre_item,
                        cantidad,
                        costo_unitario,
                        subtotal,
                        producto_externo_id
                    ) VALUES (
                        ${compraId},
                        ${item.nombre_item},
                        ${item.cantidad},
                        ${item.costo_unitario},
                        ${item.subtotal},
                        ${item.producto_externo_id || null}
                    )
                    RETURNING *
                `;
                results.push(createdItem);
            }
            return results;
        } catch (error) {
            console.error("Error creando items de compra:", error);
            throw error;
        }
    },

    // Obtener items de una compra específica
    async getByCompraId(compraId) {
        try {
            return await sql`
                SELECT 
                    ci.*,
                    pe.nombre as producto_nombre,
                    pe.codigo_usuario as producto_codigo
                FROM compras_items ci
                LEFT JOIN productos_externos pe ON pe.id = ci.producto_externo_id
                WHERE ci.compra_id = ${compraId}
                ORDER BY ci.created_at ASC
            `;
        } catch (error) {
            console.error("Error obteniendo items de compra:", error);
            throw error;
        }
    },

    // Eliminar un item
    async delete(id) {
        try {
            await sql`DELETE FROM compras_items WHERE id = ${id}`;
        } catch (error) {
            console.error("Error eliminando item de compra:", error);
            throw error;
        }
    },

    // Obtener total de items de una compra
    async getTotalByCompra(compraId) {
        try {
            const [result] = await sql`
                SELECT 
                    COUNT(*) as total_items,
                    SUM(subtotal) as total_compra
                FROM compras_items
                WHERE compra_id = ${compraId}
            `;
            return result;
        } catch (error) {
            console.error("Error obteniendo total de compra:", error);
            throw error;
        }
    }
};
