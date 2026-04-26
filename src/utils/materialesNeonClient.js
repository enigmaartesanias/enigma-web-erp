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

    // Obtener todos los items detallados para reporte
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
    },

    // ==========================================
    // NUEVO: Obtener lista de metales para Pedidos y Producción
    // ==========================================
    async getMetales() {
        try {
            const metales = await sql`
                SELECT id, nombre, precio_gramo, unidad, orden 
                FROM materiales
                WHERE activo = true
                ORDER BY orden ASC
            `;
            return metales;
        } catch (error) {
            console.error('Error obteniendo lista de metales:', error);
            throw error;
        }
    },

    // Crear nuevo metal/material en el catálogo
    async createMetal({ nombre, unidad, precio_gramo, orden }) {
        try {
            const [metal] = await sql`
                INSERT INTO materiales (nombre, unidad, precio_gramo, orden, activo)
                VALUES (${nombre}, ${unidad}, ${precio_gramo || 0}, ${orden || 99}, true)
                RETURNING *
            `;
            return metal;
        } catch (error) {
            console.error('Error creando metal:', error);
            throw error;
        }
    },

    // Soft-delete (marcar inactivo) un metal del catálogo
    async deleteMetal(id) {
        try {
            await sql`
                UPDATE materiales SET activo = false WHERE id = ${id}
            `;
        } catch (error) {
            console.error('Error eliminando metal:', error);
            throw error;
        }
    }
};

export const materialesItemsDB = {
    // Crear items en batch Y ACTUALIZAR PRECIOS AUTOMÁTICAMENTE
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
                // 1. Insertar el historial de compra
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

                // 2. ACTUALIZAR PRECIO DE REFERENCIA
                // Si el metal se compró a un precio mayor a 0, actualizamos su precio por gramo oficial
                if (item.costo_unitario > 0) {
                    await sql`
                        UPDATE materiales 
                        SET precio_gramo = ${item.costo_unitario}
                        WHERE UPPER(nombre) = UPPER(${item.nombre_material})
                    `;
                }
            }
        } catch (error) {
            console.error('Error creando items de materiales y actualizando precios:', error);
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