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

    // Actualizar un item
    async update(id, data) {
        try {
            const [item] = await sql`
                UPDATE compras_items SET
                    nombre_item = ${data.nombre_item},
                    cantidad = ${data.cantidad},
                    costo_unitario = ${data.costo_unitario},
                    subtotal = ${data.subtotal}
                WHERE id = ${id}
                RETURNING *
            `;
            return item;
        } catch (error) {
            console.error("Error actualizando item de compra:", error);
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
    },

    // Obtener todos los items (con información de compra y proveedor)
    async getAll() {
        try {
            return await sql`
                SELECT 
                    ci.*,
                    c.codigo_compra,
                    c.fecha_compra as fecha_compra,
                    p.nombre as proveedor_nombre
                FROM compras_items ci
                JOIN compras c ON c.id = ci.compra_id
                LEFT JOIN proveedores p ON p.id = c.proveedor_id
                ORDER BY c.fecha_compra DESC, ci.created_at ASC
            `;
        } catch (error) {
            console.error("Error obteniendo todos los items:", error);
            throw error;
        }
    },

    // Obtener items pendientes de inventariar
    async getAllPendientes() {
        try {
            return await sql`
                SELECT 
                    ci.*,
                    c.codigo_compra,
                    c.fecha_compra as fecha_compra,
                    p.nombre as proveedor_nombre
                FROM compras_items ci
                JOIN compras c ON c.id = ci.compra_id
                LEFT JOIN proveedores p ON p.id = c.proveedor_id
                WHERE ci.inventariado = FALSE
                ORDER BY c.fecha_compra DESC, ci.created_at ASC
            `;
        } catch (error) {
            console.error("Error obteniendo items pendientes:", error);
            throw error;
        }
    },

    // Obtener items ya inventariados
    async getAllInventariados() {
        try {
            return await sql`
                SELECT 
                    ci.*,
                    c.codigo_compra,
                    c.fecha_compra as fecha_compra,
                    p.nombre as proveedor_nombre,
                    prod.nombre as producto_inventario_nombre,
                    prod.codigo_usuario as producto_inventario_codigo
                FROM compras_items ci
                JOIN compras c ON c.id = ci.compra_id
                LEFT JOIN proveedores p ON p.id = c.proveedor_id
                LEFT JOIN productos prod ON prod.id = ci.producto_inventario_id
                WHERE ci.inventariado = TRUE
                ORDER BY c.fecha_compra DESC, ci.created_at ASC
            `;
        } catch (error) {
            console.error("Error obteniendo items inventariados:", error);
            throw error;
        }
    },

    // Marcar item como inventariado
    async marcarInventariado(itemId, productoExternoId) {
        try {
            const [item] = await sql`
                UPDATE compras_items 
                SET 
                    inventariado = TRUE,
                    producto_externo_id = ${productoExternoId}
                WHERE id = ${itemId}
                RETURNING *
            `;
            return item;
        } catch (error) {
            console.error("Error marcando item como inventariado:", error);
            throw error;
        }
    }

};
