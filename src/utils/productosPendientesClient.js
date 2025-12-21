import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const productosPendientesDB = {
    // Crear producto pendiente
    async create(data) {
        try {
            const [pendiente] = await sql`
                INSERT INTO productos_pendientes (
                    compra_id, nombre_producto, cantidad_comprada, costo_compra,
                    proveedor_id, fecha_compra, observaciones
                ) VALUES (
                    ${data.compra_id || null},
                    ${data.nombre_producto},
                    ${data.cantidad_comprada},
                    ${data.costo_compra},
                    ${data.proveedor_id || null},
                    ${data.fecha_compra},
                    ${data.observaciones || null}
                )
                RETURNING *
            `;
            return pendiente;
        } catch (error) {
            console.error('Error creando producto pendiente:', error);
            throw error;
        }
    },

    // Obtener todos los pendientes
    async getAll() {
        try {
            const pendientes = await sql`
                SELECT 
                    pp.*,
                    p.nombre as proveedor_nombre,
                    pe.nombre as producto_nombre_creado
                FROM productos_pendientes pp
                LEFT JOIN proveedores p ON pp.proveedor_id = p.id
                LEFT JOIN productos_externos pe ON pp.producto_creado_id = pe.id
                ORDER BY 
                    CASE WHEN pp.estado = 'PENDIENTE' THEN 0 ELSE 1 END,
                    pp.fecha_compra DESC
            `;
            return pendientes;
        } catch (error) {
            console.error('Error obteniendo productos pendientes:', error);
            throw error;
        }
    },

    // Obtener solo pendientes (no creados)
    async getPendientes() {
        try {
            const pendientes = await sql`
                SELECT 
                    pp.*,
                    p.nombre as proveedor_nombre
                FROM productos_pendientes pp
                LEFT JOIN proveedores p ON pp.proveedor_id = p.id
                WHERE pp.estado = 'PENDIENTE'
                ORDER BY pp.fecha_compra DESC
            `;
            return pendientes;
        } catch (error) {
            console.error('Error obteniendo pendientes:', error);
            throw error;
        }
    },

    // Contar pendientes
    async countPendientes() {
        try {
            const [result] = await sql`
                SELECT COUNT(*) as count
                FROM productos_pendientes
                WHERE estado = 'PENDIENTE'
            `;
            return parseInt(result.count);
        } catch (error) {
            console.error('Error contando pendientes:', error);
            return 0;
        }
    },

    // Obtener por ID
    async getById(id) {
        try {
            const [pendiente] = await sql`
                SELECT 
                    pp.*,
                    p.nombre as proveedor_nombre
                FROM productos_pendientes pp
                LEFT JOIN proveedores p ON pp.proveedor_id = p.id
                WHERE pp.id = ${id}
            `;
            return pendiente;
        } catch (error) {
            console.error('Error obteniendo producto pendiente:', error);
            throw error;
        }
    },

    // Marcar como creado
    async markAsCreated(id, productoId) {
        try {
            const [updated] = await sql`
                UPDATE productos_pendientes
                SET 
                    estado = 'CREADO',
                    producto_creado_id = ${productoId},
                    fecha_creacion = NOW()
                WHERE id = ${id}
                RETURNING *
            `;
            return updated;
        } catch (error) {
            console.error('Error marcando producto como creado:', error);
            throw error;
        }
    },

    // Eliminar pendiente
    async delete(id) {
        try {
            await sql`DELETE FROM productos_pendientes WHERE id = ${id}`;
        } catch (error) {
            console.error('Error eliminando producto pendiente:', error);
            throw error;
        }
    },

    // Actualizar observaciones
    async updateObservaciones(id, observaciones) {
        try {
            const [updated] = await sql`
                UPDATE productos_pendientes
                SET observaciones = ${observaciones}
                WHERE id = ${id}
                RETURNING *
            `;
            return updated;
        } catch (error) {
            console.error('Error actualizando observaciones:', error);
            throw error;
        }
    }
};
