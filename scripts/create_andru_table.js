import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function main() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS andru_donalds_images (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                image_url TEXT NOT NULL,
                order_index INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Tabla andru_donalds_images creada con éxito.");
    } catch (e) {
        console.error("Error al crear la tabla:", e);
    }
}

main();
