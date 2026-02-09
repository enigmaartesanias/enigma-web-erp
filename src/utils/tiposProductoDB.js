import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

const formatNombre = (nombre) => {
    if (!nombre) return '';
    return nombre.trim().charAt(0).toUpperCase() + nombre.trim().slice(1).toLowerCase();
};

export const tiposProductoDB = {
    async getAll() {
        const tipos = await sql`SELECT * FROM tipos_producto ORDER BY nombre`;
        return tipos;
    },

    async create(nombre) {
        try {
            const [tipo] = await sql`
                INSERT INTO tipos_producto (nombre)
                VALUES (${formatNombre(nombre)})
                RETURNING *
            `;
            return tipo;
        } catch (error) {
            console.error('Error creando tipo de producto:', error);
            throw error;
        }
    },

    async update(id, nombre) {
        try {
            const [tipo] = await sql`
                UPDATE tipos_producto
                SET nombre = ${formatNombre(nombre)}
                WHERE id = ${id}
                RETURNING *
            `;
            return tipo;
        } catch (error) {
            console.error('Error actualizando tipo de producto:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await sql`DELETE FROM tipos_producto WHERE id = ${id}`;
        } catch (error) {
            console.error('Error eliminando tipo de producto:', error);
            throw error;
        }
    }
};
