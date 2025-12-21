import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const proveedoresDB = {
    // Obtener todos los proveedores activos
    async getAll() {
        try {
            return await sql`
                SELECT * FROM proveedores 
                WHERE activo = true
                ORDER BY nombre ASC
            `;
        } catch (error) {
            console.error("Error obteniendo proveedores:", error);
            throw error;
        }
    },

    // Buscar proveedores por nombre
    async search(query) {
        try {
            return await sql`
                SELECT * FROM proveedores 
                WHERE activo = true 
                AND LOWER(nombre) LIKE ${`%${query.toLowerCase()}%`}
                ORDER BY nombre ASC
                LIMIT 10
            `;
        } catch (error) {
            console.error("Error buscando proveedores:", error);
            throw error;
        }
    },

    // Obtener por ID
    async getById(id) {
        try {
            const [proveedor] = await sql`
                SELECT * FROM proveedores WHERE id = ${id}
            `;
            return proveedor;
        } catch (error) {
            console.error("Error obteniendo proveedor por ID:", error);
            throw error;
        }
    },

    // Crear nuevo proveedor
    async create(data) {
        try {
            const [proveedor] = await sql`
                INSERT INTO proveedores (
                    nombre, telefono, direccion
                ) VALUES (
                    ${data.nombre},
                    ${data.telefono || null},
                    ${data.direccion || null}
                )
                RETURNING *
            `;
            return proveedor;
        } catch (error) {
            console.error("Error creando proveedor:", error);
            throw error;
        }
    },

    // Actualizar proveedor
    async update(id, data) {
        try {
            const [proveedor] = await sql`
                UPDATE proveedores SET
                    nombre = ${data.nombre},
                    telefono = ${data.telefono || null},
                    direccion = ${data.direccion || null},
                    activo = ${data.activo !== undefined ? data.activo : true}
                WHERE id = ${id}
                RETURNING *
            `;
            return proveedor;
        } catch (error) {
            console.error("Error actualizando proveedor:", error);
            throw error;
        }
    },

    // Desactivar proveedor (soft delete)
    async deactivate(id) {
        try {
            await sql`
                UPDATE proveedores 
                SET activo = false 
                WHERE id = ${id}
            `;
        } catch (error) {
            console.error("Error desactivando proveedor:", error);
            throw error;
        }
    }
};
