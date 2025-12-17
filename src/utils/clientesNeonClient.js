import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const clientesDB = {
    // Obtener todos los clientes
    async getAll() {
        try {
            const clientes = await sql`SELECT * FROM clientes ORDER BY created_at DESC`;
            return clientes;
        } catch (error) {
            console.error('Error fetching clientes:', error);
            throw error;
        }
    },

    // Obtener cliente por ID
    async getById(id) {
        try {
            const [cliente] = await sql`SELECT * FROM clientes WHERE id = ${id}`;
            return cliente || null;
        } catch (error) {
            console.error('Error fetching cliente:', error);
            throw error;
        }
    },

    // Buscar clientes por nombre o teléfono
    async search(query) {
        try {
            const searchTerm = `%${query}%`;
            const clientes = await sql`
                SELECT * FROM clientes 
                WHERE nombre ILIKE ${searchTerm} OR telefono ILIKE ${searchTerm}
                ORDER BY nombre ASC
            `;
            return clientes;
        } catch (error) {
            console.error('Error searching clientes:', error);
            throw error;
        }
    },

    // Crear nuevo cliente
    async create({ nombre, telefono }) {
        try {
            const [cliente] = await sql`
                INSERT INTO clientes (nombre, telefono) 
                VALUES (${nombre}, ${telefono}) 
                RETURNING *
            `;
            return cliente;
        } catch (error) {
            console.error('Error creating cliente:', error);
            throw error;
        }
    },

    // Actualizar cliente
    async update(id, { nombre, telefono }) {
        try {
            const [cliente] = await sql`
                UPDATE clientes 
                SET nombre = ${nombre}, telefono = ${telefono} 
                WHERE id = ${id}
                RETURNING *
            `;
            return cliente;
        } catch (error) {
            console.error('Error updating cliente:', error);
            throw error;
        }
    },

    // Eliminar cliente
    async delete(id) {
        try {
            await sql`DELETE FROM clientes WHERE id = ${id}`;
            return true;
        } catch (error) {
            console.error('Error deleting cliente:', error);
            throw error;
        }
    }
};
