import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const tiposMaterialesDB = {
    // Obtener todos los tipos activos
    async getAll() {
        return await sql`
            SELECT id, nombre, unidad, detalle, activo, created_at
            FROM tipos_materiales
            WHERE activo = true
            ORDER BY nombre ASC
        `;
    },

    // Obtener por ID
    async getById(id) {
        const result = await sql`
            SELECT id, nombre, unidad, detalle, activo, created_at
            FROM tipos_materiales
            WHERE id = ${id}
        `;
        return result[0];
    },

    // Crear nuevo tipo
    async create({ nombre, unidad, detalle = '' }) {
        const result = await sql`
            INSERT INTO tipos_materiales (nombre, unidad, detalle)
            VALUES (${nombre}, ${unidad}, ${detalle})
            RETURNING *
        `;
        return result[0];
    },

    // Actualizar tipo
    async update(id, { nombre, unidad, detalle }) {
        const result = await sql`
            UPDATE tipos_materiales
            SET nombre = ${nombre}, unidad = ${unidad}, detalle = ${detalle}
            WHERE id = ${id}
            RETURNING *
        `;
        return result[0];
    },

    // Soft delete
    async delete(id) {
        const result = await sql`
            UPDATE tipos_materiales
            SET activo = false
            WHERE id = ${id}
            RETURNING *
        `;
        return result[0];
    }
};
