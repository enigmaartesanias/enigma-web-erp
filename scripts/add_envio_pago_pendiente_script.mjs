import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function run() {
    try {
        console.log("Añadiendo columna 'envio_pago_pendiente' a tabla 'pedidos'...");
        await sql`ALTER TABLE pedidos ADD COLUMN envio_pago_pendiente BOOLEAN DEFAULT false;`;
        console.log("Columna agregada exitosamente.");
    } catch (e) {
        if (e.message.includes('already exists')) {
            console.log("Correcto: La columna 'envio_pago_pendiente' ya existe.");
        } else {
            console.error('Error:', e.message);
        }
    }
}

run();
