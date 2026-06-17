import sql from './neonClient';

export const andruDonaldsDB = {
    async getAll() {
        return await sql`SELECT * FROM andru_donalds_images ORDER BY order_index, created_at DESC`;
    },

    async getActive() {
        return await sql`SELECT * FROM andru_donalds_images WHERE is_active = true ORDER BY order_index, created_at DESC`;
    },

    async create(data) {
        const [item] = await sql`
      INSERT INTO andru_donalds_images (image_url, descripcion, order_index, is_active)
      VALUES (${data.image_url}, ${data.descripcion || null}, ${data.order_index || 0}, ${data.is_active !== undefined ? data.is_active : true})
      RETURNING *
    `;
        return item;
    },

    async update(id, data) {
        const [item] = await sql`
      UPDATE andru_donalds_images SET
        descripcion = ${data.descripcion},
        order_index = ${data.order_index},
        is_active = ${data.is_active}
      WHERE id = ${id}
      RETURNING *
    `;
        return item;
    },

    async delete(id) {
        await sql`DELETE FROM andru_donalds_images WHERE id = ${id}`;
    }
};

export const andruProductosDB = {
    async getAll() {
        return await sql`SELECT * FROM andru_productos_images ORDER BY order_index, created_at DESC`;
    },

    async getActive() {
        return await sql`SELECT * FROM andru_productos_images WHERE is_active = true ORDER BY order_index, created_at DESC`;
    },

    async create(data) {
        const [item] = await sql`
            INSERT INTO andru_productos_images (image_url, descripcion, order_index, is_active)
            VALUES (${data.image_url}, ${data.descripcion || null}, ${data.order_index || 0}, ${data.is_active !== undefined ? data.is_active : true})
            RETURNING *
        `;
        return item;
    },

    async update(id, data) {
        const [item] = await sql`
            UPDATE andru_productos_images SET
                descripcion = ${data.descripcion},
                order_index = ${data.order_index},
                is_active = ${data.is_active}
            WHERE id = ${id}
            RETURNING *
        `;
        return item;
    },

    async delete(id) {
        await sql`DELETE FROM andru_productos_images WHERE id = ${id}`;
    }
};
