import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

// Exportación de la base de datos de materiales
export const materialesDB = {
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

    async getAll() {
        try {
            const compras = await sql`
                SELECT 
                    mc.*,
                    p.nombre as proveedor_nombre,
                    COALESCE(
                        (SELECT COUNT(*) FROM materiales_items mi WHERE mi.compra_id = mc.id),
                        0
                    ) as items_count
                FROM materiales_compras mc
                LEFT JOIN proveedores p ON mc.proveedor_id = p.id
                ORDER BY mc.fecha_compra DESC, mc.fecha_registro DESC
            `;
            return compras;
        } catch (error) {
            console.error('Error obteniendo compras de materiales:', error);
            throw error;
        }
    },

    async getAllItems() {
        try {
            const items = await sql`
                SELECT 
                    mi.*,
                    mc.fecha_compra,
                    mc.codigo_compra,
                    p.nombre as proveedor_nombre
                FROM materiales_items mi
                INNER JOIN materiales_compras mc ON mi.compra_id = mc.id
                LEFT JOIN proveedores p ON mc.proveedor_id = p.id
                ORDER BY mc.fecha_compra DESC, mc.fecha_registro DESC
            `;
            return items;
        } catch (error) {
            console.error('Error obteniendo items de materiales:', error);
            throw error;
        }
    },

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

    async delete(id) {
        try {
            await sql`DELETE FROM materiales_compras WHERE id = ${id}`;
        } catch (error) {
            console.error('Error eliminando compra de materiales:', error);
            throw error;
        }
    },

    async getMetales(incluirInactivos = false) {
        try {
            let metales;
            if (incluirInactivos) {
                metales = await sql`SELECT id, nombre, precio_gramo, unidad, orden, activo FROM materiales ORDER BY orden ASC`;
            } else {
                metales = await sql`SELECT id, nombre, precio_gramo, unidad, orden FROM materiales WHERE activo = true ORDER BY orden ASC`;
            }
            return metales;
        } catch (error) {
            console.error('Error obteniendo lista de metales:', error);
            throw error;
        }
    },

    async createMetal({ nombre, unidad, precio_gramo, orden }) {
        try {
            const nombreNormalizado = nombre.toUpperCase().trim();
            const [metal] = await sql`
                INSERT INTO materiales (nombre, unidad, precio_gramo, orden, activo)
                VALUES (${nombreNormalizado}, ${unidad}, ${precio_gramo || 0}, ${orden || 99}, true)
                RETURNING *
            `;
            return metal;
        } catch (error) {
            console.error('Error creando metal:', error);
            throw error;
        }
    },

    async updateMetal(id, { nombre, unidad, precio_gramo, orden }) {
        try {
            await sql`
                UPDATE materiales 
                SET nombre = ${nombre.toUpperCase().trim()}, 
                    unidad = ${unidad}, 
                    precio_gramo = ${precio_gramo}, 
                    orden = ${orden}
                WHERE id = ${id}
            `;
        } catch (error) {
            console.error('Error actualizando metal:', error);
            throw error;
        }
    },

    async deleteMetal(id) {
        try {
            await sql`UPDATE materiales SET activo = false WHERE id = ${id}`;
        } catch (error) {
            console.error('Error eliminando metal:', error);
            throw error;
        }
    }
};

// Exportación de los items
export const materialesItemsDB = {
    async createBatch(compraId, items) {
        try {
            for (const item of items) {
                await sql`
                    INSERT INTO materiales_items (
                        compra_id, nombre_material, cantidad, unidad, costo_unitario, subtotal
                    ) VALUES (
                        ${compraId},
                        ${item.nombre_material.toUpperCase()},
                        ${item.cantidad},
                        ${item.unidad},
                        ${item.costo_unitario},
                        ${item.subtotal}
                    )
                `;

                if (item.costo_unitario > 0) {
                    await sql`
                        UPDATE materiales 
                        SET precio_gramo = ${item.costo_unitario}
                        WHERE UPPER(nombre) = UPPER(${item.nombre_material})
                    `;
                }
            }
        } catch (error) {
            console.error('Error creando items de materiales:', error);
            throw error;
        }
    },

    async getByCompraId(compraId) {
        try {
            return await sql`SELECT * FROM materiales_items WHERE compra_id = ${compraId} ORDER BY fecha_registro`;
        } catch (error) {
            console.error('Error obteniendo items:', error);
            throw error;
        }
    },

    async deleteByCompraId(compraId) {
        try {
            await sql`DELETE FROM materiales_items WHERE compra_id = ${compraId}`;
        } catch (error) {
            console.error('Error eliminando items:', error);
            throw error;
        }
    }
};

// Función auxiliar necesaria
export function generarCodigoMaterial() {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MAT-${año}${mes}${dia}-${random}`;
}