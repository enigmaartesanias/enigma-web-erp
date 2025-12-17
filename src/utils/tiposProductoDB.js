import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const tiposProductoDB = {
    async getAll() {
        const tipos = await sql`SELECT * FROM tipos_producto ORDER BY nombre`;
        return tipos;
    }
};
